// ============================================================
// shared/schemas.ts — Zod Schema 定义（前后端共用）
// ============================================================

import { z } from "zod";

// ---- Skill 相关 Schema ----

/** SkillMeta Zod Schema */
export const SkillMetaSchema = z.object({
  id: z.string().min(1, "id 不能为空"),
  name: z.string().min(1, "name 不能为空"),
  description: z.string(),
  category: z.string().min(1, "category 不能为空"),
  tags: z.array(z.string()).default([]),
  type: z.literal("workflow").optional(),
  author: z.string().optional(),
  version: z.string().optional(),
  filePath: z.string().min(1, "filePath 不能为空"),
  fileSize: z.number().nonnegative("fileSize 不能为负数"),
  lastModified: z
    .string()
    .datetime({ message: "lastModified 必须是有效的 ISO 8601 时间戳" }),
});

/** SkillFull Zod Schema */
export const SkillFullSchema = SkillMetaSchema.extend({
  content: z.string(),
  rawContent: z.string(),
});

// ---- 工作流相关 Schema ----

/** WorkflowStep Zod Schema */
export const WorkflowStepSchema = z.object({
  order: z.number().int().nonnegative(),
  skillId: z.string().min(1),
  skillName: z.string().min(1),
  description: z.string(),
});

/** Workflow Zod Schema */
export const WorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  steps: z.array(WorkflowStepSchema),
});

// ---- 同步相关 Schema ----

/** SyncTarget Zod Schema */
export const SyncTargetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  path: z.string().min(1),
  enabled: z.boolean(),
});

/** SyncDetail Zod Schema */
export const SyncDetailSchema = z.object({
  skillId: z.string(),
  skillName: z.string(),
  targetPath: z.string(),
  status: z.enum(["success", "overwritten", "failed"]),
  error: z.string().optional(),
});

/** SyncResult Zod Schema */
export const SyncResultSchema = z.object({
  total: z.number().nonnegative(),
  success: z.number().nonnegative(),
  overwritten: z.number().nonnegative(),
  failed: z.number().nonnegative(),
  details: z.array(SyncDetailSchema),
});

// ---- 分类与配置 Schema ----

/** Category Zod Schema */
export const CategorySchema = z.object({
  name: z.string().min(1),
  displayName: z.string().min(1),
  description: z.string().optional(),
  skillCount: z.number().nonnegative(),
});

/** AppConfig Zod Schema */
export const AppConfigSchema = z.object({
  version: z.string(),
  sync: z.object({
    targets: z.array(SyncTargetSchema),
  }),
  categories: z.array(CategorySchema),
  ui: z.object({
    defaultView: z.enum(["grid", "list"]),
    sidebarWidth: z.number().positive(),
  }),
});

// ---- API 响应 Schema ----

/** API 错误响应 Schema */
export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

/**
 * 创建 API 成功响应 Schema 的工厂函数
 * @param dataSchema - data 字段的 Zod Schema
 */
export function createApiSuccessSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
  });
}

/**
 * 创建完整 API 响应 Schema 的工厂函数
 * @param dataSchema - data 字段的 Zod Schema
 */
export function createApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.discriminatedUnion("success", [
    createApiSuccessSchema(dataSchema),
    ApiErrorSchema,
  ]);
}

// ---- 请求体校验 Schema（后端路由入口使用） ----

/** PUT /api/skills/:id/meta 请求体 */
export const UpdateSkillMetaBodySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
});

/** PUT /api/skills/:id/category 请求体 */
export const MoveSkillCategoryBodySchema = z.object({
  category: z.string().min(1, "category 为必填项"),
});

/** POST /api/categories 请求体 */
export const CreateCategoryBodySchema = z.object({
  name: z.string().min(1, "name 为必填项"),
  displayName: z.string().min(1, "displayName 为必填项"),
  description: z.string().optional(),
});

/** PUT /api/categories/:name 请求体 */
export const UpdateCategoryBodySchema = z.object({
  displayName: z.string().min(1).optional(),
  description: z.string().optional(),
});

// ---- 类型推断导出 ----

export type SkillMetaInferred = z.infer<typeof SkillMetaSchema>;
export type SkillFullInferred = z.infer<typeof SkillFullSchema>;
export type WorkflowStepInferred = z.infer<typeof WorkflowStepSchema>;
export type WorkflowInferred = z.infer<typeof WorkflowSchema>;
export type SyncTargetInferred = z.infer<typeof SyncTargetSchema>;
export type SyncDetailInferred = z.infer<typeof SyncDetailSchema>;
export type SyncResultInferred = z.infer<typeof SyncResultSchema>;
export type CategoryInferred = z.infer<typeof CategorySchema>;
export type AppConfigInferred = z.infer<typeof AppConfigSchema>;
