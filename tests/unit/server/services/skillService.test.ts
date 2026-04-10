import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock fs-extra
vi.mock("fs-extra", () => ({
  default: {
    pathExists: vi.fn(),
    readdir: vi.fn(),
    readFile: vi.fn(),
    stat: vi.fn(),
    ensureDir: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock frontmatterParser
vi.mock("../../../../server/utils/frontmatterParser", () => ({
  parseFrontmatter: vi.fn(),
}));

import fs from "fs-extra";
import {
  deleteSkill,
  getAllSkills,
  getParseErrors,
  getSkillFull,
  getSkillMeta,
  initializeSkillCache,
  refreshSkillCache,
  updateSkillMeta,
} from "../../../../server/services/skillService";
import { parseFrontmatter } from "../../../../server/utils/frontmatterParser";

// Mock 数据
const mockSkillMeta = {
  id: "react-extract",
  name: "React 组件抽取",
  description: "从代码中抽取可复用的 React 组件",
  category: "coding",
  tags: ["react", "refactor"],
  filePath: "coding/react-extract.md",
  fileSize: 1024,
  lastModified: "2024-01-01T00:00:00.000Z",
};

describe("skillService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initializeSkillCache", () => {
    it("成功扫描并缓存 Skill 文件", async () => {
      // skills 目录存在
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);

      // 模拟目录结构
      vi.mocked(fs.readdir)
        .mockResolvedValueOnce([
          { name: "coding", isDirectory: () => true, isFile: () => false },
        ] as never)
        .mockResolvedValueOnce([
          {
            name: "react-extract.md",
            isDirectory: () => false,
            isFile: () => true,
          },
        ] as never);

      // 模拟解析成功
      vi.mocked(parseFrontmatter).mockResolvedValue({
        success: true,
        meta: mockSkillMeta,
        content: "# Content",
        rawContent: "---\nname: test\n---\n# Content",
      });

      await initializeSkillCache();

      const skills = getAllSkills();
      expect(skills).toHaveLength(1);
      expect(skills[0].id).toBe("react-extract");
    });

    it("skills 目录不存在时创建并返回空列表", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false as never);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);

      await initializeSkillCache();

      const skills = getAllSkills();
      expect(skills).toHaveLength(0);
    });

    it("解析失败的文件记录到 parseErrors", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.readdir).mockResolvedValueOnce([
        { name: "bad.md", isDirectory: () => false, isFile: () => true },
      ] as never);

      vi.mocked(parseFrontmatter).mockResolvedValue({
        success: false,
        filePath: "bad.md",
        error: "YAML 语法错误",
      });

      await initializeSkillCache();

      const errors = getParseErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].error).toBe("YAML 语法错误");
    });
  });

  describe("getSkillMeta", () => {
    it("初始化后可以按 ID 获取 Skill", async () => {
      // 先初始化
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.readdir).mockResolvedValueOnce([
        { name: "test.md", isDirectory: () => false, isFile: () => true },
      ] as never);
      vi.mocked(parseFrontmatter).mockResolvedValue({
        success: true,
        meta: mockSkillMeta,
        content: "",
        rawContent: "",
      });

      await initializeSkillCache();

      const meta = getSkillMeta("react-extract");
      expect(meta).toBeDefined();
      expect(meta!.name).toBe("React 组件抽取");
    });

    it("不存在的 ID 返回 undefined", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.readdir).mockResolvedValueOnce([] as never);

      await initializeSkillCache();

      const meta = getSkillMeta("nonexistent");
      expect(meta).toBeUndefined();
    });
  });

  describe("getSkillFull", () => {
    it("返回完整 Skill 含 Markdown 正文", async () => {
      // 初始化缓存
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.readdir).mockResolvedValueOnce([
        { name: "test.md", isDirectory: () => false, isFile: () => true },
      ] as never);
      vi.mocked(parseFrontmatter).mockResolvedValue({
        success: true,
        meta: mockSkillMeta,
        content: "",
        rawContent: "",
      });

      await initializeSkillCache();

      // 模拟文件读取
      const rawContent =
        "---\nname: React 组件抽取\ncategory: coding\n---\n\n# Content";
      vi.mocked(fs.readFile).mockResolvedValue(rawContent as never);

      const full = await getSkillFull("react-extract");
      expect(full.id).toBe("react-extract");
      expect(full.content).toContain("# Content");
      expect(full.rawContent).toBe(rawContent);
    });

    it("Skill 不存在时抛出错误", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.readdir).mockResolvedValueOnce([] as never);

      await initializeSkillCache();

      await expect(getSkillFull("nonexistent")).rejects.toThrow("未找到");
    });
  });

  describe("refreshSkillCache", () => {
    it("返回刷新统计信息", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.readdir).mockResolvedValueOnce([
        { name: "ok.md", isDirectory: () => false, isFile: () => true },
        { name: "bad.md", isDirectory: () => false, isFile: () => true },
      ] as never);

      vi.mocked(parseFrontmatter)
        .mockResolvedValueOnce({
          success: true,
          meta: mockSkillMeta,
          content: "",
          rawContent: "",
        })
        .mockResolvedValueOnce({
          success: false,
          filePath: "bad.md",
          error: "解析失败",
        });

      const result = await refreshSkillCache();

      expect(result.total).toBe(2);
      expect(result.success).toBe(1);
      expect(result.errors).toBe(1);
    });
  });

  describe("deleteSkill", () => {
    it("成功删除 Skill 并从缓存移除", async () => {
      // 初始化
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.readdir).mockResolvedValueOnce([
        { name: "test.md", isDirectory: () => false, isFile: () => true },
      ] as never);
      vi.mocked(parseFrontmatter).mockResolvedValue({
        success: true,
        meta: mockSkillMeta,
        content: "",
        rawContent: "",
      });

      await initializeSkillCache();
      expect(getAllSkills()).toHaveLength(1);

      vi.mocked(fs.remove).mockResolvedValue(undefined as never);

      await deleteSkill("react-extract");

      expect(getAllSkills()).toHaveLength(0);
      expect(fs.remove).toHaveBeenCalled();
    });

    it("Skill 不存在时抛出错误", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.readdir).mockResolvedValueOnce([] as never);

      await initializeSkillCache();

      await expect(deleteSkill("nonexistent")).rejects.toThrow("未找到");
    });
  });

  describe("updateSkillMeta", () => {
    it("成功更新元数据并刷新缓存", async () => {
      // 初始化
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.readdir).mockResolvedValueOnce([
        { name: "test.md", isDirectory: () => false, isFile: () => true },
      ] as never);
      vi.mocked(parseFrontmatter).mockResolvedValue({
        success: true,
        meta: mockSkillMeta,
        content: "",
        rawContent: "",
      });

      await initializeSkillCache();

      // 模拟文件读取和写入
      vi.mocked(fs.readFile).mockResolvedValue(
        "---\nname: React 组件抽取\ndescription: 旧描述\ncategory: coding\ntags: []\n---\n\n# Content" as never,
      );
      vi.mocked(fs.writeFile).mockResolvedValue(undefined as never);

      const updated = await updateSkillMeta("react-extract", {
        description: "新描述",
        tags: ["new-tag"],
      });

      expect(updated.description).toBe("新描述");
      expect(updated.tags).toEqual(["new-tag"]);
    });

    it("Skill 不存在时抛出错误", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.readdir).mockResolvedValueOnce([] as never);

      await initializeSkillCache();

      await expect(
        updateSkillMeta("nonexistent", { name: "新名称" }),
      ).rejects.toThrow("未找到");
    });
  });
});
