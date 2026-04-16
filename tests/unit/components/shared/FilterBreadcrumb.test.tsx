// ============================================================
// tests/unit/components/shared/FilterBreadcrumb.test.tsx — 面包屑导航组件测试（Story 9.5, AD-46）
// ============================================================

import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ── Mock react-i18next ──
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      const map: Record<string, string> = {
        "skillBrowse.breadcrumbAll": "全部",
        "skillBrowse.breadcrumbSource": `来源: ${params?.source ?? ""}`,
        "skillBrowse.breadcrumbClearFilter": "清除筛选",
        "skillBrowse.breadcrumbNavLabel": "筛选路径",
      };
      return map[key] ?? key;
    },
    i18n: { language: "zh", changeLanguage: vi.fn() },
  }),
}));

// ── Mock skill-store ──
const mockSetCategory = vi.fn();
const mockSetSource = vi.fn();

const mockStoreState = {
  selectedCategory: null as string | null,
  selectedSource: null as string | null,
  categories: [] as Array<{ name: string; displayName: string }>,
  setCategory: mockSetCategory,
  setSource: mockSetSource,
};

vi.mock("@/stores/skill-store", () => ({
  useSkillStore: vi.fn(() => mockStoreState),
}));

import FilterBreadcrumb from "@/components/shared/FilterBreadcrumb";

function renderBreadcrumb() {
  return render(
    <MemoryRouter>
      <FilterBreadcrumb />
    </MemoryRouter>,
  );
}

