// ============================================================
// components/shared/SidebarItem.tsx — 侧边栏列表项组件
// ============================================================

import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const sidebarItemVariants = cva(
  "flex items-center gap-2 w-full px-4 py-1.5 text-sm transition-colors duration-200 cursor-pointer border-l-[3px]",
  {
    variants: {
      active: {
        true: "border-[hsl(var(--primary))] bg-[hsl(var(--accent))] text-[hsl(var(--primary))] font-semibold pl-[13px]",
        false:
          "border-transparent text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] pl-[13px]",
      },
      state: {
        default: "",
        disabled: "opacity-50 cursor-not-allowed pointer-events-none",
      },
    },
    defaultVariants: {
      active: false,
      state: "default",
    },
  },
);

export interface SidebarItemProps {
  /** 是否选中 */
  active?: boolean;
  /** 状态 */
  state?: "default" | "disabled";
  /** 左侧图标 */
  icon?: React.ReactNode;
  /** 标签文本 */
  label: React.ReactNode;
  /** 右侧角标 */
  badge?: React.ReactNode;
  /** 点击回调 */
  onClick?: () => void;
  /** 额外 CSS class */
  className?: string;
  /** data-testid */
  "data-testid"?: string;
  /** ARIA 属性 */
  role?: string;
  "aria-selected"?: boolean;
  "aria-label"?: string;
}

/**
 * SidebarItem — 侧边栏列表项
 *
 * - `active=true`：border-l 3px primary + accent 背景 + font-semibold
 * - `active=false`：border-transparent + hover 变化
 * - `state="disabled"`：opacity-50 + pointer-events-none
 */
export default function SidebarItem({
  active = false,
  state = "default",
  icon,
  label,
  badge,
  onClick,
  className,
  "data-testid": testId,
  role,
  "aria-selected": ariaSelected,
  "aria-label": ariaLabel,
}: SidebarItemProps) {
  return (
    <button
      data-testid={testId}
      role={role}
      aria-selected={ariaSelected}
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(sidebarItemVariants({ active, state }), className)}
    >
      {icon}
      <span className="flex-1 text-left truncate">{label}</span>
      {badge}
    </button>
  );
}
