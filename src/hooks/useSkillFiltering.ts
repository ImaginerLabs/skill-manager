// ============================================================
// hooks/useSkillFiltering.ts — 组合式 Hook：筛选 + 搜索 + 空状态
// ============================================================

import { useMemo } from "react";
import type { Category, SkillMeta } from "../../shared/types";
import { useFilteredSkills } from "./useFilteredSkills";
import { useSkillSearch } from "./useSkillSearch";

export interface UseSkillFilteringParams {
  skills: SkillMeta[];
  categories: Category[];
  selectedCategory: string | null;
  selectedSource: string | null;
  searchQuery: string;
}

export interface UseSkillFilteringReturn {
  /** 经过分类/来源筛选 + 模糊搜索后的 Skill 列表 */
  filteredSkills: SkillMeta[];
  /** 是否为"分类本身为空"（非搜索导致的空结果） */
  isCategoryEmpty: boolean;
}

/**
 * useSkillFiltering — 封装筛选 + 搜索 + 空状态判断
 *
 * 组合 `useFilteredSkills` + `useSkillSearch`，并提供 `isCategoryEmpty` 计算。
 */
export function useSkillFiltering({
  skills,
  categories,
  selectedCategory,
  selectedSource,
  searchQuery,
}: UseSkillFilteringParams): UseSkillFilteringReturn {
  const filtered = useFilteredSkills(
    skills,
    categories,
    selectedCategory,
    selectedSource,
  );

  const filteredSkills = useSkillSearch(filtered, searchQuery);

  const isCategoryEmpty = useMemo(
    () =>
      (selectedCategory !== null || selectedSource !== null) &&
      !searchQuery &&
      filtered.length === 0,
    [selectedCategory, selectedSource, searchQuery, filtered.length],
  );

  return { filteredSkills, isCategoryEmpty };
}
