import {
  BookOpen,
  Download,
  FolderOpen,
  GitBranch,
  RefreshCw,
  Settings,
  Wrench,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSkillStore } from "../../stores/skill-store";
import { useUIStore } from "../../stores/ui-store";
import ActivityHeatmap from "../stats/ActivityHeatmap";
import StatsPanel from "../stats/StatsPanel";

/**
 * 左侧边栏 — 导航菜单
 * 活跃状态左侧 2px Run Green 竖线指示器
 *
 * "Skill 库"单独处理：点击时清除分类筛选状态，支持三态视觉：
 *   - 强激活（在 / 且无分类筛选）：左侧绿线 + accent 背景 + primary 文字
 *   - 弱激活/父级态（在 / 且有分类筛选）：无绿线 + accent 背景 + foreground 文字
 *   - 非激活（在其他路由）：无背景 + muted 文字
 *
 * 分类目录树已迁移至 SecondarySidebar（仅在 Skill 库页面显示）
 */
export default function Sidebar() {
  const { sidebarOpen } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const setCategory = useSkillStore((s) => s.setCategory);
  const selectedCategory = useSkillStore((s) => s.selectedCategory);
  const { t } = useTranslation();

  // 导航项在组件内动态生成，以便使用 t() 翻译标签
  const navItems = [
    { to: "/tools", icon: Wrench, label: t("nav.devTools") },
    { to: "/workflow", icon: GitBranch, label: t("nav.workflow") },
    { to: "/sync", icon: RefreshCw, label: t("nav.sync") },
    { to: "/import", icon: Download, label: t("nav.import") },
    { to: "/paths", icon: FolderOpen, label: t("nav.pathConfig") },
    { to: "/settings", icon: Settings, label: t("nav.settings") },
  ];

  // 处理"Skill 库"点击：始终清除分类筛选，若不在 / 则导航过去
  const handleSkillLibraryClick = () => {
    setCategory(null);
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  // 计算"Skill 库"的三态样式
  const isOnSkillPage = location.pathname === "/";
  const hasFilter = selectedCategory !== null;
  const skillLibraryClassName = `flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 cursor-pointer w-full text-left ${
    isOnSkillPage
      ? hasFilter
        ? // 弱激活/父级态：有分类筛选时，无左侧绿线，保留 accent 背景
          "border-l-2 border-transparent bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] font-medium pl-[14px]"
        : // 强激活态：无分类筛选时，左侧绿线 + accent 背景 + primary 文字
          "border-l-2 border-[hsl(var(--primary))] bg-[hsl(var(--accent))] text-[hsl(var(--primary))] font-medium pl-[14px]"
      : // 非激活态
        "border-l-2 border-transparent text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] pl-[14px]"
  }`;

  if (!sidebarOpen) return null;

  return (
    <aside
      data-testid="primary-sidebar"
      className="flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0"
      style={{ width: "var(--sidebar-width)" }}
    >
      {/* 导航菜单 */}
      <nav className="py-2">
        {/* Skill 库：自定义 button，点击时清除分类筛选 */}
        <button
          data-testid="nav-skill-library"
          onClick={handleSkillLibraryClick}
          className={skillLibraryClassName}
        >
          <BookOpen size={18} />
          {t("nav.skillLibrary")}
        </button>

        {/* 其他导航项：标准 NavLink */}
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 cursor-pointer ${
                isActive
                  ? "border-l-2 border-[hsl(var(--primary))] bg-[hsl(var(--accent))] text-[hsl(var(--primary))] font-medium pl-[14px]"
                  : "border-l-2 border-transparent text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] pl-[14px]"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* 分隔线 */}
      <div className="border-t border-[hsl(var(--border))]" />

      {/* 系统统计面板 */}
      <StatsPanel />

      {/* 活跃度热力图 */}
      <ActivityHeatmap />
    </aside>
  );
}
