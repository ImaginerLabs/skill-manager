// ============================================================
// src/lib/api.ts — 前端 API 调用封装（fetch + 统一错误处理）
// ============================================================

import type { z } from "zod";
import {
  CategorySchema,
  SkillFullSchema,
  SkillMetaSchema,
} from "../../shared/schemas";
import type { ApiResponse, SkillFull, SkillMeta } from "../../shared/types";

// ---- 错误类 ----

/** API 调用错误 */
export class ApiError extends Error {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

// ---- 通用请求函数 ----

/**
 * 统一的 API 请求函数
 * 自动解析 JSON 响应，处理错误
 */
async function apiCall<T>(
  url: string,
  options?: RequestInit,
  schema?: z.ZodType<T>,
): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new ApiError(json.error.code, json.error.message, json.error.details);
  }

  // 如果提供了 Zod schema，对响应 data 进行运行时校验
  if (schema) {
    const result = schema.safeParse(json.data);
    if (!result.success) {
      console.warn(`[apiCall] 响应数据校验失败 (${url}):`, result.error.issues);
      // 校验失败不阻塞，仅打印警告（避免后端字段微调导致前端崩溃）
    }
  }

  return json.data;
}

// ---- Skill API ----

/** 获取所有 Skill 元数据列表 */
export async function fetchSkills(): Promise<SkillMeta[]> {
  return apiCall<SkillMeta[]>(
    "/api/skills",
    undefined,
    SkillMetaSchema.array(),
  );
}

/** 获取单个 Skill 完整内容 */
export async function fetchSkillById(id: string): Promise<SkillFull> {
  return apiCall<SkillFull>(
    `/api/skills/${encodeURIComponent(id)}`,
    undefined,
    SkillFullSchema,
  );
}

/** 获取解析失败的文件列表 */
export async function fetchParseErrors(): Promise<
  Array<{ filePath: string; error: string }>
> {
  return apiCall<Array<{ filePath: string; error: string }>>(
    "/api/skills/errors",
  );
}

/** 手动触发 Skill 列表刷新 */
export async function refreshSkills(): Promise<{
  total: number;
  success: number;
  errors: number;
}> {
  return apiCall<{ total: number; success: number; errors: number }>(
    "/api/refresh",
    { method: "POST" },
  );
}

// ---- Category API ----

import type { Category } from "../../shared/types";

/** 获取分类列表 */
export async function fetchCategories(): Promise<Category[]> {
  return apiCall<Category[]>(
    "/api/categories",
    undefined,
    CategorySchema.array(),
  );
}

