// ============================================================
// server/services/syncService.ts — 同步目标 CRUD 服务
// ============================================================

import fs from "fs-extra";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  DiffItem,
  DiffReport,
  SyncDetail,
  SyncMode,
  SyncResult,
  SyncTarget,
} from "../../shared/types.js";
import { AppError } from "../types/errors.js";
import { isSubPath } from "../utils/pathUtils.js";
import { readYaml, writeYaml } from "../utils/yamlUtils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const CONFIG_DIR = path.join(PROJECT_ROOT, "config");
const SETTINGS_PATH = path.join(CONFIG_DIR, "settings.yaml");

// ---- 内部工具函数 ----

interface SettingsData {
  version?: string;
  sync?: { targets?: SyncTarget[] };
  ui?: { defaultView?: string; sidebarWidth?: number };
}

/**
 * 读取 settings.yaml 完整内容
 */
async function readSettings(): Promise<SettingsData> {
  const data = await readYaml<SettingsData>(SETTINGS_PATH);
  return data ?? { version: "0.1.0", sync: { targets: [] }, ui: {} };
}

/**
 * 写入 settings.yaml（保留其他字段）
 */
async function writeSettings(data: SettingsData): Promise<void> {
  await writeYaml(SETTINGS_PATH, data);
}

/**
 * 生成唯一 ID（基于时间戳 + 随机数）
 */
function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 6);
  return `sync-${ts}-${rand}`;
}

// ---- 公开 API ----

/**
 * 获取所有同步目标
 */
export async function getSyncTargets(): Promise<SyncTarget[]> {
  const settings = await readSettings();
  return settings.sync?.targets ?? [];
}

/**
 * 添加同步目标
 */
export async function addSyncTarget(
  target: Omit<SyncTarget, "id">,
): Promise<SyncTarget> {
  if (!target.name.trim()) {
    throw AppError.validationError("同步目标名称不能为空");
  }
  if (!target.path.trim()) {
    throw AppError.validationError("同步目标路径不能为空");
  }

  // 路径合法性校验：必须是绝对路径
  if (!path.isAbsolute(target.path)) {
    throw AppError.validationError("同步目标路径必须是绝对路径");
  }

  const settings = await readSettings();
  const targets = settings.sync?.targets ?? [];

  // 检查路径是否已存在
  const normalized = path.normalize(target.path);
  const duplicate = targets.find((t) => path.normalize(t.path) === normalized);
  if (duplicate) {
    throw AppError.validationError(
      `路径已存在于同步目标「${duplicate.name}」中`,
    );
  }

  const newTarget: SyncTarget = {
    id: generateId(),
    name: target.name.trim(),
    path: target.path.trim(),
    enabled: target.enabled ?? true,
  };

  targets.push(newTarget);
  settings.sync = { ...settings.sync, targets };
  await writeSettings(settings);

  return newTarget;
}

/**
 * 更新同步目标
 */
export async function updateSyncTarget(
  id: string,
  updates: Partial<Omit<SyncTarget, "id">>,
): Promise<SyncTarget> {
  const settings = await readSettings();
  const targets = settings.sync?.targets ?? [];

  const index = targets.findIndex((t) => t.id === id);
  if (index === -1) {
    throw AppError.notFound(`同步目标 "${id}" 未找到`);
  }

  // 如果更新路径，校验合法性
  if (updates.path !== undefined) {
    if (!updates.path.trim()) {
      throw AppError.validationError("同步目标路径不能为空");
    }
    if (!path.isAbsolute(updates.path)) {
      throw AppError.validationError("同步目标路径必须是绝对路径");
    }

    // 检查路径是否与其他目标重复
    const normalized = path.normalize(updates.path);
    const duplicate = targets.find(
      (t, i) => i !== index && path.normalize(t.path) === normalized,
    );
    if (duplicate) {
      throw AppError.validationError(
        `路径已存在于同步目标「${duplicate.name}」中`,
      );
    }
  }

  if (updates.name !== undefined && !updates.name.trim()) {
    throw AppError.validationError("同步目标名称不能为空");
  }

  const updated: SyncTarget = {
    ...targets[index],
    ...(updates.name !== undefined && { name: updates.name.trim() }),
    ...(updates.path !== undefined && { path: updates.path.trim() }),
    ...(updates.enabled !== undefined && { enabled: updates.enabled }),
  };

  targets[index] = updated;
  settings.sync = { ...settings.sync, targets };
  await writeSettings(settings);

  return updated;
}

