import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../../../src/lib/api";
import { useSkillStore } from "../../../src/stores/skill-store";

// Mock API 模块
vi.mock("../../../src/lib/api", () => ({
  fetchSkills: vi.fn(),
  fetchCategories: vi.fn(),
}));

// Mock 数据
const mockSkills = [
  {
    id: "skill-1",
    name: "React 组件抽取",
    description: "从代码中抽取可复用的 React 组件",
    category: "frontend",
    tags: ["react", "refactor"],
    filePath: "skills/frontend/react-component-extraction.md",
    fileSize: 1024,
    lastModified: "2024-01-01T00:00:00Z",
  },
  {
    id: "skill-2",
    name: "代码审查",
    description: "自动化代码审查工作流",
    category: "workflow",
    tags: ["review", "quality"],
    type: "workflow" as const,
    filePath: "skills/workflow/code-review.md",
    fileSize: 2048,
    lastModified: "2024-01-02T00:00:00Z",
  },
];

const mockCategories = [
  { name: "frontend", displayName: "前端开发", skillCount: 1 },
  { name: "workflow", displayName: "工作流", skillCount: 1 },
];

describe("skill-store", () => {
  beforeEach(() => {
    // 重置 store 到初始状态
    useSkillStore.setState({
      skills: [],
      categories: [],
      selectedCategory: null,
      searchQuery: "",
      selectedSkillId: null,
      viewMode: "grid",
      loading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe("初始状态", () => {
    it("应该有正确的初始值", () => {
      const state = useSkillStore.getState();
      expect(state.skills).toEqual([]);
      expect(state.categories).toEqual([]);
      expect(state.selectedCategory).toBeNull();
      expect(state.searchQuery).toBe("");
      expect(state.selectedSkillId).toBeNull();
      expect(state.viewMode).toBe("grid");
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("fetchSkills", () => {
    it("成功获取 Skill 列表和分类", async () => {
      vi.mocked(api.fetchSkills).mockResolvedValue(mockSkills);
      vi.mocked(api.fetchCategories).mockResolvedValue(mockCategories);

      const { fetchSkills } = useSkillStore.getState();
      await fetchSkills();

      const state = useSkillStore.getState();
      expect(state.skills).toEqual(mockSkills);
      expect(state.categories).toEqual(mockCategories);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("获取失败时设置错误信息", async () => {
      vi.mocked(api.fetchSkills).mockRejectedValue(new Error("网络错误"));

      const { fetchSkills } = useSkillStore.getState();
      await fetchSkills();

      const state = useSkillStore.getState();
      expect(state.skills).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBe("网络错误");
    });

    it("获取时设置 loading 状态", async () => {
      vi.mocked(api.fetchSkills).mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(mockSkills), 100)),
      );
      vi.mocked(api.fetchCategories).mockResolvedValue(mockCategories);

      const { fetchSkills } = useSkillStore.getState();
      const promise = fetchSkills();

      // 立即检查 loading 状态
      expect(useSkillStore.getState().loading).toBe(true);

      await promise;

      expect(useSkillStore.getState().loading).toBe(false);
    });

    it("非 Error 对象的错误使用默认消息", async () => {
      vi.mocked(api.fetchSkills).mockRejectedValue("未知错误");

      const { fetchSkills } = useSkillStore.getState();
      await fetchSkills();

      const state = useSkillStore.getState();
      expect(state.error).toBe("加载 Skill 列表失败");
    });
  });

  describe("setSkills", () => {
    it("设置 Skill 列表", () => {
      const { setSkills } = useSkillStore.getState();
      setSkills(mockSkills);

      expect(useSkillStore.getState().skills).toEqual(mockSkills);
    });
  });

  describe("setCategories", () => {
    it("设置分类列表", () => {
      const { setCategories } = useSkillStore.getState();
      setCategories(mockCategories);

      expect(useSkillStore.getState().categories).toEqual(mockCategories);
    });
  });

  describe("setCategory", () => {
    it("设置选中的分类", () => {
      const { setCategory } = useSkillStore.getState();
      setCategory("frontend");

      expect(useSkillStore.getState().selectedCategory).toBe("frontend");
    });

    it("清除选中的分类", () => {
      useSkillStore.setState({ selectedCategory: "frontend" });

      const { setCategory } = useSkillStore.getState();
      setCategory(null);

      expect(useSkillStore.getState().selectedCategory).toBeNull();
    });
  });

  describe("setSearchQuery", () => {
    it("设置搜索关键词", () => {
      const { setSearchQuery } = useSkillStore.getState();
      setSearchQuery("react");

      expect(useSkillStore.getState().searchQuery).toBe("react");
    });
  });

  describe("selectSkill", () => {
    it("选中的 Skill", () => {
      const { selectSkill } = useSkillStore.getState();
      selectSkill("skill-1");

      expect(useSkillStore.getState().selectedSkillId).toBe("skill-1");
    });

    it("取消选中", () => {
      useSkillStore.setState({ selectedSkillId: "skill-1" });

      const { selectSkill } = useSkillStore.getState();
      selectSkill(null);

      expect(useSkillStore.getState().selectedSkillId).toBeNull();
    });
  });

  describe("setViewMode", () => {
    it("切换到列表视图", () => {
      const { setViewMode } = useSkillStore.getState();
      setViewMode("list");

      expect(useSkillStore.getState().viewMode).toBe("list");
    });

    it("切换到网格视图", () => {
      useSkillStore.setState({ viewMode: "list" });

      const { setViewMode } = useSkillStore.getState();
      setViewMode("grid");

      expect(useSkillStore.getState().viewMode).toBe("grid");
    });
  });
});
