import { describe, expect, it } from "vitest";
import {
  ExternalRepositorySchema,
  RepoSkillMappingSchema,
  RepositoriesConfigSchema,
  SkillMetaSchema,
} from "../../../shared/schemas";

// 辅助：构建合法的 SkillMeta 基础数据
function buildValidSkillMeta(overrides: Record<string, unknown> = {}) {
  return {
    id: "test-skill",
    name: "测试 Skill",
    description: "测试描述",
    category: "coding",
    tags: [],
    filePath: "coding/test-skill.md",
    fileSize: 1024,
    lastModified: "2024-06-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("SkillMetaSchema — 外部 Skill 字段扩展", () => {
  describe("向后兼容性", () => {
    it("现有 Skill 数据（无外部字段）仍通过校验", () => {
      const result = SkillMetaSchema.safeParse(buildValidSkillMeta());
      expect(result.success).toBe(true);
    });

    it("所有新字段缺失时，解析结果中新字段均为 undefined", () => {
      const result = SkillMetaSchema.safeParse(buildValidSkillMeta());
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.source).toBeUndefined();
        expect(result.data.sourceUrl).toBeUndefined();
        expect(result.data.sourceRepo).toBeUndefined();
        expect(result.data.readonly).toBeUndefined();
      }
    });
  });

  describe("source 字段", () => {
    it("合法 source 字符串通过校验", () => {
      const result = SkillMetaSchema.safeParse(
        buildValidSkillMeta({ source: "anthropic-official" }),
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.source).toBe("anthropic-official");
      }
    });

    it("source 缺失时通过校验（可选字段）", () => {
      const result = SkillMetaSchema.safeParse(buildValidSkillMeta());
      expect(result.success).toBe(true);
    });
  });

  describe("sourceUrl 字段", () => {
    it("合法 GitHub URL 通过校验", () => {
      const result = SkillMetaSchema.safeParse(
        buildValidSkillMeta({
          sourceUrl:
            "https://github.com/anthropics/skills/tree/main/pdf/SKILL.md",
        }),
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sourceUrl).toBe(
          "https://github.com/anthropics/skills/tree/main/pdf/SKILL.md",
        );
      }
    });

    it("合法非 GitHub URL 也通过校验（sourceUrl 只要求合法 URL）", () => {
      const result = SkillMetaSchema.safeParse(
        buildValidSkillMeta({ sourceUrl: "https://example.com/skill" }),
      );
      expect(result.success).toBe(true);
    });

    it("非法 URL 字符串校验失败", () => {
      const result = SkillMetaSchema.safeParse(
        buildValidSkillMeta({ sourceUrl: "not-a-url" }),
      );
      expect(result.success).toBe(false);
    });

    it("空字符串 sourceUrl 校验失败（不是合法 URL）", () => {
      const result = SkillMetaSchema.safeParse(
        buildValidSkillMeta({ sourceUrl: "" }),
      );
      expect(result.success).toBe(false);
    });

    it("sourceUrl 缺失时通过校验（可选字段）", () => {
      const result = SkillMetaSchema.safeParse(buildValidSkillMeta());
      expect(result.success).toBe(true);
    });
  });

  describe("sourceRepo 字段", () => {
    it("合法 GitHub 仓库 URL 通过校验", () => {
      const result = SkillMetaSchema.safeParse(
        buildValidSkillMeta({
          sourceRepo: "https://github.com/anthropics/skills",
        }),
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sourceRepo).toBe(
          "https://github.com/anthropics/skills",
        );
      }
    });

    it("非法 URL 字符串校验失败", () => {
      const result = SkillMetaSchema.safeParse(
        buildValidSkillMeta({ sourceRepo: "github.com/anthropics/skills" }),
      );
      expect(result.success).toBe(false);
    });

    it("sourceRepo 缺失时通过校验（可选字段）", () => {
      const result = SkillMetaSchema.safeParse(buildValidSkillMeta());
      expect(result.success).toBe(true);
    });
  });

  describe("readonly 字段", () => {
    it("readonly: true 通过校验", () => {
      const result = SkillMetaSchema.safeParse(
        buildValidSkillMeta({ readonly: true }),
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.readonly).toBe(true);
      }
    });

    it("readonly: false 通过校验", () => {
      const result = SkillMetaSchema.safeParse(
        buildValidSkillMeta({ readonly: false }),
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.readonly).toBe(false);
      }
    });

    it("readonly 缺失时通过校验（可选字段）", () => {
      const result = SkillMetaSchema.safeParse(buildValidSkillMeta());
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.readonly).toBeUndefined();
      }
    });

    it("readonly 为字符串 'true' 时校验失败（类型不匹配）", () => {
      const result = SkillMetaSchema.safeParse(
        buildValidSkillMeta({ readonly: "true" }),
      );
      expect(result.success).toBe(false);
    });
  });

  describe("完整外部 Skill 数据", () => {
    it("包含所有外部字段的完整数据通过校验", () => {
      const result = SkillMetaSchema.safeParse(
        buildValidSkillMeta({
          source: "anthropic-official",
          sourceUrl:
            "https://github.com/anthropics/skills/tree/main/pdf/SKILL.md",
          sourceRepo: "https://github.com/anthropics/skills",
          readonly: true,
        }),
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.source).toBe("anthropic-official");
        expect(result.data.readonly).toBe(true);
      }
    });
  });
});

