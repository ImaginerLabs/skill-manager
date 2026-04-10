import { NavLink } from "react-router-dom";
import {
  BookOpen,
  GitBranch,
  RefreshCw,
  Download,
  Settings,
} from "lucide-react";

const navItems = [
  { to: "/", icon: BookOpen, label: "Skill 库" },
  { to: "/workflow", icon: GitBranch, label: "工作流" },
  { to: "/sync", icon: RefreshCw, label: "同步" },
  { to: "/import", icon: Download, label: "导入" },
  { to: "/settings", icon: Settings, label: "设置" },
];

/**
 * 左侧边栏 — 导航 + 分类目录树（后续 Story 实现分类树）
 */
export default function Sidebar() {
  return (
    <aside
      className="flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]"
      style={{ width: "var(--sidebar-width)" }}
    >
      {/* Logo / 标题 */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-[hsl(var(--border))]">
        <span className="text-[hsl(var(--primary))] font-bold font-[var(--font-code)] text-lg">
          ⚡ Skill Manager
        </span>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-[hsl(var(--accent))] text-[hsl(var(--primary))] font-medium"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* 底部信息 */}
      <div className="px-4 py-3 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))]">
        v0.1.0
      </div>
    </aside>
  );
}
