// ============================================================
// tests/unit/components/skills/SkillPreview.external-skill.test.tsx
// Story 8.5: 前端来源标签与只读标识
// ============================================================

import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock API
const mockFetchSkillById = vi.fn();
vi.mock("../../../../src/lib/api", () => ({
  fetchSkillById: (...args: unknown[]) => mockFetchSkillById(...args),
}));

// Mock toast
vi.mock("../../../../src/components/shared/toast-store", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock stores
const mockSelectSkill = vi.fn();
const mockFetchSkills = vi.fn();
const mockSetPreviewOpen = vi.fn();

vi.mock("../../../../src/stores/skill-store", () => ({
  useSkillStore: vi.fn(() => ({
    selectedSkillId: "skill-ext-1",
    fetchSkills: mockFetchSkills,
    selectSkill: mockSelectSkill,
  })),
}));

vi.mock("../../../../src/stores/ui-store", () => ({
  useUIStore: vi.fn(() => ({
    setPreviewOpen: mockSetPreviewOpen,
  })),
}));

// Mock MetadataEditor
vi.mock("../../../../src/components/skills/MetadataEditor", () => ({
  default: () => <div data-testid="metadata-editor" />,
}));

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "skill.viewOnGithub": "在 GitHub 上查看",
        "skill.sourceRepo": "仓库",
        "skill.readonlyTooltip": "外部 Skill（只读）",
        "skill.readonlyEditTooltip": "外部 Skill 为只读，由上游仓库管理",
        "skill.readonlyDeleteTooltip": "外部 Skill 不可删除",
      };
      return map[key] ?? key;
    },
    i18n: { language: "zh", changeLanguage: vi.fn() },
  }),
}));

import SkillPreview from "../../../../src/components/skills/SkillPreview";

// 本地 Skill（无外部字段）
const mockLocalSkill = {
  id: "skill-local-1",
  name: "本地 Skill",
  description: "本地创建的 Skill",
  filePath: "coding/local-skill.md",
  category: "coding",
  tags: [],
  lastModified: "2024-06-15T10:00:00.000Z",
  fileSize: 1024,
  content: "# 本地 Skill",
  rawContent: "---\nname: 本地 Skill\n---\n# 本地 Skill",
};

// 外部 Skill（含来源元数据）
const mockExternalSkill = {
  id: "skill-ext-1",
  name: "PDF 处理",
  description: "处理 PDF 文件",
  filePath: "document-processing/pdf.md",
  category: "document-processing",
  tags: ["pdf"],
  lastModified: "2024-06-15T10:00:00.000Z",
  fileSize: 2048,
  content: "# PDF 处理",
  rawContent:
    "---\nname: PDF 处理\nsource: anthropic-official\n---\n# PDF 处理",
  source: "anthropic-official",
  sourceUrl: "https://github.com/anthropics/skills/tree/main/pdf/SKILL.md",
  sourceRepo: "https://github.com/anthropics/skills",
  readonly: true,
};

describe("SkillPreview — 外部 Skill 来源标签与只读标识 (Story 8.5)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchSkills.mockResolvedValue(undefined);
  });

  describe("来源信息区域", () => {
    it("外部 Skill 显示来源信息区域", async () => {
      mockFetchSkillById.mockResolvedValue(mockExternalSkill);
      render(<SkillPreview />);

      await waitFor(() => {
        expect(screen.getByTestId("preview-source-info")).toBeInTheDocument();
      });
    });

    it("本地 Skill 不显示来源信息区域", async () => {
      mockFetchSkillById.mockResolvedValue(mockLocalSkill);
      render(<SkillPreview />);

      await waitFor(() => {
        expect(screen.getByTestId("preview-panel")).toBeInTheDocument();
      });
      expect(
        screen.queryByTestId("preview-source-info"),
      ).not.toBeInTheDocument();
    });

    it("来源信息区域包含「在 GitHub 上查看」链接", async () => {
      mockFetchSkillById.mockResolvedValue(mockExternalSkill);
      render(<SkillPreview />);

      await waitFor(() => {
        expect(screen.getByText("在 GitHub 上查看")).toBeInTheDocument();
      });
    });

    it("「在 GitHub 上查看」链接指向 sourceUrl", async () => {
      mockFetchSkillById.mockResolvedValue(mockExternalSkill);
      render(<SkillPreview />);

      await waitFor(() => {
        const link = screen.getByText("在 GitHub 上查看").closest("a");
        expect(link).toHaveAttribute(
          "href",
          "https://github.com/anthropics/skills/tree/main/pdf/SKILL.md",
        );
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      });
    });

    it("来源信息区域显示仓库名称链接", async () => {
      mockFetchSkillById.mockResolvedValue(mockExternalSkill);
      render(<SkillPreview />);

      await waitFor(() => {
        const repoLink = screen.getByText("anthropic-official");
        expect(repoLink.closest("a")).toHaveAttribute(
          "href",
          "https://github.com/anthropics/skills",
        );
      });
    });
  });

  describe("只读锁图标", () => {
    it("readonly: true 时显示只读锁图标", async () => {
      mockFetchSkillById.mockResolvedValue(mockExternalSkill);
      render(<SkillPreview />);

      await waitFor(() => {
        expect(screen.getByTestId("preview-readonly-lock")).toBeInTheDocument();
      });
    });

    it("本地 Skill 不显示只读锁图标", async () => {
      mockFetchSkillById.mockResolvedValue(mockLocalSkill);
      render(<SkillPreview />);

      await waitFor(() => {
        expect(screen.getByTestId("preview-panel")).toBeInTheDocument();
      });
      expect(
        screen.queryByTestId("preview-readonly-lock"),
      ).not.toBeInTheDocument();
    });
  });

  describe("编辑按钮只读禁用", () => {
    it("外部 Skill 的编辑按钮处于禁用状态", async () => {
      mockFetchSkillById.mockResolvedValue(mockExternalSkill);
      render(<SkillPreview />);

      await waitFor(() => {
        const editBtn = screen.getByRole("button", { name: "编辑元数据" });
        expect(editBtn).toBeDisabled();
      });
    });

    it("本地 Skill 的编辑按钮处于启用状态", async () => {
      mockFetchSkillById.mockResolvedValue(mockLocalSkill);
      render(<SkillPreview />);

      await waitFor(() => {
        const editBtn = screen.getByRole("button", { name: "编辑元数据" });
        expect(editBtn).not.toBeDisabled();
      });
    });

    it("外部 Skill 编辑按钮 title 提示只读信息", async () => {
      mockFetchSkillById.mockResolvedValue(mockExternalSkill);
      render(<SkillPreview />);

      await waitFor(() => {
        const editBtn = screen.getByRole("button", { name: "编辑元数据" });
        expect(editBtn).toHaveAttribute(
          "title",
          "外部 Skill 为只读，由上游仓库管理",
        );
      });
    });
  });
});