describe("FilterBreadcrumb", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState.selectedCategory = null;
    mockStoreState.selectedSource = null;
    mockStoreState.categories = [
      { name: "coding", displayName: "Coding" },
      { name: "writing", displayName: "Writing" },
    ];
  });

  describe("渲染条件", () => {
    it("无筛选条件时不渲染", () => {
      const { container } = renderBreadcrumb();
      expect(container.firstChild).toBeNull();
    });

    it("选中分类时渲染面包屑", () => {
      mockStoreState.selectedCategory = "coding";
      renderBreadcrumb();

      expect(screen.getByTestId("filter-breadcrumb")).toBeInTheDocument();
    });

    it("选中来源时渲染面包屑", () => {
      mockStoreState.selectedSource = "local";
      renderBreadcrumb();

      expect(screen.getByTestId("filter-breadcrumb")).toBeInTheDocument();
    });
  });

  describe("面包屑内容", () => {
    it("分类筛选显示「全部 > 分类名」", () => {
      mockStoreState.selectedCategory = "coding";
      renderBreadcrumb();

      expect(screen.getByText("全部")).toBeInTheDocument();
      expect(screen.getByText("Coding")).toBeInTheDocument();
    });

    it("来源筛选显示「全部 > 来源: xxx」", () => {
      mockStoreState.selectedSource = "local";
      renderBreadcrumb();

      expect(screen.getByText("全部")).toBeInTheDocument();
      expect(screen.getByText("来源: local")).toBeInTheDocument();
    });

    it("分类+来源同时选中显示三层级「全部 > 分类名 > 来源: xxx」", () => {
      mockStoreState.selectedCategory = "coding";
      mockStoreState.selectedSource = "local";
      renderBreadcrumb();

      expect(screen.getByText("全部")).toBeInTheDocument();
      expect(screen.getByText("Coding")).toBeInTheDocument();
      expect(screen.getByText("来源: local")).toBeInTheDocument();
    });

    it("使用 displayName 展示分类名", () => {
      mockStoreState.selectedCategory = "coding";
      renderBreadcrumb();

      // displayName = "Coding"，不是 name = "coding"
      expect(screen.getByText("Coding")).toBeInTheDocument();
    });

    it("无 displayName 时回退到 name", () => {
      mockStoreState.categories = [];
      mockStoreState.selectedCategory = "coding";
      renderBreadcrumb();

      expect(screen.getByText("coding")).toBeInTheDocument();
    });
  });

  describe("点击交互", () => {
    it("点击「全部」清除分类筛选", () => {
      mockStoreState.selectedCategory = "coding";
      renderBreadcrumb();

      fireEvent.click(screen.getByText("全部"));
      expect(mockSetCategory).toHaveBeenCalledWith(null);
    });

    it("仅分类选中时，点击分类层级清除分类", () => {
      mockStoreState.selectedCategory = "coding";
      renderBreadcrumb();

      // 分类是当前层级（isCurrent=true），不可点击，通过清除按钮
      const codingEl = screen.getByText("Coding");
      expect(codingEl.tagName).toBe("SPAN");
    });

    it("分类+来源同时选中时，点击分类层级仅清除来源", () => {
      mockStoreState.selectedCategory = "coding";
      mockStoreState.selectedSource = "local";
      renderBreadcrumb();

      // 分类层级此时 isCurrent=false，是可点击的 button
      const codingButton = screen.getByText("Coding");
      expect(codingButton.tagName).toBe("BUTTON");
      fireEvent.click(codingButton);
      expect(mockSetSource).toHaveBeenCalledWith(null);
      expect(mockSetCategory).not.toHaveBeenCalled();
    });

    it("分类+来源同时选中时，来源项为当前层级（span 不可点击）", () => {
      mockStoreState.selectedCategory = "coding";
      mockStoreState.selectedSource = "local";
      renderBreadcrumb();

      const sourceEl = screen.getByText("来源: local");
      expect(sourceEl.tagName).toBe("SPAN");
    });

    it("仅来源选中时，来源为当前层级不可点击", () => {
      mockStoreState.selectedSource = "local";
      renderBreadcrumb();

      const currentLevel = screen.getByText("来源: local");
      expect(currentLevel.tagName).toBe("SPAN");
    });

    it("点击清除按钮清除所有筛选", () => {
      mockStoreState.selectedCategory = "coding";
      mockStoreState.selectedSource = "local";
      renderBreadcrumb();

      fireEvent.click(screen.getByTestId("breadcrumb-clear"));
      expect(mockSetCategory).toHaveBeenCalledWith(null);
      expect(mockSetSource).toHaveBeenCalledWith(null);
    });

    it("仅分类选中时，点击清除按钮清除分类", () => {
      mockStoreState.selectedCategory = "coding";
      renderBreadcrumb();

      fireEvent.click(screen.getByTestId("breadcrumb-clear"));
      expect(mockSetCategory).toHaveBeenCalledWith(null);
    });
  });

  describe("样式", () => {
    it("可点击的面包屑项有 cursor-pointer 样式", () => {
      mockStoreState.selectedCategory = "coding";
      renderBreadcrumb();

      const allButton = screen.getByText("全部");
      expect(allButton.className).toContain("cursor-pointer");
    });

    it("当前层级有 font-medium 样式", () => {
      mockStoreState.selectedCategory = "coding";
      renderBreadcrumb();

      const currentLevel = screen.getByText("Coding");
      expect(currentLevel.className).toContain("font-medium");
    });

    it("当前层级使用 text-slate-200 样式", () => {
      mockStoreState.selectedCategory = "coding";
      renderBreadcrumb();

      const currentLevel = screen.getByText("Coding");
      expect(currentLevel.className).toContain("text-slate-200");
    });

    it("可点击项使用 text-slate-400 hover:text-green-400 样式", () => {
      mockStoreState.selectedCategory = "coding";
      renderBreadcrumb();

      const allButton = screen.getByText("全部");
      expect(allButton.className).toContain("text-slate-400");
      expect(allButton.className).toContain("hover:text-green-400");
    });

    it("三层级时，中间分类层级为可点击按钮样式", () => {
      mockStoreState.selectedCategory = "coding";
      mockStoreState.selectedSource = "local";
      renderBreadcrumb();

      const codingButton = screen.getByText("Coding");
      expect(codingButton.tagName).toBe("BUTTON");
      expect(codingButton.className).toContain("cursor-pointer");
    });
  });

  describe("无障碍", () => {
    it("nav 元素 aria-label 为「筛选路径」", () => {
      mockStoreState.selectedCategory = "coding";
      renderBreadcrumb();

      const nav = screen.getByTestId("filter-breadcrumb");
      expect(nav).toHaveAttribute("aria-label", "筛选路径");
    });

    it("清除按钮有 aria-label", () => {
      mockStoreState.selectedCategory = "coding";
      renderBreadcrumb();

      const clearBtn = screen.getByTestId("breadcrumb-clear");
      expect(clearBtn).toHaveAttribute("aria-label", "清除筛选");
    });
  });
});
