import fs from "fs-extra";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { importFiles } from "../../../../server/services/importService";

// Mock fs-extra
vi.mock("fs-extra", () => ({
  default: {
    readFile: vi.fn(),
    ensureDir: vi.fn(),
    writeFile: vi.fn(),
    rename: vi.fn(),
    remove: vi.fn(),
  },
}));

// Mock skillService
vi.mock("../../../../server/services/skillService", () => ({
  refreshSkillCache: vi
    .fn()
    .mockResolvedValue({ total: 0, success: 0, errors: 0 }),
}));

describe("importService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("importFiles", () => {
    it("成功导入单个文件", async () => {
      vi.mocked(fs.readFile).mockResolvedValue(
        "---\nname: Test Skill\ndescription: A test\n---\n# Content" as never,
      );
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined as never);
      vi.mocked(fs.rename).mockResolvedValue(undefined as never);

      const result = await importFiles({
        items: [{ absolutePath: "/source/test.md", name: "Test Skill" }],
        category: "coding",
      });

      expect(result.total).toBe(1);
      expect(result.success).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.details[0].status).toBe("success");
    });

    it("补充缺失的 category 字段", async () => {
      vi.mocked(fs.readFile).mockResolvedValue(
        "---\nname: Test\n---\n# Content" as never,
      );
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.writeFile).mockImplementation(async (_path, content) => {
        // 验证写入的内容包含 category
        expect(String(content)).toContain("category: coding");
      });
      vi.mocked(fs.rename).mockResolvedValue(undefined as never);

      await importFiles({
        items: [{ absolutePath: "/source/test.md", name: "Test" }],
        category: "coding",
      });

      expect(fs.writeFile).toHaveBeenCalled();
    });

    it("补充缺失的 name 字段（使用文件名）", async () => {
      vi.mocked(fs.readFile).mockResolvedValue(
        "---\ndescription: desc\n---\n# Content" as never,
      );
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.writeFile).mockImplementation(async (_path, content) => {
        expect(String(content)).toContain("name: my-skill");
      });
      vi.mocked(fs.rename).mockResolvedValue(undefined as never);

      await importFiles({
        items: [{ absolutePath: "/source/my-skill.md", name: "my-skill" }],
        category: "coding",
      });
    });

    it("部分文件导入失败时返回混合结果", async () => {
      vi.mocked(fs.readFile)
        .mockResolvedValueOnce("---\nname: Good\n---\n# OK" as never)
        .mockRejectedValueOnce(new Error("ENOENT: 文件不存在"));
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined as never);
      vi.mocked(fs.rename).mockResolvedValue(undefined as never);

      const result = await importFiles({
        items: [
          { absolutePath: "/source/good.md", name: "Good" },
          { absolutePath: "/source/missing.md", name: "Missing" },
        ],
        category: "coding",
      });

      expect(result.total).toBe(2);
      expect(result.success).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.details[1].status).toBe("failed");
      expect(result.details[1].error).toContain("ENOENT");
    });

    it("Frontmatter 解析失败时仍能导入", async () => {
      vi.mocked(fs.readFile).mockResolvedValue(
        "这不是有效的 Frontmatter\n# 但仍然是内容" as never,
      );
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined as never);
      vi.mocked(fs.rename).mockResolvedValue(undefined as never);

      const result = await importFiles({
        items: [{ absolutePath: "/source/bad-fm.md", name: "Bad FM" }],
        category: "coding",
      });

      expect(result.success).toBe(1);
    });

    it("导入完成后刷新缓存", async () => {
      const { refreshSkillCache } =
        await import("../../../../server/services/skillService");
      vi.mocked(fs.readFile).mockResolvedValue("---\nname: T\n---\n" as never);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined as never);
      vi.mocked(fs.rename).mockResolvedValue(undefined as never);

      await importFiles({
        items: [{ absolutePath: "/source/t.md", name: "T" }],
        category: "coding",
      });

      expect(refreshSkillCache).toHaveBeenCalled();
    });
  });
});
