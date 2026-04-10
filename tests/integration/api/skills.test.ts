/**
 * API 集成测试
 * 使用 Supertest 测试 Express API 端点
 * Mock 服务层，专注验证 HTTP 层（路由、中间件、请求/响应格式）
 */

import type { Express } from "express";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Mock skillService — 在 createApp 导入之前
vi.mock("../../../server/services/skillService", () => ({
  getAllSkills: vi.fn(),
  getSkillMeta: vi.fn(),
  getSkillFull: vi.fn(),
  getParseErrors: vi.fn(),
  refreshSkillCache: vi.fn(),
  initializeSkillCache: vi.fn(),
  deleteSkill: vi.fn(),
  updateSkillMeta: vi.fn(),
  moveSkillToCategory: vi.fn(),
  getSkillsRoot: vi.fn().mockReturnValue("/mock/skills"),
}));

// Mock categoryService
vi.mock("../../../server/services/categoryService", () => ({
  getCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

// Mock configService
vi.mock("../../../server/services/configService", () => ({
  loadConfig: vi.fn(),
  loadSettings: vi.fn(),
  loadCategories: vi.fn(),
}));

import { createApp } from "../../../server/app";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../../../server/services/categoryService";
import {
  loadConfig,
  loadCategories as loadConfigCategories,
} from "../../../server/services/configService";
import {
  deleteSkill,
  getAllSkills,
  getParseErrors,
  getSkillFull,
  moveSkillToCategory,
  refreshSkillCache,
  updateSkillMeta,
} from "../../../server/services/skillService";
import { AppError } from "../../../server/types/errors";

// ---- Mock 数据 ----

const mockSkills = [
  {
    id: "react-extract",
    name: "React 组件抽取",
    description: "从代码中抽取可复用的 React 组件",
    category: "coding",
    tags: ["react", "refactor"],
    filePath: "coding/react-extract.md",
    fileSize: 1024,
    lastModified: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "code-review",
    name: "代码审查",
    description: "自动化代码审查工作流",
    category: "workflow",
    tags: ["review"],
    type: "workflow" as const,
    filePath: "workflow/code-review.md",
    fileSize: 2048,
    lastModified: "2024-01-02T00:00:00.000Z",
  },
];

const mockSkillFull = {
  ...mockSkills[0],
  content: "# React 组件抽取\n\n从代码中抽取可复用的 React 组件",
  rawContent:
    "---\nname: React 组件抽取\ncategory: coding\n---\n\n# React 组件抽取\n\n从代码中抽取可复用的 React 组件",
};

const mockCategories = [
  {
    name: "coding",
    displayName: "编程开发",
    description: "编程相关",
    skillCount: 1,
  },
  { name: "workflow", displayName: "工作流", skillCount: 1 },
];

// ---- 测试 ----

let app: Express;

beforeAll(() => {
  app = createApp({ isProduction: false, distPath: "/mock/dist" });
});

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================
// Health API
// ============================================================

describe("Health API", () => {
  describe("GET /api/health", () => {
    it("返回健康状态", async () => {
      const res = await request(app).get("/api/health");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("ok");
      expect(res.body.data).toHaveProperty("version");
      expect(res.body.data).toHaveProperty("timestamp");
    });
  });
});

// ============================================================
// Skill API
// ============================================================

describe("Skill API", () => {
  describe("GET /api/skills", () => {
    it("返回 Skill 列表", async () => {
      vi.mocked(getAllSkills).mockReturnValue(mockSkills as any);

      const res = await request(app).get("/api/skills");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].id).toBe("react-extract");
    });

    it("返回空列表", async () => {
      vi.mocked(getAllSkills).mockReturnValue([]);

      const res = await request(app).get("/api/skills");

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it("服务层抛出错误时返回 500", async () => {
      vi.mocked(getAllSkills).mockImplementation(() => {
        throw new Error("内部错误");
      });

      const res = await request(app).get("/api/skills");

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("INTERNAL_ERROR");
    });
  });

  describe("GET /api/skills/errors", () => {
    it("返回解析错误列表", async () => {
      vi.mocked(getParseErrors).mockReturnValue([
        { filePath: "bad.md", error: "YAML 语法错误" },
      ]);

      const res = await request(app).get("/api/skills/errors");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].filePath).toBe("bad.md");
    });
  });

  describe("GET /api/skills/:id", () => {
    it("返回单个 Skill 完整内容", async () => {
      vi.mocked(getSkillFull).mockResolvedValue(mockSkillFull as any);

      const res = await request(app).get("/api/skills/react-extract");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe("react-extract");
      expect(res.body.data).toHaveProperty("content");
      expect(res.body.data).toHaveProperty("rawContent");
    });

    it("Skill 不存在时返回 404", async () => {
      vi.mocked(getSkillFull).mockRejectedValue(
        AppError.skillNotFound("nonexistent"),
      );

      const res = await request(app).get("/api/skills/nonexistent");

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("SKILL_NOT_FOUND");
    });
  });

  describe("POST /api/refresh", () => {
    it("触发刷新并返回统计", async () => {
      vi.mocked(refreshSkillCache).mockResolvedValue({
        total: 10,
        success: 9,
        errors: 1,
      });

      const res = await request(app).post("/api/refresh");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBe(10);
      expect(res.body.data.success).toBe(9);
      expect(res.body.data.errors).toBe(1);
    });
  });

  describe("PUT /api/skills/:id/meta", () => {
    it("成功更新 Skill 元数据", async () => {
      const updatedSkill = {
        ...mockSkills[0],
        name: "新名称",
        description: "新描述",
      };
      vi.mocked(updateSkillMeta).mockResolvedValue(updatedSkill as any);

      const res = await request(app)
        .put("/api/skills/react-extract/meta")
        .send({ name: "新名称", description: "新描述" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("新名称");
    });

    it("空请求体返回 400 校验错误", async () => {
      // 空对象是合法的（所有字段都是 optional），但如果 name 为空字符串则不合法
      const res = await request(app)
        .put("/api/skills/react-extract/meta")
        .send({ name: "" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("Skill 不存在时返回 404", async () => {
      vi.mocked(updateSkillMeta).mockRejectedValue(
        AppError.skillNotFound("nonexistent"),
      );

      const res = await request(app)
        .put("/api/skills/nonexistent/meta")
        .send({ name: "新名称" });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("SKILL_NOT_FOUND");
    });
  });

  describe("PUT /api/skills/:id/category", () => {
    it("成功移动 Skill 到其他分类", async () => {
      const movedSkill = { ...mockSkills[0], category: "devops" };
      vi.mocked(moveSkillToCategory).mockResolvedValue(movedSkill as any);

      const res = await request(app)
        .put("/api/skills/react-extract/category")
        .send({ category: "devops" });

      expect(res.status).toBe(200);
      expect(res.body.data.category).toBe("devops");
    });

    it("缺少 category 字段返回 400", async () => {
      const res = await request(app)
        .put("/api/skills/react-extract/category")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("DELETE /api/skills/:id", () => {
    it("成功删除 Skill", async () => {
      vi.mocked(deleteSkill).mockResolvedValue(undefined);

      const res = await request(app).delete("/api/skills/react-extract");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("Skill 不存在时返回 404", async () => {
      vi.mocked(deleteSkill).mockRejectedValue(
        AppError.skillNotFound("nonexistent"),
      );

      const res = await request(app).delete("/api/skills/nonexistent");

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("SKILL_NOT_FOUND");
    });
  });
});

// ============================================================
// Category API
// ============================================================

describe("Category API", () => {
  describe("GET /api/categories", () => {
    it("返回分类列表", async () => {
      // 注意：GET /api/categories 由 configRoutes 先匹配，调用 configService.loadCategories
      vi.mocked(loadConfigCategories).mockResolvedValue(mockCategories);

      const res = await request(app).get("/api/categories");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe("POST /api/categories", () => {
    it("成功创建新分类", async () => {
      const newCategory = {
        name: "testing",
        displayName: "测试",
        description: "测试相关",
        skillCount: 0,
      };
      vi.mocked(createCategory).mockResolvedValue(newCategory);

      const res = await request(app).post("/api/categories").send({
        name: "testing",
        displayName: "测试",
        description: "测试相关",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("testing");
    });

    it("缺少必填字段返回 400", async () => {
      const res = await request(app)
        .post("/api/categories")
        .send({ name: "testing" }); // 缺少 displayName

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("分类已存在时返回 409", async () => {
      vi.mocked(createCategory).mockRejectedValue(
        new AppError("CATEGORY_EXISTS", '分类 "coding" 已存在', 409),
      );

      const res = await request(app)
        .post("/api/categories")
        .send({ name: "coding", displayName: "编程" });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("CATEGORY_EXISTS");
    });
  });

  describe("PUT /api/categories/:name", () => {
    it("成功更新分类", async () => {
      const updated = { ...mockCategories[0], displayName: "新编程开发" };
      vi.mocked(updateCategory).mockResolvedValue(updated);

      const res = await request(app)
        .put("/api/categories/coding")
        .send({ displayName: "新编程开发" });

      expect(res.status).toBe(200);
      expect(res.body.data.displayName).toBe("新编程开发");
    });

    it("分类不存在时返回 404", async () => {
      vi.mocked(updateCategory).mockRejectedValue(
        AppError.notFound('分类 "nonexistent" 未找到'),
      );

      const res = await request(app)
        .put("/api/categories/nonexistent")
        .send({ displayName: "新名称" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/categories/:name", () => {
    it("成功删除空分类", async () => {
      vi.mocked(deleteCategory).mockResolvedValue(undefined);

      const res = await request(app).delete("/api/categories/empty");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("非空分类返回 409", async () => {
      vi.mocked(deleteCategory).mockRejectedValue(
        new AppError(
          "CATEGORY_NOT_EMPTY",
          '分类 "coding" 下还有 5 个 Skill',
          409,
        ),
      );

      const res = await request(app).delete("/api/categories/coding");

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("CATEGORY_NOT_EMPTY");
    });
  });
});

// ============================================================
// Config API
// ============================================================

describe("Config API", () => {
  describe("GET /api/config", () => {
    it("返回完整应用配置", async () => {
      vi.mocked(loadConfig).mockResolvedValue({
        version: "0.1.0",
        sync: { targets: [] },
        categories: mockCategories,
        ui: { defaultView: "grid", sidebarWidth: 240 },
      });

      const res = await request(app).get("/api/config");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.version).toBe("0.1.0");
      expect(res.body.data.categories).toHaveLength(2);
    });
  });
});

// ============================================================
// 404 处理
// ============================================================

describe("API 404 处理", () => {
  it("未匹配的 API 路由返回 404", async () => {
    const res = await request(app).get("/api/nonexistent-endpoint");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("POST 到不存在的端点返回 404", async () => {
    const res = await request(app).post("/api/nonexistent");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ============================================================
// 错误处理中间件
// ============================================================

describe("错误处理中间件", () => {
  it("AppError 返回对应的 statusCode 和 code", async () => {
    vi.mocked(getAllSkills).mockImplementation(() => {
      throw AppError.skillNotFound("test");
    });

    const res = await request(app).get("/api/skills");

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("SKILL_NOT_FOUND");
    expect(res.body.error.message).toContain("test");
  });

  it("未知错误返回 500 + INTERNAL_ERROR", async () => {
    vi.mocked(getAllSkills).mockImplementation(() => {
      throw new TypeError("unexpected error");
    });

    const res = await request(app).get("/api/skills");

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("INTERNAL_ERROR");
  });
});