/**
 * 删除同步目标
 */
export async function removeSyncTarget(id: string): Promise<void> {
  const settings = await readSettings();
  const targets = settings.sync?.targets ?? [];

  const index = targets.findIndex((t) => t.id === id);
  if (index === -1) {
    throw AppError.notFound(`同步目标 "${id}" 未找到`);
  }

  targets.splice(index, 1);
  settings.sync = { ...settings.sync, targets };
  await writeSettings(settings);
}

/**
 * 校验同步路径是否存在且可访问
 */
export async function validateSyncPath(
  targetPath: string,
): Promise<{ exists: boolean; writable: boolean }> {
  if (!path.isAbsolute(targetPath)) {
    throw AppError.validationError("路径必须是绝对路径");
  }

  const exists = await fs.pathExists(targetPath);
  if (!exists) {
    return { exists: false, writable: false };
  }

  try {
    await fs.access(targetPath, fs.constants.W_OK);
    return { exists: true, writable: true };
  } catch {
    return { exists: true, writable: false };
  }
}

// ---- 文件比较工具函数 ----

/**
 * 计算文件的 md5 哈希值
 */
async function computeMd5(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath);
  return createHash("md5").update(content).digest("hex");
}

/**
 * 比较源文件和目标文件，判断是否需要同步
 * 分层策略：先比较 mtime（O(1)），mtime 不同再比较 md5（O(n)）
 */
async function compareSkillFile(
  sourcePath: string,
  targetPath: string,
): Promise<{
  status: "added" | "modified" | "unchanged";
  method: "mtime" | "md5";
}> {
  // 1. 目标文件不存在 → 新增
  const targetExists = await fs.pathExists(targetPath);
  if (!targetExists) {
    return { status: "added", method: "mtime" };
  }

  // 2. 快速路径：比较 mtime
  const [sourceStat, targetStat] = await Promise.all([
    fs.stat(sourcePath),
    fs.stat(targetPath),
  ]);

  // mtime 相同 → 大概率未变化（快速跳过）
  if (sourceStat.mtimeMs === targetStat.mtimeMs) {
    return { status: "unchanged", method: "mtime" };
  }

  // 3. mtime 不同 → 回退到 md5 精确比较
  try {
    const [sourceHash, targetHash] = await Promise.all([
      computeMd5(sourcePath),
      computeMd5(targetPath),
    ]);

    if (sourceHash === targetHash) {
      return { status: "unchanged", method: "md5" };
    }

    return { status: "modified", method: "md5" };
  } catch {
    // md5 计算失败时回退到全量覆盖（FR-V2-29）
    return { status: "modified", method: "md5" };
  }
}

/**
 * 查找 Skill 文件夹中的代表性文件（SKILL.md 或第一个 .md 文件）
 */
function findRepresentativeFile(dirPath: string, files: string[]): string {
  // 优先 SKILL.md
  if (files.includes("SKILL.md")) {
    return path.join(dirPath, "SKILL.md");
  }
  // 其次第一个 .md 文件
  const mdFile = files.find((f) => f.endsWith(".md"));
  if (mdFile) {
    return path.join(dirPath, mdFile);
  }
  // 兜底：目录本身（不应该发生）
  return dirPath;
}

/**
 * 从 Skill meta 推导出源文件夹路径和文件夹名
 */
function resolveSkillDirs(
  meta: { filePath: string },
  skillsRoot: string,
): { sourceDir: string; folderName: string } {
  const skillRelDir = path.dirname(meta.filePath);
  const sourceDir = path.join(skillsRoot, skillRelDir);
  const folderName = path.basename(skillRelDir);
  return { sourceDir, folderName };
}

// ---- 同步推送（支持多模式） ----

/**
 * 执行同步推送 — 支持 full / incremental / replace 三种模式
 *
 * - full（默认）：全量覆盖，同名文件夹直接覆盖
 * - incremental：增量同步，mtime + md5 分层比较，跳过未变化文件
 * - replace：替换同步，先删除目标中对应文件夹，再全量复制
 */
