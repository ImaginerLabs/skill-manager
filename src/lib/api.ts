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
