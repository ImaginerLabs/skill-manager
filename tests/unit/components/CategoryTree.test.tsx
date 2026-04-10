import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CategoryTree from "../../../src/components/skills/CategoryTree";
import { useSkillStore } from "../../../src/stores/skill-store";

// Mock skill-store
vi.mock("../../../src/stores/skill-store", () => ({
  useSkillStore: vi.fn(),
}));

const mockSetCategory = vi.fn();

const mockCategories = [
  { name: "coding", displayName: "编程开发", skillCount: 5 },
  { name: "writing", displayName: "文档写作", skillCount: 3 },
  { name: "devops", displayName: "DevOps", skillCount: 0 },
];

const mockSkills = Array.from({ length: 8 }, (_, i) => ({
  id: `skill-${i}`,
  name: `Skill ${i}`,
}));

function setupStore(overrides: Record<string, unknown> = {}) {
  vi.mocked(useSkillStore).mockReturnValue({
    categories: mockCategories,
    selectedCategory: null,
    setCategory: mockSetCategory,
    skills: mockSkills,
    ...overrides,
  } as any);
}

describe("CategoryTree", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupStore();
  });

  describe("渲染", () => {
    it("渲染分类标题", () => {
      render(<CategoryTree />);
      expect(screen.getByText("分类")).toBeInTheDocument();
    });

    it("渲染「全部」选项并显示总数", () => {
      render(<CategoryTree />);
      expect(screen.getByText("全部")).toBeInTheDocument();
      expect(screen.getByText("8")).toBeInTheDocument();
    });

    it("渲染所有分类及其 skillCount", () => {
      render(<CategoryTree />);
      expect(screen.getByText("编程开发")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("文档写作")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("DevOps")).toBeInTheDocument();
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("无分类时显示提示文本", () => {
      setupStore({ categories: [] });
      render(<CategoryTree />);
      expect(screen.getByText("暂无分类，请先导入 Skill")).toBeInTheDocument();
    });
  });

  describe("交互", () => {
    it("点击「全部」调用 setCategory(null)", () => {
      render(<CategoryTree />);
      fireEvent.click(screen.getByText("全部"));
      expect(mockSetCategory).toHaveBeenCalledWith(null);
    });

    it("点击分类调用 setCategory(name)", () => {
      render(<CategoryTree />);
      fireEvent.click(screen.getByText("编程开发"));
      expect(mockSetCategory).toHaveBeenCalledWith("coding");
    });

    it("点击不同分类传递正确的 name", () => {
      render(<CategoryTree />);
      fireEvent.click(screen.getByText("文档写作"));
      expect(mockSetCategory).toHaveBeenCalledWith("writing");
    });
  });

  describe("选中状态", () => {
    it("selectedCategory 为 null 时「全部」高亮", () => {
      setupStore({ selectedCategory: null });
      render(<CategoryTree />);
      const allButton = screen.getByText("全部").closest("button");
      expect(allButton?.className).toContain("font-medium");
    });

    it("selectedCategory 匹配时对应分类高亮", () => {
      setupStore({ selectedCategory: "coding" });
      render(<CategoryTree />);
      const codingButton = screen.getByText("编程开发").closest("button");
      expect(codingButton?.className).toContain("font-medium");
    });
  });
});
