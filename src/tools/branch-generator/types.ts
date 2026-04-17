// ============================================================
// tools/branch-generator/types.ts — Git 分支生成器类型定义
// ============================================================

/** 分支生成输入参数 */
export interface BranchInput {
  /** 目标分支（如 develop, main），选填 */
  targetBranch?: string;
  /** 意图 ID（如 feature, bugfix） */
  intent: IntentId;
  /** 原始描述（中文或英文） */
  description: string;
  /** 关联单号（如 JIRA-1234） */
  ticketNumber?: string;
  /** 是否包含日期标记 */
  includeDate?: boolean;
  /** 作者标识 */
  author?: string;
}

/** 生成结果 */
export interface BranchResult {
  /** 生成的分支名 */
  branchName: string;
  /** 生成的 Git 命令 */
  gitCommand: string;
  /** 是否通过校验 */
  isValid: boolean;
  /** 校验错误列表 */
  errors: string[];
}

/** 历史记录条目 */
export interface HistoryEntry {
  /** 分支名 */
  branchName: string;
  /** 生成时间（YYYY-MM-DD HH:mm） */
  time: string;
}

/** 意图 ID 类型 */
export type IntentId =
  | "feature"
  | "bugfix"
  | "hotfix"
  | "release"
  | "refactor"
  | "chore"
  | "docs"
  | "test"
  | "perf";

/** 意图配置 */
export interface IntentConfig {
  id: IntentId;
  prefix: string;
  labelKey: string;
  icon: string;
  colorClass: string;
  borderClass: string;
  bgClass: string;
  descKey: string;
}

/** 校验错误信息 */
export interface ValidationError {
  rule: string;
  message: string;
}
