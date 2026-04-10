// ============================================================
// components/skills/SkillCard.tsx — Skill 卡片组件
// ============================================================

import { FileText, GitBranch } from "lucide-react";
import type { SkillMeta } from "../../../shared/types";
import { useSkillStore } from "../../stores/skill-store";

interface SkillCardProps {
  skill: SkillMeta;
}

/**
 * Skill 卡片 — 展示名称、描述（截断 2 行）、分类标签、类型标识
 * 支持 hover/selected/focused 三种交互状态
 */
export default function SkillCard({ skill }: SkillCardProps) {
  const { selectedSkillId, selectSkill } = useSkillStore();
  const isSelected = selectedSkillId === skill.id;

  return (
    <button
      onClick={() => selectSkill(skill.id)}
      className={`group w-full text-left rounded-lg border p-4 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[hsl(var(--primary))] ${
        isSelected
          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))/0.08] shadow-[0_0_0_1px_hsl(var(--primary))]"
          : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--muted))] hover:bg-[hsl(var(--surface-elevated))]"
      }`}
    >
      {/* 标题行 */}
      <div className="flex items-start gap-2 mb-2">
        {skill.type === "workflow" ? (
          <GitBranch
            size={16}
            className="mt-0.5 shrink-0 text-[hsl(var(--info))]"
          />
        ) : (
          <FileText
            size={16}
            className="mt-0.5 shrink-0 text-[hsl(var(--primary))]"
          />
        )}
        <h3 className="font-medium text-sm text-[hsl(var(--foreground))] leading-tight line-clamp-1">
          {skill.name}
        </h3>
      </div>

      {/* 描述（截断 2 行） */}
      <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 mb-3 min-h-[2.5em]">
        {skill.description || "暂无描述"}
      </p>

      {/* 底部标签 */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* 分类标签 */}
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[hsl(var(--primary))/0.12] text-[hsl(var(--primary))]">
          {skill.category}
        </span>

        {/* 类型标识 */}
        {skill.type === "workflow" && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[hsl(var(--info))/0.12] text-[hsl(var(--info))]">
            工作流
          </span>
        )}

        {/* 标签 */}
        {skill.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-[hsl(var(--surface-elevated))] text-[hsl(var(--muted-foreground))]"
          >
            {tag}
          </span>
        ))}
        {skill.tags.length > 2 && (
          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
            +{skill.tags.length - 2}
          </span>
        )}
      </div>
    </button>
  );
}