export async function pushSync(
  skillIds: string[],
  targetIds?: string[],
  mode: SyncMode = "full",
): Promise<SyncResult> {
  const { getSkillMeta, getSkillsRoot } = await import("./skillService.js");

  if (skillIds.length === 0) {
    throw AppError.validationError("至少选择一个 Skill");
  }

  // 获取同步目标（仅启用的）
  const allTargets = await getSyncTargets();
  let targets: SyncTarget[];
  if (targetIds && targetIds.length > 0) {
    targets = allTargets.filter((t) => t.enabled && targetIds.includes(t.id));
  } else {
    targets = allTargets.filter((t) => t.enabled);
  }

  if (targets.length === 0) {
    throw AppError.validationError(
      "没有可用的同步目标（请确保至少有一个启用的同步目标）",
    );
  }

  const skillsRoot = getSkillsRoot();
  const details: SyncDetail[] = [];
  let successCount = 0;
  let overwrittenCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  let updatedCount = 0;
  let deletedCount = 0;

  // 收集本次同步涉及的文件夹名（用于 replace 模式删除孤儿）
  const syncedFolderNames = new Set<string>();

  for (const skillId of skillIds) {
    const meta = getSkillMeta(skillId);
    if (!meta) {
      for (const target of targets) {
        details.push({
          skillId,
          skillName: skillId,
          targetPath: target.path,
          status: "failed",
          error: `Skill "${skillId}" 未找到`,
        });
        failedCount++;
      }
      continue;
    }

    const { sourceDir, folderName } = resolveSkillDirs(meta, skillsRoot);
    syncedFolderNames.add(folderName);

    for (const target of targets) {
      const destDir = path.join(target.path, folderName);

      try {
        // 确保目标父目录存在
        await fs.ensureDir(target.path);

        if (mode === "replace") {
          // 替换模式：先安全删除，再全量复制
          if (!isSubPath(destDir, target.path)) {
            throw AppError.pathTraversal();
          }
          if (await fs.pathExists(destDir)) {
            await fs.remove(destDir);
          }
          await fs.copy(sourceDir, destDir, { overwrite: true });
          details.push({
            skillId: meta.id,
            skillName: meta.name,
            targetPath: destDir,
            status: "success",
          });
          successCount++;
        } else if (mode === "incremental") {
          // 增量模式：比较后决定是否复制
          const sourceFiles = await fs.readdir(sourceDir);
          const repFile = findRepresentativeFile(sourceDir, sourceFiles);
          const targetRepFile = path.join(
            destDir,
            path.relative(sourceDir, repFile),
          );

          const cmp = await compareSkillFile(repFile, targetRepFile);

          if (cmp.status === "unchanged") {
            details.push({
              skillId: meta.id,
              skillName: meta.name,
              targetPath: destDir,
              status: "skipped",
            });
            skippedCount++;
          } else {
            await fs.copy(sourceDir, destDir, { overwrite: true });
            if (cmp.status === "added") {
              details.push({
                skillId: meta.id,
                skillName: meta.name,
                targetPath: destDir,
                status: "success",
              });
              successCount++;
            } else {
              details.push({
                skillId: meta.id,
                skillName: meta.name,
                targetPath: destDir,
                status: "updated",
              });
              updatedCount++;
            }
          }
        } else {
          // full 模式（默认）：全量覆盖
          const existed = await fs.pathExists(destDir);
          await fs.copy(sourceDir, destDir, { overwrite: true });

          if (existed) {
            details.push({
              skillId: meta.id,
              skillName: meta.name,
              targetPath: destDir,
              status: "overwritten",
            });
            overwrittenCount++;
          } else {
            details.push({
              skillId: meta.id,
              skillName: meta.name,
              targetPath: destDir,
              status: "success",
            });
            successCount++;
          }
        }
      } catch (err) {
        details.push({
          skillId: meta.id,
          skillName: meta.name,
          targetPath: destDir,
          status: "failed",
          error: err instanceof Error ? err.message : String(err),
        });
        failedCount++;
      }
    }
  }

  // 替换模式：删除目标目录中不在本次同步列表中的孤儿 Skill 文件夹
  if (mode === "replace") {
    for (const target of targets) {
      try {
        const targetExists = await fs.pathExists(target.path);
        if (!targetExists) continue;

        const targetEntries = await fs.readdir(target.path, {
          withFileTypes: true,
        });

        for (const entry of targetEntries) {
          if (!entry.isDirectory() || syncedFolderNames.has(entry.name)) {
            continue;
          }

          const entryPath = path.join(target.path, entry.name);

          // 检查是否是 Skill 文件夹（包含 .md 文件）
          try {
            const entryFiles = await fs.readdir(entryPath);
            const hasMd = entryFiles.some((f) => f.endsWith(".md"));
            if (!hasMd) continue;
          } catch {
            continue;
          }

          // 路径安全校验
          if (!isSubPath(entryPath, target.path)) continue;

          try {
            await fs.remove(entryPath);
            details.push({
              skillId: entry.name,
              skillName: entry.name,
              targetPath: entryPath,
              status: "deleted",
            });
            deletedCount++;
          } catch (err) {
            details.push({
              skillId: entry.name,
              skillName: entry.name,
              targetPath: entryPath,
              status: "failed",
              error: `删除孤儿文件夹失败: ${err instanceof Error ? err.message : String(err)}`,
            });
            failedCount++;
          }
        }
      } catch {
        // 目标目录读取失败，跳过该目标的孤儿清理
      }
    }
  }

  return {
    total: details.length,
    success: successCount,
    overwritten: overwrittenCount,
    failed: failedCount,
    skipped: skippedCount,
    updated: updatedCount,
    deleted: deletedCount,
    details,
  };
}

