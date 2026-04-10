import { describe, expect, it } from "vitest";
import {
  getRelativePath,
  getSkillId,
  isSubPath,
  normalizePath,
  resolveSkillPath,
  slugify,
} from "../../../../server/utils/pathUtils";

describe("pathUtils", () => {
  describe("normalizePath", () => {
    it("将 Windows 反斜杠转为正斜杠", () => {
      expect(normalizePath("skills\\coding\\test.md")).toBe(
        "skills/coding/test.md",
      );
    });

    it("移除尾部斜杠", () => {
      expect(normalizePath("skills/coding/")).toBe("skills/coding");
    });

    it("保留根路径 /", () => {
      expect(normalizePath("/")).toBe("/");
    });

    it("处理空字符串", () => {
      expect(normalizePath("")).toBe("");
    });

    it("处理已经是 POSIX 风格的路径", () => {
      expect(normalizePath("skills/coding/test.md")).toBe(
        "skills/coding/test.md",
      );
    });

    it("处理多层 Windows 路径", () => {
      expect(normalizePath("C:\\Users\\alex\\skills\\test.md")).toBe(
        "C:/Users/alex/skills/test.md",
      );
    });
  });

  describe("resolveSkillPath", () => {
    it("基于 skillsRoot 解析相对路径", () => {
      const result = resolveSkillPath("coding/test.md", "/project/skills");
      expect(result).toContain("coding/test.md");
      expect(result).not.toContain("\\");
    });

    it("返回归一化的绝对路径", () => {
      const result = resolveSkillPath("test.md", "/project/skills");
      expect(result).toContain("/project/skills/test.md");
    });
  });

  describe("getRelativePath", () => {
    it("计算相对路径", () => {
      const result = getRelativePath(
        "/project/skills/coding/test.md",
        "/project/skills",
      );
      expect(result).toBe("coding/test.md");
    });

    it("返回归一化的相对路径", () => {
      const result = getRelativePath(
        "/project/skills/test.md",
        "/project/skills",
      );
      expect(result).toBe("test.md");
    });
  });

  describe("isSubPath", () => {
    it("子路径在父路径内返回 true", () => {
      expect(
        isSubPath("/project/skills/coding/test.md", "/project/skills"),
      ).toBe(true);
    });

    it("相同路径返回 true", () => {
      expect(isSubPath("/project/skills", "/project/skills")).toBe(true);
    });

    it("路径遍历攻击返回 false", () => {
      expect(
        isSubPath("/project/skills/../secrets/key", "/project/skills"),
      ).toBe(false);
    });

    it("不相关路径返回 false", () => {
      expect(isSubPath("/other/path/file.md", "/project/skills")).toBe(false);
    });

    it("前缀匹配但非子目录返回 false", () => {
      expect(
        isSubPath("/project/skills-extra/file.md", "/project/skills"),
      ).toBe(false);
    });
  });

  describe("slugify", () => {
    it("去除 .md 扩展名", () => {
      expect(slugify("My Skill.md")).toBe("my-skill");
    });

    it("特殊字符转连字符", () => {
      expect(slugify("My Awesome Skill.md")).toBe("my-awesome-skill");
    });

    it("保留中文字符", () => {
      expect(slugify("代码审查工具.md")).toBe("代码审查工具");
    });

    it("合并连续连字符", () => {
      expect(slugify("skill--name.md")).toBe("skill-name");
    });

    it("去除首尾连字符", () => {
      expect(slugify("-skill-name-.md")).toBe("skill-name");
    });

    it("小写化", () => {
      expect(slugify("MySkill.MD")).toBe("myskill");
    });

    it("处理无扩展名的文件名", () => {
      expect(slugify("my-skill")).toBe("my-skill");
    });
  });

  describe("getSkillId", () => {
    it("从文件路径提取 skill id", () => {
      expect(getSkillId("skills/coding/react-component.md")).toBe(
        "react-component",
      );
    });

    it("从绝对路径提取 skill id", () => {
      expect(getSkillId("/project/skills/coding/test.md")).toBe("test");
    });

    it("处理中文文件名", () => {
      expect(getSkillId("skills/代码审查.md")).toBe("代码审查");
    });
  });
});
