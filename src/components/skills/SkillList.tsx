// ============================================================
// components/skills/SkillList.tsx — Skill 列表视图（紧凑单行）
// ============================================================

import { FileText, GitBranch } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SkillMeta } from "../../../shared/types";
import { useSkillStore } from "../../stores/skill-store";
import { Badge } from "../ui/badge";

interface SkillListItemProps {
  skill: SkillMeta;
}

/** 单行列表项 */
function SkillListItem({ skill }: SkillListItemProps) {
  const { selectedSkillId, selectSkill } = useSkillStore();
  const { t } = useTranslation();
  const isSelected = selectedSkillId === skill.id;

  return (
    <button
      onClick={() => selectSkill(skill.id)}
      className={`flex items-center gap-3 w-full px-3 py-2 text-left rounded-md transition-colors duration-200 cursor-pointer ${
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
        {skill.name}
      </span>

      {/* 描述 */}
      <span className="flex-1 text-xs text-[hsl(var(--muted-foreground))] truncate">
        {skill.description || t("common.noDescription")}
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
}

interface SkillListProps {
  skills: SkillMeta[];
}

/**
 * Skill 列表视图 — 紧凑单行展示
 */
export default function SkillList({ skills }: SkillListProps) {
  return (
    <div data-testid="skill-list" className="flex flex-col gap-1">
      {skills.map((skill) => (
        <SkillListItem key={skill.id} skill={skill} />
      ))}
    </div>
  );
}
