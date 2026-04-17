// ============================================================
// server/services/bundleService.ts — 套件 CRUD 服务（V3 统一模型）
// ============================================================

import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  ApplyBundleResult,
  PathPreset,
  SkillBundle,
  SkillBundleCreate,
  SkillBundleLegacy,
  SkillBundleUpdate,
  SkillBundleWithStatus,
  SyncTarget,
} from "../../shared/types.js";
import { AppError } from "../types/errors.js";
import { readYaml, writeYaml } from "../utils/yamlUtils.js";
import { getCategories } from "./categoryService.js";
import { getAllSkills, waitForInitialization } from "./skillService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const CONFIG_DIR = path.join(PROJECT_ROOT, "config");
const SETTINGS_PATH = path.join(CONFIG_DIR, "settings.yaml");

/** 套件数量上限 */
const BUNDLE_LIMIT = 50;

/** 套件名称校验正则 */
const VALID_BUNDLE_NAME_RE = /^[a-z0-9-]+$/;

/** 默认套件固定 ID */
const DEFAULT_BUNDLE_ID = "bundle-default";

/** 默认套件包含的出厂分类 */
const DEFAULT_BUNDLE_CATEGORIES = [
  "coding",
  "writing",
  "devops",
  "workflows",
  "document-processing",
  "dev-tools",
  "testing",
  "design",
  "meta-skills",
];

// ---- 内部工具函数 ----

interface SettingsData {
  version?: string;
  sync?: { targets?: SyncTarget[] };
  pathPresets?: PathPreset[];
  skillBundles?: (SkillBundle | SkillBundleLegacy)[];
  activeCategories?: string[];
  ui?: { defaultView?: string; sidebarWidth?: number };
}

async function readSettings(): Promise<SettingsData> {
  const data = await readYaml<SettingsData>(SETTINGS_PATH);
  return (
    data ?? {
      version: "0.1.0",
      sync: { targets: [] },
      pathPresets: [],
      skillBundles: [],
      activeCategories: [],
      ui: {},
    }
  );
}

async function writeSettings(data: SettingsData): Promise<void> {
  await writeYaml(SETTINGS_PATH, data);
}

function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 6);
  return `bundle-${ts}-${rand}`;
}

/**
 * V3 迁移：将旧格式套件转换为新格式
 */
function migrateToNewFormat(
  bundle: SkillBundle | SkillBundleLegacy,
): SkillBundle {
  if ("criteria" in bundle) {
    return bundle as SkillBundle;
  }
  return {
    id: bundle.id,
    name: bundle.name,
    displayName: bundle.displayName,
    description: bundle.description,
    criteria: {
      categories: bundle.categoryNames,
    },
    createdAt: bundle.createdAt,
    updatedAt: bundle.updatedAt,
  };
}

/**
 * 迁移所有旧格式套件到 V3（幂等操作）
 */
async function migrateBundles(): Promise<boolean> {
  const settings = await readSettings();
  const bundles = settings.skillBundles ?? [];

  const needsMigration = bundles.some((b) => !("criteria" in b));
  if (!needsMigration) {
    return false;
  }

  const migrated = bundles.map(migrateToNewFormat);
  settings.skillBundles = migrated;
  await writeSettings(settings);
  console.log("[bundleService] 套件已迁移到 V3 格式");
  return true;
}

// ---- 公开 API ----

/**
 * 初始化：执行 V3 迁移（幂等）
 */
export async function migrateBundlesIfNeeded(): Promise<void> {
  try {
    await migrateBundles();
  } catch (error) {
    console.error("[bundleService] 迁移失败，使用现有数据继续:", error);
  }
}

/**
 * 获取所有套件（含损坏引用信息注入，自动迁移旧格式）
 */
export async function getBundles(): Promise<SkillBundleWithStatus[]> {
  const settings = await readSettings();
  const bundles = (settings.skillBundles ?? []).map(migrateToNewFormat);

  const categories = await getCategories();
  const validCategoryNames = new Set(
    categories.map((c) => c.name.toLowerCase()),
  );

  return bundles.map((bundle) => ({
    ...bundle,
    brokenCategoryNames: (bundle.criteria.categories ?? []).filter(
      (name) => !validCategoryNames.has(name.toLowerCase()),
    ),
  }));
}

/**
 * 根据 ID 获取套件
 */
export async function getBundleById(id: string): Promise<SkillBundle | null> {
  const settings = await readSettings();
  const bundles = (settings.skillBundles ?? []).map(migrateToNewFormat);
  return bundles.find((b) => b.id === id) ?? null;
}

/**
 * 添加套件（V3 格式）
 */
