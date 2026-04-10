// ============================================================
// server/utils/frontmatterParser.ts — Frontmatter 解析 + Zod 校验
// ============================================================

import fs from "fs-extra";
import matter from "gray-matter";
import path from "node:path";

import { SkillMetaSchema } from "../../shared/schemas.js";
import type { SkillMeta } from "../../shared/types.js";
import { getSkillId, normalizePath } from "./pathUtils.js";

// ---- 结果类型定义 ----

/** 解析成功结果 */
export interface ParseSuccess {
  success: true;
  meta: SkillMeta;
  content: string;
  rawContent: string;
}

/** 解析失败结果 */
export interface ParseFailure {
  success: false;
  filePath: string;
  error: string;
  details?: unknown;
}

/** 解析结果联合类型 */
export type ParseResult = ParseSuccess | ParseFailure;

/**
 * 解析 Skill 文件的 YAML Frontmatter + Markdown 正文
 *
 * 流程：读取文件 → gray-matter 解析 → 补充元数据 → Zod 校验 → 返回结构化结果
 *
 * @param filePath - Skill 文件的绝对路径
 * @param skillsRoot - skills/ 目录的绝对路径（用于计算相对路径）
 * @returns 解析结果（成功或失败）
 */
export async function parseFrontmatter(
  filePath: string,
  skillsRoot: string,
): Promise<ParseResult> {
  // 1. 读取文件
  let rawContent: string;
  let stat: fs.Stats;
  try {
    rawContent = await fs.readFile(filePath, "utf-8");
    stat = await fs.stat(filePath);
  } catch (err) {
    return {
      success: false,
      filePath: normalizePath(filePath),
      error: `文件读取失败: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // 2. 计算相对路径和元数据
  const relativePath = normalizePath(path.relative(skillsRoot, filePath));
  const skillId = getSkillId(filePath);
  const fileSize = stat.size;
  const lastModified = stat.mtime.toISOString();

  // 3. 使用内部解析函数
  return parseRawFrontmatterInternal(
    rawContent,
    relativePath,
    skillId,
    fileSize,
    lastModified,
  );
}

/**
 * 从原始字符串解析 Frontmatter（不读取文件）
 * 用于导入场景，调用者已持有文件内容
 *
 * @param rawContent - 原始文件内容（含 Frontmatter）
 * @param filePath - 文件路径（相对于 skills/，用于错误报告和元数据）
 * @param fileSize - 文件大小（bytes），默认为 rawContent 的字节长度
 * @param lastModified - 最后修改时间（ISO 8601），默认为当前时间
 * @returns 解析结果（成功或失败）
 */
export function parseRawFrontmatter(
  rawContent: string,
  filePath: string,
  fileSize?: number,
  lastModified?: string,
): ParseResult {
  const skillId = getSkillId(filePath);
  const size = fileSize ?? Buffer.byteLength(rawContent, "utf-8");
  const modified = lastModified ?? new Date().toISOString();

  return parseRawFrontmatterInternal(
    rawContent,
    normalizePath(filePath),
    skillId,
    size,
    modified,
  );
}

/**
 * 内部解析函数：gray-matter 解析 + Zod 校验
 */
function parseRawFrontmatterInternal(
  rawContent: string,
  filePath: string,
  skillId: string,
  fileSize: number,
  lastModified: string,
): ParseResult {
  // 1. gray-matter 解析
  let data: Record<string, unknown>;
  let content: string;
  try {
    const parsed = matter(rawContent);
    data = parsed.data as Record<string, unknown>;
    content = parsed.content;
  } catch (err) {
    return {
      success: false,
      filePath,
      error: `YAML Frontmatter 语法错误: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  // 2. 组装完整的 SkillMeta 数据（自动填充系统字段）
  const metaCandidate = {
    id: skillId,
    name: data.name ?? "",
    description: data.description ?? "",
    category: data.category ?? "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    type: data.type,
    author: data.author,
    version: data.version,
    filePath,
    fileSize,
    lastModified,
  };

  // 3. Zod 校验
  const result = SkillMetaSchema.safeParse(metaCandidate);
  if (!result.success) {
    return {
      success: false,
      filePath,
      error: `Frontmatter 校验失败: ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
      details: result.error.issues,
    };
  }

  return {
    success: true,
    meta: result.data as SkillMeta,
    content,
    rawContent,
  };
}
