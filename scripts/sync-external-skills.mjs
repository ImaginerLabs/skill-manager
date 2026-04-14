#!/usr/bin/env node
/**
 * scripts/sync-external-skills.mjs
 * 外部 Skill 同步脚本 — 从外部 GitHub 仓库拉取、筛选、复制 Skill 并注入来源元数据
 *
 * 用法：
 *   node scripts/sync-external-skills.mjs           # 正常同步
 *   node scripts/sync-external-skills.mjs --dry-run  # 预览模式（不实际写文件）
 */

import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import yaml from "js-yaml";

// ---- 路径常量 ----
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(PROJECT_ROOT, "config", "repositories.yaml");
const SKILLS_ROOT = path.join(PROJECT_ROOT, "skills");
const SKILL_REPOS_ROOT = path.join(PROJECT_ROOT, "skill-repos");

// ---- 运行模式 ----
const isDryRun = process.argv.includes("--dry-run");

// ---- 变更统计 ----
const stats = {
  added: /** @type {string[]} */ ([]),
  updated: /** @type {string[]} */ ([]),
  skipped: /** @type {string[]} */ ([]),
  errors: /** @type {string[]} */ ([]),
};

// ============================================================
// 工具函数
// ============================================================

/**
 * 读取并解析 config/repositories.yaml
 * @returns {{ repositories: Array }} 仓库配置，文件不存在或格式错误时返回空数组
 */
function loadRepositoriesConfig() {
  if (!existsSync(CONFIG_PATH)) {
    log(`配置文件不存在，跳过同步: ${CONFIG_PATH}`);
    return { repositories: [] };
  }

  try {
    const raw = readFileSync(CONFIG_PATH, "utf-8");
    const parsed = yaml.load(raw);
    if (!parsed || !Array.isArray(parsed.repositories)) {
      log("WARN: 配置文件格式错误，repositories 字段缺失或非数组，返回空配置");
      return { repositories: [] };
    }
    return parsed;
  } catch (err) {
    log(`ERROR: 读取配置文件失败: ${err.message}`);
    return { repositories: [] };
  }
}

/**
 * 日志输出（统一 [sync] 前缀）
 * @param {string} msg
 */
function log(msg) {
  console.log(`[sync] ${msg}`);
}

/**
 * 在 Skill 目录中查找主 .md 文件
 * 优先 SKILL.md，其次目录下第一个 .md 文件
 * @param {string} skillDir
 * @returns {string|null}
 */
function findMainSkillFile(skillDir) {
  const skillMd = path.join(skillDir, "SKILL.md");
  if (existsSync(skillMd)) return skillMd;

  try {
    const files = readdirSync(skillDir).filter((f) => f.endsWith(".md"));
    return files.length > 0 ? path.join(skillDir, files[0]) : null;
  } catch {
    return null;
  }
}

/**
 * 检测是否存在本地 Skill 冲突（本地 Skill 优先）
 * @param {string} skillName
 * @param {string} targetCategory
 * @returns {boolean}
 */
function hasLocalConflict(skillName, targetCategory) {
  const targetPath = path.join(SKILLS_ROOT, targetCategory, skillName);
  if (!existsSync(targetPath)) return false;

  const mainFile = findMainSkillFile(targetPath);
  if (!mainFile) return true; // 无法判断，视为冲突

  try {
    const parsed = matter(readFileSync(mainFile, "utf-8"));
    // 无 source 字段 = 本地 Skill = 冲突
    return !parsed.data.source;
  } catch {
    return true;
  }
}

/**
 * 向 Skill 主 .md 文件注入来源元数据
 * @param {string} skillMdPath
 * @param {{ id: string; url: string; branch: string; skillsPath: string }} repo
 * @param {string} skillName
 * @param {string} targetCategory
 */