export async function addBundle(
  data: SkillBundleCreate,
): Promise<SkillBundleWithStatus> {
  if (!VALID_BUNDLE_NAME_RE.test(data.name)) {
    throw AppError.validationError("套件名称只能包含小写字母、数字和连字符");
  }

  const settings = await readSettings();
  const bundles = (settings.skillBundles ?? []).map(migrateToNewFormat);

  if (bundles.length >= BUNDLE_LIMIT) {
    throw AppError.bundleLimitExceeded();
  }

  const nameLower = data.name.toLowerCase();
  const duplicate = bundles.find((b) => b.name.toLowerCase() === nameLower);
  if (duplicate) {
    throw AppError.bundleNameDuplicate(data.name);
  }

  if (data.criteria.categories?.length) {
    const categories = await getCategories();
    const validCategoryNames = new Set(
      categories.map((c) => c.name.toLowerCase()),
    );
    const invalidCategories = data.criteria.categories.filter(
      (name) => !validCategoryNames.has(name.toLowerCase()),
    );
    if (invalidCategories.length > 0) {
      throw AppError.validationError(
        `以下分类不存在：${invalidCategories.join(", ")}`,
      );
    }
  }

  const now = new Date().toISOString();
  const newBundle: SkillBundle = {
    id: generateId(),
    name: data.name,
    displayName: data.displayName,
    ...(data.description?.trim()
      ? { description: data.description.trim() }
      : {}),
    criteria: data.criteria,
    createdAt: now,
    updatedAt: now,
  };

  bundles.push(newBundle);
  settings.skillBundles = bundles;
  await writeSettings(settings);

  return {
    ...newBundle,
    brokenCategoryNames: [],
  };
}

/**
 * 更新套件（V3 格式）
 */
export async function updateBundle(
  id: string,
  updates: SkillBundleUpdate,
): Promise<SkillBundleWithStatus> {
  const settings = await readSettings();
  const bundles = (settings.skillBundles ?? []).map(migrateToNewFormat);

  const index = bundles.findIndex((b) => b.id === id);
  if (index === -1) {
    throw AppError.bundleNotFound(id);
  }

  if (updates.criteria?.categories?.length) {
    const categories = await getCategories();
    const validCategoryNames = new Set(
      categories.map((c) => c.name.toLowerCase()),
    );
    const invalidCategories = updates.criteria.categories.filter(
      (name) => !validCategoryNames.has(name.toLowerCase()),
    );
    if (invalidCategories.length > 0) {
      throw AppError.validationError(
        `以下分类不存在：${invalidCategories.join(", ")}`,
      );
    }
  }

  const updated: SkillBundle = {
    ...bundles[index],
    ...(updates.displayName !== undefined && {
      displayName: updates.displayName,
    }),
    ...(updates.description !== undefined && {
      description: updates.description.trim() || undefined,
    }),
    ...(updates.criteria !== undefined && {
      criteria: updates.criteria,
    }),
    updatedAt: new Date().toISOString(),
  };

  bundles[index] = updated;
  settings.skillBundles = bundles;
  await writeSettings(settings);

  const categories = await getCategories();
  const validCategoryNames = new Set(
    categories.map((c) => c.name.toLowerCase()),
  );

  return {
    ...updated,
    brokenCategoryNames: (updated.criteria.categories ?? []).filter(
      (name) => !validCategoryNames.has(name.toLowerCase()),
    ),
  };
}

/**
 * 删除套件
 */
export async function removeBundle(id: string): Promise<void> {
  if (id === DEFAULT_BUNDLE_ID) {
    throw AppError.badRequest("默认套件不可删除");
  }

  const settings = await readSettings();
  const bundles = (settings.skillBundles ?? []).map(migrateToNewFormat);

  const index = bundles.findIndex((b) => b.id === id);
  if (index === -1) {
    throw AppError.bundleNotFound(id);
  }

  bundles.splice(index, 1);
  settings.skillBundles = bundles;
  await writeSettings(settings);
}

/**
 * 一键激活套件（覆盖写入，跳过已删除分类）
 * V3 统一激活逻辑：合并 categories、sources、skills 条件取并集
 */
export async function applyBundle(id: string): Promise<ApplyBundleResult> {
  await waitForInitialization();
  const settings = await readSettings();
  const bundles = (settings.skillBundles ?? []).map(migrateToNewFormat);

  const bundle = bundles.find((b) => b.id === id);
  if (!bundle) {
    throw AppError.bundleNotFound(id);
  }

  const allSkills = getAllSkills();
  const categories = await getCategories();
  const validCategoryNames = new Set(
    categories.map((c) => c.name.toLowerCase()),
  );

  const matchedSkillIds = new Set<string>();
  const skippedCategories: string[] = [];

  const { criteria } = bundle;

  if (criteria.categories?.length) {
    const categorySkillMap = new Map<string, string[]>();
    for (const skill of allSkills) {
      const cat = skill.category.toLowerCase();
      if (!categorySkillMap.has(cat)) {
        categorySkillMap.set(cat, []);
      }
      categorySkillMap.get(cat)!.push(skill.id);
    }

    for (const catName of criteria.categories) {
      if (validCategoryNames.has(catName.toLowerCase())) {
        const ids = categorySkillMap.get(catName.toLowerCase()) ?? [];
        ids.forEach((id) => matchedSkillIds.add(id));
      } else {
        skippedCategories.push(catName);
      }
    }
  }

  if (criteria.sources?.length) {
    for (const skill of allSkills) {
      const source = skill.source ?? "";
      if (criteria.sources.includes(source)) {
        matchedSkillIds.add(skill.id);
      }
    }
  }

  if (criteria.skills?.length) {
    for (const skillId of criteria.skills) {
      matchedSkillIds.add(skillId);
    }
  }

  const appliedCategories =
    criteria.categories?.filter((name) => !skippedCategories.includes(name)) ??
    [];

  settings.activeCategories = appliedCategories;
  await writeSettings(settings);

  return {
    applied: [...matchedSkillIds],
    skipped: skippedCategories,
    total: matchedSkillIds.size,
  };
}

