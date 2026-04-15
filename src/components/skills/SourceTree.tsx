// ============================================================
// components/skills/SourceTree.tsx — 来源列表组件
// 在「按来源」视图中展示来源列表，支持点击筛选（AD-42）
// ============================================================

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSkillStore } from "../../stores/skill-store";
import { Badge } from "../ui/badge";

/** 来源映射 — icon + 显示名称，硬编码 + 回退策略 */
const SOURCE_MAP: Record<string, { icon: string; displayName: string }> = {
  "": { icon: "👤", displayName: "" }, // 我的 Skill（displayName 由 i18n 提供）
  "anthropic-official": { icon: "🏢", displayName: "Anthropic" },
  "awesome-copilot": { icon: "🌟", displayName: "Awesome" },
};

function getSourceIcon(source: string): string {
  return SOURCE_MAP[source]?.icon || "📦"; // 未知来源回退
}

function getSourceDisplayName(source: string): string {
  return SOURCE_MAP[source]?.displayName || source; // 未知来源回退到原始 key
}

interface SourceItem {
  key: string | null; // null = 全部
  name: string;
  count: number;
  icon: string;
}

/**
 * SourceTree — 来源列表组件
 *
 * 从 skills 数组按 source 字段聚合来源数据，纯前端计算（无后端 API）。
 * 复用 CategoryTree 列表项样式。
 * ARIA: role="listbox" + role="option" + aria-label 含数量信息
 */
export default function SourceTree() {
  const { skills, selectedSource, setSource } = useSkillStore();
  const { t } = useTranslation();

  // 从 skills 按 source 字段聚合（useMemo 保证性能，AD-42）
  const sources: SourceItem[] = useMemo(() => {
    const map = new Map<string, number>();
    for (const skill of skills) {
      const key = skill.source || "";
      map.set(key, (map.get(key) || 0) + 1);
    }

    const items: SourceItem[] = [
      // "全部" 选项
      {
        key: null,
        name: t("nav.allSources"),
        count: skills.length,
        icon: "🌐",
      },
    ];

    // 按来源分组
    for (const [key, count] of map.entries()) {
      items.push({
        key,
        name: key ? getSourceDisplayName(key) : t("nav.mySkills"),
        count,
        icon: getSourceIcon(key),
      });
    }

    return items;
  }, [skills, t]);

  return (
    <div
      className="py-2"
      role="listbox"
      aria-label={t("nav.sourceListLabel") ?? "按来源筛选 Skill"}
    >
      {sources.map((source) => {
        const isActive = selectedSource === source.key;
        return (
          <button
            key={source.key ?? "__all__"}
            role="option"
            aria-selected={isActive}
            aria-label={`${source.name}，${source.count} 个 Skill`}
            onClick={() => setSource(source.key)}
            className={`flex items-center gap-2 w-full px-4 py-1.5 text-sm transition-colors duration-200 cursor-pointer ${
              isActive
                ? "border-l-[3px] border-[hsl(var(--primary))] bg-[hsl(var(--accent))] text-[hsl(var(--primary))] font-medium pl-[13px]"
                : "border-l-[3px] border-transparent text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] pl-[13px]"
            }`}
          >
            <span className="text-sm shrink-0">{source.icon}</span>
            <span className="flex-1 text-left truncate">{source.name}</span>
            <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
              {source.count}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
