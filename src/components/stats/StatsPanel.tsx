// ============================================================
// components/stats/StatsPanel.tsx — 系统统计信息面板
// 展示 Skill 总数、工作流总数、分类总数
// ============================================================

import { BookOpen, GitBranch, Tag } from "lucide-react";
import { useSkillStore } from "../../stores/skill-store";

interface StatItem {
  icon: React.ElementType;
  count: number;
  label: string;
}

/**
 * 系统统计面板 — 展示三项核心统计数字
 * 数据来源：useSkillStore（实时响应 Skill 数据变化）
 */
export default function StatsPanel() {
  const skills = useSkillStore((s) => s.skills);
  const categories = useSkillStore((s) => s.categories);

  const skillCount = skills.filter((sk) => sk.type !== "workflow").length;
  const workflowCount = skills.filter((sk) => sk.type === "workflow").length;
  const categoryCount = categories.length;

  const stats: StatItem[] = [
    { icon: BookOpen, count: skillCount, label: "Skills" },
    { icon: GitBranch, count: workflowCount, label: "工作流" },
    { icon: Tag, count: categoryCount, label: "分类" },
  ];

  return (
    <div className="px-3 py-2" data-testid="stats-panel">
      <div className="grid grid-cols-3 gap-1">
        {stats.map(({ icon: Icon, count, label }) => (
          <div
            key={label}
            className="flex flex-col items-center py-2 rounded-md bg-[hsl(var(--accent)/0.5)]"
          >
            <Icon
              size={12}
              className="text-[hsl(var(--muted-foreground))] mb-1"
            />
            <span
              className="text-sm font-bold text-[hsl(var(--foreground))]"
              data-testid={`stats-count-${label}`}
            >
              {count}
            </span>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