/**
 * 收集当前所有实际存在的分类名
 */
async function collectAllCategoryNames(): Promise<string[]> {
  await waitForInitialization();
  const skills = getAllSkills();
  const categories = await getCategories();

  const categorySet = new Set<string>();
  for (const cat of categories) {
    if (cat.name !== "uncategorized") {
      categorySet.add(cat.name);
    }
  }
  for (const skill of skills) {
    if (skill.category && skill.category !== "uncategorized") {
      categorySet.add(skill.category);
    }
  }

  return [...categorySet];
}

/**
 * 确保默认套件存在（幂等操作，V3 格式）
 */
export async function ensureDefaultBundle(): Promise<void> {
  const settings = await readSettings();
  const bundles = (settings.skillBundles ?? []).map(migrateToNewFormat);

  const allCategoryNames = await collectAllCategoryNames();
  const existingIndex = bundles.findIndex((b) => b.name === "default");
  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    const existing = bundles[existingIndex];
    const validSet = new Set(allCategoryNames);
    const currentNames = new Set(existing.criteria.categories ?? []);

    const newNames = allCategoryNames.filter((n) => !currentNames.has(n));
    const removedNames = (existing.criteria.categories ?? []).filter(
      (n) => !validSet.has(n),
    );

    if (newNames.length > 0 || removedNames.length > 0) {
      const updatedCategories = (existing.criteria.categories ?? [])
        .filter((n) => validSet.has(n))
        .concat(newNames);

      bundles[existingIndex] = {
        ...existing,
        criteria: {
          ...existing.criteria,
          categories: updatedCategories,
        },
        updatedAt: now,
      };
      settings.skillBundles = bundles;
      await writeSettings(settings);

      const logs: string[] = [];
      if (newNames.length > 0) {
        logs.push(`新增 ${newNames.length} 个分类: ${newNames.join(", ")}`);
      }
      if (removedNames.length > 0) {
        logs.push(
          `移除 ${removedNames.length} 个失效分类: ${removedNames.join(", ")}`,
        );
      }
      console.log(`[bundleService] 默认套件已更新，${logs.join("；")}`);
    }
    return;
  }

  const defaultBundle: SkillBundle = {
    id: DEFAULT_BUNDLE_ID,
    name: "default",
    displayName: "默认套件",
    description: "包含所有分类的完整技能组合",
    criteria: {
      categories:
        allCategoryNames.length > 0
          ? allCategoryNames
          : DEFAULT_BUNDLE_CATEGORIES,
    },
    createdAt: now,
    updatedAt: now,
  };

  bundles.push(defaultBundle);
  settings.skillBundles = bundles;
  await writeSettings(settings);
  console.log("[bundleService] 默认套件已创建");
}

/**
 * 解析套件条件，返回匹配的 Skill ID 列表（用于前端同步页面）
 */
export function resolveBundleSkills(bundle: SkillBundle): string[] {
  const allSkills = getAllSkills();
  const matchedSkillIds = new Set<string>();
  const { criteria } = bundle;

  if (criteria.categories?.length) {
    const categorySkillMap = new Map<string, string[]>();
    for (const skill of allSkills) {
      const cat = skill.category.toLowerCase();
      if (!categorySkillMap.has(cat)) {
        categorySkillMap.set(cat, []);
      }
      categorySkillMap.get(cat)!.push(skill.id);
    }

    for (const catName of criteria.categories) {
      const ids = categorySkillMap.get(catName.toLowerCase()) ?? [];
      ids.forEach((id) => matchedSkillIds.add(id));
    }
  }

  if (criteria.sources?.length) {
    for (const skill of allSkills) {
      const source = skill.source ?? "";
      if (criteria.sources.includes(source)) {
        matchedSkillIds.add(skill.id);
      }
    }
  }

  if (criteria.skills?.length) {
    for (const skillId of criteria.skills) {
      matchedSkillIds.add(skillId);
    }
  }

  return [...matchedSkillIds];
}
