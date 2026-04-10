// ============================================================
// server/services/configService.ts — 配置文件读写服务
// ============================================================

import path from "node:path";
import { fileURLToPath } from "node:url";
import { readYaml, writeYaml } from "../utils/yamlUtils.js";
import type { AppConfig, Category, SyncTarget } from "../../shared/types.js";

// 项目根目录（使用 fileURLToPath 确保 Windows 兼容）
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const CONFIG_DIR = path.join(PROJECT_ROOT, "config");
const SETTINGS_PATH = path.join(CONFIG_DIR, "settings.yaml");
const CATEGORIES_PATH = path.join(CONFIG_DIR, "categories.yaml");

/** 默认设置 */
const DEFAULT_SETTINGS: Omit<AppConfig, "categories"> = {
  version: "0.1.0",
  sync: { targets: [] as SyncTarget[] },
  ui: { defaultView: "grid", sidebarWidth: 240 },
};

/** 默认分类 */
const DEFAULT_CATEGORIES: Omit<Category, "skillCount">[] = [
  {
    name: "coding",
    displayName: "编程开发",
    description: "代码编写、调试、重构相关的 Skill",
  },
  {
    name: "writing",
    displayName: "文档写作",
    description: "文档、注释、技术写作相关的 Skill",
  },
  {
    name: "devops",
    displayName: "DevOps",
    description: "部署、CI/CD、运维相关的 Skill",
  },
  {
    name: "workflows",
    displayName: "工作流",
    description: "多 Skill 组合的自动化工作流",
  },
];

/**
 * 加载应用设置
 * 文件不存在或解析失败时使用默认值并自动创建配置文件
 */
export async function loadSettings(): Promise<Omit<AppConfig, "categories">> {
  try {
    const data = await readYaml<Record<string, unknown>>(SETTINGS_PATH);
    if (data) {
      return {
        version: (data.version as string) ?? DEFAULT_SETTINGS.version,
        sync: {
          targets: (data.sync as { targets?: SyncTarget[] })?.targets ?? [],
        },
        ui: {
          defaultView:
            ((data.ui as { defaultView?: string })?.defaultView as
              | "grid"
              | "list") ?? DEFAULT_SETTINGS.ui.defaultView,
          sidebarWidth:
            (data.ui as { sidebarWidth?: number })?.sidebarWidth ??
            DEFAULT_SETTINGS.ui.sidebarWidth,
        },
      };
    }
  } catch (err) {
    console.error("[configService] 设置文件读取失败，使用默认值:", err);
  }

  // 文件不存在或解析失败，创建默认配置
  try {
    await writeYaml(SETTINGS_PATH, {
      version: DEFAULT_SETTINGS.version,
      sync: DEFAULT_SETTINGS.sync,
      ui: DEFAULT_SETTINGS.ui,
    });
    console.log("[configService] 已创建默认设置文件:", SETTINGS_PATH);
  } catch (writeErr) {
    console.error("[configService] 创建默认设置文件失败:", writeErr);
  }

  return { ...DEFAULT_SETTINGS };
}

/**
 * 加载分类列表
 * 文件不存在或解析失败时使用默认值并自动创建配置文件
 * skillCount 在此阶段默认为 0，后续由 skillService 填充
 */
export async function loadCategories(): Promise<Category[]> {
  try {
    const data =
      await readYaml<Array<Record<string, unknown>>>(CATEGORIES_PATH);
    if (data && Array.isArray(data)) {
      return data.map((item) => ({
        name: (item.name as string) ?? "",
        displayName:
          (item.displayName as string) ?? (item.name as string) ?? "",
        description: item.description as string | undefined,
        skillCount: 0,
      }));
    }
  } catch (err) {
    console.error("[configService] 分类文件读取失败，使用默认值:", err);
  }

  // 文件不存在或解析失败，创建默认配置
  try {
    await writeYaml(CATEGORIES_PATH, DEFAULT_CATEGORIES);
    console.log("[configService] 已创建默认分类文件:", CATEGORIES_PATH);
  } catch (writeErr) {
    console.error("[configService] 创建默认分类文件失败:", writeErr);
  }

  return DEFAULT_CATEGORIES.map((cat) => ({ ...cat, skillCount: 0 }));
}

/**
 * 加载完整应用配置
 */
export async function loadConfig(): Promise<AppConfig> {
  const [settings, categories] = await Promise.all([
    loadSettings(),
    loadCategories(),
  ]);

  return {
    ...settings,
    categories,
  };
}
