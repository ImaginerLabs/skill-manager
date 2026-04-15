// ============================================================
// shared/types.ts — 前后端共享核心类型定义
// ============================================================

// ---- Skill 相关类型 ----

/** Skill 元数据（从 Frontmatter 解析） */
export interface SkillMeta {
  /** slug 化文件名（不含扩展名） */
  id: string;
  /** Frontmatter: name */
  name: string;
  /** Frontmatter: description */
  description: string;
  /** Frontmatter: category */
  category: string;
  /** Frontmatter: tags */
  tags: string[];
  /** Frontmatter: type — 仅工作流 Skill 有此字段 */
  type?: "workflow";
  /** Frontmatter: author */
  author?: string;
  /** Frontmatter: version */
  version?: string;
  /** 相对于 skills/ 的路径 */
  filePath: string;
  /** 文件大小（bytes） */
  fileSize: number;
  /** ISO 8601 时间戳 */
  lastModified: string;

  // ---- 外部 Skill 来源元数据（可选，仅外部 Skill 有值）----

  /** 来源仓库 ID（对应 repositories.yaml 中的 id，外部 Skill 专用） */
  source?: string;
  /** Skill 在 GitHub 上的 URL（外部 Skill 专用） */
  sourceUrl?: string;
  /** 仓库 GitHub URL（外部 Skill 专用） */
  sourceRepo?: string;
  /** 是否只读（外部 Skill 为 true，本地 Skill 无此字段或为 false） */
  readonly?: boolean;
}

/** 完整 Skill（含 Markdown 正文） */
export interface SkillFull extends SkillMeta {
  /** Markdown 正文（不含 Frontmatter） */
  content: string;
  /** 原始文件内容（含 Frontmatter） */
  rawContent: string;
}

// ---- 工作流相关类型 ----

/** 工作流步骤 */
export interface WorkflowStep {
  order: number;
  skillId: string | null;
  skillName: string | null;
  description: string;
  type: "skill" | "custom";
}

/** 工作流 */
export interface Workflow {
  name: string;
  description: string;
  steps: WorkflowStep[];
}

// ---- 扫描相关类型 ----

/** 扫描结果项（单个文件） */
export interface ScanResultItem {
  /** slug 化文件名 */
  id: string;
  /** Frontmatter: name（解析失败时使用文件名） */
  name: string;
  /** Frontmatter: description（解析失败时为空） */
  description: string;
  /** 相对于扫描目录的路径 */
  filePath: string;
  /** 绝对路径 */
  absolutePath: string;
  /** 解析状态 */
  parseStatus: "ok" | "failed";
  /** 解析失败时的错误信息 */
  parseError?: string;
  /** 文件大小（bytes） */
  fileSize: number;
  /** ISO 8601 时间戳 */
  lastModified: string;
}

/** 扫描结果 */
export interface ScanResult {
  /** 扫描到的文件列表 */
  items: ScanResultItem[];
  /** 扫描的目录路径 */
  scanPath: string;
  /** 扫描到的 .md 文件总数 */
  totalFiles: number;
}

// ---- 导入相关类型 ----

/** 导入请求项 */
export interface ImportRequestItem {
  /** 源文件绝对路径 */
  absolutePath: string;
  /** 文件名 */
  name: string;
}

/** 导入请求 */
export interface ImportRequest {
  /** 要导入的文件列表 */
  items: ImportRequestItem[];
  /** 目标分类 */
  category: string;
  /** 扫描时使用的根目录（用于路径安全校验，默认为 CodeBuddy 默认路径） */
  scanRoot?: string;
}

/** 导入结果项 */
export interface ImportResultItem {
  /** 文件名 */
  name: string;
  /** 状态 */
  status: "success" | "failed";
  /** 失败时的错误信息 */
  error?: string;
}

/** 导入结果 */
export interface ImportResult {
  /** 总数 */
  total: number;
  /** 成功数 */
  success: number;
  /** 失败数 */
  failed: number;
  /** 详细列表 */
  details: ImportResultItem[];
}

// ---- 同步相关类型 ----

/** 同步目标 */
export interface SyncTarget {
  id: string;
  /** 例如 "CodeBuddy" */
  name: string;
  /** 绝对路径 */
  path: string;
  enabled: boolean;
}

/** 同步模式 */
export type SyncMode = "incremental" | "replace" | "full";

/** 同步详情 */
export interface SyncDetail {
  skillId: string;
  skillName: string;
  targetPath: string;
  status: "success" | "overwritten" | "failed" | "skipped" | "updated";
  error?: string;
}

