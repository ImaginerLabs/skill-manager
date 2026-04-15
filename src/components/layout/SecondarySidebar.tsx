// ============================================================
// components/layout/SecondarySidebar.tsx — 二级侧边栏（分类/来源视图切换）
// 仅在 Skill 库页面（路由 /）时由 AppLayout 条件渲染
// ============================================================

import { Layers, Settings } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { useSkillStore } from "../../stores/skill-store";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import CategoryTree from "../skills/CategoryTree";
import SourceTree from "../skills/SourceTree";
import ViewTab, { type ViewMode } from "../skills/ViewTab";

/**
 * 二级侧边栏 — 视图切换 Tab + 分类目录树/来源列表 + 管理分类入口
 *
 * 职责：
 *   - 顶部 ViewTab 切换「按分类」和「按来源」两种浏览维度（AD-41）
 *   - 展示分类目录树（只读筛选导航，不提供编辑能力）
 *   - 底部提供「管理分类」快捷入口，跳转到 /settings
 *
 * 显示条件：由 AppLayout 在 pathname === "/" 时条件渲染
 */
export default function SecondarySidebar() {
  const { t } = useTranslation();
  const { setCategory, setSource } = useSkillStore();
  const [activeView, setActiveView] = useState<ViewMode>("category");

  // Tab 切换时清除当前维度的筛选状态（FR-V2-4）
  const handleViewChange = useCallback(
    (view: ViewMode) => {
      setActiveView(view);
      if (view === "category") {
        setSource(null); // 切到分类时清除来源筛选
      } else {
        setCategory(null); // 切到来源时清除分类筛选
      }
    },
    [setCategory, setSource],
  );
  return (
    <aside
      data-testid="secondary-sidebar"
      className="flex flex-col border-l border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0"
      style={{ width: "var(--secondary-sidebar-width)" }}
    >
      {/* 标题栏 */}
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-[hsl(var(--border))]">
        <Layers size={14} className="text-[hsl(var(--primary))] shrink-0" />
        <span className="text-xs font-semibold text-[hsl(var(--foreground))] uppercase tracking-wider">
          {t("nav.categories")}
        </span>
      </div>

      {/* 视图切换 Tab（AD-41） */}
      <ViewTab activeView={activeView} onViewChange={handleViewChange} />

      {/* 视图内容区域 */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden"
        role="tabpanel"
        id={`panel-${activeView}`}
        aria-labelledby={`tab-${activeView}`}
      >
        <ErrorBoundary
          fallback={
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {t("nav.categories")} {t("common.loadFailed", "加载失败")}
              </p>
            </div>
          }
        >
          {activeView === "category" ? <CategoryTree /> : <SourceTree />}
        </ErrorBoundary>
      </div>

      {/* 底部管理分类入口 */}
      <div className="border-t border-[hsl(var(--border))] p-2">
        <NavLink
          to="/settings"
          data-testid="secondary-sidebar-manage-link"
          className={({ isActive }) =>
            `flex items-center gap-2 w-full px-3 py-2 text-xs rounded-md transition-colors duration-200 ${
              isActive
                ? "text-[hsl(var(--primary))] bg-[hsl(var(--accent))]"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]"
            }`
          }
        >
          <Settings size={13} />
          <span>{t("nav.manageCategories")}</span>
        </NavLink>
      </div>
    </aside>
  );
}
