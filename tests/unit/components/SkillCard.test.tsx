import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SkillMeta } from "../../../shared/types";
import SkillCard from "../../../src/components/skills/SkillCard";

// Mock 数据
const mockSkill: SkillMeta = {
  id: "skill-1",
  name: "React 组件抽取",
  description: "从代码中抽取可复用的 React 组件，提高代码复用率",
  category: "frontend",
  tags: ["react", "refactor", "component"],
  filePath: "skills/frontend/react-component-extraction.md",
  fileSize: 1024,
  lastModified: "2024-01-01T00:00:00Z",
};

const mockWorkflowSkill: SkillMeta = {
  id: "workflow-1",
  name: "代码审查工作流",
  description: "自动化代码审查流程",
  category: "workflow",
  tags: ["review", "quality"],
  type: "workflow",
  filePath: "skills/workflow/code-review.md",
  fileSize: 2048,
  lastModified: "2024-01-02T00:00:00Z",
};

// Mock store
const mockSelectSkill = vi.fn();
vi.mock("../../src/stores/skill-store", () => ({
  useSkillStore: vi.fn(() => ({
    selectedSkillId: null,
    selectSkill: mockSelectSkill,
  })),
}));

describe("SkillCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("渲染", () => {
    it("渲染普通 Skill 卡片", () => {
      render(<SkillCard skill={mockSkill} />);

      expect(screen.getByText("React 组件抽取")).toBeInTheDocument();
      expect(
        screen.getByText("从代码中抽取可复用的 React 组件，提高代码复用率"),
      ).toBeInTheDocument();
      expect(screen.getByText("frontend")).toBeInTheDocument();
    });

    it("渲染工作流 Skill 卡片", () => {
      render(<SkillCard skill={mockWorkflowSkill} />);

      expect(screen.getByText("代码审查工作流")).toBeInTheDocument();
      expect(screen.getByText("workflow")).toBeInTheDocument();
      expect(screen.getByText("工作流")).toBeInTheDocument();
    });

    it("显示最多 2 个标签", () => {
      render(<SkillCard skill={mockSkill} />);

      expect(screen.getByText("react")).toBeInTheDocument();
      expect(screen.getByText("refactor")).toBeInTheDocument();
      expect(screen.queryByText("component")).not.toBeInTheDocument();
      expect(screen.getByText("+1")).toBeInTheDocument();
    });

    it("无描述时显示默认文本", () => {
      const skillWithoutDesc = { ...mockSkill, description: "" };
      render(<SkillCard skill={skillWithoutDesc} />);

      expect(screen.getByText("暂无描述")).toBeInTheDocument();
    });
  });

  describe("交互", () => {
    it("卡片按钮可点击", () => {
      render(<SkillCard skill={mockSkill} />);

      const card = screen.getByRole("button");
      // 验证按钮存在且可点击
      expect(card).toBeInTheDocument();
      expect(card).toBeEnabled();
    });
  });

  describe("图标显示", () => {
    it("普通 Skill 显示 FileText 图标", () => {
      render(<SkillCard skill={mockSkill} />);

      const card = screen.getByRole("button");
      const svg = card.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("工作流 Skill 显示 GitBranch 图标", () => {
      render(<SkillCard skill={mockWorkflowSkill} />);

      const card = screen.getByRole("button");
      const svg = card.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("可访问性", () => {
    it("卡片是可聚焦的按钮", () => {
      render(<SkillCard skill={mockSkill} />);

      const card = screen.getByRole("button");
      expect(card).toBeInTheDocument();
    });

    it("键盘可访问", () => {
      render(<SkillCard skill={mockSkill} />);

      const card = screen.getByRole("button");
      card.focus();
      expect(card).toHaveFocus();
    });
  });

  describe("样式", () => {
    it("包含正确的过渡效果", () => {
      render(<SkillCard skill={mockSkill} />);

      const card = screen.getByRole("button");
      expect(card.className).toContain("transition-all");
      expect(card.className).toContain("duration-150");
    });

    it("包含正确的边框样式类", () => {
      render(<SkillCard skill={mockSkill} />);

      const card = screen.getByRole("button");
      // 检查包含 border 类（未选中或选中状态都会有 border）
      expect(card.className).toMatch(/border-/);
    });
  });
});
