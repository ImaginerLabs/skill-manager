import { describe, expect, it } from "vitest";
import { zh } from "../../../src/i18n/locales/zh";

describe("zh.ts — 中文翻译资源", () => {
  const REQUIRED_TOP_LEVEL_KEYS = [
    "nav",
    "common",
    "skillBrowse",
    "sync",
    "syncTarget",
    "settings",
    "bundle",
    "category",
    "metadata",
    "header",
    "toast",
    "workflow",
    "import",
    "paths",
    "pathPreset",
    "commandPalette",
    "skillList",
    "errors",
  ] as const;

  it("包含所有必需的顶层键", () => {
    for (const key of REQUIRED_TOP_LEVEL_KEYS) {
      expect(zh).toHaveProperty(key);
    }
  });

  it("nav 域包含所有导航键", () => {
    expect(zh.nav.skillLibrary).toBe("Skill 库");
    expect(zh.nav.workflow).toBe("工作流");
    expect(zh.nav.sync).toBe("同步");
    expect(zh.nav.import).toBe("导入");
    expect(zh.nav.pathConfig).toBe("路径配置");
    expect(zh.nav.categories).toBe("分类");
    expect(zh.nav.manageCategories).toBe("管理分类");
  });

  it("common 域包含所有通用键", () => {
    expect(zh.common.loading).toBe("加载中...");
    expect(zh.common.save).toBe("保存");
    expect(zh.common.cancel).toBe("取消");
    expect(zh.common.close).toBe("关闭");
    expect(zh.common.noDescription).toBe("暂无描述");
  });

  it("bundle 域包含激活插值键", () => {
    expect(zh.bundle.activateSuccess_withSkipped).toContain("{{applied}}");
    expect(zh.bundle.activateSuccess_withSkipped).toContain("{{skipped}}");
    expect(zh.bundle.activateSuccess).toContain("{{applied}}");
  });

  it("skillBrowse 域包含插值键", () => {
    expect(zh.skillBrowse.skillCount).toContain("{{count}}");
    expect(zh.skillBrowse.skillCountFiltered).toContain("{{filtered}}");
    expect(zh.skillBrowse.skillCountFiltered).toContain("{{total}}");
  });

  it("category 域包含批量操作插值键", () => {
    expect(zh.category.batchRemoveSuccess).toContain("{{count}}");
    expect(zh.category.batchRemoveButton).toContain("{{count}}");
    expect(zh.category.deleteConfirmDesc).toContain("{{name}}");
  });

  it("toast 域包含工作流消息插值键", () => {
    expect(zh.toast.workflowLoaded).toContain("{{name}}");
    expect(zh.toast.workflowDeleted).toContain("{{name}}");
    expect(zh.toast.workflowUndoDelete).toContain("{{name}}");
  });

  it("errors 域包含所有错误码", () => {
    expect(zh.errors.SKILL_NOT_FOUND).toBeDefined();
    expect(zh.errors.VALIDATION_ERROR).toBeDefined();
    expect(zh.errors.BUNDLE_LIMIT_EXCEEDED).toBeDefined();
    expect(zh.errors.BUNDLE_NAME_DUPLICATE).toBeDefined();
    expect(zh.errors.PATH_TRAVERSAL).toBeDefined();
    expect(zh.errors.unknown).toBeDefined();
  });
});
