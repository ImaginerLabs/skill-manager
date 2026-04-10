import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getDefaultScanPath,
  scanDirectory,
} from "../../../../server/services/scanService";

// Mock fs-extra
vi.mock("fs-extra", () => ({
  default: {
    pathExists: vi.fn(),
    access: vi.fn(),
    stat: vi.fn(),
    readdir: vi.fn(),
    readFile: vi.fn(),
    constants: { R_OK: 4 },
  },
}));

// Mock frontmatterParser
vi.mock("../../../../server/utils/frontmatterParser", () => ({
  parseFrontmatter: vi.fn(),
}));

import { parseFrontmatter } from "../../../../server/utils/frontmatterParser";

describe("scanService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getDefaultScanPath", () => {
    it("返回 ~/.codebuddy/skills 的绝对路径", () => {
      const result = getDefaultScanPath();
      const expected = path.join(os.homedir(), ".codebuddy", "skills");
      // 归一化后比较（POSIX 风格）
      expect(result).toContain(".codebuddy");
      expect(result).toContain("skills");
      expect(result).toBe(expected.replace(/\\/g, "/"));
    });
  });

  describe("scanDirectory", () => {
    it("路径不存在时抛出 SCAN_PATH_NOT_FOUND", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false as never);

      await expect(scanDirectory("/nonexistent/path")).rejects.toMatchObject({
        code: "SCAN_PATH_NOT_FOUND",
      });
    });

    it("权限被拒时抛出 SCAN_PERMISSION_DENIED", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.access).mockRejectedValue(new Error("EACCES") as never);

      await expect(scanDirectory("/restricted/path")).rejects.toMatchObject({
        code: "SCAN_PERMISSION_DENIED",
      });
    });

    it("非目录路径抛出 SCAN_PATH_NOT_FOUND", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.access).mockResolvedValue(undefined as never);
      vi.mocked(fs.stat).mockResolvedValue({
        isDirectory: () => false,
      } as fs.Stats);

      await expect(scanDirectory("/some/file.txt")).rejects.toMatchObject({
        code: "SCAN_PATH_NOT_FOUND",
      });
    });

    it("空目录返回空数组", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.access).mockResolvedValue(undefined as never);
      vi.mocked(fs.stat).mockResolvedValue({
        isDirectory: () => true,
      } as fs.Stats);
      vi.mocked(fs.readdir).mockResolvedValue([] as never);

      const result = await scanDirectory("/empty/dir");

      expect(result.items).toHaveLength(0);
      expect(result.totalFiles).toBe(0);
    });

    it("成功扫描并解析 .md 文件", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.access).mockResolvedValue(undefined as never);

      // 第一次 stat 调用（目录检查）
      vi.mocked(fs.stat)
        .mockResolvedValueOnce({
          isDirectory: () => true,
        } as fs.Stats)
        // 第二次 stat 调用（文件 stat）
        .mockResolvedValueOnce({
          size: 1024,
          mtime: new Date("2026-01-01T00:00:00Z"),
        } as fs.Stats);

      vi.mocked(fs.readdir).mockResolvedValue([
        { name: "test-skill.md", isFile: () => true, isDirectory: () => false },
      ] as never);

      vi.mocked(parseFrontmatter).mockResolvedValue({
        success: true,
        meta: {
          id: "test-skill",
          name: "Test Skill",
          description: "A test skill",
          category: "coding",
          tags: [],
          filePath: "test-skill.md",
          fileSize: 1024,
          lastModified: "2026-01-01T00:00:00.000Z",
        },
        content: "# Test",
        rawContent: "---\nname: Test Skill\n---\n# Test",
      });

      const result = await scanDirectory("/scan/dir");

      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe("Test Skill");
      expect(result.items[0].parseStatus).toBe("ok");
      expect(result.totalFiles).toBe(1);
    });

    it("解析失败的文件标记为 failed 但仍返回", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.access).mockResolvedValue(undefined as never);

      vi.mocked(fs.stat)
        .mockResolvedValueOnce({
          isDirectory: () => true,
        } as fs.Stats)
        .mockResolvedValueOnce({
          size: 512,
          mtime: new Date("2026-01-01T00:00:00Z"),
        } as fs.Stats);

      vi.mocked(fs.readdir).mockResolvedValue([
        { name: "bad-file.md", isFile: () => true, isDirectory: () => false },
      ] as never);

      vi.mocked(parseFrontmatter).mockResolvedValue({
        success: false,
        filePath: "bad-file.md",
        error: "YAML 语法错误",
      });

      const result = await scanDirectory("/scan/dir");

      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe("bad-file");
      expect(result.items[0].parseStatus).toBe("failed");
      expect(result.items[0].parseError).toBe("YAML 语法错误");
    });

    it("正确处理中文文件名", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.access).mockResolvedValue(undefined as never);

      vi.mocked(fs.stat)
        .mockResolvedValueOnce({
          isDirectory: () => true,
        } as fs.Stats)
        .mockResolvedValueOnce({
          size: 256,
          mtime: new Date("2026-01-01T00:00:00Z"),
        } as fs.Stats);

      vi.mocked(fs.readdir).mockResolvedValue([
        {
          name: "代码审查工具.md",
          isFile: () => true,
          isDirectory: () => false,
        },
      ] as never);

      vi.mocked(parseFrontmatter).mockResolvedValue({
        success: true,
        meta: {
          id: "代码审查工具",
          name: "代码审查工具",
          description: "用于代码审查的 Skill",
          category: "coding",
          tags: [],
          filePath: "代码审查工具.md",
          fileSize: 256,
          lastModified: "2026-01-01T00:00:00.000Z",
        },
        content: "# 代码审查",
        rawContent: "---\nname: 代码审查工具\n---\n# 代码审查",
      });

      const result = await scanDirectory("/scan/dir");

      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe("代码审查工具");
    });

    it("无参数时使用默认路径", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false as never);

      await expect(scanDirectory()).rejects.toMatchObject({
        code: "SCAN_PATH_NOT_FOUND",
      });

      // 验证使用了默认路径
      expect(fs.pathExists).toHaveBeenCalledWith(
        expect.stringContaining(".codebuddy"),
      );
    });
  });
});
