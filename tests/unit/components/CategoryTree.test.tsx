import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CategoryTree from "../../../src/components/skills/CategoryTree";
import { useSkillStore } from "../../../src/stores/skill-store";

// Mock react-i18next
vi.mock("react-i18next", async () => {
  const { zh } = await import("../../../src/i18n/locales/zh");
  function resolve(key: string, obj: Record<string, unknown>): string {
    const parts = key.split(".");
    let cur: unknown = obj;
    for (const p of parts) {
      if (cur && typeof cur === "object" && p in cur)
        cur = (cur as Record<string, unknown>)[p];
      else return key;
    }
    return typeof cur === "string" ? cur : key;
  }
  return {
    useTranslation: () => ({
      t: (key: string, params?: Record<string, unknown>) => {
        let text = resolve(key, zh as unknown as Record<string, unknown>);
        if (params) {
          for (const [k, v] of Object.entries(params)) {
            text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v));
          }
        }
        return text;
      },
      i18n: { language: "zh", changeLanguage: vi.fn() },
    }),
  };
});

// Mock react-router-dom
const mockNavigate = vi.fn();
let mockPathname = "/";

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: mockPathname }),
}));

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
    mockPathname = "/";
    setupStore();
  });

  describe("渲染", () => {
    it("渲染分类标题", () => {
      render(<CategoryTree />);
      expect(screen.getByText("分类")).toBeInTheDocument();
    });

    it("渲染「全部」选项并显示总数", () => {
      render(<CategoryTree />);
      expect(screen.getByText("按分类")).toBeInTheDocument();
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
      expect(screen.getByText("暂无分类")).toBeInTheDocument();
    });
  });

  describe("交互", () => {
    it("点击「全部」调用 setCategory(null)", () => {
      render(<CategoryTree />);
      fireEvent.click(screen.getByText("按分类"));
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
      const allButton = screen.getByText("按分类").closest("button");
      expect(allButton?.className).toContain("font-semibold");
    });

    it("selectedCategory 匹配时对应分类高亮", () => {
      setupStore({ selectedCategory: "coding" });
      render(<CategoryTree />);
      const codingButton = screen.getByText("编程开发").closest("button");
      expect(codingButton?.className).toContain("font-semibold");
    });
  });
});
