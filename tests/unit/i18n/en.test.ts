import { describe, expect, it } from "vitest";
import { en } from "../../../src/i18n/locales/en";
import { zh } from "../../../src/i18n/locales/zh";

/**
 * 递归获取对象所有叶子键路径，如 "nav.skillLibrary"
 */
function getLeafKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      keys.push(...getLeafKeys(v as Record<string, unknown>, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

describe("en.ts — 英文翻译资源结构验证", () => {
  const zhKeys = getLeafKeys(zh as unknown as Record<string, unknown>).sort();
  const enKeys = getLeafKeys(en as unknown as Record<string, unknown>).sort();

  it("en 与 zh 的键集合完全一致（深度对比）", () => {
    expect(enKeys).toEqual(zhKeys);
  });

  it("en 所有值均为非空字符串", () => {
    for (const key of enKeys) {
      const parts = key.split(".");

      let val: any = en;
      for (const p of parts) val = val[p];
      expect(typeof val).toBe("string");
      expect(val.length).toBeGreaterThan(0);
    }
  });

  it("nav 域英文翻译正确", () => {
    expect(en.nav.skillLibrary).toBe("Skill Library");
    expect(en.nav.workflow).toBe("Workflow");
    expect(en.nav.sync).toBe("Sync");
    expect(en.nav.import).toBe("Import");
    expect(en.nav.categories).toBe("Categories");
    expect(en.nav.manageCategories).toBe("Manage Categories");
  });

  it("common 域英文翻译正确", () => {
    expect(en.common.loading).toBe("Loading...");
    expect(en.common.save).toBe("Save");
    expect(en.common.cancel).toBe("Cancel");
    expect(en.common.close).toBe("Close");
    expect(en.common.noDescription).toBe("No description");
  });

  it("插值变量与 zh 保持一致", () => {
    // skillCount 插值
    expect(en.skillBrowse.skillCount).toContain("{{count}}");
    expect(en.skillBrowse.skillCountFiltered).toContain("{{filtered}}");
    expect(en.skillBrowse.skillCountFiltered).toContain("{{total}}");
    // bundle 激活插值
    expect(en.bundle.activateSuccess_withSkipped).toContain("{{applied}}");
    expect(en.bundle.activateSuccess_withSkipped).toContain("{{skipped}}");
    expect(en.bundle.activateSuccess).toContain("{{applied}}");
    // toast 工作流插值
    expect(en.toast.workflowLoaded).toContain("{{name}}");
    expect(en.toast.workflowDeleted).toContain("{{name}}");
    // category 批量操作插值
    expect(en.category.batchRemoveSuccess).toContain("{{count}}");
    expect(en.category.deleteConfirmDesc).toContain("{{name}}");
  });
});
