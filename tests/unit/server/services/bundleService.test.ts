// ============================================================
// tests/unit/server/services/bundleService.test.ts — 套件服务单元测试
// ============================================================

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock 依赖（必须在 import 之前）
vi.mock("../../../../server/utils/yamlUtils", () => ({
  readYaml: vi.fn(),
  writeYaml: vi.fn(),
}));

vi.mock("../../../../server/services/categoryService", () => ({
  getCategories: vi.fn(),
}));

import {
  addBundle,
  applyBundle,
  ensureDefaultBundle,
  getBundles,
  removeBundle,
  updateBundle,
} from "../../../../server/services/bundleService";
import { getCategories } from "../../../../server/services/categoryService";
import { readYaml, writeYaml } from "../../../../server/utils/yamlUtils";

// 测试用分类数据
const mockCategories = [
  { name: "coding", displayName: "编程", description: "", skillCount: 5 },
  { name: "testing", displayName: "测试", description: "", skillCount: 3 },
  { name: "writing", displayName: "写作", description: "", skillCount: 2 },
];

// 测试用套件数据
const mockBundle = {
  id: "bundle-abc123-xyz1",
  name: "frontend-dev",
  displayName: "前端日常开发",
  description: "前端开发常用分类",
  categoryNames: ["coding", "testing"],
  createdAt: "2026-04-13T00:00:00.000Z",
  updatedAt: "2026-04-13T00:00:00.000Z",
};

