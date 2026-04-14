// ============================================================
// server/services/syncService.ts — 同步目标 CRUD 服务
// ============================================================

import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { SyncDetail, SyncResult, SyncTarget } from "../../shared/types.js";
import { AppError } from "../types/errors.js";
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

/**
 * 执行同步推送 — 将选定的 Skill 整个文件夹复制到启用的同步目标目录
 *
 * 流程：
 * 1. 获取启用的同步目标列表
 * 2. 从 meta.filePath（如 "coding/explore/SKILL.md"）推导出 Skill 文件夹路径
 * 3. 将整个 Skill 文件夹复制到 {target.path}/{folderName}/
 * 4. 同名文件夹默认覆盖，在结果中标注 overwritten
 */
export async function pushSync(
  skillIds: string[],
  targetIds?: string[],
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

  // 对每个 Skill × 每个目标执行文件夹复制
  for (const skillId of skillIds) {
    const meta = getSkillMeta(skillId);
    if (!meta) {
      // Skill 不存在，记录失败
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

    // 从 meta.filePath（如 "coding/explore/SKILL.md"）推导出 Skill 文件夹
    const skillRelDir = path.dirname(meta.filePath); // "coding/explore"
    const sourceDir = path.join(skillsRoot, skillRelDir); // 源文件夹绝对路径
    const folderName = path.basename(skillRelDir); // "explore" — Skill 文件夹名

    for (const target of targets) {
      const destDir = path.join(target.path, folderName);
      try {
        // 确保目标父目录存在
        await fs.ensureDir(target.path);

        // 检查目标文件夹是否已存在（判断是否为覆盖）
        const existed = await fs.pathExists(destDir);

        // 复制整个 Skill 文件夹（overwrite: true 覆盖已有内容）
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

  return {
    total: details.length,
    success: successCount,
    overwritten: overwrittenCount,
    failed: failedCount,
    details,
  };
}
