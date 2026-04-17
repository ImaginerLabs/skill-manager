// ============================================================
// components/shared/Toast.tsx — Toast 容器组件
// ============================================================

import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";
import { type ToastItem, dismissToast, subscribeToasts } from "./toast-store";

// ---- Toast 容器组件 ----
const ICON_MAP = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const COLOR_MAP = {
  success: "text-[hsl(var(--primary))]",
  error: "text-[hsl(var(--destructive))]",
  info: "text-[hsl(var(--info))]",
};

const BG_MAP = {
  success: "border-[hsl(var(--primary))/0.3]",
  error: "border-[hsl(var(--destructive))/0.3]",
  info: "border-[hsl(var(--info))/0.3]",
};

/**
 * Toast 容器 — 屏幕右上角，最大堆叠 3 个
 */
export default function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    return subscribeToasts(setItems);
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[10000] flex flex-col gap-2 max-w-sm"
      role="region"
      aria-label="通知"
      aria-live="polite"
    >
      {items.map((item) => {
        const Icon = ICON_MAP[item.type];
        return (
          <div
            key={item.id}
            className={`flex items-start gap-2 p-3 rounded-lg border bg-[hsl(var(--card))] shadow-lg animate-in slide-in-from-right fade-in duration-200 ${BG_MAP[item.type]}`}
            role="alert"
          >
            <Icon
              size={16}
              className={`shrink-0 mt-0.5 ${COLOR_MAP[item.type]}`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[hsl(var(--foreground))]">
                {item.message}
              </p>
              {item.details && expandedId === item.id && (
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  {item.details}
                </p>
              )}
              {item.details && expandedId !== item.id && (
                <button
                  onClick={() => setExpandedId(item.id)}
                  className="text-xs text-[hsl(var(--primary))] mt-1 hover:underline"
                >
                  查看详情
                </button>
              )}
              {/* 操作按钮（如撤销） */}
              {item.action && (
                <button
                  onClick={item.action.onClick}
                  className="text-xs font-medium text-[hsl(var(--primary))] mt-1.5 px-2 py-0.5 rounded border border-[hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--primary)/0.1)] transition-colors"
                  aria-label={item.action.label}
                >
                  {item.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => dismissToast(item.id)}
              className="shrink-0 p-0.5 rounded text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              aria-label="关闭通知"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