function injectSourceMetadata(skillMdPath, repo, skillName, targetCategory) {
  try {
    const raw = readFileSync(skillMdPath, "utf-8");
    const parsed = matter(raw);

    // 构建 sourceUrl：处理 skillsPath 为 "." 的情况
    const skillsPathSegment =
      repo.skillsPath && repo.skillsPath !== "."
        ? `${repo.skillsPath}/${skillName}`
        : skillName;

    parsed.data.source = repo.id;
    parsed.data.sourceUrl = `${repo.url}/tree/${repo.branch}/${skillsPathSegment}`;
    parsed.data.sourceRepo = repo.url;
    parsed.data.readonly = true;

    // 补充 category（外部 Skill 通常不含此字段，使用 targetCategory 填充）
    if (!parsed.data.category) {
      parsed.data.category = targetCategory;
    }

    // 补充 name（子文件可能缺失，使用文件名（不含扩展名）填充）
    if (!parsed.data.name) {
      const fileName = path.basename(skillMdPath, ".md");
      parsed.data.name = fileName;
    }

    const output = matter.stringify(parsed.content, parsed.data);
    writeFileSync(skillMdPath, output, "utf-8");
  } catch (err) {
    log(`WARN: Frontmatter 注入失败（${skillMdPath}）: ${err.message}，文件已复制但无来源元数据`);
  }
}

/**
 * 复制 Skill 目录
 * @param {string} sourceDir
 * @param {string} targetDir
 */
function copySkillDirectory(sourceDir, targetDir) {
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }
  cpSync(sourceDir, targetDir, { recursive: true });
}

/**
 * 递归收集目录下所有 .md 文件的绝对路径
 * @param {string} dir
 * @returns {string[]}
 */
function collectAllMdFiles(dir) {
  const results = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...collectAllMdFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        results.push(fullPath);
      }
    }
  } catch {
    // 目录不可读时静默跳过
  }
  return results;
}

/**
 * 执行 git 命令（clone 或 pull）
 * @param {string} repoUrl
 * @param {string} branch
 * @param {string} repoId
 * @returns {boolean} 是否成功
 */
function syncGitRepo(repoUrl, branch, repoId) {
  const repoDir = path.join(SKILL_REPOS_ROOT, repoId);

  try {
    if (!existsSync(repoDir)) {
      log(`[${repoId}] 首次 clone: ${repoUrl} (branch: ${branch})`);
      if (!isDryRun) {
        execSync(
          `git clone ${repoUrl} --branch ${branch} --single-branch ${repoDir}`,
          { timeout: 60000, stdio: "pipe" },
        );
      } else {
        log(`[DRY-RUN] 将执行: git clone ${repoUrl} --branch ${branch} --single-branch ${repoDir}`);
      }
    } else {
      log(`[${repoId}] 增量 pull`);
      if (!isDryRun) {
        execSync(`git -C ${repoDir} pull`, {
          timeout: 60000,
          stdio: "pipe",
        });
      } else {
        log(`[DRY-RUN] 将执行: git -C ${repoDir} pull`);
      }
    }
    return true;
  } catch (err) {
    log(`ERROR: [${repoId}] git 操作失败: ${err.message}`);
    return false;
  }
}

/**
 * 根据 include/exclude 规则筛选 Skill 列表
 * @param {Array<{name: string; targetCategory: string}>} include
 * @param {string[]} exclude
 * @returns {Array<{name: string; targetCategory: string}>}
 */
function filterSkills(include, exclude) {
  const excludeSet = new Set(exclude || []);
  return (include || []).filter((item) => {
    if (excludeSet.has(item.name)) {
      return false; // 黑名单优先
    }
    return true;
  });
}

/**
 * 处理单个仓库的同步
 * @param {object} repo
 */
