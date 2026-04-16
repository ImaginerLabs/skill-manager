// ============================================================
// components/skills/SkillList.tsx — Skill 列表视图（紧凑单行）
// ============================================================

import { FileText, GitBranch } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SkillMeta } from "../../../shared/types";
import { useSkillStore } from "../../stores/skill-store";
import HighlightText from "../shared/HighlightText";
import { Badge } from "../ui/badge";
import SkillContextMenu from "./SkillContextMenu";

interface SkillListItemProps {
  skill: SkillMeta;
  /** Roving focus props */
  rovingProps?: {
    tabIndex: number;
    "data-focused": boolean;
    "aria-current": "true" | undefined;
    ref: (el: HTMLElement | null) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  onDelete?: () => void;
}

/** 单行列表项 */
function SkillListItem({ skill, rovingProps, onDelete }: SkillListItemProps) {
  const { selectedSkillId, selectSkill, searchQuery } = useSkillStore();
  const { t } = useTranslation();
  const isSelected = selectedSkillId === skill.id;
  const isFocused = rovingProps?.["data-focused"] ?? false;

  const item = (
    <button
      ref={rovingProps?.ref}
      tabIndex={rovingProps?.tabIndex}
      aria-current={rovingProps?.["aria-current"]}
      onClick={() => selectSkill(skill.id)}
      onKeyDown={rovingProps?.onKeyDown}
      className={`flex items-center gap-3 w-full px-3 py-2 text-left rounded-md transition-colors duration-200 cursor-pointer ${
        isFocused
          ? "ring-2 ring-[hsl(var(--primary))] ring-offset-1 ring-offset-[hsl(var(--background))]"
          : ""
      } ${
        isSelected
          ? "bg-[hsl(var(--primary))/0.08] border border-[hsl(var(--primary))]"
          : "hover:bg-[hsl(var(--accent))] border border-transparent"
      }`}
    >
      {/* 图标 */}
      {skill.type === "workflow" ? (
        <GitBranch size={14} className="shrink-0 text-[hsl(var(--info))]" />
      ) : (
        <FileText size={14} className="shrink-0 text-[hsl(var(--primary))]" />
      )}

      {/* 名称 */}
      <span className="text-sm font-medium text-[hsl(var(--foreground))] truncate min-w-[120px] max-w-[200px]">
        <HighlightText text={skill.name} query={searchQuery} />
      </span>

      {/* 描述 */}
      <span className="flex-1 text-xs text-[hsl(var(--muted-foreground))] truncate">
        <HighlightText
          text={skill.description || t("common.noDescription")}
          query={searchQuery}
        />
      </span>

      {/* 分类 */}
      <Badge variant="default" className="h-5 px-1.5 text-[10px] shrink-0">
        {skill.category}
      </Badge>

      {/* 标签数量 */}
      {skill.tags.length > 0 && (
        <Badge variant="outline" className="h-5 px-1.5 text-[10px] shrink-0">
          {t("skillList.tagCount", { count: skill.tags.length })}
        </Badge>
      )}
    </button>
  );

  return (
    <SkillContextMenu
      skillId={skill.id}
      skillName={skill.name}
      skillPath={`${skill.category}/${skill.id}.md`}
      isReadonly={skill.readonly ?? false}
      onDelete={onDelete}
    >
      {item}
    </SkillContextMenu>
  );
}

interface SkillListProps {
  skills: SkillMeta[];
  /** 获取每个项的 roving focus props */
  getItemProps?: (index: number) => {
    tabIndex: number;
    "data-focused": boolean;
    "aria-current": "true" | undefined;
    ref: (el: HTMLElement | null) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  /** 删除回调 */
  onDeleteSkill?: (skill: SkillMeta) => void;
}

/**
 * Skill 列表视图 — 紧凑单行展示
 */
export default function SkillList({
  skills,
  getItemProps,
  onDeleteSkill,
}: SkillListProps) {
  return (
    <div data-testid="skill-list" className="flex flex-col gap-1" role="list">
      {skills.map((skill, index) => (
        <SkillListItem
          key={skill.id}
          skill={skill}
          rovingProps={getItemProps?.(index)}
          onDelete={
            skill.readonly
              ? undefined
              : onDeleteSkill
                ? () => onDeleteSkill(skill)
                : undefined
          }
        />
      ))}
    </div>
  );
}
