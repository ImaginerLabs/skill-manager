// ============================================================
// components/skills/SkillListView.tsx — Skill 列表视图（含筛选逻辑）
// ============================================================

import { useFilteredSkills } from "../../hooks/useFilteredSkills";
import { useSkillSearch } from "../../hooks/useSkillSearch";
import { useSkillStore } from "../../stores/skill-store";
import EmptyState from "./EmptyState";
import SkillList from "./SkillList";

/**
 * Skill 列表视图 — 根据分类筛选和搜索条件展示 Skill 列表
 */
export default function SkillListView() {
  const { skills, categories, selectedCategory, selectedSource, searchQuery } =
    useSkillStore();

  // 按分类或来源筛选（互斥，AD-41；支持"未分类"虚拟分类）
  const filtered = useFilteredSkills(
    skills,
    categories,
    selectedCategory,
    selectedSource,
  );

  // 再用 Fuse.js 模糊搜索
  const filteredSkills = useSkillSearch(filtered, searchQuery);

  // 判断是否为"分类本身为空"（非搜索导致的空结果）
  const isCategoryEmpty =
    (selectedCategory !== null || selectedSource !== null) &&
    !searchQuery &&
    filtered.length === 0;

  if (filteredSkills.length === 0) {
    return (
      <EmptyState
        hasSkills={skills.length > 0}
        isCategoryEmpty={isCategoryEmpty}
      />
    );
  }

  return <SkillList skills={filteredSkills} />;
}
