// ============================================================
// components/skills/ViewTab.tsx — 二级 Sidebar 视图切换 Tab
// 在「按分类」和「按来源」两种浏览维度间切换（AD-41, UX-DR3）
// ============================================================

import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";

export type ViewMode = "category" | "source";

interface ViewTabProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

/**
 * ViewTab — SecondarySidebar 顶部的视图切换 Tab
 *
 * ARIA: role="tablist" + role="tab" + aria-selected + Arrow Left/Right
 * 样式: 选中态底边框 2px solid #22C55E（Run Green）
 */
export default function ViewTab({ activeView, onViewChange }: ViewTabProps) {
  const { t } = useTranslation();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const tabs: { key: ViewMode; label: string }[] = [
    { key: "category", label: t("nav.byCategory") },
    { key: "source", label: t("nav.bySource") },
  ];

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let nextIndex = -1;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        nextIndex = (index + 1) % tabs.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      }
      if (nextIndex >= 0) {
        tabRefs.current[nextIndex]?.focus();
      }
    },
    [tabs.length],
  );

  return (
    <div
      role="tablist"
      aria-label={t("nav.viewSwitcher") ?? "视图切换"}
      className="flex border-b border-[hsl(var(--border))]"
    >
      {tabs.map((tab, index) => {
        const isActive = activeView === tab.key;
        return (
          <button
            key={tab.key}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.key}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onViewChange(tab.key)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[hsl(var(--primary))] focus-visible:outline-offset-[-2px] ${
              isActive
                ? "text-[hsl(var(--foreground))] border-b-2 border-[hsl(var(--primary))]"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] border-b-2 border-transparent"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
