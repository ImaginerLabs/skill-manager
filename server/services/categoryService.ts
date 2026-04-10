// ============================================================
// server/services/categoryService.ts — 分类管理服务
// ============================================================

import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Category } from "../../shared/types.js";
import { AppError } from "../types/errors.js";
import { readYaml, writeYaml } from "../utils/yamlUtils.js";
import { getAllSkills } from "./skillService.js";

// 项目根目录
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const CONFIG_DIR = path.join(PROJECT_ROOT, "config");
const CATEGORIES_PATH = path.join(CONFIG_DIR, "categories.yaml");
const SKILLS_ROOT = path.join(PROJECT_ROOT, "skills");

/**
 * 获取分类列表（含 Skill 计数）
 */
export async function getCategories(): Promise<Category[]> {
  const raw = await readYaml<Array<Record<string, unknown>>>(CATEGORIES_PATH);
  const categories: Category[] = (raw || []).map((item) => ({
    name: (item.name as string) ?? "",
    displayName: (item.displayName as string) ?? (item.name as string) ?? "",
    description: item.description as string | undefined,
    skillCount: 0,
  }));

  // 计算每个分类的 Skill 数量
  const skills = getAllSkills();
  for (const skill of skills) {
    const cat = categories.find((c) => c.name === skill.category);
    if (cat) {
      cat.skillCount++;
    }
  }

  return categories;
}

/**
 * 创建新分类
 */
export async function createCategory(data: {
  name: string;
  displayName: string;
  description?: string;
}): Promise<Category> {
  const categories = await getRawCategories();

  // 检查名称是否已存在
  if (categories.some((c) => c.name === data.name)) {
    throw new AppError("CATEGORY_EXISTS", `分类 "${data.name}" 已存在`, 409);
  }

  const newCategory = {
    name: data.name,
    displayName: data.displayName,
    description: data.description,
  };

  categories.push(newCategory);
  await writeYaml(CATEGORIES_PATH, categories);

  // 创建对应的 skills 子目录
  const categoryDir = path.join(SKILLS_ROOT, data.name);
  await fs.ensureDir(categoryDir);

  return { ...newCategory, skillCount: 0 };
}

/**
 * 更新分类
 */
export async function updateCategory(
  name: string,
  data: { displayName?: string; description?: string },
): Promise<Category> {
  const categories = await getRawCategories();
  const index = categories.findIndex((c) => c.name === name);

  if (index === -1) {
    throw AppError.notFound(`分类 "${name}" 未找到`);
  }

  if (data.displayName !== undefined) {
    categories[index].displayName = data.displayName;
  }
  if (data.description !== undefined) {
    categories[index].description = data.description;
  }

  await writeYaml(CATEGORIES_PATH, categories);

  // 计算 skillCount
  const skills = getAllSkills();
  const skillCount = skills.filter((s) => s.category === name).length;

  return {
    name: categories[index].name,
    displayName: categories[index].displayName ?? name,
    description: categories[index].description,
    skillCount,
  };
}

/**
 * 删除分类（仅允许删除空分类）
 */
export async function deleteCategory(name: string): Promise<void> {
  const categories = await getRawCategories();
  const index = categories.findIndex((c) => c.name === name);

  if (index === -1) {
    throw AppError.notFound(`分类 "${name}" 未找到`);
  }

  // 检查分类下是否有 Skill
  const skills = getAllSkills();
  const skillCount = skills.filter((s) => s.category === name).length;
  if (skillCount > 0) {
    throw new AppError(
      "CATEGORY_NOT_EMPTY",
      `分类 "${name}" 下还有 ${skillCount} 个 Skill，请先移走再删除`,
      409,
    );
  }

  categories.splice(index, 1);
  await writeYaml(CATEGORIES_PATH, categories);
}

// ---- 内部工具 ----

/** 读取原始分类数据（不含 skillCount） */
async function getRawCategories(): Promise<
  Array<{ name: string; displayName: string; description?: string }>
> {
  const raw = await readYaml<Array<Record<string, unknown>>>(CATEGORIES_PATH);
  return (raw || []).map((item) => ({
    name: (item.name as string) ?? "",
    displayName: (item.displayName as string) ?? (item.name as string) ?? "",
    description: item.description as string | undefined,
  }));
}
