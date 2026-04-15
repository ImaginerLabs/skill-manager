// ============================================================
// components/skills/SkillGrid.tsx — Skill 卡片网格视图
// ============================================================

import { useFilteredSkills } from "../../hooks/useFilteredSkills";
import { useSkillSearch } from "../../hooks/useSkillSearch";
import { useSkillStore } from "../../stores/skill-store";
import EmptyState from "./EmptyState";
import SkillCard from "./SkillCard";

/**
 * Skill 卡片网格 — 根据分类筛选和搜索条件展示 Skill 卡片
 */
export default function SkillGrid() {
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

  return (
    <div
      data-testid="skill-grid"
      className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4"
    >
      {filteredSkills.map((skill) => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </div>
  );
}
