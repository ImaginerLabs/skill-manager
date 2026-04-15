// ============================================================
// server/services/importService.ts — 文件导入服务
// ============================================================

import fs from "fs-extra";
import matter from "gray-matter";
import path from "node:path";
import type {
  ImportRequest,
  ImportResult,
  ImportResultItem,
} from "../../shared/types.js";
import { AppError } from "../types/errors.js";
import { safeWrite } from "../utils/fileUtils.js";
import { isSubPath, normalizePath, slugify } from "../utils/pathUtils.js";
import { getDefaultScanPath } from "./scanService.js";
import { getSkillsRoot, refreshSkillCache } from "./skillService.js";

/** SKILL.md 文件名 */
const SKILL_MD_FILENAME = "SKILL.md";

/**
 * 判断路径是否为 SKILL 包目录（包含 SKILL.md 的目录）
 */
async function isSkillPackageDir(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath);
    if (!stat.isDirectory()) return false;
    const skillMdPath = path.join(dirPath, SKILL_MD_FILENAME);
    return await fs.pathExists(skillMdPath);
  } catch {
    return false;
  }
}

/**
 * 获取 SKILL 包目录的名称（用于创建目标目录）
 * 优先使用 SKILL.md 中 frontmatter 的 name 字段，否则使用目录名
 */
async function getSkillPackageName(skillDir: string): Promise<string> {
  const skillMdPath = path.join(skillDir, SKILL_MD_FILENAME);
  try {
    const content = await fs.readFile(skillMdPath, "utf-8");
    const parsed = matter(content);
    if (parsed.data.name) {
      return slugify(String(parsed.data.name));
    }
  } catch {
    // 解析失败时使用目录名
  }
  return path.basename(skillDir);
}

/**
 * 复制整个 SKILL 包目录到目标位置
 * @param sourceDir - 源 SKILL 包目录
 * @param targetDir - 目标目录（skills/{category}/{skill-name}/）
 * @param category - 目标分类
 */
async function copySkillPackage(
  sourceDir: string,
  targetDir: string,
  category: string,
): Promise<void> {
  // 确保目标目录存在
  await fs.ensureDir(targetDir);

  // 读取源目录下的所有文件和子目录
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      // 递归复制子目录
      await fs.copy(sourcePath, targetPath, { overwrite: true });
    } else if (entry.isFile()) {
      if (entry.name === SKILL_MD_FILENAME) {
        // 对 SKILL.md 特殊处理：更新 frontmatter 中的 category 字段
        const content = await fs.readFile(sourcePath, "utf-8");
        let newContent: string;
        try {
          const parsed = matter(content);
          // 更新 category
          parsed.data.category = category;
          // 确保 name 和 description 字段存在
          if (!parsed.data.name) {
            parsed.data.name = path.basename(sourceDir);
          }
          if (
            parsed.data.description === undefined ||
            parsed.data.description === null
          ) {
            parsed.data.description = "";
          }
          newContent = matter.stringify(parsed.content, parsed.data);
        } catch {
          // 解析失败时直接复制原内容
          newContent = content;
        }
        await safeWrite(targetPath, newContent);
      } else {
        // 其他文件直接复制
        await fs.copy(sourcePath, targetPath, { overwrite: true });
      }
    }
  }
}

/**
 * 导入文件或 SKILL 包到 skills 目录
 *
 * 流程：
 * 1. 判断源是 SKILL 包目录还是单个 .md 文件
 * 2. SKILL 包目录：复制整个目录（包含 references、scripts 等子目录）
 * 3. 单个 .md 文件：解析 Frontmatter，补充字段，写入到正确位置
 * 4. 刷新 Skill 缓存
 */
/** 合法分类名正则：只允许小写字母、数字、连字符 */
const VALID_CATEGORY_RE = /^[a-z0-9-]+$/;