/** 同步结果 */
export interface SyncResult {
  total: number;
  success: number;
  overwritten: number;
  failed: number;
  /** 增量同步跳过的文件数 */
  skipped: number;
  /** 增量同步更新的文件数 */
  updated: number;
  details: SyncDetail[];
}

/** Diff 报告项 */
export interface DiffItem {
  skillId: string;
  skillName: string;
  /** 相对路径（文件夹名） */
  path: string;
}

/** Diff 差异报告 */
export interface DiffReport {
  targetId: string;
  targetPath: string;
  /** 源有目标无 */
  added: DiffItem[];
  /** 两边都有但内容不同 */
  modified: DiffItem[];
  /** 目标有源无 */
  deleted: DiffItem[];
  /** 两边内容一致 */
  unchanged: DiffItem[];
  /** ISO 时间戳 */
  generatedAt: string;
}

// ---- 路径预设类型 ----

/** 路径预设 */
export interface PathPreset {
  id: string;
  /** 绝对路径 */
  path: string;
  /** 可选备注 */
  label?: string;
}

// ---- 套件类型 ----

/** 套件（分类组合） */
export interface SkillBundle {
  /** 格式：bundle-{ts36}-{rand4} */
  id: string;
  /** 英文标识，唯一，/^[a-z0-9-]+$/ */
  name: string;
  /** 显示名称 */
  displayName: string;
  /** 可选描述 */
  description?: string;
  /** 引用分类的 name（英文标识）列表，最多 20 个 */
  categoryNames: string[];
  /** ISO 8601 创建时间 */
  createdAt: string;
  /** ISO 8601 更新时间 */
  updatedAt: string;
}

/** 套件（含损坏引用信息，用于 API 响应） */
export interface SkillBundleWithStatus extends SkillBundle {
  /** 已被删除的分类名列表（损坏引用） */
  brokenCategoryNames: string[];
}

/** 套件激活结果 */
export interface ApplyBundleResult {
  /** 成功激活的分类名列表 */
  applied: string[];
  /** 因引用损坏被跳过的分类名列表 */
  skipped: string[];
}

/** 创建套件请求体 */
export interface SkillBundleCreate {
  name: string;
  displayName: string;
  description?: string;
  categoryNames: string[];
}

/** 更新套件请求体 */
export interface SkillBundleUpdate {
  displayName?: string;
  description?: string;
  categoryNames?: string[];
}

// ---- 外部仓库配置类型 ----

/** 仓库 Skill 映射（白名单项） */
export interface RepoSkillMapping {
  /** Skill 名称（对应仓库中的目录名） */
  name: string;
  /** 目标分类（对应 categories.yaml 中的 name） */
  targetCategory: string;
}

/** 外部仓库配置 */
export interface ExternalRepository {
  /** 仓库唯一标识 */
  id: string;
  /** 仓库显示名称 */
  name: string;
  /** 仓库 GitHub HTTPS URL */
  url: string;
  /** 同步分支名 */
  branch: string;
  /** 仓库内 Skill 目录相对路径 */
  skillsPath: string;
  /** 是否启用 */
  enabled: boolean;
  /** 白名单（仅同步列表中的 Skill） */
  include: RepoSkillMapping[];
  /** 黑名单（排除列表中的 Skill，优先级高于白名单） */
  exclude: string[];
}

/** 仓库注册配置（对应 config/repositories.yaml） */
export interface RepositoriesConfig {
  repositories: ExternalRepository[];
}

// ---- 分类与配置类型 ----

/** 分类 */
export interface Category {
  name: string;
  displayName: string;
  description?: string;
  skillCount: number;
}

/** 应用配置 */
export interface AppConfig {
  version: string;
  sync: {
    targets: SyncTarget[];
  };
  pathPresets: PathPreset[];
  skillBundles: SkillBundle[];
  activeCategories: string[];
  categories: Category[];
  ui: {
    defaultView: "grid" | "list";
    sidebarWidth: number;
  };
}

// ---- API 响应类型 ----

/** 成功响应 */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

/** 错误响应 */
export interface ApiErrorResponse {
  success: false;
  error: {
    /** 错误码，例如 "SKILL_NOT_FOUND"、"PARSE_ERROR" */
    code: string;
    /** 用户可读的错误信息 */
    message: string;
    /** 可选的详细信息（开发模式下可能包含 stack trace） */
    details?: unknown;
  };
}

/** 统一 API 响应类型 */
export type ApiResponse<T> = ApiSuccess<T> | ApiErrorResponse;
