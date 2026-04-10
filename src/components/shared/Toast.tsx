// ============================================================
// components/shared/Toast.tsx — Toast 通知系统
// ============================================================

import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

// ---- Toast 类型定义 ----

export interface ToastItem {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  details?: string;
  duration?: number;
}

// ---- 全局 Toast 状态管理 ----

type ToastListener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<ToastListener>();
let nextId = 1;

function notifyListeners() {
  for (const listener of listeners) {
    listener([...toasts]);
  }
}

/** 添加 Toast 通知 */
export function toast(
  type: ToastItem["type"],
  message: string,
  options?: { details?: string; duration?: number },
) {
  const id = String(nextId++);
  const item: ToastItem = {
    id,
    type,
    message,
    details: options?.details,
    duration: options?.duration ?? (type === "error" ? 8000 : 4000),
  };

  // 最大堆叠 3 个
  toasts = [...toasts.slice(-2), item];
  notifyListeners();

  // 自动消失
  setTimeout(() => {
    dismissToast(id);
  }, item.duration);
}

/** 关闭 Toast */
export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notifyListeners();
}

/** 快捷方法 */
toast.success = (message: string, options?: { details?: string }) =>
  toast("success", message, options);
toast.error = (message: string, options?: { details?: string }) =>
  toast("error", message, options);
toast.info = (message: string, options?: { details?: string }) =>
  toast("info", message, options);

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
 * Toast 容器 — 渲染在右下角，最大堆叠 3 个
 */
export default function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm"
      role="region"
      aria-label="通知"
      aria-live="polite"
    >
      {items.map((item) => {
        const Icon = ICON_MAP[item.type];
        return (
          <div
            key={item.id}
            className={`flex items-start gap-2 p-3 rounded-lg border bg-[hsl(var(--card))] shadow-lg animate-in slide-in-from-right ${BG_MAP[item.type]}`}
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
