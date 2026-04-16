// ============================================================
// components/shared/SkillTypeIcon.tsx — Skill 类型图标组件
// ============================================================

import { FileText, GitBranch } from "lucide-react";
import type { SkillMeta } from "../../../shared/types";

export interface SkillTypeIconProps {
  /** Skill 类型 */
  type: SkillMeta["type"];
  /** 图标尺寸（默认 16） */
  size?: number;
  /** 额外 CSS class */
  className?: string;
}

/**
 * SkillTypeIcon — 根据类型渲染对应的图标
 *
 * - `type === "workflow"` → GitBranch 图标
 * - 其他 → FileText 图标
 * - 统一使用 muted-foreground 色（弱化图标，让名称成为视觉焦点）
 */
export default function SkillTypeIcon({
  type,
  size = 16,
  className,
}: SkillTypeIconProps) {
  if (type === "workflow") {
    return (
      <GitBranch
        size={size}
        className={`shrink-0 text-[hsl(var(--muted-foreground))]${className ? ` ${className}` : ""}`}
      />
    );
  }

  return (
    <FileText
      size={size}
      className={`shrink-0 text-[hsl(var(--muted-foreground))]${className ? ` ${className}` : ""}`}
    />
  );
}