describe("RepoSkillMappingSchema", () => {
  it("合法数据通过校验", () => {
    const result = RepoSkillMappingSchema.safeParse({
      name: "pdf",
      targetCategory: "document-processing",
    });
    expect(result.success).toBe(true);
  });

  it("name 为空时校验失败", () => {
    const result = RepoSkillMappingSchema.safeParse({
      name: "",
      targetCategory: "coding",
    });
    expect(result.success).toBe(false);
  });

  it("targetCategory 为空时校验失败", () => {
    const result = RepoSkillMappingSchema.safeParse({
      name: "pdf",
      targetCategory: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("ExternalRepositorySchema", () => {
  function buildValidRepo(overrides: Record<string, unknown> = {}) {
    return {
      id: "anthropic-official",
      name: "Anthropic Official Skills",
      url: "https://github.com/anthropics/skills",
      branch: "main",
      skillsPath: ".",
      enabled: true,
      include: [{ name: "pdf", targetCategory: "document-processing" }],
      exclude: ["slack-gif-creator"],
      ...overrides,
    };
  }

  it("合法仓库配置通过校验", () => {
    const result = ExternalRepositorySchema.safeParse(buildValidRepo());
    expect(result.success).toBe(true);
  });

  it("url 为合法 GitHub HTTPS URL 通过校验", () => {
    const result = ExternalRepositorySchema.safeParse(
      buildValidRepo({ url: "https://github.com/anthropics/skills" }),
    );
    expect(result.success).toBe(true);
  });

  it("url 不是 https://github.com/ 开头时校验失败", () => {
    const result = ExternalRepositorySchema.safeParse(
      buildValidRepo({ url: "https://gitlab.com/anthropics/skills" }),
    );
    expect(result.success).toBe(false);
  });

  it("url 为 http:// 时校验失败（必须 https）", () => {
    const result = ExternalRepositorySchema.safeParse(
      buildValidRepo({ url: "http://github.com/anthropics/skills" }),
    );
    expect(result.success).toBe(false);
  });

  it("url 为非 URL 字符串时校验失败", () => {
    const result = ExternalRepositorySchema.safeParse(
      buildValidRepo({ url: "not-a-url" }),
    );
    expect(result.success).toBe(false);
  });

  it("include 为空数组时通过校验", () => {
    const result = ExternalRepositorySchema.safeParse(
      buildValidRepo({ include: [] }),
    );
    expect(result.success).toBe(true);
  });

  it("exclude 为空数组时通过校验", () => {
    const result = ExternalRepositorySchema.safeParse(
      buildValidRepo({ exclude: [] }),
    );
    expect(result.success).toBe(true);
  });

  it("enabled: false 时通过校验", () => {
    const result = ExternalRepositorySchema.safeParse(
      buildValidRepo({ enabled: false }),
    );
    expect(result.success).toBe(true);
  });
});

describe("RepositoriesConfigSchema", () => {
  it("包含多个仓库的合法配置通过校验", () => {
    const result = RepositoriesConfigSchema.safeParse({
      repositories: [
        {
          id: "anthropic-official",
          name: "Anthropic Official Skills",
          url: "https://github.com/anthropics/skills",
          branch: "main",
          skillsPath: ".",
          enabled: true,
          include: [{ name: "pdf", targetCategory: "document-processing" }],
          exclude: [],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("空仓库列表通过校验", () => {
    const result = RepositoriesConfigSchema.safeParse({ repositories: [] });
    expect(result.success).toBe(true);
  });

  it("repositories 字段缺失时使用默认空数组", () => {
    const result = RepositoriesConfigSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.repositories).toEqual([]);
    }
  });
});
