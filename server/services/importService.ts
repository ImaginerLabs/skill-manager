// ============================================================
// server/services/importService.ts — 文件导入服务
// ============================================================

import fs from "fs-extra";
import matter from "gray-matter";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  ImportRequest,
  ImportResult,
  ImportResultItem,
} from "../../shared/types.js";
import { safeWrite } from "../utils/fileUtils.js";
import { normalizePath } from "../utils/pathUtils.js";
import { refreshSkillCache } from "./skillService.js";

// 项目根目录
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const SKILLS_ROOT = path.join(PROJECT_ROOT, "skills");

/**
 * 导入文件到 skills 目录
 *
 * 流程：
 * 1. 读取源文件内容
 * 2. 解析 Frontmatter
 * 3. 补充缺失字段（category, name, description）
 * 4. 重新序列化为 Frontmatter + content
 * 5. 使用 safeWrite 写入到 skills/{category}/{filename}
 * 6. 刷新 Skill 缓存
 */
export async function importFiles(
  request: ImportRequest,
): Promise<ImportResult> {
  const { items, category } = request;
  const details: ImportResultItem[] = [];
  let successCount = 0;
  let failedCount = 0;

  for (const item of items) {
    try {
      // 1. 读取源文件
      const rawContent = await fs.readFile(item.absolutePath, "utf-8");
      const fileName = path.basename(item.absolutePath);

      // 2. 解析 Frontmatter
      let data: Record<string, unknown>;
      let content: string;
      try {
        const parsed = matter(rawContent);
        data = parsed.data as Record<string, unknown>;
        content = parsed.content;
      } catch {
        // Frontmatter 解析失败，使用空 data
        data = {};
        content = rawContent;
      }

      // 3. 补充缺失字段
      if (!data.category) {
        data.category = category;
      }
      if (!data.name) {
        data.name = path.basename(fileName, ".md");
      }
      if (data.description === undefined || data.description === null) {
        data.description = "";
      }

      // 4. 重新序列化
      const newContent = matter.stringify(content, data);

      // 5. 写入到 skills/{category}/{filename}
      const targetDir = path.join(SKILLS_ROOT, category);
      const targetPath = path.join(targetDir, fileName);
      await safeWrite(targetPath, newContent);

      details.push({ name: item.name, status: "success" });
      successCount++;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      details.push({
        name: item.name,
        status: "failed",
        error: errorMsg,
      });
      failedCount++;
    }
  }

  // 6. 刷新 Skill 缓存
  try {
    await refreshSkillCache();
  } catch {
    // 缓存刷新失败不影响导入结果
    console.error("[importService] 刷新缓存失败");
  }

  return {
    total: items.length,
    success: successCount,
    failed: failedCount,
    details,
  };
}

/**
 * 获取 skills 根目录路径（用于测试）
 */
export function getSkillsRoot(): string {
  return normalizePath(SKILLS_ROOT);
}

/**
 * 清理源文件（导入后删除原始文件）
 *
 * @param filePaths - 要删除的文件绝对路径列表
 * @returns 清理结果
 */
export async function cleanupFiles(
  filePaths: string[],
): Promise<{
  total: number;
  success: number;
  failed: number;
  errors: string[];
}> {
  let successCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  for (const filePath of filePaths) {
    try {
      await fs.remove(filePath);
      successCount++;
    } catch (err) {
      failedCount++;
      errors.push(
        `${path.basename(filePath)}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return {
    total: filePaths.length,
    success: successCount,
    failed: failedCount,
    errors,
  };
}
