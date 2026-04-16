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
  // 外部 Skill 来源元数据（可选，向后兼容）
  source: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  sourceRepo: z.string().url().optional(),
  readonly: z.boolean().optional(),
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
  skillId: z.string().nullable(),
  skillName: z.string().nullable(),
  description: z.string(),
  type: z.enum(["skill", "custom"]),
});

/** Workflow Zod Schema */
export const WorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  steps: z.array(WorkflowStepSchema),
});

// ---- 扫描相关 Schema ----

/** ScanResultItem Zod Schema */
export const ScanResultItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  filePath: z.string(),
  absolutePath: z.string(),
  parseStatus: z.enum(["ok", "failed"]),
  parseError: z.string().optional(),
  fileSize: z.number().nonnegative(),
  lastModified: z.string(),
});

/** ScanResult Zod Schema */
export const ScanResultSchema_Import = z.object({
  items: z.array(ScanResultItemSchema),
  scanPath: z.string(),
  totalFiles: z.number().nonnegative(),
});

/** POST /api/import/scan 请求体 */
export const ScanRequestBodySchema = z.object({
  path: z.string().optional(),
});

// ---- 导入相关 Schema ----

/** ImportRequestItem Zod Schema */
export const ImportRequestItemSchema = z.object({
  absolutePath: z.string().min(1),
  name: z.string().min(1),
});

/** POST /api/import/execute 请求体 */
export const ImportRequestBodySchema = z.object({
  items: z.array(ImportRequestItemSchema).min(1, "至少选择一个文件"),
  category: z.string().min(1, "分类为必填项"),
  /** 扫描时使用的根目录，用于路径安全校验 */
  scanRoot: z.string().optional(),
});

/** POST /api/import/cleanup 请求体 */
export const CleanupRequestBodySchema = z.object({
  filePaths: z.array(z.string().min(1)).min(1, "filePaths 不能为空"),
  /** 允许删除的根目录（默认为 CodeBuddy 扫描路径） */
  scanRoot: z.string().optional(),
});

/** ImportResultItem Zod Schema */
export const ImportResultItemSchema = z.object({
  name: z.string(),
  status: z.enum(["success", "failed"]),
  error: z.string().optional(),
});

/** ImportResult Zod Schema */
export const ImportResultSchema = z.object({
  total: z.number().nonnegative(),
  success: z.number().nonnegative(),
  failed: z.number().nonnegative(),
  details: z.array(ImportResultItemSchema),
});

// ---- 同步相关 Schema ----

/** SyncTarget Zod Schema */
export const SyncTargetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  path: z.string().min(1),
  enabled: z.boolean(),
});

/** SyncMode Zod Schema */
export const SyncModeSchema = z.enum(["incremental", "replace", "full"]);

/** SyncDetail Zod Schema */
export const SyncDetailSchema = z.object({
  skillId: z.string(),
  skillName: z.string(),
  targetPath: z.string(),
  status: z.enum([
    "success",
    "overwritten",
    "failed",
    "skipped",
    "updated",
    "deleted",
  ]),
  error: z.string().optional(),
});

/** SyncResult Zod Schema */
export const SyncResultSchema = z.object({
  total: z.number().nonnegative(),
  success: z.number().nonnegative(),
  overwritten: z.number().nonnegative(),
  failed: z.number().nonnegative(),
  skipped: z.number().nonnegative(),
  updated: z.number().nonnegative(),
  deleted: z.number().nonnegative(),
  details: z.array(SyncDetailSchema),
});

/** DiffItem Zod Schema */
export const DiffItemSchema = z.object({
  skillId: z.string(),
  skillName: z.string(),
  path: z.string(),
});

/** DiffReport Zod Schema */
export const DiffReportSchema = z.object({
  targetId: z.string(),
  targetPath: z.string(),
  added: z.array(DiffItemSchema),
  modified: z.array(DiffItemSchema),
  deleted: z.array(DiffItemSchema),
  unchanged: z.array(DiffItemSchema),
  generatedAt: z.string(),
});

// ---- 路径预设 Schema ----

/** PathPreset Zod Schema */
export const PathPresetSchema = z.object({
  id: z.string().min(1),
  path: z.string().min(1),
  label: z.string().optional(),
});

/** POST /api/path-presets 请求体 */
export const PathPresetCreateSchema = z.object({
  path: z.string().min(1, "path 为必填项"),
  label: z.string().optional(),
});

/** PUT /api/path-presets/:id 请求体 */
export const PathPresetUpdateSchema = z.object({
  path: z.string().min(1).optional(),
  label: z.string().optional(),
});

// ---- 外部仓库配置 Schema ----

