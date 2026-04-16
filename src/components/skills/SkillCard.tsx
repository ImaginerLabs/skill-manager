// ============================================================
// components/skills/SkillCard.tsx — Skill 卡片组件
// ============================================================

import { ExternalLink, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SkillMeta } from "../../../shared/types";
import { useSkillStore } from "../../stores/skill-store";
import HighlightText from "../shared/HighlightText";
import SkillTypeIcon from "../shared/SkillTypeIcon";
import { Badge } from "../ui/badge";
import SkillContextMenu from "./SkillContextMenu";

interface SkillCardProps {
  skill: SkillMeta;
  /** Roving focus props（由 useRovingFocus 提供） */
  rovingProps?: {
    tabIndex: number;
    "data-focused": boolean;
    "aria-current": "true" | undefined;
    ref: (el: HTMLElement | null) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  /** 编辑元数据回调 */
  onEditMeta?: () => void;
  /** 删除回调 */
  onDelete?: () => void;
}

/**
 * Skill 卡片 — 展示名称、描述（截断 2 行）、分类标签、类型标识
 * 支持 hover/selected/focused 三种交互状态
 * 外部 Skill 显示来源标签（右上角）和锁图标（左下角）
 */
export default function SkillCard({
  skill,
  rovingProps,
  onEditMeta,
  onDelete,
}: SkillCardProps) {
  const { selectedSkillId, selectSkill, searchQuery } = useSkillStore();
  const { t } = useTranslation();
  const isSelected = selectedSkillId === skill.id;
  const isFocused = rovingProps?.["data-focused"] ?? false;

  const card = (
    <button
      data-testid="skill-card"
      ref={rovingProps?.ref}
      tabIndex={rovingProps?.tabIndex}
      aria-current={rovingProps?.["aria-current"]}
      onClick={() => selectSkill(skill.id)}
      onKeyDown={rovingProps?.onKeyDown}
      className={`group relative w-full text-left rounded-lg border p-4 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[hsl(var(--primary))] ${
        isFocused
          ? "ring-2 ring-[hsl(var(--primary))] ring-offset-1 ring-offset-[hsl(var(--background))]"
          : ""
      } ${
        isSelected
          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))/0.08] shadow-[0_0_0_1px_hsl(var(--primary))]"
          : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--muted))] hover:bg-[hsl(var(--surface-elevated))]"
      }`}
    >
      {/* 来源标签（右上角，仅外部 Skill 显示） */}
      {skill.source && skill.sourceUrl && (
        <a
          data-testid="skill-source-badge"
          href={skill.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))/0.5] hover:bg-[hsl(var(--muted))] transition-colors"
          title={t("skill.viewOnGithub")}
        >
          <ExternalLink size={10} />
          <span className="max-w-[80px] truncate">{skill.source}</span>
        </a>
      )}

      {/* 标题行 */}
      <div
        className={`flex items-start gap-2 mb-2 ${skill.source ? "pr-20" : ""}`}
      >
        <SkillTypeIcon type={skill.type} size={16} className="mt-0.5" />
        <h3
          data-testid="skill-name"
          className="font-medium text-sm text-[hsl(var(--foreground))] leading-tight line-clamp-1"
        >
          <HighlightText text={skill.name} query={searchQuery} />
        </h3>
      </div>

      {/* 描述（截断 2 行） */}
      <p
        data-testid="skill-description"
        className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 mb-3 min-h-[2.5em]"
      >
        <HighlightText
          text={skill.description || t("common.noDescription")}
          query={searchQuery}
        />
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

        {/* 锁图标（左下角，仅只读 Skill 显示） */}
        {skill.readonly && (
          <span
            data-testid="skill-readonly-lock"
            className="ml-auto flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))]"
            title={t("skill.readonlyTooltip")}
          >
            <Lock size={10} />
          </span>
        )}
      </div>
    </button>
  );

  return (
    <SkillContextMenu
      skillId={skill.id}
      skillName={skill.name}
      skillPath={`${skill.category}/${skill.id}.md`}
      isReadonly={skill.readonly ?? false}
      onEditMeta={onEditMeta}
      onDelete={onDelete}
    >
      {card}
    </SkillContextMenu>
  );
}
