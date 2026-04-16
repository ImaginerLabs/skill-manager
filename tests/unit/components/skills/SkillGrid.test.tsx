// ============================================================
// tests/unit/components/skills/SkillGrid.test.tsx — SkillGrid 过渡动效组件测试（Story 9.5, AD-47）
// ============================================================

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SkillMeta } from "../../../shared/types";

// ── Mock scrollIntoView (jsdom 不支持) ──
Element.prototype.scrollIntoView = vi.fn();

// ── Mock react-i18next ──
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "skillBrowse.title": "Skill 浏览",
        "common.noDescription": "暂无描述",
        "skillList.workflowBadge": "工作流",
        "common.delete": "删除",
        "common.cancel": "取消",
        "metadata.deleteConfirmTitle": "确认删除",
        "metadata.deleteConfirmDesc": "确定要删除吗？",
        "metadata.deleteFailed": "删除失败",
        "toast.workflowDeleted": "已删除",
      };
      return map[key] ?? key;
    },
    i18n: { language: "zh", changeLanguage: vi.fn() },
  }),
}));

// ── Mock skill-store ──
const mockFetchSkills = vi.fn();
const mockSelectSkill = vi.fn();
const mockSetCategory = vi.fn();
const mockSetSource = vi.fn();

const mockStoreState = {
  skills: [] as SkillMeta[],
  categories: [] as Array<{ name: string; displayName: string }>,
  selectedCategory: null as string | null,
  selectedSource: null as string | null,
  searchQuery: "",
  selectedSkillId: null as string | null,
  fetchSkills: mockFetchSkills,
  selectSkill: mockSelectSkill,
  setCategory: mockSetCategory,
  setSource: mockSetSource,
};

vi.mock("@/stores/skill-store", () => ({
  useSkillStore: vi.fn(() => mockStoreState),
}));

// ── Mock ui-store ──
const mockSetPreviewOpen = vi.fn();
vi.mock("@/stores/ui-store", () => ({
  useUIStore: vi.fn(() => ({
    setPreviewOpen: mockSetPreviewOpen,
  })),
}));

// ── Mock toast-store ──
vi.mock("@/components/shared/toast-store", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// ── Mock api ──
vi.mock("@/lib/api", () => ({
  deleteSkill: vi.fn().mockResolvedValue(undefined),
}));

// ── Mock sync-store ──
vi.mock("@/stores/sync-store", () => ({
  useSyncStore: vi.fn(() => ({
    toggleSkillSelection: vi.fn(),
  })),
}));

// ── Mock react-router-dom ──
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  MemoryRouter: ({ children }: { children: React.ReactNode }) => children,
}));

import SkillGrid from "@/components/skills/SkillGrid";

const mockSkills: SkillMeta[] = [
  {
    id: "skill-1",
    name: "React 组件抽取",
    description: "从代码中抽取可复用的 React 组件",
    category: "coding",
    tags: ["react"],
    filePath: "skills/coding/react-component.md",
    fileSize: 1024,
    lastModified: "2024-01-01T00:00:00Z",
  },
  {
    id: "skill-2",
    name: "Code Review",
    description: "自动代码审查",
    category: "review",
    tags: ["review"],
    filePath: "skills/review/code-review.md",
    fileSize: 2048,
    lastModified: "2024-01-02T00:00:00Z",
  },
];

describe("SkillGrid 过渡动效", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState.skills = mockSkills;
    mockStoreState.categories = [
      { name: "coding", displayName: "Coding" },
      { name: "review", displayName: "Review" },
    ];
    mockStoreState.selectedCategory = null;
    mockStoreState.selectedSource = null;
    mockStoreState.searchQuery = "";
    mockStoreState.selectedSkillId = null;
  });

  describe("data-entering 属性", () => {
    it("卡片容器有 skill-grid-item CSS class", () => {
      render(<SkillGrid />);

      const gridItems = document.querySelectorAll(".skill-grid-item");
      expect(gridItems.length).toBeGreaterThan(0);
    });

    it("初始渲染时卡片有 data-entering 属性（触发淡入动画）", () => {
      render(<SkillGrid />);

      // 初始渲染时 entering 状态为 true（useEffect 触发），卡片有 data-entering
      const gridItems = document.querySelectorAll(".skill-grid-item");
      const hasEntering = Array.from(gridItems).some((item) =>
        item.hasAttribute("data-entering"),
      );
      expect(hasEntering).toBe(true);
    });

    it("网格容器有正确的 CSS Grid 布局", () => {
      render(<SkillGrid />);

      const grid = screen.getByTestId("skill-grid");
      expect(grid.className).toContain("grid");
    });

    it("网格容器有 role=grid", () => {
      render(<SkillGrid />);

      const grid = screen.getByTestId("skill-grid");
      expect(grid).toHaveAttribute("role", "grid");
    });

    it("每个 skill-grid-item 包含 SkillCard", () => {
      render(<SkillGrid />);

      const gridItems = document.querySelectorAll(".skill-grid-item");
      expect(gridItems.length).toBe(mockSkills.length);
    });
  });
});
