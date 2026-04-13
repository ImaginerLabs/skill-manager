import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("i18n init — 翻译资源与语言切换", () => {
  beforeEach(() => {
    localStorage.removeItem("skill-manager-lang");
  });

  afterEach(() => {
    localStorage.removeItem("skill-manager-lang");
  });

  it("zh 翻译资源可正常访问", async () => {
    const { default: i18n } = await import("../../../src/i18n/index");
    await i18n.changeLanguage("zh");
    expect(i18n.t("nav.skillLibrary")).toBe("Skill 库");
    expect(i18n.t("common.save")).toBe("保存");
    expect(i18n.t("common.cancel")).toBe("取消");
    expect(i18n.t("common.loading")).toBe("加载中...");
  });

  it("en 翻译资源可正常访问", async () => {
    const { default: i18n } = await import("../../../src/i18n/index");
    await i18n.changeLanguage("en");
    expect(i18n.t("nav.skillLibrary")).toBe("Skill Library");
    expect(i18n.t("common.save")).toBe("Save");
    expect(i18n.t("common.cancel")).toBe("Cancel");
    expect(i18n.t("common.loading")).toBe("Loading...");
  });

  it("插值翻译正常工作（zh）", async () => {
    const { default: i18n } = await import("../../../src/i18n/index");
    await i18n.changeLanguage("zh");
    expect(i18n.t("skillBrowse.skillCount", { count: 5 })).toBe("5 个 Skill");
    expect(
      i18n.t("skillBrowse.skillCountFiltered", { filtered: 3, total: 10 }),
    ).toBe("3 / 10 个 Skill");
    expect(i18n.t("bundle.activateSuccess", { applied: 3 })).toBe(
      "已激活 3 个分类",
    );
    expect(
      i18n.t("bundle.activateSuccess_withSkipped", { applied: 3, skipped: 1 }),
    ).toBe("已激活 3 个分类，跳过 1 个已删除分类");
  });

  it("插值翻译正常工作（en）", async () => {
    const { default: i18n } = await import("../../../src/i18n/index");
    await i18n.changeLanguage("en");
    expect(i18n.t("skillBrowse.skillCount", { count: 5 })).toBe("5 Skills");
    expect(
      i18n.t("skillBrowse.skillCountFiltered", { filtered: 3, total: 10 }),
    ).toBe("3 / 10 Skills");
    expect(i18n.t("bundle.activateSuccess", { applied: 3 })).toBe(
      "Activated 3 categories",
    );
    expect(
      i18n.t("bundle.activateSuccess_withSkipped", { applied: 3, skipped: 1 }),
    ).toBe("Activated 3 categories, skipped 1 deleted");
  });

  it("语言切换后翻译立即更新", async () => {
    const { default: i18n } = await import("../../../src/i18n/index");
    await i18n.changeLanguage("zh");
    expect(i18n.t("common.save")).toBe("保存");
    await i18n.changeLanguage("en");
    expect(i18n.t("common.save")).toBe("Save");
    await i18n.changeLanguage("zh");
    expect(i18n.t("common.save")).toBe("保存");
  });

  it("fallbackLng 为 zh — 不支持的语言降级后翻译可用", async () => {
    const { default: i18n } = await import("../../../src/i18n/index");
    // 切换到不支持的语言，i18next 会 fallback 到 zh
    await i18n.changeLanguage("ja");
    // fallback 后应能访问 zh 翻译
    expect(i18n.t("common.save")).toBe("保存");
  });

  it("detection 配置使用 skill-manager-lang 作为 localStorage key", async () => {
    const { default: i18n } = await import("../../../src/i18n/index");
    // 验证 detection 配置中 lookupLocalStorage key 正确
    const detection = i18n.options.detection as Record<string, unknown>;
    expect(detection).toBeDefined();
    expect(detection.lookupLocalStorage).toBe("skill-manager-lang");
    expect(detection.order).toContain("localStorage");
    expect(detection.order).toContain("navigator");
  });

  it("supportedLngs 只包含 zh 和 en", async () => {
    const { default: i18n } = await import("../../../src/i18n/index");
    const options = i18n.options;
    expect(options.supportedLngs).toContain("zh");
    expect(options.supportedLngs).toContain("en");
    // 不应包含其他语言
    const langs = options.supportedLngs as string[];
    const filtered = langs.filter((l) => l !== "cimode");
    expect(filtered).toHaveLength(2);
  });

  it("category 批量操作插值（zh）", async () => {
    const { default: i18n } = await import("../../../src/i18n/index");
    await i18n.changeLanguage("zh");
    expect(i18n.t("category.batchRemoveSuccess", { count: 3 })).toBe(
      "已将 3 个 Skill 移出分类",
    );
    expect(i18n.t("category.batchRemoveButton", { count: 5 })).toBe(
      "移出此分类 (5)",
    );
    expect(i18n.t("category.deleteConfirmDesc", { name: "coding" })).toBe(
      '确定要删除分类 "coding" 吗？',
    );
  });

  it("toast 工作流消息插值（zh）", async () => {
    const { default: i18n } = await import("../../../src/i18n/index");
    await i18n.changeLanguage("zh");
    expect(i18n.t("toast.workflowLoaded", { name: "My Flow" })).toBe(
      "已加载工作流「My Flow」到编排器",
    );
    expect(i18n.t("toast.workflowDeleted", { name: "My Flow" })).toBe(
      "工作流「My Flow」已删除",
    );
  });
});
