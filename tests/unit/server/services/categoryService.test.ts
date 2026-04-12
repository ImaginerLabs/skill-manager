import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock yamlUtils
vi.mock("../../../../server/utils/yamlUtils", () => ({
  readYaml: vi.fn(),
  writeYaml: vi.fn(),
}));

// Mock skillService
vi.mock("../../../../server/services/skillService", () => ({
  getAllSkills: vi.fn(),
  waitForInitialization: vi.fn().mockResolvedValue(undefined),
}));

// Mock fs-extra
vi.mock("fs-extra", () => ({
  default: {
    ensureDir: vi.fn().mockResolvedValue(undefined),
  },
}));

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../../../server/services/categoryService";
import { getAllSkills } from "../../../../server/services/skillService";
import { readYaml, writeYaml } from "../../../../server/utils/yamlUtils";

const mockCategories = [
  { name: "coding", displayName: "编程开发", description: "编程相关" },
  { name: "writing", displayName: "文档写作" },
];

const mockSkills = [
  {
    id: "s1",
    name: "Skill 1",
    category: "coding",
    tags: [],
    description: "",
    filePath: "coding/s1.md",
    fileSize: 100,
    lastModified: "2024-01-01T00:00:00Z",
  },
  {
    id: "s2",
    name: "Skill 2",
    category: "coding",
    tags: [],
    description: "",
    filePath: "coding/s2.md",
    fileSize: 200,
    lastModified: "2024-01-01T00:00:00Z",
  },
  {
    id: "s3",
    name: "Skill 3",
    category: "writing",
    tags: [],
    description: "",
    filePath: "writing/s3.md",
    fileSize: 150,
    lastModified: "2024-01-01T00:00:00Z",
  },
];

describe("categoryService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAllSkills).mockReturnValue(mockSkills as any);
    vi.mocked(readYaml).mockResolvedValue(mockCategories);
    vi.mocked(writeYaml).mockResolvedValue(undefined);
  });

  describe("getCategories", () => {
    it("返回分类列表并计算 skillCount", async () => {
      const result = await getCategories();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("coding");
      expect(result[0].skillCount).toBe(2);
      expect(result[1].name).toBe("writing");
      expect(result[1].skillCount).toBe(1);
    });

    it("配置文件为空时返回空数组", async () => {
      vi.mocked(readYaml).mockResolvedValue(null);

      const result = await getCategories();

      expect(result).toEqual([]);
    });

    it("displayName 缺失时使用 name", async () => {
      vi.mocked(readYaml).mockResolvedValue([{ name: "test" }]);

      const result = await getCategories();

      expect(result[0].displayName).toBe("test");
    });
  });

  describe("createCategory", () => {
    it("成功创建新分类", async () => {
      const result = await createCategory({
        name: "devops",
        displayName: "DevOps",
        description: "运维相关",
      });

      expect(result.name).toBe("devops");
      expect(result.displayName).toBe("DevOps");
      expect(result.skillCount).toBe(0);
      expect(writeYaml).toHaveBeenCalled();
    });

    it("分类名称已存在时抛出错误", async () => {
      await expect(
        createCategory({
          name: "coding",
          displayName: "编程",
        }),
      ).rejects.toThrow('分类 "coding" 已存在');
    });
  });

  describe("updateCategory", () => {
    it("成功更新分类", async () => {
      const result = await updateCategory("coding", {
        displayName: "新编程开发",
        description: "新描述",
      });

      expect(result.name).toBe("coding");
      expect(result.displayName).toBe("新编程开发");
      expect(result.skillCount).toBe(2);
      expect(writeYaml).toHaveBeenCalled();
    });

    it("分类不存在时抛出错误", async () => {
      await expect(
        updateCategory("nonexistent", { displayName: "新名称" }),
      ).rejects.toThrow("未找到");
    });
  });

  describe("deleteCategory", () => {
    it("成功删除空分类", async () => {
      // 添加一个没有 Skill 的分类
      vi.mocked(readYaml).mockResolvedValue([
        ...mockCategories,
        { name: "empty", displayName: "空分类" },
      ]);

      await expect(deleteCategory("empty")).resolves.toBeUndefined();
      expect(writeYaml).toHaveBeenCalled();
    });

    it("非空分类不允许删除", async () => {
      await expect(deleteCategory("coding")).rejects.toThrow("还有 2 个 Skill");
    });

    it("分类不存在时抛出错误", async () => {
      await expect(deleteCategory("nonexistent")).rejects.toThrow("未找到");
    });
  });
});
