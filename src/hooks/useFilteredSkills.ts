// ============================================================
// hooks/useFilteredSkills.ts — 统一的 Skill 分类/来源筛选逻辑
// ============================================================

import { useMemo } from "react";
import type { Category, SkillMeta } from "../../shared/types";

/**
 * 根据分类或来源筛选 Skill 列表
 *
 * 特殊处理：当 selectedCategory === "uncategorized" 时，
 * 筛选出所有不属于任何已知分类（categories.yaml 中定义的分类）的 Skill。
 * 后端 getCategories() 会追加虚拟的 "uncategorized" 分类，但 Skill 的 category
 * 字段值是实际的非标准分类名（如 "review"、"understand"），不是 "uncategorized"。
 */
export function useFilteredSkills(
  skills: SkillMeta[],
  categories: Category[],
  selectedCategory: string | null,
  selectedSource: string | null,
): SkillMeta[] {
  return useMemo(() => {
    let filtered = skills;

    if (selectedCategory) {
      if (selectedCategory === "uncategorized") {
        // "未分类"：筛选出不属于任何已知分类的 Skill
        const knownCategories = new Set(
          categories
            .filter((c) => c.name !== "uncategorized")
            .map((c) => c.name.toLowerCase()),
        );
        filtered = filtered.filter(
          (s) => !knownCategories.has(s.category.toLowerCase()),
        );
      } else {
        filtered = filtered.filter(
          (s) => s.category.toLowerCase() === selectedCategory.toLowerCase(),
        );
      }
    }

    if (selectedSource !== null && selectedSource !== undefined) {
      if (selectedSource === "") {
        filtered = filtered.filter((s) => !s.source);
      } else {
        filtered = filtered.filter((s) => s.source === selectedSource);
      }
    }

    return filtered;
  }, [skills, categories, selectedCategory, selectedSource]);
}
