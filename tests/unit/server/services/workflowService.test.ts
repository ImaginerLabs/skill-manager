import fs from "fs-extra";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock 依赖
vi.mock("fs-extra");
vi.mock("../../../../server/utils/fileUtils", () => ({
  safeWrite: vi.fn(),
}));
vi.mock("../../../../server/services/skillService", () => ({
  refreshSkillCache: vi.fn(),
}));

import {
  createWorkflow,
  deleteWorkflow,
  getWorkflows,
  previewWorkflow,
} from "../../../../server/services/workflowService";
import { safeWrite } from "../../../../server/utils/fileUtils";

describe("workflowService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("previewWorkflow", () => {
    it("生成正确格式的工作流内容", () => {
      const content = previewWorkflow({
        name: "代码审查工作流",
        description: "自动化代码审查",
        steps: [
          {
            order: 1,
            skillId: "code-review",
            skillName: "代码审查",
            description: "执行全面审查",
          },
          {
            order: 2,
            skillId: "test-coverage",
            skillName: "测试覆盖",
            description: "",
          },
        ],
      });

      expect(content).toContain("name: 代码审查工作流");
      expect(content).toContain("type: workflow");
      expect(content).toContain("category: workflows");
      expect(content).toContain("## Step 1");
      expect(content).toContain("**使用 Skill:** `代码审查`");
      expect(content).toContain("执行全面审查");
      expect(content).toContain("## Step 2");
      expect(content).toContain("**使用 Skill:** `测试覆盖`");
    });
  });

  describe("createWorkflow", () => {
    it("创建工作流文件", async () => {
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
      vi.mocked(fs.pathExists).mockResolvedValue(false as never);
      vi.mocked(safeWrite).mockResolvedValue(undefined);

      const result = await createWorkflow({
        name: "测试工作流",
        description: "测试描述",
        steps: [
          {
            order: 1,
            skillId: "s1",
            skillName: "Skill 1",
            description: "",
          },
        ],
      });

      expect(result.id).toBeTruthy();
      expect(result.filePath).toContain("workflows/");
      expect(safeWrite).toHaveBeenCalledOnce();
    });

    it("名称为空时抛出校验错误", async () => {
      await expect(
        createWorkflow({
          name: "",
          description: "",
          steps: [
            {
              order: 1,
              skillId: "s1",
              skillName: "S1",
              description: "",
            },
          ],
        }),
      ).rejects.toThrow("工作流名称不能为空");
    });

    it("无步骤时抛出校验错误", async () => {
      await expect(
        createWorkflow({
          name: "测试",
          description: "",
          steps: [],
        }),
      ).rejects.toThrow("工作流至少需要一个步骤");
    });
  });

  describe("getWorkflows", () => {
    it("目录不存在时返回空数组", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false as never);

      const result = await getWorkflows();
      expect(result).toEqual([]);
    });

    it("读取工作流文件列表", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.readdir).mockResolvedValue(["test.md"] as never);
      vi.mocked(fs.readFile).mockResolvedValue(
        "---\nname: 测试工作流\ndescription: 描述\n---\n内容" as never,
      );

      const result = await getWorkflows();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("测试工作流");
    });
  });

  describe("deleteWorkflow", () => {
    it("文件不存在时抛出 404", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false as never);

      await expect(deleteWorkflow("nonexistent")).rejects.toThrow("未找到");
    });
  });
});