function processRepository(repo) {
  log(`----------------------------------------`);
  log(`[${repo.id}] 开始处理: ${repo.url}`);

  // 1. git clone / pull
  const gitSuccess = syncGitRepo(repo.url, repo.branch, repo.id);
  if (!gitSuccess) {
    log(`[${repo.id}] 跳过（git 操作失败）`);
    stats.errors.push(`[${repo.id}] git 操作失败`);
    return;
  }

  // 2. 确定仓库内 Skill 根目录
  const repoDir = path.join(SKILL_REPOS_ROOT, repo.id);
  const skillsSourceRoot =
    repo.skillsPath && repo.skillsPath !== "."
      ? path.join(repoDir, repo.skillsPath)
      : repoDir;

  // 3. 筛选 Skill
  const filteredSkills = filterSkills(repo.include, repo.exclude);
  log(`[${repo.id}] 筛选后 Skill 数量: ${filteredSkills.length}`);

  // 4. 处理每个 Skill
  for (const skillMapping of filteredSkills) {
    const { name: skillName, targetCategory } = skillMapping;
    const sourceSkillDir = path.join(skillsSourceRoot, skillName);

    // 检查源目录是否存在
    if (!isDryRun && !existsSync(sourceSkillDir)) {
      log(`WARN: [${repo.id}] Skill "${skillName}" 在仓库中不存在，跳过`);
      stats.skipped.push(`${skillName} (不存在于仓库)`);
      continue;
    }

    // 检查本地冲突
    if (!isDryRun && hasLocalConflict(skillName, targetCategory)) {
      log(`WARN: [${repo.id}] Skill "${skillName}" 已存在本地版本，跳过外部版本`);
      stats.skipped.push(`${skillName} (本地 Skill 优先)`);
      continue;
    }

    const targetSkillDir = path.join(SKILLS_ROOT, targetCategory, skillName);
    const isNew = !existsSync(targetSkillDir);

    if (isDryRun) {
      log(`[DRY-RUN] 将复制: ${sourceSkillDir} → ${targetSkillDir}`);
      log(`[DRY-RUN] 将注入 Frontmatter: source=${repo.id}, readonly=true`);
      stats.added.push(`${skillName} → ${targetCategory}`);
      continue;
    }

    // 复制 Skill 目录
    try {
      copySkillDirectory(sourceSkillDir, targetSkillDir);
    } catch (err) {
      log(`ERROR: [${repo.id}] 复制 Skill "${skillName}" 失败: ${err.message}`);
      stats.errors.push(`${skillName} (复制失败)`);
      continue;
    }

    // 注入 Frontmatter 来源元数据（仅主 SKILL.md）
    const mainFile = findMainSkillFile(targetSkillDir);
    if (mainFile) {
      injectSourceMetadata(mainFile, repo, skillName, targetCategory);
    } else {
      log(`WARN: [${repo.id}] Skill "${skillName}" 无主 .md 文件，跳过 Frontmatter 注入`);
    }

    if (isNew) {
      log(`[${repo.id}] 新增: ${skillName} → skills/${targetCategory}/${skillName}`);
      stats.added.push(`${skillName} → ${targetCategory}`);
    } else {
      log(`[${repo.id}] 更新: ${skillName} → skills/${targetCategory}/${skillName}`);
      stats.updated.push(`${skillName} → ${targetCategory}`);
    }
  }
}

// ============================================================
// 主流程
// ============================================================

function main() {
  log("========================================");
  log(isDryRun ? "开始同步外部 Skill 仓库 [DRY-RUN 模式]" : "开始同步外部 Skill 仓库");
  log("========================================");

  // 读取配置
  log(`读取配置: ${CONFIG_PATH}`);
  const config = loadRepositoriesConfig();
  const enabledRepos = config.repositories.filter((r) => r.enabled);
  log(`发现 ${enabledRepos.length} 个启用的仓库`);

  if (enabledRepos.length === 0) {
    log("无启用的仓库，退出");
    printSummary();
    return;
  }

  // 确保 skill-repos 目录存在
  if (!isDryRun && !existsSync(SKILL_REPOS_ROOT)) {
    mkdirSync(SKILL_REPOS_ROOT, { recursive: true });
  }

  // 处理每个仓库
  for (const repo of enabledRepos) {
    try {
      processRepository(repo);
    } catch (err) {
      log(`ERROR: [${repo.id}] 未捕获异常: ${err.message}`);
      stats.errors.push(`[${repo.id}] 未捕获异常`);
    }
  }

  printSummary();
}

/**
 * 输出变更摘要
 */
function printSummary() {
  log("========================================");
  log("同步完成 — 变更摘要");
  log("========================================");
  log(`新增: ${stats.added.length} 个`);
  stats.added.forEach((s) => log(`  + ${s}`));
  log(`更新: ${stats.updated.length} 个`);
  stats.updated.forEach((s) => log(`  ~ ${s}`));
  log(`跳过: ${stats.skipped.length} 个`);
  stats.skipped.forEach((s) => log(`  - ${s}`));
  if (stats.errors.length > 0) {
    log(`错误: ${stats.errors.length} 个`);
    stats.errors.forEach((s) => log(`  ! ${s}`));
  }
  log("========================================");
}

// 执行主流程
try {
  main();
  process.exit(0);
} catch (err) {
  log(`FATAL: 脚本未捕获异常: ${err.message}`);
  console.error(err);
  process.exit(1);
}