export async function importFiles(
  request: ImportRequest,
): Promise<ImportResult> {
  const { items, category } = request;
  const details: ImportResultItem[] = [];
  let successCount = 0;
  let failedCount = 0;

  // P2-fix: 校验 category 合法性，防止路径注入，使用语义正确的 validationError
  if (!VALID_CATEGORY_RE.test(category)) {
    throw AppError.validationError(
      `非法分类名 "${category}"，只允许小写字母、数字和连字符`,
    );
  }

  // P1-fix: 优先使用调用方传入的 scanRoot，fallback 到默认 CodeBuddy 扫描路径
  const allowedScanRoot = request.scanRoot
    ? normalizePath(path.resolve(request.scanRoot))
    : getDefaultScanPath();

  for (const item of items) {
    try {
      // P2: 校验 absolutePath 必须在允许的扫描目录内
      const resolvedSrc = normalizePath(path.resolve(item.absolutePath));
      if (!isSubPath(resolvedSrc, allowedScanRoot)) {
        throw AppError.pathTraversal(
          `源文件路径超出允许范围: ${item.absolutePath}`,
        );
      }

      const fileName = path.basename(item.absolutePath);

      // 判断是否为 SKILL 包目录中的 SKILL.md
      // 如果源文件是 SKILL.md 且其所在目录是 SKILL 包目录，则导入整个目录
      const sourceDir = path.dirname(item.absolutePath);
      const isPackage =
        fileName === SKILL_MD_FILENAME && (await isSkillPackageDir(sourceDir));

      if (isPackage) {
        // ---- SKILL 包目录导入：复制整个目录 ----
        const skillDirName = await getSkillPackageName(sourceDir);
        const targetDir = path.join(getSkillsRoot(), category, skillDirName);
        await copySkillPackage(sourceDir, targetDir, category);
      } else {
        // ---- 单个 .md 文件导入（兼容旧逻辑）----
        // 1. 读取源文件
        const rawContent = await fs.readFile(item.absolutePath, "utf-8");

        // 2. 解析 Frontmatter
        // P4: 解析失败时保留原始内容，不调用 matter.stringify 避免重复 Frontmatter
        let data: Record<string, unknown>;
        let content: string;
        let parseFailed = false;
        try {
          const parsed = matter(rawContent);
          data = parsed.data as Record<string, unknown>;
          content = parsed.content;
        } catch {
          // Frontmatter 解析失败，直接使用原始内容，跳过 Frontmatter 补充
          data = {};
          content = rawContent;
          parseFailed = true;
        }

        // 3. 补充缺失字段（仅在解析成功时执行）
        let newContent: string;
        if (parseFailed) {
          // 解析失败：直接写入原始内容，不添加 Frontmatter
          newContent = rawContent;
        } else {
          if (!data.category) {
            data.category = category;
          }
          if (!data.name) {
            data.name = path.basename(fileName, ".md");
          }
          if (data.description === undefined || data.description === null) {
            data.description = "";
          }

          // 4. 重新序列化
          newContent = matter.stringify(content, data);
        }

        // 5. 写入到 skills/{category}/{skill-name}/SKILL.md（层级结构）
        const skillName = slugify(path.basename(fileName, ".md"));
        const targetDir = path.join(getSkillsRoot(), category, skillName);
        await fs.ensureDir(targetDir);
        const targetPath = path.join(targetDir, SKILL_MD_FILENAME);
        await safeWrite(targetPath, newContent);
      }

      details.push({ name: item.name, status: "success" });
      successCount++;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      details.push({
        name: item.name,
        status: "failed",
        error: errorMsg,
      });
      failedCount++;
    }
  }

  // 6. 刷新 Skill 缓存
  try {
    await refreshSkillCache();
  } catch {
    // 缓存刷新失败不影响导入结果
    console.error("[importService] 刷新缓存失败");
  }

  return {
    total: items.length,
    success: successCount,
    failed: failedCount,
    details,
  };
}

/**
 * 清理源文件（导入后删除原始文件）
 *
 * P1: 每个路径必须在允许的扫描目录内，防止任意文件删除
 *
 * @param filePaths - 要删除的文件绝对路径列表
 * @param allowedRoot - 允许删除的根目录（默认为 CodeBuddy 扫描路径）
 * @returns 清理结果
 */
export async function cleanupFiles(
  filePaths: string[],
  allowedRoot?: string,
): Promise<{
  total: number;
  success: number;
  failed: number;
  errors: string[];
}> {
  const root = allowedRoot ?? getDefaultScanPath();
  let successCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  for (const filePath of filePaths) {
    try {
      // P1: 校验路径必须在允许的根目录内
      const resolved = normalizePath(path.resolve(filePath));
      if (!isSubPath(resolved, root)) {
        // 路径安全拒绝计入 failed，不中断其他文件的清理
        failedCount++;
        errors.push(`${path.basename(filePath)}: 路径超出允许范围，拒绝删除`);
        continue;
      }
      await fs.remove(filePath);
      successCount++;
    } catch (err) {
      failedCount++;
      errors.push(
        `${path.basename(filePath)}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return {
    total: filePaths.length,
    success: successCount,
    failed: failedCount,
    errors,
  };
}
