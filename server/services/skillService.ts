// ============================================================
// server/services/skillService.ts — Skill 扫描、缓存管理与 CRUD 服务
// ============================================================

import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";

import matter from "gray-matter";
import type { SkillFull, SkillMeta } from "../../shared/types.js";
import { AppError } from "../types/errors.js";
import { parseFrontmatter } from "../utils/frontmatterParser.js";
import { normalizePath } from "../utils/pathUtils.js";

// 项目根目录
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const SKILLS_ROOT = path.join(PROJECT_ROOT, "skills");

// ---- 内存缓存 ----

/** Skill 元数据缓存 Map<id, SkillMeta> */
const skillCache = new Map<string, SkillMeta>();

/** 解析失败的文件记录 Map<filePath, errorMessage> */
const parseErrors = new Map<string, string>();

/** 缓存是否已初始化 */
let initialized = false;

// ---- 目录扫描 ----

/**
 * 递归扫描目录下所有 .md 文件
 * @param dirPath - 要扫描的目录绝对路径
 * @returns .md 文件的绝对路径列表
 */
async function scanMarkdownFiles(dirPath: string): Promise<string[]> {
  const results: string[] = [];

  // 目录不存在时返回空数组（不抛异常）
  const exists = await fs.pathExists(dirPath);
  if (!exists) {
    console.warn(`[skillService] skills 目录不存在: ${dirPath}`);
    return results;
  }

  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // 跳过隐藏目录（以 . 开头）
      if (entry.name.startsWith(".")) continue;
      // 递归扫描子目录
      const subFiles = await scanMarkdownFiles(fullPath);
      results.push(...subFiles);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * 初始化 Skill 缓存 — 扫描 skills/ 目录并解析所有 .md 文件
 * 应在应用启动时调用一次
 */
export async function initializeSkillCache(): Promise<void> {
  console.log("[skillService] 开始扫描 skills/ 目录...");
  const startTime = Date.now();

  // 清空缓存
  skillCache.clear();
  parseErrors.clear();

  // 确保 skills 目录存在
  await fs.ensureDir(SKILLS_ROOT);

  // 扫描所有 .md 文件
  const files = await scanMarkdownFiles(SKILLS_ROOT);
  console.log(`[skillService] 发现 ${files.length} 个 .md 文件`);

  // 并行解析所有文件
  const results = await Promise.all(
    files.map((filePath) => parseFrontmatter(filePath, SKILLS_ROOT)),
  );

  // 处理解析结果
  let successCount = 0;
  let errorCount = 0;

  for (const result of results) {
    if (result.success) {
      // 处理 ID 冲突：如果已存在相同 ID，添加数字后缀
      let id = result.meta.id;
      if (skillCache.has(id)) {
        let suffix = 2;
        while (skillCache.has(`${id}-${suffix}`)) {
          suffix++;
        }
        id = `${id}-${suffix}`;
        result.meta.id = id;
      }
      skillCache.set(id, result.meta);
      successCount++;
    } else {
      parseErrors.set(result.filePath, result.error);
      errorCount++;
      console.warn(
        `[skillService] 解析失败: ${result.filePath} — ${result.error}`,
      );
    }
  }

  initialized = true;
  const elapsed = Date.now() - startTime;
  console.log(
    `[skillService] 扫描完成: ${successCount} 成功, ${errorCount} 失败, 耗时 ${elapsed}ms`,
  );
}

/**
 * 刷新 Skill 缓存 — 重新扫描 skills/ 目录
 * 对应 POST /api/refresh
 */
export async function refreshSkillCache(): Promise<{
  total: number;
  success: number;
  errors: number;
}> {
  await initializeSkillCache();
  return {
    total: skillCache.size + parseErrors.size,
    success: skillCache.size,
    errors: parseErrors.size,
  };
}

// ---- 查询操作 ----

/**
 * 获取所有 Skill 元数据列表
 */
export function getAllSkills(): SkillMeta[] {
  ensureInitialized();
  return Array.from(skillCache.values());
}

/**
 * 根据 ID 获取 Skill 元数据
 */
export function getSkillMeta(id: string): SkillMeta | undefined {
  ensureInitialized();
  return skillCache.get(id);
}

/**
 * 根据 ID 获取完整 Skill（含 Markdown 正文）
 * 元数据从缓存获取，正文按需从文件系统读取
 */
export async function getSkillFull(id: string): Promise<SkillFull> {
  ensureInitialized();

  const meta = skillCache.get(id);
  if (!meta) {
    throw AppError.skillNotFound(id);
  }

  // 从文件系统读取完整内容
  const absolutePath = path.join(SKILLS_ROOT, meta.filePath);

  try {
    const rawContent = await fs.readFile(absolutePath, "utf-8");
    // 使用 gray-matter 分离 content
    const parsed = matter(rawContent);

    return {
      ...meta,
      content: parsed.content,
      rawContent,
    };
  } catch (err) {
    throw new AppError(
      "FILE_READ_ERROR",
      `读取 Skill 文件失败: ${err instanceof Error ? err.message : String(err)}`,
      500,
    );
  }
}

/**
 * 获取解析失败的文件列表
 */
export function getParseErrors(): Array<{
  filePath: string;
  error: string;
}> {
  return Array.from(parseErrors.entries()).map(([filePath, error]) => ({
    filePath,
    error,
  }));
}

/**
 * 获取 skills 根目录路径
 */
export function getSkillsRoot(): string {
  return SKILLS_ROOT;
}

// ---- 写操作 ----

/**
 * 删除 Skill 文件
 */
export async function deleteSkill(id: string): Promise<void> {
  ensureInitialized();

  const meta = skillCache.get(id);
  if (!meta) {
    throw AppError.skillNotFound(id);
  }

  const absolutePath = path.join(SKILLS_ROOT, meta.filePath);

  try {
    await fs.remove(absolutePath);
    skillCache.delete(id);
  } catch (err) {
    throw AppError.fileWriteError(
      `删除 Skill 文件失败: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

/**
 * 移动 Skill 到其他分类（物理移动文件到目标分类目录）
 */
export async function moveSkillToCategory(
  id: string,
  targetCategory: string,
): Promise<SkillMeta> {
  ensureInitialized();

  const meta = skillCache.get(id);
  if (!meta) {
    throw AppError.skillNotFound(id);
  }

  const oldAbsolutePath = path.join(SKILLS_ROOT, meta.filePath);
  const fileName = path.basename(meta.filePath);
  const newRelativePath = normalizePath(path.join(targetCategory, fileName));
  const newAbsolutePath = path.join(SKILLS_ROOT, newRelativePath);

  // 确保目标目录存在
  await fs.ensureDir(path.join(SKILLS_ROOT, targetCategory));

  try {
    // 读取文件内容，更新 frontmatter 中的 category
    const rawContent = await fs.readFile(oldAbsolutePath, "utf-8");
    const parsed = matter(rawContent);
    parsed.data.category = targetCategory;

    // 重新序列化
    const newContent = matter.stringify(parsed.content, parsed.data);

    // 写入新位置
    await fs.writeFile(newAbsolutePath, newContent, "utf-8");

    // 删除旧文件
    await fs.remove(oldAbsolutePath);

    // 更新缓存
    const updatedMeta: SkillMeta = {
      ...meta,
      category: targetCategory,
      filePath: newRelativePath,
    };
    skillCache.set(id, updatedMeta);

    return updatedMeta;
  } catch (err) {
    throw AppError.fileWriteError(
      `移动 Skill 文件失败: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

/**
 * 更新 Skill 的 Frontmatter 元数据（不修改 Markdown 正文）
 */
export async function updateSkillMeta(
  id: string,
  updates: {
    name?: string;
    description?: string;
    category?: string;
    tags?: string[];
  },
): Promise<SkillMeta> {
  ensureInitialized();

  const meta = skillCache.get(id);
  if (!meta) {
    throw AppError.skillNotFound(id);
  }

  const absolutePath = path.join(SKILLS_ROOT, meta.filePath);

  try {
    const rawContent = await fs.readFile(absolutePath, "utf-8");
    const parsed = matter(rawContent);

    // 更新 frontmatter 字段
    if (updates.name !== undefined) parsed.data.name = updates.name;
    if (updates.description !== undefined)
      parsed.data.description = updates.description;
    if (updates.category !== undefined) parsed.data.category = updates.category;
    if (updates.tags !== undefined) parsed.data.tags = updates.tags;

    // 重新序列化
    const newContent = matter.stringify(parsed.content, parsed.data);
    await fs.writeFile(absolutePath, newContent, "utf-8");

    // 更新缓存
    const updatedMeta: SkillMeta = {
      ...meta,
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.description !== undefined && {
        description: updates.description,
      }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.tags !== undefined && { tags: updates.tags }),
      lastModified: new Date().toISOString(),
    };
    skillCache.set(id, updatedMeta);

    return updatedMeta;
  } catch (err) {
    throw AppError.fileWriteError(
      `更新 Skill 元数据失败: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

// ---- 内部工具 ----

/**
 * 确保缓存已初始化
 */
function ensureInitialized(): void {
  if (!initialized) {
    throw AppError.internal("Skill 缓存尚未初始化，请等待应用启动完成");
  }
}
