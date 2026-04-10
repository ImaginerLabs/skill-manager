import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  createCategory,
  deleteCategory,
  deleteSkill,
  fetchCategories,
  fetchSkillById,
  fetchSkills,
  moveSkillCategory,
  refreshSkills,
  updateCategory,
  updateSkillMeta,
} from "../../../src/lib/api";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock 成功响应
const mockSuccessResponse = <T>(data: T) => ({
  success: true as const,
  data,
});

// Mock 错误响应
const mockErrorResponse = (code: string, message: string) => ({
  success: false as const,
  error: { code, message },
});

describe("api.ts", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("fetchSkills", () => {
    it("成功获取 Skill 列表", async () => {
      const mockSkills = [
        {
          id: "skill-1",
          name: "React 组件抽取",
          description: "描述",
          category: "frontend",
          tags: ["react"],
          filePath: "skills/skill-1.md",
          fileSize: 1024,
          lastModified: "2024-01-01T00:00:00Z",
        },
      ];

      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockSkills),
      });

      const result = await fetchSkills();
      expect(result).toEqual(mockSkills);
      expect(mockFetch).toHaveBeenCalledWith("/api/skills", expect.any(Object));
    });

    it("API 错误时抛出 ApiError", async () => {
      // 设置 mock 返回错误响应
      mockFetch.mockResolvedValue({
        json: async () => mockErrorResponse("FETCH_ERROR", "获取失败"),
      });

      // 第一次调用验证抛出错误
      try {
        await fetchSkills();
        expect.fail("应该抛出错误");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).code).toBe("FETCH_ERROR");
        expect((error as ApiError).message).toBe("获取失败");
      }
    });
  });

  describe("fetchSkillById", () => {
    it("成功获取单个 Skill", async () => {
      const mockSkill = {
        id: "skill-1",
        name: "React 组件抽取",
        description: "描述",
        category: "frontend",
        tags: ["react"],
        filePath: "skills/skill-1.md",
        fileSize: 1024,
        lastModified: "2024-01-01T00:00:00Z",
        content: "# 内容",
        rawContent: "---\nname: test\n---\n# 内容",
      };

      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockSkill),
      });

      const result = await fetchSkillById("skill-1");
      expect(result).toEqual(mockSkill);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/skills/skill-1",
        expect.any(Object),
      );
    });

    it("特殊字符 ID 正确编码", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse({ id: "skill-with spaces" }),
      });

      await fetchSkillById("skill with spaces");
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/skills/skill%20with%20spaces",
        expect.any(Object),
      );
    });

    it("Skill 不存在时抛出错误", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockErrorResponse("SKILL_NOT_FOUND", "Skill 不存在"),
      });

      await expect(fetchSkillById("non-existent")).rejects.toThrow(ApiError);
    });
  });

  describe("fetchCategories", () => {
    it("成功获取分类列表", async () => {
      const mockCategories = [
        { name: "frontend", displayName: "前端开发", skillCount: 10 },
        { name: "backend", displayName: "后端开发", skillCount: 5 },
      ];

      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockCategories),
      });

      const result = await fetchCategories();
      expect(result).toEqual(mockCategories);
    });
  });

  describe("createCategory", () => {
    it("成功创建分类", async () => {
      const newCategory = {
        name: "testing",
        displayName: "测试",
        description: "测试相关技能",
      };

      const mockResponse = {
        name: "testing",
        displayName: "测试",
        description: "测试相关技能",
        skillCount: 0,
      };

      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockResponse),
      });

      const result = await createCategory(newCategory);
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith("/api/categories", {
        method: "POST",
        body: JSON.stringify(newCategory),
        headers: expect.any(Object),
      });
    });
  });

  describe("updateCategory", () => {
    it("成功更新分类", async () => {
      const updateData = { displayName: "新名称" };
      const mockResponse = {
        name: "frontend",
        displayName: "新名称",
        skillCount: 10,
      };

      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockResponse),
      });

      const result = await updateCategory("frontend", updateData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteCategory", () => {
    it("成功删除分类", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(undefined),
      });

      await expect(deleteCategory("old-category")).resolves.toBeUndefined();
    });
  });

  describe("updateSkillMeta", () => {
    it("成功更新 Skill 元数据", async () => {
      const updateData = {
        name: "新名称",
        description: "新描述",
        tags: ["new-tag"],
      };

      const mockResponse = {
        id: "skill-1",
        name: "新名称",
        description: "新描述",
        category: "frontend",
        tags: ["new-tag"],
        filePath: "skills/skill-1.md",
        fileSize: 1024,
        lastModified: "2024-01-02T00:00:00Z",
      };

      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockResponse),
      });

      const result = await updateSkillMeta("skill-1", updateData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("moveSkillCategory", () => {
    it("成功移动 Skill 到其他分类", async () => {
      const mockResponse = {
        id: "skill-1",
        name: "React 组件抽取",
        category: "backend", // 移动后的分类
        filePath: "skills/backend/skill-1.md",
        fileSize: 1024,
        lastModified: "2024-01-02T00:00:00Z",
        description: "",
        tags: [],
      };

      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockResponse),
      });

      const result = await moveSkillCategory("skill-1", "backend");
      expect(result.category).toBe("backend");
    });
  });

  describe("deleteSkill", () => {
    it("成功删除 Skill", async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(undefined),
      });

      await expect(deleteSkill("skill-1")).resolves.toBeUndefined();
    });
  });

  describe("refreshSkills", () => {
    it("成功触发刷新", async () => {
      const mockResponse = { total: 10, success: 9, errors: 1 };

      mockFetch.mockResolvedValueOnce({
        json: async () => mockSuccessResponse(mockResponse),
      });

      const result = await refreshSkills();
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith("/api/refresh", {
        method: "POST",
        headers: expect.any(Object),
      });
    });
  });

  describe("ApiError", () => {
    it("正确构造错误对象", () => {
      const error = new ApiError("TEST_ERROR", "测试错误", { detail: "info" });

      expect(error.name).toBe("ApiError");
      expect(error.code).toBe("TEST_ERROR");
      expect(error.message).toBe("测试错误");
      expect(error.details).toEqual({ detail: "info" });
    });
  });
});
