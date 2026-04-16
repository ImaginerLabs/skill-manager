import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SkillMeta } from "../../../shared/types";
import SkillCard from "../../../src/components/skills/SkillCard";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "common.noDescription": "暂无描述",
        "skillList.workflowBadge": "工作流",
        "skill.viewOnGithub": "在 GitHub 上查看",
        "skill.readonlyTooltip": "外部 Skill（只读）",
        "skill.editMeta": "编辑元数据",
        "skill.syncToIDE": "同步到 IDE",
        "skill.copyPath": "复制路径",
        "skill.pathCopied": "路径已复制",
        "common.delete": "删除",
      };
      return map[key] ?? key;
    },
    i18n: { language: "zh", changeLanguage: vi.fn() },
  }),
}));

// Mock react-router-dom（SkillContextMenu 使用 useNavigate）
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  MemoryRouter: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock sync-store（SkillContextMenu 使用 useSyncStore）
vi.mock("../../src/stores/sync-store", () => ({
  useSyncStore: vi.fn(() => ({
    toggleSkillSelection: vi.fn(),
  })),
}));

// Mock toast-store
vi.mock("../../src/components/shared/toast-store", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

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
      expect(card.className).toContain("duration-200");
    });

    it("包含正确的边框样式类", () => {
      render(<SkillCard skill={mockSkill} />);

      const card = screen.getByRole("button");
      // 检查包含 border 类（未选中或选中状态都会有 border）
      expect(card.className).toMatch(/border-/);
    });
  });

  describe("外部 Skill — 来源标签", () => {
    const externalSkill: SkillMeta = {
      ...mockSkill,
      source: "anthropic-official",
      sourceUrl: "https://github.com/anthropics/skills/tree/main/pdf/SKILL.md",
      sourceRepo: "https://github.com/anthropics/skills",
      readonly: true,
    };

    it("有 source 字段时显示来源标签", () => {
      render(<SkillCard skill={externalSkill} />);
      expect(screen.getByTestId("skill-source-badge")).toBeInTheDocument();
    });

    it("无 source 字段时不显示来源标签", () => {
      render(<SkillCard skill={mockSkill} />);
      expect(
        screen.queryByTestId("skill-source-badge"),
      ).not.toBeInTheDocument();
    });

    it("来源标签包含仓库 ID 文本", () => {
      render(<SkillCard skill={externalSkill} />);
      expect(screen.getByTestId("skill-source-badge")).toHaveTextContent(
        "anthropic-official",
      );
    });

    it("来源标签 href 指向 sourceUrl", () => {
      render(<SkillCard skill={externalSkill} />);
      const badge = screen.getByTestId("skill-source-badge");
      expect(badge).toHaveAttribute(
        "href",
        "https://github.com/anthropics/skills/tree/main/pdf/SKILL.md",
      );
    });

    it("来源标签在新标签页打开（target=_blank）", () => {
      render(<SkillCard skill={externalSkill} />);
      const badge = screen.getByTestId("skill-source-badge");
      expect(badge).toHaveAttribute("target", "_blank");
      expect(badge).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("有 source 但无 sourceUrl 时不显示来源标签", () => {
      const skillNoUrl: SkillMeta = {
        ...mockSkill,
        source: "anthropic-official",
      };
      render(<SkillCard skill={skillNoUrl} />);
      expect(
        screen.queryByTestId("skill-source-badge"),
      ).not.toBeInTheDocument();
    });
  });

  describe("外部 Skill — 锁图标", () => {
    it("readonly: true 时显示锁图标", () => {
      const readonlySkill: SkillMeta = { ...mockSkill, readonly: true };
      render(<SkillCard skill={readonlySkill} />);
      expect(screen.getByTestId("skill-readonly-lock")).toBeInTheDocument();
    });

    it("readonly: false 时不显示锁图标", () => {
      const nonReadonlySkill: SkillMeta = { ...mockSkill, readonly: false };
      render(<SkillCard skill={nonReadonlySkill} />);
      expect(
        screen.queryByTestId("skill-readonly-lock"),
      ).not.toBeInTheDocument();
    });

    it("readonly 字段缺失时不显示锁图标", () => {
      render(<SkillCard skill={mockSkill} />);
      expect(
        screen.queryByTestId("skill-readonly-lock"),
      ).not.toBeInTheDocument();
    });
  });
});
