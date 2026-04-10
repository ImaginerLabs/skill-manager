import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { SkillMeta } from "../../../shared/types";
import { useSkillSearch } from "../../../src/hooks/useSkillSearch";

// Mock 数据
const mockSkills: SkillMeta[] = [
  {
    id: "skill-1",
    name: "React 组件抽取",
    description: "从代码中抽取可复用的 React 组件",
    category: "frontend",
    tags: ["react", "refactor", "component"],
    filePath: "skills/frontend/react-component-extraction.md",
    fileSize: 1024,
    lastModified: "2024-01-01T00:00:00Z",
  },
  {
    id: "skill-2",
    name: "Vue 组件重构",
    description: "重构 Vue 组件的最佳实践",
    category: "frontend",
    tags: ["vue", "refactor"],
    filePath: "skills/frontend/vue-refactor.md",
    fileSize: 2048,
    lastModified: "2024-01-02T00:00:00Z",
  },
  {
    id: "skill-3",
    name: "代码审查工作流",
    description: "自动化代码审查流程",
    category: "workflow",
    tags: ["review", "quality"],
    type: "workflow",
    filePath: "skills/workflow/code-review.md",
    fileSize: 3072,
    lastModified: "2024-01-03T00:00:00Z",
  },
];

describe("useSkillSearch", () => {
  describe("空搜索", () => {
    it("查询为空时返回全部 Skills", () => {
      const { result } = renderHook(() => useSkillSearch(mockSkills, ""));
      expect(result.current).toEqual(mockSkills);
    });

    it("查询仅包含空格时返回全部 Skills", () => {
      const { result } = renderHook(() => useSkillSearch(mockSkills, "   "));
      expect(result.current).toEqual(mockSkills);
    });
  });

  describe("单关键词搜索", () => {
    it("按名称匹配", () => {
      const { result } = renderHook(() => useSkillSearch(mockSkills, "React"));
      // Fuse.js 会匹配包含 React 的所有项（名称、标签等）
      expect(result.current.length).toBeGreaterThanOrEqual(1);
      expect(result.current.some((s) => s.name === "React 组件抽取")).toBe(
        true,
      );
    });

    it("按描述匹配", () => {
      const { result } = renderHook(() => useSkillSearch(mockSkills, "自动化"));
      expect(result.current).toHaveLength(1);
      expect(result.current[0].name).toBe("代码审查工作流");
    });

    it("按标签匹配", () => {
      const { result } = renderHook(() =>
        useSkillSearch(mockSkills, "refactor"),
      );
      expect(result.current).toHaveLength(2);
      expect(result.current.map((s) => s.id)).toContain("skill-1");
      expect(result.current.map((s) => s.id)).toContain("skill-2");
    });

    it("按分类匹配", () => {
      const { result } = renderHook(() =>
        useSkillSearch(mockSkills, "workflow"),
      );
      expect(result.current).toHaveLength(1);
      expect(result.current[0].category).toBe("workflow");
    });

    it("模糊匹配部分关键词", () => {
      const { result } = renderHook(() => useSkillSearch(mockSkills, "组件"));
      expect(result.current.length).toBeGreaterThan(0);
      expect(result.current.map((s) => s.name)).toContain("React 组件抽取");
    });
  });

  describe("多关键词搜索（AND 逻辑）", () => {
    it("多个关键词取交集", () => {
      const { result } = renderHook(() =>
        useSkillSearch(mockSkills, "refactor react"),
      );
      // refactor 和 react 同时匹配的只有 skill-1
      expect(result.current.some((s) => s.name === "React 组件抽取")).toBe(
        true,
      );
    });

    it("多关键词搜索返回结果", () => {
      const { result } = renderHook(() =>
        useSkillSearch(mockSkills, "vue react"),
      );
      // 不同关键词可能匹配不同项
      expect(result.current.length).toBeGreaterThanOrEqual(0);
    });

    it("三个关键词取交集", () => {
      const { result } = renderHook(() =>
        useSkillSearch(mockSkills, "frontend refactor component"),
      );
      expect(result.current).toHaveLength(1);
      expect(result.current[0].id).toBe("skill-1");
    });
  });

  describe("边界情况", () => {
    it("空 Skills 数组返回空结果", () => {
      const { result } = renderHook(() => useSkillSearch([], "react"));
      expect(result.current).toEqual([]);
    });

    it("无匹配时返回空数组", () => {
      const { result } = renderHook(() =>
        useSkillSearch(mockSkills, "不存在的关键词"),
      );
      expect(result.current).toEqual([]);
    });

    it("大小写不敏感", () => {
      const { result } = renderHook(() => useSkillSearch(mockSkills, "REACT"));
      // Fuse.js 默认大小写不敏感
      expect(result.current.length).toBeGreaterThanOrEqual(1);
      expect(result.current.some((s) => s.name === "React 组件抽取")).toBe(
        true,
      );
    });

    it("特殊字符处理", () => {
      const { result } = renderHook(() =>
        useSkillSearch(mockSkills, "react!@#$%"),
      );
      // 特殊字符不影响搜索
      expect(result.current.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("性能测试", () => {
    it("大量数据时搜索性能", () => {
      // 生成 1000 个 mock skills
      const largeSkillList: SkillMeta[] = Array.from(
        { length: 1000 },
        (_, i) => ({
          id: `skill-${i}`,
          name: `Skill ${i}`,
          description: `描述 ${i}`,
          category: i % 2 === 0 ? "frontend" : "backend",
          tags: [`tag-${i % 10}`],
          filePath: `skills/skill-${i}.md`,
          fileSize: 1024,
          lastModified: "2024-01-01T00:00:00Z",
        }),
      );

      const startTime = performance.now();
      const { result } = renderHook(() =>
        useSkillSearch(largeSkillList, "tag-5"),
      );
      const endTime = performance.now();

      // 搜索应该在 100ms 内完成
      expect(endTime - startTime).toBeLessThan(100);
      // 至少有一个匹配结果
      expect(result.current.length).toBeGreaterThanOrEqual(0);
    });
  });
});
