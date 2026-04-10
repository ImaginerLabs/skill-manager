// ============================================================
// components/skills/SkillGrid.tsx — Skill 卡片网格视图
// ============================================================

import { useSkillSearch } from "../../hooks/useSkillSearch";
import { useSkillStore } from "../../stores/skill-store";
import EmptyState from "./EmptyState";
import SkillCard from "./SkillCard";

/**
 * Skill 卡片网格 — 根据分类筛选和搜索条件展示 Skill 卡片
 */
export default function SkillGrid() {
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

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
      {filteredSkills.map((skill) => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </div>
  );
}
