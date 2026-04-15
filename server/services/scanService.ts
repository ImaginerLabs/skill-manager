// ============================================================
// server/services/scanService.ts — IDE 目录扫描服务
// ============================================================

import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import type { ScanResult, ScanResultItem } from "../../shared/types.js";
import { AppError } from "../types/errors.js";
import { parseFrontmatter } from "../utils/frontmatterParser.js";
import { normalizePath, slugify } from "../utils/pathUtils.js";

/** 默认 CodeBuddy IDE Skill 目录 */
const DEFAULT_SCAN_PATH = path.join(os.homedir(), ".codebuddy", "skills");

/**
 * 获取默认扫描路径
 */
export function getDefaultScanPath(): string {
  return normalizePath(DEFAULT_SCAN_PATH);
}

/**
 * 检测 CodeBuddy IDE 目录是否存在且包含 .md 文件
 * 用于冷启动引导
 */
export async function detectCodeBuddy(): Promise<{
  detected: boolean;
  path: string;
  fileCount: number;
}> {
  const scanPath = DEFAULT_SCAN_PATH;
  const normalizedPath = normalizePath(scanPath);

  try {
    const exists = await fs.pathExists(scanPath);
    if (!exists) {
      return { detected: false, path: normalizedPath, fileCount: 0 };
    }

    const stat = await fs.stat(scanPath);
    if (!stat.isDirectory()) {
      return { detected: false, path: normalizedPath, fileCount: 0 };
    }

    const mdFiles = await collectMdFiles(scanPath);
    return {
      detected: mdFiles.length > 0,
      path: normalizedPath,
      fileCount: mdFiles.length,
    };
  } catch {
    return { detected: false, path: normalizedPath, fileCount: 0 };
  }
}

/**
 * 递归收集目录中的所有 .md 文件
 * P5: 添加最大深度限制和 visited set，防止 symlink loop 导致无限递归
 */
async function collectMdFiles(
  dirPath: string,
  currentDepth = 0,
  maxDepth = 10,
  visited: Set<string> = new Set(),
): Promise<string[]> {
  if (currentDepth > maxDepth) {
    return [];
  }

  // 使用 realpath 检测 symlink 循环
  let realDir: string;
  try {
    realDir = await fs.realpath(dirPath);
  } catch {
    return [];
  }
  if (visited.has(realDir)) {
    return [];
  }
  visited.add(realDir);

  const results: string[] = [];
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  // 若当前目录下存在 SKILL.md，视为 Skill 包根目录：只收录 SKILL.md，不递归子目录
  const hasSkillMd = entries.some((e) => e.isFile() && e.name === "SKILL.md");
  if (hasSkillMd) {
    results.push(path.join(dirPath, "SKILL.md"));
    return results;
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      // 跳过隐藏目录（以 . 开头）
      if (entry.name.startsWith(".")) continue;
      const subFiles = await collectMdFiles(
        fullPath,
        currentDepth + 1,
        maxDepth,
        visited,
      );
      results.push(...subFiles);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * 扫描指定目录中的 Skill 文件
 *
 * @param dirPath - 要扫描的目录绝对路径（可选，默认为 CodeBuddy 路径）
 * @returns 扫描结果
 */
export async function scanDirectory(dirPath?: string): Promise<ScanResult> {
  const scanPath = dirPath ? path.resolve(dirPath) : DEFAULT_SCAN_PATH;

  // 1. 校验目录存在性
  const exists = await fs.pathExists(scanPath);
  if (!exists) {
    throw AppError.scanPathNotFound(scanPath);
  }

  // 2. 校验目录权限
  try {
    await fs.access(scanPath, fs.constants.R_OK);
  } catch {
    throw AppError.scanPermissionDenied(scanPath);
  }

  // 3. 校验是否为目录
  const stat = await fs.stat(scanPath);
  if (!stat.isDirectory()) {
    throw AppError.scanPathNotFound(scanPath);
  }

  // 4. 递归收集 .md 文件
  let mdFiles: string[];
  try {
    mdFiles = await collectMdFiles(scanPath);
  } catch (err) {
    // readdir 权限错误等
    if (
      err instanceof Error &&
      "code" in err &&
      (err as NodeJS.ErrnoException).code === "EACCES"
    ) {
      throw AppError.scanPermissionDenied(scanPath);
    }
    throw err;
  }

  // 5. 对每个文件尝试解析 Frontmatter
  const items: ScanResultItem[] = [];

  for (const filePath of mdFiles) {
    const fileStat = await fs.stat(filePath);
    const relativePath = normalizePath(path.relative(scanPath, filePath));
    const fileName = path.basename(filePath, ".md");

    // 尝试解析 Frontmatter
    const parseResult = await parseFrontmatter(filePath, scanPath);

    if (parseResult.success) {
      items.push({
        id: slugify(path.basename(filePath)),
        name: parseResult.meta.name || fileName,
        description: parseResult.meta.description || "",
        filePath: relativePath,
        absolutePath: normalizePath(filePath),
        parseStatus: "ok",
        fileSize: fileStat.size,
        lastModified: fileStat.mtime.toISOString(),
      });
    } else {
      items.push({
        id: slugify(path.basename(filePath)),
        name: fileName,
        description: "",
        filePath: relativePath,
        absolutePath: normalizePath(filePath),
        parseStatus: "failed",
        parseError: parseResult.error,
        fileSize: fileStat.size,
        lastModified: fileStat.mtime.toISOString(),
      });
    }
  }

  return {
    items,
    scanPath: normalizePath(scanPath),
    totalFiles: mdFiles.length,
  };
}
