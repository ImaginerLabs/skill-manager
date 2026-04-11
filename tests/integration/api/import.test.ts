/**
 * Import API 集成测试
 * 使用 Supertest 测试 Express Import API 端点
 * Mock 服务层，专注验证 HTTP 层（路由、中间件、请求/响应格式）
 *
 * 覆盖 Epic 2 所有 API 端点：
 * - POST /api/import/scan (Story 2-1)
 * - POST /api/import/execute (Story 2-3)
 * - GET /api/import/detect-codebuddy (Story 2-4)
 * - POST /api/import/cleanup (Story 2-4)
 */

import type { Express } from "express";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Mock scanService — 在 createApp 导入之前
vi.mock("../../../server/services/scanService", () => ({
  scanDirectory: vi.fn(),
  getDefaultScanPath: vi.fn().mockReturnValue("/mock/home/.codebuddy/skills"),
  detectCodeBuddy: vi.fn(),
}));

// Mock importService
vi.mock("../../../server/services/importService", () => ({
  importFiles: vi.fn(),
  cleanupFiles: vi.fn(),
  getSkillsRoot: vi.fn().mockReturnValue("/mock/skills"),
}));

// Mock skillService（createApp 依赖）
vi.mock("../../../server/services/skillService", () => ({
  getAllSkills: vi.fn().mockReturnValue([]),
  getSkillMeta: vi.fn(),
  getSkillFull: vi.fn(),
  getParseErrors: vi.fn().mockReturnValue([]),
  refreshSkillCache: vi.fn(),
  initializeSkillCache: vi.fn(),
  deleteSkill: vi.fn(),
  updateSkillMeta: vi.fn(),
  moveSkillToCategory: vi.fn(),
  getSkillsRoot: vi.fn().mockReturnValue("/mock/skills"),
}));

