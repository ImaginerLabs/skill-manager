// ============================================================
// components/skills/SkillListView.tsx — Skill 列表视图（含筛选逻辑）
// ============================================================

import { useSkillSearch } from "../../hooks/useSkillSearch";
import { useSkillStore } from "../../stores/skill-store";
import EmptyState from "./EmptyState";
import SkillList from "./SkillList";

/**
 * Skill 列表视图 — 根据分类筛选和搜索条件展示 Skill 列表
 */
export default function SkillListView() {
  const { skills, selectedCategory, searchQuery } = useSkillStore();

  // 先按分类筛选
  const categoryFiltered = selectedCategory
    ? skills.filter((s) => s.category === selectedCategory)
    : skills;

  // 再用 Fuse.js 模糊搜索
  const filteredSkills = useSkillSearch(categoryFiltered, searchQuery);

  if (filteredSkills.length === 0) {
    return <EmptyState hasSkills={skills.length > 0} />;
  }

  return <SkillList skills={filteredSkills} />;
}
