// ============================================================
// hooks/useSkillSearch.ts — Fuse.js 模糊搜索封装
// ============================================================

import Fuse from "fuse.js";
import { useMemo } from "react";
import type { SkillMeta } from "../../shared/types";

/** Fuse.js 搜索配置 */
const FUSE_OPTIONS: Fuse.IFuseOptions<SkillMeta> = {
  keys: [
    { name: "name", weight: 0.4 },
    { name: "description", weight: 0.3 },
    { name: "tags", weight: 0.2 },
    { name: "category", weight: 0.1 },
  ],
  threshold: 0.4, // 模糊度（0 = 精确匹配，1 = 匹配所有）
  includeScore: true,
  minMatchCharLength: 1,
};

/**
 * Fuse.js 模糊搜索 Hook
 * @param skills - Skill 列表
 * @param query - 搜索关键词
 * @returns 搜索结果（按相关度排序）
 */
export function useSkillSearch(
  skills: SkillMeta[],
  query: string,
): SkillMeta[] {
  const fuse = useMemo(() => new Fuse(skills, FUSE_OPTIONS), [skills]);

  return useMemo(() => {
    if (!query.trim()) return skills;

    // 多关键词 AND 逻辑：使用 Fuse.js 的 extended search
    const keywords = query.trim().split(/\s+/).filter(Boolean);

    if (keywords.length === 1) {
      return fuse.search(keywords[0]).map((result) => result.item);
    }

    // 多关键词：逐个搜索取交集
    let resultIds: Set<string> | null = null;
    const itemMap = new Map<string, SkillMeta>();

    for (const keyword of keywords) {
      const results = fuse.search(keyword);
      const ids = new Set(results.map((r) => r.item.id));

      for (const r of results) {
        itemMap.set(r.item.id, r.item);
      }

      if (resultIds === null) {
        resultIds = ids;
      } else {
        resultIds = new Set([...resultIds].filter((id) => ids.has(id)));
      }
    }

    return resultIds
      ? [...resultIds].map((id) => itemMap.get(id)!).filter(Boolean)
      : [];
  }, [fuse, skills, query]);
}
