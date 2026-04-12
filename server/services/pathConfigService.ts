// ============================================================
// server/services/pathConfigService.ts — 路径配置 CRUD 服务
// ============================================================

import path from "node:path";
import { fileURLToPath } from "node:url";
import type { PathConfig } from "../../shared/types.js";
import { AppError } from "../types/errors.js";
import { readYaml, writeYaml } from "../utils/yamlUtils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const CONFIG_DIR = path.join(PROJECT_ROOT, "config");
const SETTINGS_PATH = path.join(CONFIG_DIR, "settings.yaml");

// ---- 内部工具函数 ----

interface SettingsData {
  version?: string;
  sync?: { targets?: unknown[] };
  paths?: PathConfig[];
  ui?: { defaultView?: string; sidebarWidth?: number };
}

async function readSettings(): Promise<SettingsData> {
  const data = await readYaml<SettingsData>(SETTINGS_PATH);
  return data ?? { version: "0.1.0", sync: { targets: [] }, paths: [], ui: {} };
}

async function writeSettings(data: SettingsData): Promise<void> {
  await writeYaml(SETTINGS_PATH, data);
}

function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 6);
  return `path-${ts}-${rand}`;
}

// ---- 公开 API ----

/**
 * 获取所有路径配置
 */
export async function getPathConfigs(): Promise<PathConfig[]> {
  const settings = await readSettings();
  return settings.paths ?? [];
}

/**
 * 添加路径配置
 */
export async function addPathConfig(
  data: Omit<PathConfig, "id">,
): Promise<PathConfig> {
  if (!data.path.trim()) {
    throw AppError.validationError("路径不能为空");
  }

  const settings = await readSettings();
  const paths = settings.paths ?? [];

  // 检查路径是否已存在（归一化比较）
  const normalized = data.path.trim();
  const duplicate = paths.find((p) => p.path === normalized);
  if (duplicate) {
    throw AppError.validationError(`路径「${normalized}」已存在`);
  }

  const newItem: PathConfig = {
    id: generateId(),
    path: data.path.trim(),
    ...(data.remark?.trim() ? { remark: data.remark.trim() } : {}),
  };

  paths.push(newItem);
  settings.paths = paths;
  await writeSettings(settings);

  return newItem;
}

/**
 * 更新路径配置
 */
export async function updatePathConfig(
  id: string,
  updates: Partial<Omit<PathConfig, "id">>,
): Promise<PathConfig> {
  const settings = await readSettings();
  const paths = settings.paths ?? [];

  const index = paths.findIndex((p) => p.id === id);
  if (index === -1) {
    throw AppError.notFound(`路径配置 "${id}" 未找到`);
  }

  if (updates.path !== undefined && !updates.path.trim()) {
    throw AppError.validationError("路径不能为空");
  }

  // 检查新路径是否与其他配置重复
  if (updates.path !== undefined) {
    const normalized = updates.path.trim();
    const duplicate = paths.find(
      (p, i) => i !== index && p.path === normalized,
    );
    if (duplicate) {
      throw AppError.validationError(`路径「${normalized}」已存在`);
    }
  }

  const existing = paths[index];
  const updated: PathConfig = {
    ...existing,
    ...(updates.path !== undefined ? { path: updates.path.trim() } : {}),
    // remark 支持设置为空字符串（清除备注）
    ...(updates.remark !== undefined
      ? updates.remark.trim()
        ? { remark: updates.remark.trim() }
        : { remark: undefined }
      : {}),
  };

  // 清理 remark 为 undefined 时不在 YAML 中输出
  if (!updated.remark) {
    delete updated.remark;
  }

  paths[index] = updated;
  settings.paths = paths;
  await writeSettings(settings);

  return updated;
}

/**
 * 删除路径配置
 */
export async function deletePathConfig(id: string): Promise<void> {
  const settings = await readSettings();
  const paths = settings.paths ?? [];

  const index = paths.findIndex((p) => p.id === id);
  if (index === -1) {
    throw AppError.notFound(`路径配置 "${id}" 未找到`);
  }

  paths.splice(index, 1);
  settings.paths = paths;
  await writeSettings(settings);
}
