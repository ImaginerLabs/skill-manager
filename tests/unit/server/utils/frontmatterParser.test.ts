import fs from "fs-extra";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  parseFrontmatter,
  parseRawFrontmatter,
} from "../../../../server/utils/frontmatterParser";

// 辅助函数：构建标准 Skill 文件内容
function buildSkillContent(
  frontmatter: Record<string, unknown>,
  body = "# Skill Content",
): string {
  const lines = Object.entries(frontmatter).map(([key, value]) => {
    if (Array.isArray(value)) {
      return `${key}:\n${value.map((v) => `  - ${v}`).join("\n")}`;
    }
    return `${key}: ${value}`;
  });
  return `---\n${lines.join("\n")}\n---\n\n${body}`;
}

describe("frontmatterParser", () => {
  describe("parseRawFrontmatter", () => {
    it("成功解析完整的 Frontmatter", () => {
      const content = buildSkillContent({
        name: "React 组件抽取",
        description: "从代码中抽取可复用的 React 组件",
        category: "coding",
        tags: ["react", "refactor"],
      });

      const result = parseRawFrontmatter(content, "coding/react-extract.md");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.meta.name).toBe("React 组件抽取");
        expect(result.meta.description).toBe("从代码中抽取可复用的 React 组件");
        expect(result.meta.category).toBe("coding");
        expect(result.meta.tags).toEqual(["react", "refactor"]);
        expect(result.meta.id).toBe("react-extract");
        expect(result.meta.filePath).toBe("coding/react-extract.md");
        expect(result.content).toContain("# Skill Content");
      }
    });

    it("解析工作流类型 Skill", () => {
      const content = buildSkillContent({
        name: "代码审查工作流",
        description: "自动化代码审查",
        category: "workflows",
        type: "workflow",
      });

      const result = parseRawFrontmatter(content, "workflows/code-review.md");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.meta.type).toBe("workflow");
      }
    });

    it("缺少 name 时使用空字符串", () => {
      const content = buildSkillContent({
        description: "描述",
        category: "coding",
      });

      const result = parseRawFrontmatter(content, "coding/test.md");

      // name 为空字符串，Zod 校验要求 min(1)，应该失败
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("name");
      }
    });

    it("缺少 category 时校验失败", () => {
      const content = buildSkillContent({
        name: "Test Skill",
        description: "描述",
      });

      const result = parseRawFrontmatter(content, "test.md");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("category");
      }
    });

    it("YAML 语法错误时返回失败", () => {
      const content = "---\ninvalid: yaml: [broken\n---\n\n# Content";

      const result = parseRawFrontmatter(content, "bad.md");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("YAML Frontmatter 语法错误");
      }
    });

    it("无 Frontmatter 的文件", () => {
      const content = "# Just Markdown\n\nNo frontmatter here.";

      const result = parseRawFrontmatter(content, "no-fm.md");

      // gray-matter 会返回空 data，name 和 category 为空，校验失败
      expect(result.success).toBe(false);
    });

    it("tags 不是数组时使用空数组", () => {
      const content = buildSkillContent({
        name: "Test",
        description: "描述",
        category: "coding",
        tags: "not-an-array",
      });

      const result = parseRawFrontmatter(content, "coding/test.md");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.meta.tags).toEqual([]);
      }
    });

    it("可选字段 author 和 version 正确解析", () => {
      const content = buildSkillContent({
        name: "Test",
        description: "描述",
        category: "coding",
        author: "Alex",
        version: "1.0.0",
      });

      const result = parseRawFrontmatter(content, "coding/test.md");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.meta.author).toBe("Alex");
        expect(result.meta.version).toBe("1.0.0");
      }
    });

    it("自定义 fileSize 和 lastModified", () => {
      const content = buildSkillContent({
        name: "Test",
        description: "描述",
        category: "coding",
      });

      const result = parseRawFrontmatter(
        content,
        "coding/test.md",
        2048,
        "2024-06-01T00:00:00.000Z",
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.meta.fileSize).toBe(2048);
        expect(result.meta.lastModified).toBe("2024-06-01T00:00:00.000Z");
      }
    });

    it("Windows 路径归一化", () => {
      const content = buildSkillContent({
        name: "Test",
        description: "描述",
        category: "coding",
      });

      const result = parseRawFrontmatter(content, "coding\\test.md");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.meta.filePath).toBe("coding/test.md");
      }
    });
  });

  describe("parseFrontmatter（读文件版）", () => {
    beforeEach(() => {
      vi.spyOn(fs, "readFile");
      vi.spyOn(fs, "stat");
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("文件读取失败时返回失败结果", async () => {
      vi.mocked(fs.readFile).mockRejectedValue(
        new Error("ENOENT: no such file or directory"),
      );

      const result = await parseFrontmatter(
        "/fake/path/skill.md",
        "/fake/skills",
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("文件读取失败");
        expect(result.error).toContain("ENOENT");
        expect(result.filePath).toBeTruthy();
      }
    });

    it("文件读取失败（非 Error 对象）时返回失败结果", async () => {
      vi.mocked(fs.readFile).mockRejectedValue("权限拒绝");

      const result = await parseFrontmatter(
        "/fake/path/skill.md",
        "/fake/skills",
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("文件读取失败");
        expect(result.error).toContain("权限拒绝");
      }
    });

    it("成功读取文件并解析 Frontmatter", async () => {
      const rawContent = `---
name: 测试 Skill
description: 测试描述
category: coding
tags:
  - test
---

# 内容`;

      vi.mocked(fs.readFile).mockResolvedValue(rawContent as never);
      vi.mocked(fs.stat).mockResolvedValue({
        size: Buffer.byteLength(rawContent, "utf-8"),
        mtime: new Date("2024-06-01T00:00:00.000Z"),
      } as fs.Stats);

      const result = await parseFrontmatter(
        "/fake/skills/coding/test-skill.md",
        "/fake/skills",
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.meta.name).toBe("测试 Skill");
        expect(result.meta.category).toBe("coding");
        expect(result.meta.tags).toEqual(["test"]);
        expect(result.meta.lastModified).toBe("2024-06-01T00:00:00.000Z");
      }
    });

    it("文件内容 Frontmatter 校验失败时返回失败结果", async () => {
      const rawContent = `---
description: 缺少 name 和 category
---

# 内容`;

      vi.mocked(fs.readFile).mockResolvedValue(rawContent as never);
      vi.mocked(fs.stat).mockResolvedValue({
        size: 100,
        mtime: new Date(),
      } as fs.Stats);

      const result = await parseFrontmatter(
        "/fake/skills/coding/bad.md",
        "/fake/skills",
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Frontmatter 校验失败");
      }
    });
  });

  describe("外部 Skill 字段解析", () => {
    it("Frontmatter 含 source 字段时正确解析", () => {
      const content = buildSkillContent({
        name: "PDF 处理",
        description: "处理 PDF 文件",
        category: "document-processing",
        source: "anthropic-official",
      });

      const result = parseRawFrontmatter(content, "document-processing/pdf.md");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.meta.source).toBe("anthropic-official");
      }
    });

    it("Frontmatter 含 sourceUrl 字段时正确解析", () => {
      const content = buildSkillContent({
        name: "PDF 处理",
        description: "处理 PDF 文件",
        category: "document-processing",
        sourceUrl:
          "https://github.com/anthropics/skills/tree/main/pdf/SKILL.md",
      });

      const result = parseRawFrontmatter(content, "document-processing/pdf.md");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.meta.sourceUrl).toBe(
          "https://github.com/anthropics/skills/tree/main/pdf/SKILL.md",
        );
      }
    });

    it("Frontmatter 含 sourceRepo 字段时正确解析", () => {
      const content = buildSkillContent({
        name: "PDF 处理",
        description: "处理 PDF 文件",
        category: "document-processing",
        sourceRepo: "https://github.com/anthropics/skills",
      });

      const result = parseRawFrontmatter(content, "document-processing/pdf.md");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.meta.sourceRepo).toBe(
          "https://github.com/anthropics/skills",
        );
      }
    });

    it("Frontmatter 含 readonly: true 时，meta.readonly === true", () => {
      const content = buildSkillContent({
        name: "PDF 处理",
        description: "处理 PDF 文件",
        category: "document-processing",
        readonly: true,
      });

      const result = parseRawFrontmatter(content, "document-processing/pdf.md");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.meta.readonly).toBe(true);
      }
    });

    it("Frontmatter 含 readonly: false 时，meta.readonly === undefined（严格 === true 检查）", () => {
      const content = buildSkillContent({
        name: "PDF 处理",
        description: "处理 PDF 文件",
        category: "document-processing",
        readonly: false,
      });

      const result = parseRawFrontmatter(content, "document-processing/pdf.md");

      expect(result.success).toBe(true);
      if (result.success) {
        // readonly: false 不等于 true，所以返回 undefined
        expect(result.meta.readonly).toBeUndefined();
      }
    });

    it("Frontmatter 不含外部字段时，所有新字段均为 undefined，解析不报错", () => {
      const content = buildSkillContent({
        name: "普通 Skill",
        description: "本地 Skill",
        category: "coding",
      });

      const result = parseRawFrontmatter(content, "coding/normal.md");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.meta.source).toBeUndefined();
        expect(result.meta.sourceUrl).toBeUndefined();
        expect(result.meta.sourceRepo).toBeUndefined();
        expect(result.meta.readonly).toBeUndefined();
      }
    });

    it("包含所有外部字段的完整外部 Skill 正确解析", () => {
      const content = buildSkillContent({
        name: "PDF 处理",
        description: "处理 PDF 文件",
        category: "document-processing",
        source: "anthropic-official",
        sourceUrl:
          "https://github.com/anthropics/skills/tree/main/pdf/SKILL.md",
        sourceRepo: "https://github.com/anthropics/skills",
        readonly: true,
      });

      const result = parseRawFrontmatter(content, "document-processing/pdf.md");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.meta.source).toBe("anthropic-official");
        expect(result.meta.sourceUrl).toBe(
          "https://github.com/anthropics/skills/tree/main/pdf/SKILL.md",
        );
        expect(result.meta.sourceRepo).toBe(
          "https://github.com/anthropics/skills",
        );
        expect(result.meta.readonly).toBe(true);
      }
    });
  });
});
