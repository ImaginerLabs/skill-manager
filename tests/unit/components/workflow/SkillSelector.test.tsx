import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock stores
const mockFetchSkills = vi.fn();
const mockAddStep = vi.fn();

vi.mock("../../../../src/stores/skill-store", () => ({
  useSkillStore: vi.fn(() => ({
    skills: [
      {
        id: "skill-1",
        name: "代码审查",
        description: "执行全面的代码审查",
        category: "coding",
        tags: ["review"],
        filePath: "skills/coding/code-review.md",
        fileSize: 1024,
        lastModified: "2024-01-01T00:00:00Z",
      },
      {
        id: "skill-2",
        name: "测试覆盖分析",
        description: "分析测试覆盖率",
        category: "coding",
        tags: ["test"],
        filePath: "skills/coding/test-coverage.md",
        fileSize: 2048,
        lastModified: "2024-01-02T00:00:00Z",
      },
      {
        id: "workflow-1",
        name: "提交前检查",
        description: "自动化提交前检查流程",
        category: "workflows",
        tags: ["commit"],
        type: "workflow",
        filePath: "skills/workflows/pre-commit.md",
        fileSize: 512,
        lastModified: "2024-01-03T00:00:00Z",
      },
    ],
    loading: false,
    fetchSkills: mockFetchSkills,
  })),
}));

vi.mock("../../../../src/stores/workflow-store", () => ({
  useWorkflowStore: vi.fn(() => ({
    steps: [],
    addStep: mockAddStep,
  })),
}));

import SkillSelector from "../../../../src/components/workflow/SkillSelector";

describe("SkillSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("渲染", () => {
    it("渲染搜索框和 Skill 列表", () => {
      render(<SkillSelector />);

      expect(screen.getByPlaceholderText("搜索 Skill...")).toBeInTheDocument();
      expect(screen.getByText("代码审查")).toBeInTheDocument();
      expect(screen.getByText("测试覆盖分析")).toBeInTheDocument();
      expect(screen.getByText("提交前检查")).toBeInTheDocument();
    });

    it("显示 Skill 描述", () => {
      render(<SkillSelector />);

      expect(screen.getByText("执行全面的代码审查")).toBeInTheDocument();
    });

    it("显示分类标签", () => {
      render(<SkillSelector />);

      const codingBadges = screen.getAllByText("coding");
      expect(codingBadges.length).toBeGreaterThan(0);
    });

    it("工作流 Skill 显示 workflow 标签", () => {
      render(<SkillSelector />);

      expect(screen.getByText("workflow")).toBeInTheDocument();
    });
  });

  describe("搜索", () => {
    it("搜索框输入后筛选 Skill", async () => {
      const user = userEvent.setup();
      render(<SkillSelector />);

      const searchInput = screen.getByPlaceholderText("搜索 Skill...");
      await user.type(searchInput, "审查");

      // fuse.js 模糊搜索 — 应该能匹配到"代码审查"
      expect(screen.getByText("代码审查")).toBeInTheDocument();
    });
  });

  describe("交互", () => {
    it("点击 Skill 调用 addStep", async () => {
      const user = userEvent.setup();
      render(<SkillSelector />);

      const skillButton = screen.getByLabelText("添加 代码审查 到工作流");
      await user.click(skillButton);

      expect(mockAddStep).toHaveBeenCalledWith("skill-1", "代码审查");
    });

    it("每个 Skill 项都有正确的 aria-label", () => {
      render(<SkillSelector />);

      expect(
        screen.getByLabelText("添加 代码审查 到工作流"),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("添加 测试覆盖分析 到工作流"),
      ).toBeInTheDocument();
    });
  });
});
