// ============================================================
// components/skills/SkillCard.tsx — Skill 卡片组件
// ============================================================

import { FileText, GitBranch } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SkillMeta } from "../../../shared/types";
import { useSkillStore } from "../../stores/skill-store";
import { Badge } from "../ui/badge";

interface SkillCardProps {
  skill: SkillMeta;
}

/**
 * Skill 卡片 — 展示名称、描述（截断 2 行）、分类标签、类型标识
 * 支持 hover/selected/focused 三种交互状态
 */
export default function SkillCard({ skill }: SkillCardProps) {
  const { selectedSkillId, selectSkill } = useSkillStore();
  const { t } = useTranslation();
  const isSelected = selectedSkillId === skill.id;

  return (
    <button
      data-testid="skill-card"
      onClick={() => selectSkill(skill.id)}
      className={`group w-full text-left rounded-lg border p-4 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[hsl(var(--primary))] ${
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
        <h3
          data-testid="skill-name"
          className="font-medium text-sm text-[hsl(var(--foreground))] leading-tight line-clamp-1"
        >
          {skill.name}
        </h3>
      </div>

      {/* 描述（截断 2 行） */}
      <p
        data-testid="skill-description"
        className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 mb-3 min-h-[2.5em]"
      >
        {skill.description || t("common.noDescription")}
      </p>

      {/* 底部标签 */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* 分类标签 */}
        <Badge
          data-testid="skill-category"
          variant="default"
          className="h-5 px-1.5 text-[10px]"
        >
          {skill.category}
        </Badge>

        {/* 类型标识 */}
        {skill.type === "workflow" && (
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
            {t("skillList.workflowBadge")}
          </Badge>
        )}

        {/* 标签 */}
        {skill.tags.slice(0, 2).map((tag) => (
          <Badge
            data-testid="skill-tag"
            key={tag}
            variant="outline"
            className="h-5 px-1.5 text-[10px]"
          >
            {tag}
          </Badge>
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