// ---- Diff 对比 ----

/**
 * 对比源 Skill 与目标目录的差异，生成差异报告
 * 不执行任何文件操作
 */
export async function diffSync(
  skillIds: string[],
  targetId: string,
): Promise<DiffReport> {
  const { getSkillMeta, getSkillsRoot } = await import("./skillService.js");

  if (skillIds.length === 0) {
    throw AppError.validationError("至少选择一个 Skill");
  }

  // 获取目标
  const allTargets = await getSyncTargets();
  const target = allTargets.find((t) => t.id === targetId);
  if (!target) {
    throw AppError.notFound(`同步目标 "${targetId}" 未找到`);
  }

  const targetPath = target.path;
  const targetExists = await fs.pathExists(targetPath);

  const skillsRoot = getSkillsRoot();
  const added: DiffItem[] = [];
  const modified: DiffItem[] = [];
  const unchanged: DiffItem[] = [];
  const deleted: DiffItem[] = [];

  // 1. 正向遍历：源 → 目标
  const sourceBasenames = new Set<string>();

  for (const skillId of skillIds) {
    const meta = getSkillMeta(skillId);
    if (!meta) continue;

    const { sourceDir, folderName } = resolveSkillDirs(meta, skillsRoot);
    sourceBasenames.add(folderName);

    const item: DiffItem = {
      skillId: meta.id,
      skillName: meta.name,
      path: folderName,
    };

    if (!targetExists) {
      added.push(item);
      continue;
    }

    const destDir = path.join(targetPath, folderName);
    const destExists = await fs.pathExists(destDir);

    if (!destExists) {
      added.push(item);
      continue;
    }

    // 以代表性文件哈希比较
    try {
      const sourceFiles = await fs.readdir(sourceDir);
      const repFile = findRepresentativeFile(sourceDir, sourceFiles);
      const targetRepFile = path.join(
        destDir,
        path.relative(sourceDir, repFile),
      );

      const targetRepExists = await fs.pathExists(targetRepFile);
      if (!targetRepExists) {
        modified.push(item);
        continue;
      }

      const [sourceHash, targetHash] = await Promise.all([
        computeMd5(repFile),
        computeMd5(targetRepFile),
      ]);

      if (sourceHash === targetHash) {
        unchanged.push(item);
      } else {
        modified.push(item);
      }
    } catch {
      // 哈希计算失败，视为已修改
      modified.push(item);
    }
  }

  // 2. 反向遍历：目标中有但源中没有的 → 删除候选
  if (targetExists) {
    try {
      const targetEntries = await fs.readdir(targetPath, {
        withFileTypes: true,
      });

      for (const entry of targetEntries) {
        if (entry.isDirectory() && !sourceBasenames.has(entry.name)) {
          // 检查是否是 Skill 文件夹（包含 .md 文件）
          const entryPath = path.join(targetPath, entry.name);
          const entryFiles = await fs.readdir(entryPath);
          const hasMd = entryFiles.some((f) => f.endsWith(".md"));
          if (hasMd) {
            deleted.push({
              skillId: entry.name,
              skillName: entry.name,
              path: entry.name,
            });
          }
        }
      }
    } catch {
      // 目标目录读取失败，忽略反向遍历
    }
  }

  return {
    targetId: target.id,
    targetPath: target.path,
    added,
    modified,
    deleted,
    unchanged,
    generatedAt: new Date().toISOString(),
  };
}