/** 创建新分类 */
export async function createCategory(data: {
  name: string;
  displayName: string;
  description?: string;
}): Promise<Category> {
  return apiCall<Category>("/api/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** 更新分类 */
export async function updateCategory(
  name: string,
  data: { displayName?: string; description?: string },
): Promise<Category> {
  return apiCall<Category>(`/api/categories/${encodeURIComponent(name)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/** 删除分类 */
export async function deleteCategory(name: string): Promise<void> {
  return apiCall<void>(`/api/categories/${encodeURIComponent(name)}`, {
    method: "DELETE",
  });
}

// ---- Skill 管理 API ----

/** 更新 Skill 元数据 */
export async function updateSkillMeta(
  id: string,
  data: {
    name?: string;
    description?: string;
    category?: string;
    tags?: string[];
  },
): Promise<SkillMeta> {
  return apiCall<SkillMeta>(`/api/skills/${encodeURIComponent(id)}/meta`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/** 移动 Skill 到其他分类 */
export async function moveSkillCategory(
  id: string,
  category: string,
): Promise<SkillMeta> {
  return apiCall<SkillMeta>(`/api/skills/${encodeURIComponent(id)}/category`, {
    method: "PUT",
    body: JSON.stringify({ category }),
  });
}

/** 删除 Skill */
export async function deleteSkill(id: string): Promise<void> {
  return apiCall<void>(`/api/skills/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/** 删除目标目录下所有 Skill */
export async function deleteSkillsByPath(targetPath: string): Promise<{
  deleted: string[];
}> {
  return apiCall<{ deleted: string[] }>(
    `/api/skills/by-path?path=${encodeURIComponent(targetPath)}`,
    { method: "DELETE" },
  );
}

// ---- Import/Scan API ----

import type { ImportResult, ScanResult } from "../../shared/types";

/** 扫描 IDE 目录中的 Skill 文件 */
export async function scanDirectory(scanPath?: string): Promise<ScanResult> {
  return apiCall<ScanResult>("/api/import/scan", {
    method: "POST",
    body: JSON.stringify({ path: scanPath }),
  });
}

/** 执行文件导入 */
export async function importFiles(
  items: Array<{ absolutePath: string; name: string }>,
  category: string,
  scanRoot?: string,
): Promise<ImportResult> {
  return apiCall<ImportResult>("/api/import/execute", {
    method: "POST",
    body: JSON.stringify({ items, category, scanRoot }),
  });
}

/** 检测 CodeBuddy IDE 目录（冷启动引导） */
export async function detectCodeBuddy(): Promise<{
  detected: boolean;
  path: string;
  fileCount: number;
}> {
  return apiCall<{ detected: boolean; path: string; fileCount: number }>(
    "/api/import/detect-codebuddy",
  );
}

/** 清理源文件（导入后删除原始文件） */
export async function cleanupSourceFiles(
  filePaths: string[],
  scanRoot?: string,
): Promise<{
  total: number;
  success: number;
  failed: number;
  errors: string[];
}> {
  return apiCall<{
    total: number;
    success: number;
    failed: number;
    errors: string[];
  }>("/api/import/cleanup", {
    method: "POST",
    body: JSON.stringify({ filePaths, scanRoot }),
  });
}

// ---- Workflow API ----

import type { Workflow, WorkflowStep } from "../../shared/types";

/** 获取所有工作流列表 */
export async function fetchWorkflows(): Promise<
  Array<{ id: string; name: string; description: string; filePath: string }>
> {
  return apiCall<
    Array<{ id: string; name: string; description: string; filePath: string }>
  >("/api/workflows");
}

/** 获取单个工作流详情（结构化数据，含 steps） */
export async function fetchWorkflowDetail(id: string): Promise<{
  id: string;
  name: string;
  description: string;
  filePath: string;
  steps: WorkflowStep[];
}> {
  return apiCall<{
    id: string;
    name: string;
    description: string;
    filePath: string;
    steps: WorkflowStep[];
  }>(`/api/workflows/${encodeURIComponent(id)}`);
}

/** 创建新工作流 */
export async function createWorkflow(
  workflow: Workflow,
): Promise<{ id: string; filePath: string }> {
  return apiCall<{ id: string; filePath: string }>("/api/workflows", {
    method: "POST",
    body: JSON.stringify(workflow),
  });
}

/** 预览工作流内容（不保存） */
export async function previewWorkflow(
  workflow: Workflow,
): Promise<{ content: string }> {
  return apiCall<{ content: string }>("/api/workflows/preview", {
    method: "POST",
    body: JSON.stringify(workflow),
  });
}

/** 更新工作流 */
export async function updateWorkflow(
  id: string,
  workflow: Workflow,
): Promise<{ id: string; filePath: string }> {
  return apiCall<{ id: string; filePath: string }>(
    `/api/workflows/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(workflow),
    },
  );
}

/** 删除工作流 */
export async function deleteWorkflow(id: string): Promise<void> {
  return apiCall<void>(`/api/workflows/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// ---- Sync Target API ----

import type { SyncTarget } from "../../shared/types";

/** 获取所有同步目标 */
export async function fetchSyncTargets(): Promise<SyncTarget[]> {
  return apiCall<SyncTarget[]>("/api/sync/targets");
}

/** 添加同步目标 */
export async function addSyncTarget(data: {
  name: string;
  path: string;
  enabled?: boolean;
}): Promise<SyncTarget> {
  return apiCall<SyncTarget>("/api/sync/targets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** 更新同步目标 */
export async function updateSyncTarget(
  id: string,
  data: { name?: string; path?: string; enabled?: boolean },
): Promise<SyncTarget> {
  return apiCall<SyncTarget>(`/api/sync/targets/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/** 删除同步目标 */
export async function deleteSyncTarget(id: string): Promise<void> {
  return apiCall<void>(`/api/sync/targets/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/** 校验同步路径 */
export async function validateSyncPath(
  targetPath: string,
): Promise<{ exists: boolean; writable: boolean }> {
  return apiCall<{ exists: boolean; writable: boolean }>(
    "/api/sync/validate-path",
    {
      method: "POST",
      body: JSON.stringify({ path: targetPath }),
    },
  );
}

// ---- Sync Push API ----

import type {
  DiffReport,
  PathPreset,
  SyncMode,
  SyncResult,
} from "../../shared/types";

/** 执行同步推送（支持 full / incremental / replace 模式） */
export async function pushSync(
  skillIds: string[],
  targetIds?: string[],
  mode?: SyncMode,
): Promise<SyncResult> {
  return apiCall<SyncResult>("/api/sync/push", {
    method: "POST",
    body: JSON.stringify({ skillIds, targetIds, mode }),
  });
}

/** 对比源 Skill 与目标目录的差异（不执行文件操作） */
export async function diffSync(
  skillIds: string[],
  targetId: string,
): Promise<DiffReport> {
  return apiCall<DiffReport>("/api/sync/diff", {
    method: "POST",
    body: JSON.stringify({ skillIds, targetId }),
  });
}

// ---- Path Preset API ----

/** 获取所有路径预设 */
export async function fetchPathPresets(): Promise<PathPreset[]> {
  return apiCall<PathPreset[]>("/api/path-presets");
}

/** 添加路径预设 */
export async function addPathPreset(data: {
  path: string;
  label?: string;
}): Promise<PathPreset> {
  return apiCall<PathPreset>("/api/path-presets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** 更新路径预设 */
export async function updatePathPreset(
  id: string,
  data: { path?: string; label?: string },
): Promise<PathPreset> {
  return apiCall<PathPreset>(`/api/path-presets/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/** 删除路径预设 */
export async function deletePathPreset(id: string): Promise<void> {
  return apiCall<void>(`/api/path-presets/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// ---- Skill Bundle API ----

import type {
  ApplyBundleResult,
  SkillBundleCreate,
  SkillBundleUpdate,
  SkillBundleWithStatus,
} from "../../shared/types";

/** 获取所有套件（含损坏引用信息） */
export async function fetchSkillBundles(): Promise<SkillBundleWithStatus[]> {
  return apiCall<SkillBundleWithStatus[]>("/api/skill-bundles");
}

/** 创建套件 */
export async function createSkillBundle(
  data: SkillBundleCreate,
): Promise<SkillBundleWithStatus> {
  return apiCall<SkillBundleWithStatus>("/api/skill-bundles", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** 更新套件 */
export async function updateSkillBundle(
  id: string,
  data: SkillBundleUpdate,
): Promise<SkillBundleWithStatus> {
  return apiCall<SkillBundleWithStatus>(
    `/api/skill-bundles/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

/** 删除套件 */
export async function deleteSkillBundle(id: string): Promise<void> {
  return apiCall<void>(`/api/skill-bundles/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/** 激活套件（将套件中的分类设为当前激活分类） */
export async function applySkillBundle(id: string): Promise<ApplyBundleResult> {
  return apiCall<ApplyBundleResult>(
    `/api/skill-bundles/${encodeURIComponent(id)}/apply`,
    { method: "PUT" },
  );
}

// ---- Stats API ----

/** 活跃度数据点 */
export interface ActivityDay {
  date: string; // YYYY-MM-DD
  count: number; // 当日修改文件数
  files: string[]; // 当日修改的文件名列表（不含路径和 .md 后缀）
}

/** 获取近 N 周 Skill 文件修改活跃度 */
export async function fetchActivityStats(weeks = 12): Promise<ActivityDay[]> {
  return apiCall<ActivityDay[]>(`/api/stats/activity?weeks=${weeks}`);
}