// Mock categoryService（createApp 依赖）
vi.mock("../../../server/services/categoryService", () => ({
  getCategories: vi.fn().mockReturnValue([]),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

// Mock configService（createApp 依赖）
vi.mock("../../../server/services/configService", () => ({
  loadConfig: vi.fn(),
  loadSettings: vi.fn(),
  loadCategories: vi.fn().mockResolvedValue([]),
}));

import { createApp } from "../../../server/app";
import {
  cleanupFiles,
  importFiles,
} from "../../../server/services/importService";
import {
  detectCodeBuddy,
  scanDirectory,
} from "../../../server/services/scanService";
import { AppError } from "../../../server/types/errors";

// ---- Mock 数据 ----

const mockScanResult = {
  items: [
    {
      id: "react-extract",
      name: "React 组件抽取",
      description: "从代码中抽取可复用的 React 组件",
      filePath: "react-extract.md",
      absolutePath: "/mock/home/.codebuddy/skills/react-extract.md",
      parseStatus: "ok" as const,
      fileSize: 1024,
      lastModified: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "broken-skill",
      name: "broken-skill",
      description: "",
      filePath: "broken-skill.md",
      absolutePath: "/mock/home/.codebuddy/skills/broken-skill.md",
      parseStatus: "failed" as const,
      parseError: "YAML 语法错误",
      fileSize: 512,
      lastModified: "2024-01-02T00:00:00.000Z",
    },
  ],
  scanPath: "/mock/home/.codebuddy/skills",
  totalFiles: 2,
};

const mockImportResult = {
  total: 2,
  success: 1,
  failed: 1,
  details: [
    { name: "react-extract.md", status: "success" as const },
    {
      name: "broken-skill.md",
      status: "failed" as const,
      error: "文件读取失败",
    },
  ],
};

const mockDetectResult = {
  detected: true,
  path: "/mock/home/.codebuddy/skills",
  fileCount: 5,
};

const mockCleanupResult = {
  total: 2,
  success: 2,
  failed: 0,
  errors: [],
};

// ---- 测试 ----

let app: Express;

beforeAll(() => {
  app = createApp({ isProduction: false, distPath: "/mock/dist" });
});

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================
// POST /api/import/scan — 扫描 IDE 目录
// ============================================================

describe("Import Scan API", () => {
  describe("POST /api/import/scan", () => {
    it("无请求体时使用默认路径扫描成功", async () => {
      vi.mocked(scanDirectory).mockResolvedValue(mockScanResult);

      const res = await request(app).post("/api/import/scan").send({});

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(2);
      expect(res.body.data.totalFiles).toBe(2);
      expect(res.body.data.scanPath).toBe("/mock/home/.codebuddy/skills");
      expect(scanDirectory).toHaveBeenCalledWith(undefined);
    });

    it("指定路径扫描成功", async () => {
      vi.mocked(scanDirectory).mockResolvedValue({
        ...mockScanResult,
        scanPath: "/custom/path",
      });

      const res = await request(app)
        .post("/api/import/scan")
        .send({ path: "/custom/path" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(scanDirectory).toHaveBeenCalledWith("/custom/path");
    });

    it("扫描结果包含解析失败的文件", async () => {
      vi.mocked(scanDirectory).mockResolvedValue(mockScanResult);

      const res = await request(app).post("/api/import/scan").send({});

      expect(res.status).toBe(200);
      const failedItem = res.body.data.items.find(
        (i: any) => i.parseStatus === "failed",
      );
      expect(failedItem).toBeDefined();
      expect(failedItem.parseError).toBe("YAML 语法错误");
    });

    it("空目录返回空数组", async () => {
      vi.mocked(scanDirectory).mockResolvedValue({
        items: [],
        scanPath: "/mock/home/.codebuddy/skills",
        totalFiles: 0,
      });

      const res = await request(app).post("/api/import/scan").send({});

      expect(res.status).toBe(200);
      expect(res.body.data.items).toEqual([]);
      expect(res.body.data.totalFiles).toBe(0);
    });

    it("路径不存在时返回 404 + SCAN_PATH_NOT_FOUND", async () => {
      vi.mocked(scanDirectory).mockRejectedValue(
        AppError.scanPathNotFound("/nonexistent/path"),
      );

      const res = await request(app)
        .post("/api/import/scan")
        .send({ path: "/nonexistent/path" });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("SCAN_PATH_NOT_FOUND");
    });

    it("权限被拒时返回 403 + SCAN_PERMISSION_DENIED", async () => {
      vi.mocked(scanDirectory).mockRejectedValue(
        AppError.scanPermissionDenied("/restricted/path"),
      );

      const res = await request(app)
        .post("/api/import/scan")
        .send({ path: "/restricted/path" });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("SCAN_PERMISSION_DENIED");
    });

    it("服务层抛出未知错误时返回 500", async () => {
      vi.mocked(scanDirectory).mockRejectedValue(new Error("意外错误"));

      const res = await request(app).post("/api/import/scan").send({});

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("INTERNAL_ERROR");
    });
  });
});

// ============================================================
// POST /api/import/execute — 执行文件导入
// ============================================================

describe("Import Execute API", () => {
  describe("POST /api/import/execute", () => {
    it("成功导入文件", async () => {
      vi.mocked(importFiles).mockResolvedValue(mockImportResult);

      const res = await request(app)
        .post("/api/import/execute")
        .send({
          items: [
            {
              absolutePath: "/mock/home/.codebuddy/skills/react-extract.md",
              name: "react-extract.md",
            },
            {
              absolutePath: "/mock/home/.codebuddy/skills/broken-skill.md",
              name: "broken-skill.md",
            },
          ],
          category: "coding",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.success).toBe(1);
      expect(res.body.data.failed).toBe(1);
      expect(res.body.data.details).toHaveLength(2);
    });

    it("返回部分失败的详细信息", async () => {
      vi.mocked(importFiles).mockResolvedValue(mockImportResult);

      const res = await request(app)
        .post("/api/import/execute")
        .send({
          items: [
            {
              absolutePath: "/mock/path/a.md",
              name: "a.md",
            },
          ],
          category: "coding",
        });

      expect(res.status).toBe(200);
      const failedDetail = res.body.data.details.find(
        (d: any) => d.status === "failed",
      );
      expect(failedDetail).toBeDefined();
      expect(failedDetail.error).toBe("文件读取失败");
    });

    it("缺少 items 字段返回 400 校验错误", async () => {
      const res = await request(app)
        .post("/api/import/execute")
        .send({ category: "coding" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("items 为空数组返回 400 校验错误", async () => {
      const res = await request(app)
        .post("/api/import/execute")
        .send({ items: [], category: "coding" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("缺少 category 字段返回 400 校验错误", async () => {
      const res = await request(app)
        .post("/api/import/execute")
        .send({
          items: [{ absolutePath: "/mock/path/a.md", name: "a.md" }],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("category 为空字符串返回 400 校验错误", async () => {
      const res = await request(app)
        .post("/api/import/execute")
        .send({
          items: [{ absolutePath: "/mock/path/a.md", name: "a.md" }],
          category: "",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("可选的 scanRoot 参数被传递给服务层", async () => {
      vi.mocked(importFiles).mockResolvedValue({
        total: 1,
        success: 1,
        failed: 0,
        details: [{ name: "a.md", status: "success" }],
      });

      const res = await request(app)
        .post("/api/import/execute")
        .send({
          items: [{ absolutePath: "/custom/root/a.md", name: "a.md" }],
          category: "coding",
          scanRoot: "/custom/root",
        });

      expect(res.status).toBe(200);
      expect(importFiles).toHaveBeenCalledWith(
        expect.objectContaining({ scanRoot: "/custom/root" }),
      );
    });

    it("服务层抛出路径遍历错误时返回 400", async () => {
      vi.mocked(importFiles).mockRejectedValue(
        AppError.pathTraversal("源文件路径超出允许范围"),
      );

      const res = await request(app)
        .post("/api/import/execute")
        .send({
          items: [{ absolutePath: "/etc/passwd", name: "passwd" }],
          category: "coding",
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("PATH_TRAVERSAL");
    });

    it("服务层抛出校验错误时返回 400", async () => {
      vi.mocked(importFiles).mockRejectedValue(
        AppError.validationError("非法分类名"),
      );

      const res = await request(app)
        .post("/api/import/execute")
        .send({
          items: [{ absolutePath: "/mock/path/a.md", name: "a.md" }],
          category: "../evil",
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });
});

// ============================================================
// GET /api/import/detect-codebuddy — 检测 CodeBuddy IDE 目录
// ============================================================

describe("Import Detect CodeBuddy API", () => {
  describe("GET /api/import/detect-codebuddy", () => {
    it("检测到 CodeBuddy 目录存在且有文件", async () => {
      vi.mocked(detectCodeBuddy).mockResolvedValue(mockDetectResult);

      const res = await request(app).get("/api/import/detect-codebuddy");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.detected).toBe(true);
      expect(res.body.data.path).toBe("/mock/home/.codebuddy/skills");
      expect(res.body.data.fileCount).toBe(5);
    });

    it("CodeBuddy 目录不存在", async () => {
      vi.mocked(detectCodeBuddy).mockResolvedValue({
        detected: false,
        path: "/mock/home/.codebuddy/skills",
        fileCount: 0,
      });

      const res = await request(app).get("/api/import/detect-codebuddy");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.detected).toBe(false);
      expect(res.body.data.fileCount).toBe(0);
    });

    it("CodeBuddy 目录存在但为空", async () => {
      vi.mocked(detectCodeBuddy).mockResolvedValue({
        detected: false,
        path: "/mock/home/.codebuddy/skills",
        fileCount: 0,
      });

      const res = await request(app).get("/api/import/detect-codebuddy");

      expect(res.status).toBe(200);
      expect(res.body.data.detected).toBe(false);
    });

    it("服务层抛出错误时返回 500", async () => {
      vi.mocked(detectCodeBuddy).mockRejectedValue(new Error("检测失败"));

      const res = await request(app).get("/api/import/detect-codebuddy");

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("INTERNAL_ERROR");
    });
  });
});

// ============================================================
// POST /api/import/cleanup — 清理源文件
// ============================================================

describe("Import Cleanup API", () => {
  describe("POST /api/import/cleanup", () => {
    it("成功清理文件", async () => {
      vi.mocked(cleanupFiles).mockResolvedValue(mockCleanupResult);

      const res = await request(app)
        .post("/api/import/cleanup")
        .send({
          filePaths: [
            "/mock/home/.codebuddy/skills/react-extract.md",
            "/mock/home/.codebuddy/skills/broken-skill.md",
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.success).toBe(2);
      expect(res.body.data.failed).toBe(0);
    });

    it("部分文件清理失败", async () => {
      vi.mocked(cleanupFiles).mockResolvedValue({
        total: 2,
        success: 1,
        failed: 1,
        errors: ["broken-skill.md: 文件不存在"],
      });

      const res = await request(app)
        .post("/api/import/cleanup")
        .send({
          filePaths: ["/mock/path/a.md", "/mock/path/b.md"],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.failed).toBe(1);
      expect(res.body.data.errors).toHaveLength(1);
    });

    it("缺少 filePaths 字段返回 400", async () => {
      const res = await request(app).post("/api/import/cleanup").send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("filePaths 为空数组返回 400", async () => {
      const res = await request(app)
        .post("/api/import/cleanup")
        .send({ filePaths: [] });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("filePaths 不是数组返回 400", async () => {
      const res = await request(app)
        .post("/api/import/cleanup")
        .send({ filePaths: "not-an-array" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("路径遍历攻击被拒绝返回 400", async () => {
      vi.mocked(cleanupFiles).mockRejectedValue(
        AppError.pathTraversal("路径超出允许范围，拒绝删除"),
      );

      const res = await request(app)
        .post("/api/import/cleanup")
        .send({ filePaths: ["/etc/passwd"] });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("PATH_TRAVERSAL");
    });

    it("服务层抛出未知错误时返回 500", async () => {
      vi.mocked(cleanupFiles).mockRejectedValue(new Error("磁盘错误"));

      const res = await request(app)
        .post("/api/import/cleanup")
        .send({ filePaths: ["/mock/path/a.md"] });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("INTERNAL_ERROR");
    });
  });
});
