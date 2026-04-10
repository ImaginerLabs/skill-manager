// ============================================================
// server/utils/pathUtils.ts — 跨平台路径工具函数
// ============================================================

import path from "node:path";

/**
 * 将路径归一化为 POSIX 风格（正斜杠），移除尾部斜杠
 * @param inputPath - 输入路径（可能包含 Windows 反斜杠）
 * @returns POSIX 风格的归一化路径
 */
export function normalizePath(inputPath: string): string {
  // 将 Windows 反斜杠转为正斜杠
  let normalized = inputPath.replace(/\\/g, "/");
  // 移除尾部斜杠（保留根路径 "/"）
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

/**
 * 基于 skills/ 根目录解析绝对路径
 * @param relativePath - 相对于 skills/ 的路径
 * @param skillsRoot - skills/ 目录的绝对路径
 * @returns 归一化的绝对路径
 */
export function resolveSkillPath(
  relativePath: string,
  skillsRoot: string,
): string {
  const resolved = path.resolve(skillsRoot, relativePath);
  return normalizePath(resolved);
}

/**
 * 获取相对路径
 * @param absolutePath - 绝对路径
 * @param basePath - 基准路径
 * @returns 归一化的相对路径
 */
export function getRelativePath(
  absolutePath: string,
  basePath: string,
): string {
  const relative = path.relative(basePath, absolutePath);
  return normalizePath(relative);
}

/**
 * 校验 childPath 是否在 parentPath 内（防止路径遍历）
 * @param childPath - 待校验的子路径
 * @param parentPath - 父路径（白名单目录）
 * @returns 如果 childPath 在 parentPath 内返回 true
 */
export function isSubPath(childPath: string, parentPath: string): boolean {
  const resolvedChild = normalizePath(path.resolve(childPath));
  const resolvedParent = normalizePath(path.resolve(parentPath));

  // 子路径必须以父路径开头，且紧跟 "/" 或完全相等
  return (
    resolvedChild === resolvedParent ||
    resolvedChild.startsWith(resolvedParent + "/")
  );
}

/**
 * 将文件名转为 slug 格式的 id
 * - 去除 .md 扩展名
 * - 特殊字符转连字符（保留中文、字母、数字）
 * - 合并连续连字符
 * - 去除首尾连字符
 * - 小写化
 *
 * @param filename - 文件名（可含扩展名）
 * @returns slug 格式的 id
 *
 * @example
 * slugify("My Awesome Skill.md") // "my-awesome-skill"
 * slugify("代码审查工具.md")       // "代码审查工具"
 * slugify("skill--name.md")       // "skill-name"
 */
export function slugify(filename: string): string {
  return filename
    .replace(/\.md$/i, "") // 去除 .md 扩展名
    .replace(/[^\w\u4e00-\u9fff-]/g, "-") // 非字母数字中文转连字符
    .replace(/-+/g, "-") // 合并连续连字符
    .replace(/^-|-$/g, "") // 去除首尾连字符
    .toLowerCase();
}

/**
 * 从文件路径提取 skill id
 * @param filePath - 文件路径（相对或绝对）
 * @returns slug 格式的 skill id
 */
export function getSkillId(filePath: string): string {
  const basename = path.basename(filePath);
  return slugify(basename);
}