describe("bundleService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCategories).mockResolvedValue(mockCategories);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ----------------------------------------------------------------
  // getBundles
  // ----------------------------------------------------------------
  describe("getBundles", () => {
    it("settings 为 null 时返回空数组", async () => {
      vi.mocked(readYaml).mockResolvedValue(null);

      const result = await getBundles();
      expect(result).toEqual([]);
    });

    it("旧版 settings 无 skillBundles 字段时返回空数组（向后兼容）", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        version: "0.1.0",
        sync: { targets: [] },
        pathPresets: [],
      });

      const result = await getBundles();
      expect(result).toEqual([]);
    });

    it("返回套件列表，并注入 brokenCategoryNames（无损坏引用）", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [mockBundle],
      });

      const result = await getBundles();
      expect(result).toHaveLength(1);
      expect(result[0].brokenCategoryNames).toEqual([]);
    });

    it("注入 brokenCategoryNames（有损坏引用）", async () => {
      const bundleWithBroken = {
        ...mockBundle,
        categoryNames: ["coding", "deleted-category"],
      };
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [bundleWithBroken],
      });

      const result = await getBundles();
      expect(result[0].brokenCategoryNames).toEqual(["deleted-category"]);
    });

    it("分类名大小写不敏感匹配（不误判为损坏引用）", async () => {
      const bundleWithUpperCase = {
        ...mockBundle,
        categoryNames: ["Coding", "Testing"],
      };
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [bundleWithUpperCase],
      });

      const result = await getBundles();
      expect(result[0].brokenCategoryNames).toEqual([]);
    });
  });

  // ----------------------------------------------------------------
  // addBundle
  // ----------------------------------------------------------------
  describe("addBundle", () => {
    it("成功创建套件", async () => {
      vi.mocked(readYaml).mockResolvedValue({ skillBundles: [] });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await addBundle({
        name: "my-bundle",
        displayName: "我的套件",
        categoryNames: ["coding", "testing"],
      });

      expect(result.id).toMatch(/^bundle-/);
      expect(result.name).toBe("my-bundle");
      expect(result.displayName).toBe("我的套件");
      expect(result.categoryNames).toEqual(["coding", "testing"]);
      expect(result.brokenCategoryNames).toEqual([]);
      expect(writeYaml).toHaveBeenCalledOnce();
    });

    it("成功创建套件（含 description）", async () => {
      vi.mocked(readYaml).mockResolvedValue({ skillBundles: [] });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await addBundle({
        name: "my-bundle",
        displayName: "我的套件",
        description: "这是描述",
        categoryNames: ["coding"],
      });

      expect(result.description).toBe("这是描述");
    });

    it("名称不符合正则时抛出校验错误", async () => {
      await expect(
        addBundle({
          name: "My Bundle",
          displayName: "我的套件",
          categoryNames: ["coding"],
        }),
      ).rejects.toThrow("小写字母");
    });

    it("名称重复时抛出错误（大小写不敏感）", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [{ ...mockBundle, name: "my-bundle" }],
      });

      await expect(
        addBundle({
          name: "my-bundle",
          displayName: "重复套件",
          categoryNames: ["coding"],
        }),
      ).rejects.toThrow("已存在");
    });

    it("分类不存在时抛出校验错误", async () => {
      vi.mocked(readYaml).mockResolvedValue({ skillBundles: [] });

      await expect(
        addBundle({
          name: "my-bundle",
          displayName: "我的套件",
          categoryNames: ["nonexistent-category"],
        }),
      ).rejects.toThrow("不存在");
    });

    it("套件数量达到上限（50）时抛出错误", async () => {
      const maxBundles = Array.from({ length: 50 }, (_, i) => ({
        ...mockBundle,
        id: `bundle-${i}`,
        name: `bundle-${i}`,
      }));
      vi.mocked(readYaml).mockResolvedValue({ skillBundles: maxBundles });

      await expect(
        addBundle({
          name: "new-bundle",
          displayName: "新套件",
          categoryNames: ["coding"],
        }),
      ).rejects.toThrow("上限");
    });

    it("创建后 writeYaml 写入的数据包含新套件", async () => {
      vi.mocked(readYaml).mockResolvedValue({ skillBundles: [] });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      await addBundle({
        name: "new-bundle",
        displayName: "新套件",
        categoryNames: ["coding"],
      });

      const writeCall = vi.mocked(writeYaml).mock.calls[0];
      const writtenData = writeCall[1] as {
        skillBundles: { name: string }[];
      };
      expect(writtenData.skillBundles).toHaveLength(1);
      expect(writtenData.skillBundles[0].name).toBe("new-bundle");
    });
  });

  // ----------------------------------------------------------------
  // updateBundle
  // ----------------------------------------------------------------
  describe("updateBundle", () => {
    it("成功更新 displayName", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [mockBundle],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await updateBundle(mockBundle.id, {
        displayName: "新显示名称",
      });

      expect(result.displayName).toBe("新显示名称");
      expect(result.name).toBe(mockBundle.name); // name 不变
    });

    it("成功更新 categoryNames", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [mockBundle],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await updateBundle(mockBundle.id, {
        categoryNames: ["coding", "writing"],
      });

      expect(result.categoryNames).toEqual(["coding", "writing"]);
    });

    it("更新 categoryNames 包含不存在的分类时抛出错误", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [mockBundle],
      });

      await expect(
        updateBundle(mockBundle.id, {
          categoryNames: ["nonexistent"],
        }),
      ).rejects.toThrow("不存在");
    });

    it("id 不存在时抛出 404 错误", async () => {
      vi.mocked(readYaml).mockResolvedValue({ skillBundles: [] });

      await expect(
        updateBundle("nonexistent-id", { displayName: "新名称" }),
      ).rejects.toThrow("未找到");
    });

    it("更新后 updatedAt 时间戳更新", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [mockBundle],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await updateBundle(mockBundle.id, {
        displayName: "新名称",
      });

      expect(result.updatedAt).not.toBe(mockBundle.updatedAt);
    });
  });

  // ----------------------------------------------------------------
  // removeBundle
  // ----------------------------------------------------------------
  describe("removeBundle", () => {
    it("成功删除套件", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [mockBundle],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      await removeBundle(mockBundle.id);

      expect(writeYaml).toHaveBeenCalledOnce();
      const writeCall = vi.mocked(writeYaml).mock.calls[0];
      const writtenData = writeCall[1] as { skillBundles: unknown[] };
      expect(writtenData.skillBundles).toHaveLength(0);
    });

    it("删除后其他套件保留", async () => {
      const anotherBundle = {
        ...mockBundle,
        id: "bundle-other",
        name: "other",
      };
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [mockBundle, anotherBundle],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      await removeBundle(mockBundle.id);

      const writeCall = vi.mocked(writeYaml).mock.calls[0];
      const writtenData = writeCall[1] as { skillBundles: { id: string }[] };
      expect(writtenData.skillBundles).toHaveLength(1);
      expect(writtenData.skillBundles[0].id).toBe("bundle-other");
    });

    it("id 不存在时抛出 404 错误", async () => {
      vi.mocked(readYaml).mockResolvedValue({ skillBundles: [] });

      await expect(removeBundle("nonexistent-id")).rejects.toThrow("未找到");
    });

    it("尝试删除默认套件（bundle-default）时抛出 400 错误", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [
          {
            id: "bundle-default",
            name: "default",
            displayName: "默认套件",
            categoryNames: ["coding"],
            createdAt: "2026-04-14T00:00:00.000Z",
            updatedAt: "2026-04-14T00:00:00.000Z",
          },
        ],
      });

      await expect(removeBundle("bundle-default")).rejects.toThrow(
        "默认套件不可删除",
      );
    });
  });

  // ----------------------------------------------------------------
  // ensureDefaultBundle
  // ----------------------------------------------------------------
  describe("ensureDefaultBundle", () => {
    it("默认套件不存在时自动创建", async () => {
      vi.mocked(readYaml).mockResolvedValue({ skillBundles: [] });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      await ensureDefaultBundle();

      expect(writeYaml).toHaveBeenCalledOnce();
      const writeCall = vi.mocked(writeYaml).mock.calls[0];
      const writtenData = writeCall[1] as {
        skillBundles: {
          id: string;
          name: string;
          categoryNames: string[];
        }[];
      };
      expect(writtenData.skillBundles).toHaveLength(1);
      expect(writtenData.skillBundles[0].id).toBe("bundle-default");
      expect(writtenData.skillBundles[0].name).toBe("default");
      expect(writtenData.skillBundles[0].categoryNames).toHaveLength(9);
    });

    it("默认套件已存在时幂等跳过（不重复创建）", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [
          {
            id: "bundle-default",
            name: "default",
            displayName: "默认套件",
            categoryNames: ["coding"],
            createdAt: "2026-04-14T00:00:00.000Z",
            updatedAt: "2026-04-14T00:00:00.000Z",
          },
        ],
      });

      await ensureDefaultBundle();

      // 幂等：不应调用 writeYaml
      expect(writeYaml).not.toHaveBeenCalled();
    });

    it("创建的默认套件包含所有 9 个出厂分类", async () => {
      vi.mocked(readYaml).mockResolvedValue({ skillBundles: [] });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      await ensureDefaultBundle();

      const writeCall = vi.mocked(writeYaml).mock.calls[0];
      const writtenData = writeCall[1] as {
        skillBundles: { categoryNames: string[] }[];
      };
      const categories = writtenData.skillBundles[0].categoryNames;
      expect(categories).toContain("coding");
      expect(categories).toContain("writing");
      expect(categories).toContain("devops");
      expect(categories).toContain("workflows");
      expect(categories).toContain("document-processing");
      expect(categories).toContain("dev-tools");
      expect(categories).toContain("testing");
      expect(categories).toContain("design");
      expect(categories).toContain("meta-skills");
    });

    it("settings 为 null 时也能正常创建默认套件", async () => {
      vi.mocked(readYaml).mockResolvedValue(null);
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      await ensureDefaultBundle();

      expect(writeYaml).toHaveBeenCalledOnce();
    });
  });

  // ----------------------------------------------------------------
  // applyBundle
  // ----------------------------------------------------------------
  describe("applyBundle", () => {
    it("成功激活套件（所有分类有效）", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [mockBundle],
        activeCategories: [],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await applyBundle(mockBundle.id);

      expect(result.applied).toEqual(["coding", "testing"]);
      expect(result.skipped).toEqual([]);
    });

    it("激活时跳过已删除的分类（损坏引用）", async () => {
      const bundleWithBroken = {
        ...mockBundle,
        categoryNames: ["coding", "deleted-category"],
      };
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [bundleWithBroken],
        activeCategories: [],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await applyBundle(bundleWithBroken.id);

      expect(result.applied).toEqual(["coding"]);
      expect(result.skipped).toEqual(["deleted-category"]);
    });

    it("激活以覆盖模式写入 activeCategories（不叠加）", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [mockBundle],
        activeCategories: ["writing", "old-category"],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      await applyBundle(mockBundle.id);

      const writeCall = vi.mocked(writeYaml).mock.calls[0];
      const writtenData = writeCall[1] as { activeCategories: string[] };
      // 覆盖写入，不叠加旧的 activeCategories
      expect(writtenData.activeCategories).toEqual(["coding", "testing"]);
      expect(writtenData.activeCategories).not.toContain("writing");
    });

    it("id 不存在时抛出 404 错误", async () => {
      vi.mocked(readYaml).mockResolvedValue({ skillBundles: [] });

      await expect(applyBundle("nonexistent-id")).rejects.toThrow("未找到");
    });

    it("所有分类均已删除时 applied 为空数组", async () => {
      const bundleAllBroken = {
        ...mockBundle,
        categoryNames: ["deleted-1", "deleted-2"],
      };
      vi.mocked(readYaml).mockResolvedValue({
        skillBundles: [bundleAllBroken],
        activeCategories: ["coding"],
      });
      vi.mocked(writeYaml).mockResolvedValue(undefined);

      const result = await applyBundle(bundleAllBroken.id);

      expect(result.applied).toEqual([]);
      expect(result.skipped).toEqual(["deleted-1", "deleted-2"]);

      const writeCall = vi.mocked(writeYaml).mock.calls[0];
      const writtenData = writeCall[1] as { activeCategories: string[] };
      expect(writtenData.activeCategories).toEqual([]);
    });
  });
});