/** RepoSkillMapping Zod Schema */
export const RepoSkillMappingSchema = z.object({
  name: z.string().min(1, "name 不能为空"),
  targetCategory: z.string().min(1, "targetCategory 不能为空"),
});

/** ExternalRepository Zod Schema */
export const ExternalRepositorySchema = z.object({
  id: z.string().min(1, "id 不能为空"),
  name: z.string().min(1, "name 不能为空"),
  /** 必须是 https://github.com/ 开头的合法 URL */
  url: z
    .string()
    .regex(
      /^https:\/\/github\.com\//,
      "url 必须是 https://github.com/ 开头的合法 GitHub URL",
    ),
  branch: z.string().min(1, "branch 不能为空"),
  skillsPath: z.string().min(1, "skillsPath 不能为空"),
  enabled: z.boolean(),
  include: z.array(RepoSkillMappingSchema).default([]),
  exclude: z.array(z.string()).default([]),
});

/** RepositoriesConfig Zod Schema */
export const RepositoriesConfigSchema = z.object({
  repositories: z.array(ExternalRepositorySchema).default([]),
});

// ---- 套件 Schema ----

/** SkillBundle Zod Schema */
export const SkillBundleSchema = z.object({
  id: z.string().min(1),
  name: z.string().regex(/^[a-z0-9-]+$/, "名称只能包含小写字母、数字和连字符"),
  displayName: z.string().min(1, "显示名称不能为空"),
  description: z.string().optional(),
  categoryNames: z
    .array(z.string().min(1))
    .min(1, "至少选择 1 个分类")
    .max(20, "最多选择 20 个分类"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** POST /api/skill-bundles 请求体 */
export const SkillBundleCreateSchema = z.object({
  name: z
    .string()
    .min(1, "name 为必填项")
    .regex(/^[a-z0-9-]+$/, "名称只能包含小写字母、数字和连字符"),
  displayName: z.string().min(1, "displayName 为必填项"),
  description: z.string().optional(),
  categoryNames: z
    .array(z.string().min(1))
    .min(1, "至少选择 1 个分类")
    .max(20, "最多选择 20 个分类"),
});

/** PUT /api/skill-bundles/:id 请求体 */
export const SkillBundleUpdateSchema = z.object({
  displayName: z.string().min(1).optional(),
  description: z.string().optional(),
  categoryNames: z.array(z.string().min(1)).min(1).max(20).optional(),
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
  pathPresets: z.array(PathPresetSchema).default([]),
  skillBundles: z.array(SkillBundleSchema).max(50).default([]),
  activeCategories: z.array(z.string()).default([]),
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

/** POST /api/sync/targets 请求体 */
export const SyncTargetCreateSchema = z.object({
  name: z.string().min(1, "name 为必填项"),
  path: z.string().min(1, "path 为必填项"),
  enabled: z.boolean().default(true),
});

/** PUT /api/sync/targets/:id 请求体 */
export const SyncTargetUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  path: z.string().min(1).optional(),
  enabled: z.boolean().optional(),
});

/** POST /api/sync/push 请求体 */
export const SyncPushRequestSchema = z.object({
  skillIds: z.array(z.string().min(1)).min(1, "至少选择一个 Skill"),
  targetIds: z.array(z.string().min(1)).optional(),
  mode: SyncModeSchema.default("full"),
});

/** POST /api/sync/diff 请求体 */
export const DiffRequestSchema = z.object({
  skillIds: z.array(z.string().min(1)).min(1, "至少选择一个 Skill"),
  targetId: z.string().min(1, "targetId 为必填项"),
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
export type ScanResultItemInferred = z.infer<typeof ScanResultItemSchema>;
export type ScanResultInferred_Import = z.infer<typeof ScanResultSchema_Import>;
export type PathPresetInferred = z.infer<typeof PathPresetSchema>;
export type SkillBundleInferred = z.infer<typeof SkillBundleSchema>;
export type SkillBundleCreateInferred = z.infer<typeof SkillBundleCreateSchema>;
export type SkillBundleUpdateInferred = z.infer<typeof SkillBundleUpdateSchema>;
export type RepoSkillMappingInferred = z.infer<typeof RepoSkillMappingSchema>;
export type ExternalRepositoryInferred = z.infer<
  typeof ExternalRepositorySchema
>;
export type RepositoriesConfigInferred = z.infer<
  typeof RepositoriesConfigSchema
>;
export type SyncModeInferred = z.infer<typeof SyncModeSchema>;
export type DiffItemInferred = z.infer<typeof DiffItemSchema>;
export type DiffReportInferred = z.infer<typeof DiffReportSchema>;
export type DiffRequestInferred = z.infer<typeof DiffRequestSchema>;
