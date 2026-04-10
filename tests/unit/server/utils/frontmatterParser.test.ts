import { describe, expect, it } from "vitest";
import { parseRawFrontmatter } from "../../../../server/utils/frontmatterParser";

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
});
