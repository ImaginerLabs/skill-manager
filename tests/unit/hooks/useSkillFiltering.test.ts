// ============================================================
// tests/unit/hooks/useSkillFiltering.test.ts — useSkillFiltering Hook 测试
// ============================================================

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Category, SkillMeta } from "../../../shared/types";

// Mock 底层 Hooks
vi.mock("../../../src/hooks/useFilteredSkills", () => ({
  useFilteredSkills: (
    skills: SkillMeta[],
    categories: Category[],
    selectedCategory: string | null,
    selectedSource: string | null,
  ) => {
    let result = skills;
    if (selectedCategory) {
      result = result.filter((s) => s.category === selectedCategory);
    }
    if (selectedSource) {
      result = result.filter((s) => s.source === selectedSource);
    }
    return result;
  },
}));

vi.mock("../../../src/hooks/useSkillSearch", () => ({
  useSkillSearch: (skills: SkillMeta[], query: string) => {
    if (!query) return skills;
    return skills.filter((s) =>
      s.name.toLowerCase().includes(query.toLowerCase()),
    );
  },
}));

import { useSkillFiltering } from "../../../src/hooks/useSkillFiltering";

const mockSkills: SkillMeta[] = [
  {
    id: "skill-1",
    name: "Code Review",
    description: "Review code",
    category: "coding",
    tags: [],
    filePath: "coding/skill-1.md",
    fileSize: 100,
    lastModified: "2026-01-01",
  },
  {
    id: "skill-2",
    name: "Deploy Script",
    description: "Deploy",
    category: "devops",
    tags: [],
    filePath: "devops/skill-2.md",
    fileSize: 200,
    lastModified: "2026-01-02",
    source: "anthropics/skills",
  },
];

const mockCategories: Category[] = [
  { name: "coding", displayName: "编程", description: "" },
  { name: "devops", displayName: "运维", description: "" },
];

describe("useSkillFiltering", () => {
  it("无筛选条件时返回全部 Skill", () => {
    const { result } = renderHook(() =>
      useSkillFiltering({
        skills: mockSkills,
        categories: mockCategories,
        selectedCategory: null,
        selectedSource: null,
        searchQuery: "",
      }),
    );

    expect(result.current.filteredSkills).toHaveLength(2);
    expect(result.current.isCategoryEmpty).toBe(false);
  });

  it("按分类筛选", () => {
    const { result } = renderHook(() =>
      useSkillFiltering({
        skills: mockSkills,
        categories: mockCategories,
        selectedCategory: "coding",
        selectedSource: null,
        searchQuery: "",
      }),
    );

    expect(result.current.filteredSkills).toHaveLength(1);
    expect(result.current.filteredSkills[0].id).toBe("skill-1");
  });

  it("按来源筛选", () => {
    const { result } = renderHook(() =>
      useSkillFiltering({
        skills: mockSkills,
        categories: mockCategories,
        selectedCategory: null,
        selectedSource: "anthropics/skills",
        searchQuery: "",
      }),
    );

    expect(result.current.filteredSkills).toHaveLength(1);
    expect(result.current.filteredSkills[0].id).toBe("skill-2");
  });

  it("搜索关键词筛选", () => {
    const { result } = renderHook(() =>
      useSkillFiltering({
        skills: mockSkills,
        categories: mockCategories,
        selectedCategory: null,
        selectedSource: null,
        searchQuery: "deploy",
      }),
    );

    expect(result.current.filteredSkills).toHaveLength(1);
    expect(result.current.filteredSkills[0].id).toBe("skill-2");
  });

  it("分类为空时 isCategoryEmpty 为 true", () => {
    const { result } = renderHook(() =>
      useSkillFiltering({
        skills: mockSkills,
        categories: mockCategories,
        selectedCategory: "nonexistent",
        selectedSource: null,
        searchQuery: "",
      }),
    );

    expect(result.current.filteredSkills).toHaveLength(0);
    expect(result.current.isCategoryEmpty).toBe(true);
  });

  it("搜索无结果时 isCategoryEmpty 为 false", () => {
    const { result } = renderHook(() =>
      useSkillFiltering({
        skills: mockSkills,
        categories: mockCategories,
        selectedCategory: null,
        selectedSource: null,
        searchQuery: "nonexistent",
      }),
    );

    expect(result.current.filteredSkills).toHaveLength(0);
    expect(result.current.isCategoryEmpty).toBe(false);
  });
});
