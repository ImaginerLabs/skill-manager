// ============================================================
// tools/branch-generator/generator.ts — 分支名生成与校验核心逻辑
// ============================================================

import { translateChineseToEnglish } from "./chinese-map";
import { getIntentConfig } from "./intent-config";
import type { BranchInput, BranchResult, ValidationError } from "./types";

// ---- 格式化规则 ----

/**
 * 将描述文本格式化为合法的分支名片段
 * 按序执行 PRD 中定义的 7 步格式化规则
 */
export function formatDescription(input: string): string {
  if (!input) return "";

  let result = input;

  // 1. 将中文关键词替换为对应英文
  result = translateChineseToEnglish(result);

  // 2. 移除所有剩余中文字符（未匹配的中文直接丢弃）
  result = result.replace(/[\u4e00-\u9fff]/g, "");

  // 3. 下划线和空格转换为短横线
  result = result.replace(/[_\s]+/g, "-");

  // 4. 移除所有非法字符（仅保留 a-z、0-9、-）
  result = result.replace(/[^a-z0-9-]/gi, "");

  // 5. 合并连续短横线为单个
  result = result.replace(/-+/g, "-");

  // 6. 去除首尾短横线
  result = result.replace(/^-+|-+$/g, "");

  // 7. 全部转为小写
  result = result.toLowerCase();

  return result;
}

/**
 * 格式化关联单号
 * 自动转小写，保留单号内部连字符
 */
export function formatTicketNumber(ticket: string): string {
  if (!ticket) return "";
  return ticket.toLowerCase().trim();
}

/**
 * 格式化作者标识
 * 自动转小写，仅保留 a-z、0-9、- 字符
 */
export function formatAuthor(author: string): string {
  if (!author) return "";
  return author
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * 获取当前日期标记（YYYYMMDD 格式）
 */
export function getDateTag(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

// ---- 校验规则 ----

/**
 * 对生成的分支名进行 Git 合法性校验
 * 遵循 git check-ref-format 规则
 */
export function validateBranchName(name: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!name) {
    errors.push({ rule: "non-empty", message: "分支名不能为空" });
    return errors;
  }

  if (name.length > 100) {
    errors.push({
      rule: "length",
      message: "分支名过长，建议不超过100个字符",
    });
  }

  if (name.includes("..")) {
    errors.push({
      rule: "no-double-dot",
      message: "分支名不能包含连续的点号(..)",
    });
  }

  if (/[\s~^:?*[\]\\]/.test(name)) {
    errors.push({ rule: "no-illegal-chars", message: "分支名包含非法字符" });
  }

  if (name.includes("@{")) {
    errors.push({
      rule: "no-lock-notation",
      message: "分支名不能包含锁定表示法(@{)",
    });
  }

  if (name.includes("//")) {
    errors.push({
      rule: "no-double-slash",
      message: "分支名不能包含连续的斜杠(//)",
    });
  }

  if (/[/.]$/.test(name)) {
    errors.push({
      rule: "no-invalid-end",
      message: "分支名不能以 / 或 . 结尾",
    });
  }

  if (name.endsWith("-")) {
    errors.push({
      rule: "no-dash-end",
      message: "分支名不能以 - 结尾",
    });
  }

  if (name.startsWith("-")) {
    errors.push({
      rule: "no-dash-start",
      message: "分支名不能以 - 开头",
    });
  }

  return errors;
}

// ---- 生成分支名 ----

/**
 * 根据输入参数生成分支名
 *
 * 拼接规则：<意图前缀>/[日期]-[单号]-[描述]-[作者]
 * - 意图前缀与后续部分用 / 分隔
 * - 可选部分之间用 - 连接
 * - 仅拼接用户实际填写的部分，省略空字段
 */
export function generateBranchName(input: BranchInput): string {
  const config = getIntentConfig(input.intent);

  // 格式化各片段
  const description = formatDescription(input.description);
  const ticket = formatTicketNumber(input.ticketNumber ?? "");
  const author = formatAuthor(input.author ?? "");
  const date = input.includeDate ? getDateTag() : "";

  // 拼接可选部分（按固定位置：日期 → 单号 → 描述 → 作者）
  const parts: string[] = [];
  if (date) parts.push(date);
  if (ticket) parts.push(ticket);
  if (description) parts.push(description);
  if (author) parts.push(author);

  const suffix = parts.join("-");

  // 至少需要描述字段
  if (!suffix) return config.prefix.replace("/", "");

  return `${config.prefix}${suffix}`;
}

// ---- 生成完整结果 ----

/**
 * 根据输入参数生成完整的分支结果（分支名 + Git 命令 + 校验）
 */
export function generateBranch(input: BranchInput): BranchResult {
  const branchName = generateBranchName(input);
  const errors = validateBranchName(branchName);
  const isValid = errors.length === 0;

  const targetPart = input.targetBranch?.trim();
  const gitCommand = isValid
    ? targetPart
      ? `git checkout -b ${branchName} ${targetPart}`
      : `git checkout -b ${branchName}`
    : "";

  return {
    branchName,
    gitCommand,
    isValid,
    errors: errors.map((e) => e.message),
  };
}
