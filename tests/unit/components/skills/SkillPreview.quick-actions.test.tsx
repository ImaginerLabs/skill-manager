// ============================================================
// tests/unit/components/skills/SkillPreview.quick-actions.test.tsx
// Story 3.1: Skill 详情侧边栏快捷操作
// 验收标准：
//   - 详情面板顶部显示"复制文件路径"按钮
//   - 点击后调用 clipboard API，显示成功 toast
//   - clipboard 失败时显示错误 toast
// ============================================================

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "skill.readonlyTooltip": "外部 Skill 只读",
        "skill.readonlyEditTooltip": "外部 Skill 不可编辑",
        "skill.sourceRepo": "来源仓库",
        "skill.viewOnGithub": "在 GitHub 查看",
      };
      return map[key] ?? key;
    },
    i18n: { language: "zh", changeLanguage: vi.fn() },
  }),
}));

// Mock API
const mockFetchSkillById = vi.fn();
vi.mock("../../../../src/lib/api", () => ({
  fetchSkillById: (...args: unknown[]) => mockFetchSkillById(...args),
}));

// Mock toast
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock("../../../../src/components/shared/toast-store", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

// Mock stores
const mockSelectSkill = vi.fn();
const mockFetchSkills = vi.fn();
const mockSetPreviewOpen = vi.fn();

vi.mock("../../../../src/stores/skill-store", () => ({
  useSkillStore: vi.fn(() => ({
    selectedSkillId: "skill-1",
    fetchSkills: mockFetchSkills,
    selectSkill: mockSelectSkill,
  })),
}));

vi.mock("../../../../src/stores/ui-store", () => ({
  useUIStore: vi.fn(() => ({
    setPreviewOpen: mockSetPreviewOpen,
  })),
}));

// Mock MetadataEditor（避免复杂依赖）
vi.mock("../../../../src/components/skills/MetadataEditor", () => ({
  default: () => <div data-testid="metadata-editor" />,
}));

import SkillPreview from "../../../../src/components/skills/SkillPreview";

const mockSkill = {
  id: "skill-1",
  name: "代码审查",
  description: "自动化代码审查工具",
  filePath: "/Users/alex/skills/code-review.md",
  category: "development",
  type: "skill" as const,
  tags: ["review", "quality"],
  author: "Alex",
  version: "1.0.0",
  lastModified: "2024-06-15T10:00:00.000Z",
  content: "# 代码审查\n\n自动化审查流程。",
};

describe("SkillPreview — 快捷操作（复制路径）(Story 3.1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchSkillById.mockResolvedValue(mockSkill);
    mockFetchSkills.mockResolvedValue(undefined);
  });

  // ─────────────────────────────────────────────
  // 复制路径按钮渲染
  // ─────────────────────────────────────────────
  describe("复制路径按钮渲染", () => {
    it("加载 Skill 后显示'复制文件路径'按钮", async () => {
      render(<SkillPreview />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "复制文件路径" }),
        ).toBeInTheDocument();
      });
    });

    it("复制路径按钮位于标题操作区（顶部）", async () => {
      render(<SkillPreview />);

      await waitFor(() => {
        const copyBtn = screen.getByRole("button", { name: "复制文件路径" });
        // 按钮应在 preview-panel 的头部区域
        const previewPanel = screen.getByTestId("preview-panel");
        expect(previewPanel.contains(copyBtn)).toBe(true);
      });
    });
  });

  // ─────────────────────────────────────────────
  // 复制路径功能
  // ─────────────────────────────────────────────
  describe("复制路径功能", () => {
    it("点击复制按钮后调用 clipboard.writeText 写入文件路径", async () => {
      const user = userEvent.setup();
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      });

      render(<SkillPreview />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "复制文件路径" }),
        ).toBeInTheDocument();
      });

      const copyBtn = screen.getByRole("button", { name: "复制文件路径" });
      await user.click(copyBtn);

      expect(writeTextMock).toHaveBeenCalledWith(mockSkill.filePath);
    });

    it("复制成功后显示成功 toast", async () => {
      const user = userEvent.setup();
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: vi.fn().mockResolvedValue(undefined) },
        writable: true,
        configurable: true,
      });

      render(<SkillPreview />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "复制文件路径" }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: "复制文件路径" }));

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith("路径已复制到剪贴板");
      });
    });

    it("复制成功后按钮 title 属性变为'已复制'", async () => {
      const user = userEvent.setup();
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: vi.fn().mockResolvedValue(undefined) },
        writable: true,
        configurable: true,
      });

      render(<SkillPreview />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "复制文件路径" }),
        ).toBeInTheDocument();
      });

      const copyBtn = screen.getByRole("button", { name: "复制文件路径" });
      await user.click(copyBtn);

      // title 属性在 copied=true 时变为"已复制"
      await waitFor(() => {
        expect(copyBtn).toHaveAttribute("title", "已复制");
      });
    });

    it("clipboard API 失败时显示错误 toast", async () => {
      const user = userEvent.setup();
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: vi.fn().mockRejectedValue(new Error("Permission denied")),
        },
        writable: true,
        configurable: true,
      });

      render(<SkillPreview />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "复制文件路径" }),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: "复制文件路径" }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("复制失败，请手动复制");
      });
    });
  });

  // ─────────────────────────────────────────────
  // 关闭预览按钮（已从 SkillPreview 移除，由外部布局控制）
  // ─────────────────────────────────────────────
  // ─────────────────────────────────────────────
  // 未选中状态
  // ─────────────────────────────────────────────
  describe("未选中状态", () => {
    it("selectedSkillId 为 null 时显示占位提示，不显示复制按钮", async () => {
      const { useSkillStore } =
        await import("../../../../src/stores/skill-store");
      vi.mocked(useSkillStore).mockReturnValue({
        selectedSkillId: null,
        fetchSkills: mockFetchSkills,
        selectSkill: mockSelectSkill,
      } as ReturnType<typeof useSkillStore>);

      render(<SkillPreview />);

      expect(screen.getByText("skillBrowse.previewEmpty")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "复制文件路径" }),
      ).not.toBeInTheDocument();
    });
  });
});
