// ============================================================
// server/services/bundleService.ts — 套件 CRUD 服务
// ============================================================

import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  ApplyBundleResult,
  PathPreset,
  SkillBundle,
  SkillBundleCreate,
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

/** 默认套件包含的出厂分类（初始创建时使用，后续会动态更新） */
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
  skillBundles?: SkillBundle[];
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

// ---- 公开 API ----

/**
 * 获取所有套件（含损坏引用信息注入）
 */
export async function getBundles(): Promise<SkillBundleWithStatus[]> {
  const settings = await readSettings();
  const bundles = settings.skillBundles ?? [];

  // 获取当前有效分类列表，用于计算 brokenCategoryNames
  const categories = await getCategories();
  const validCategoryNames = new Set(
    categories.map((c) => c.name.toLowerCase()),
  );

  return bundles.map((bundle) => ({
    ...bundle,
    brokenCategoryNames: bundle.categoryNames.filter(
      (name) => !validCategoryNames.has(name.toLowerCase()),
    ),
  }));
}

/**
 * 添加套件
 */
export async function addBundle(
  data: SkillBundleCreate,
): Promise<SkillBundleWithStatus> {
  // 名称格式校验
  if (!VALID_BUNDLE_NAME_RE.test(data.name)) {
    throw AppError.validationError("套件名称只能包含小写字母、数字和连字符");
  }

  const settings = await readSettings();
  const bundles = settings.skillBundles ?? [];

  // 数量上限校验
  if (bundles.length >= BUNDLE_LIMIT) {
    throw AppError.bundleLimitExceeded();
  }

  // 名称唯一性校验（大小写不敏感）
  const nameLower = data.name.toLowerCase();
  const duplicate = bundles.find((b) => b.name.toLowerCase() === nameLower);
  if (duplicate) {
    throw AppError.bundleNameDuplicate(data.name);
  }

  // 分类存在性校验
  const categories = await getCategories();
  const validCategoryNames = new Set(
    categories.map((c) => c.name.toLowerCase()),
  );
  const invalidCategories = data.categoryNames.filter(
    (name) => !validCategoryNames.has(name.toLowerCase()),
  );
  if (invalidCategories.length > 0) {
    throw AppError.validationError(
      `以下分类不存在：${invalidCategories.join(", ")}`,
    );
  }

  const now = new Date().toISOString();
  const newBundle: SkillBundle = {
    id: generateId(),
    name: data.name,
    displayName: data.displayName,
    ...(data.description?.trim()
      ? { description: data.description.trim() }
      : {}),
    categoryNames: data.categoryNames,
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
 * 更新套件
 */
export async function updateBundle(
  id: string,
  updates: SkillBundleUpdate,
): Promise<SkillBundleWithStatus> {
  const settings = await readSettings();
  const bundles = settings.skillBundles ?? [];

  const index = bundles.findIndex((b) => b.id === id);
  if (index === -1) {
    throw AppError.bundleNotFound(id);
  }

  // 如果更新了 categoryNames，校验分类存在性
  if (updates.categoryNames !== undefined) {
    const categories = await getCategories();
    const validCategoryNames = new Set(
      categories.map((c) => c.name.toLowerCase()),
    );
    const invalidCategories = updates.categoryNames.filter(
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
    ...(updates.categoryNames !== undefined && {
      categoryNames: updates.categoryNames,
    }),
    updatedAt: new Date().toISOString(),
  };

  bundles[index] = updated;
  settings.skillBundles = bundles;
  await writeSettings(settings);

  // 计算 brokenCategoryNames
  const categories = await getCategories();
  const validCategoryNames = new Set(
    categories.map((c) => c.name.toLowerCase()),
  );

  return {
    ...updated,
    brokenCategoryNames: updated.categoryNames.filter(
      (name) => !validCategoryNames.has(name.toLowerCase()),
    ),
  };
}

/**
 * 删除套件
 */
export async function removeBundle(id: string): Promise<void> {
  // 默认套件不可删除
  if (id === DEFAULT_BUNDLE_ID) {
    throw AppError.badRequest("默认套件不可删除");
  }

  const settings = await readSettings();
  const bundles = settings.skillBundles ?? [];

  const index = bundles.findIndex((b) => b.id === id);
  if (index === -1) {
    throw AppError.bundleNotFound(id);
  }

  bundles.splice(index, 1);
  settings.skillBundles = bundles;
  await writeSettings(settings);
}

/**
 * 一键激活套件（覆盖写入 activeCategories，跳过已删除分类）
 */
export async function applyBundle(id: string): Promise<ApplyBundleResult> {
  const settings = await readSettings();
  const bundles = settings.skillBundles ?? [];

  const bundle = bundles.find((b) => b.id === id);
  if (!bundle) {
    throw AppError.bundleNotFound(id);
  }

  const categories = await getCategories();
  const validCategoryNames = new Set(
    categories.map((c) => c.name.toLowerCase()),
  );

  const applied = bundle.categoryNames.filter((name) =>
    validCategoryNames.has(name.toLowerCase()),
  );
  const skipped = bundle.categoryNames.filter(
    (name) => !validCategoryNames.has(name.toLowerCase()),
  );

  // 覆盖写入（不叠加）
  settings.activeCategories = applied;
  await writeSettings(settings);

  return { applied, skipped };
}

/**
 * 收集当前所有实际存在的分类名（从 Skill 缓存 + categories.yaml 合并去重）
 */
async function collectAllCategoryNames(): Promise<string[]> {
  await waitForInitialization();
  const skills = getAllSkills();
  const categories = await getCategories();

  const categorySet = new Set<string>();
  // 1. 从 categories.yaml 中获取所有已定义分类
  for (const cat of categories) {
    if (cat.name !== "uncategorized") {
      categorySet.add(cat.name);
    }
  }
  // 2. 从实际 Skill 中收集所有分类（包括非标准分类）
  for (const skill of skills) {
    if (skill.category && skill.category !== "uncategorized") {
      categorySet.add(skill.category);
    }
  }

  return [...categorySet];
}

/**
 * 确保默认套件存在并包含所有分类（幂等操作）
 * 系统启动时调用，若默认套件不存在则创建，已存在则更新其 categoryNames
 */
export async function ensureDefaultBundle(): Promise<void> {
  const settings = await readSettings();
  const bundles = settings.skillBundles ?? [];

  // 动态收集所有分类名
  const allCategoryNames = await collectAllCategoryNames();

  const existingIndex = bundles.findIndex((b) => b.name === "default");
  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    // 已存在：同步 categoryNames（添加新分类 + 移除已失效分类）
    const existing = bundles[existingIndex];
    const validSet = new Set(allCategoryNames);
    const currentNames = new Set(existing.categoryNames);

    const newNames = allCategoryNames.filter((n) => !currentNames.has(n));
    const removedNames = existing.categoryNames.filter((n) => !validSet.has(n));

    if (newNames.length > 0 || removedNames.length > 0) {
      const updatedCategories = existing.categoryNames
        .filter((n) => validSet.has(n))
        .concat(newNames);

      bundles[existingIndex] = {
        ...existing,
        categoryNames: updatedCategories,
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

  // 不存在：创建默认套件，包含所有分类
  const defaultBundle: SkillBundle = {
    id: DEFAULT_BUNDLE_ID,
    name: "default",
    displayName: "默认套件",
    description: "包含所有分类的完整技能组合",
    categoryNames:
      allCategoryNames.length > 0
        ? allCategoryNames
        : DEFAULT_BUNDLE_CATEGORIES,
    createdAt: now,
    updatedAt: now,
  };

  bundles.push(defaultBundle);
  settings.skillBundles = bundles;
  await writeSettings(settings);
  console.log("[bundleService] 默认套件已创建");
}
