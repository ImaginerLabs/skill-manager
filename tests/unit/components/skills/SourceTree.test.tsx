import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "nav.allSources": "全部",
        "nav.mySkills": "我的 Skill",
        "nav.sourceListLabel": "按来源筛选 Skill",
      };
      return map[key] ?? key;
    },
    i18n: { language: "zh", changeLanguage: vi.fn() },
  }),
}));

// Mock skill-store
const mockSetSource = vi.fn();
let mockSkills: Array<{
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  filePath: string;
  fileSize: number;
  lastModified: string;
  source?: string;
}> = [];
let mockSelectedSource: string | null = null;

vi.mock("../../../../src/stores/skill-store", () => ({
  useSkillStore: vi.fn(() => ({
    skills: mockSkills,
    selectedSource: mockSelectedSource,
    setSource: mockSetSource,
  })),
}));

import SourceTree from "../../../../src/components/skills/SourceTree";

describe("SourceTree", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelectedSource = null;
    mockSkills = [
      {
        id: "code-review",
        name: "Code Review",
        description: "代码审查",
        category: "coding",
        tags: [],
        filePath: "coding/code-review.md",
        fileSize: 100,
        lastModified: "2026-01-01T00:00:00Z",
      },
      {
        id: "pdf-reader",
        name: "PDF Reader",
        description: "PDF 阅读",
        category: "document-processing",
        tags: [],
        filePath: "document-processing/pdf-reader.md",
        fileSize: 100,
        lastModified: "2026-01-01T00:00:00Z",
        source: "anthropic-official",
      },
      {
        id: "copilot-skill",
        name: "Copilot Skill",
        description: "Copilot 技能",
        category: "coding",
        tags: [],
        filePath: "coding/copilot-skill.md",
        fileSize: 100,
        lastModified: "2026-01-01T00:00:00Z",
        source: "awesome-copilot",
      },
    ];
  });

  describe("渲染", () => {
    it("渲染全部、我的 Skill 和外部来源项", () => {
      render(<SourceTree />);

      expect(screen.getByText("全部")).toBeInTheDocument();
      expect(screen.getByText("我的 Skill")).toBeInTheDocument();
      // SourceTree 使用 displayName 而非原始 source key
      expect(screen.getByText("Anthropic")).toBeInTheDocument();
      expect(screen.getByText("Awesome")).toBeInTheDocument();
    });

    it("显示每个来源的 Skill 数量 Badge", () => {
      render(<SourceTree />);

      // 全部: 3, 我的 Skill: 1, anthropic-official: 1, awesome-copilot: 1
      const badges = screen.getAllByText("1");
      expect(badges.length).toBeGreaterThanOrEqual(3);
      expect(screen.getByText("3")).toBeInTheDocument(); // 全部
    });

    it("source 为空的 Skill 归入我的 Skill 分组", () => {
      render(<SourceTree />);

      // code-review 没有 source 字段，应归入"我的 Skill"
      const mySkillOption = screen.getByRole("option", {
        name: /我的 Skill/,
      });
      expect(mySkillOption).toBeInTheDocument();
    });
  });

  describe("交互", () => {
    it("点击来源项调用 setSource", async () => {
      const user = userEvent.setup();
      render(<SourceTree />);

      await user.click(screen.getByText("Anthropic"));

      expect(mockSetSource).toHaveBeenCalledWith("anthropic-official");
    });

    it("点击全部调用 setSource(null)", async () => {
      const user = userEvent.setup();
      render(<SourceTree />);

      await user.click(screen.getByText("全部"));

      expect(mockSetSource).toHaveBeenCalledWith(null);
    });

    it("点击我的 Skill 调用 setSource('')", async () => {
      const user = userEvent.setup();
      render(<SourceTree />);

      await user.click(screen.getByText("我的 Skill"));

      expect(mockSetSource).toHaveBeenCalledWith("");
    });
  });

  describe("ARIA 无障碍", () => {
    it("容器有 role=listbox", () => {
      render(<SourceTree />);

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("每个来源项有 role=option", () => {
      render(<SourceTree />);

      const options = screen.getAllByRole("option");
      expect(options.length).toBe(4); // 全部 + 我的 Skill + 2 个外部来源
    });

    it("选中来源项有 aria-selected=true", () => {
      mockSelectedSource = "anthropic-official";
      render(<SourceTree />);

      const activeOption = screen.getByRole("option", {
        name: /Anthropic/,
      });
      expect(activeOption).toHaveAttribute("aria-selected", "true");
    });

    it("aria-label 包含数量信息", () => {
      render(<SourceTree />);

      const allOption = screen.getByRole("option", {
        name: /全部.*3/,
      });
      expect(allOption).toBeInTheDocument();
    });
  });

  describe("空状态", () => {
    it("无 Skill 时只显示全部（数量为 0）", () => {
      mockSkills = [];
      render(<SourceTree />);

      expect(screen.getByText("全部")).toBeInTheDocument();
      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });
});
