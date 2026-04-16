// ============================================================
// components/shared/SearchInput.tsx — 统一搜索输入框组件
// ============================================================

import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface SearchInputProps {
  /** 受控值 */
  value?: string;
  /** 值变化回调 */
  onChange?: (value: string) => void;
  /** 占位文本 */
  placeholder?: string;
  /** 是否自动聚焦 */
  autoFocus?: boolean;
  /** 额外 CSS class */
  className?: string;
  /** data-testid */
  "data-testid"?: string;
}

/**
 * SearchInput — 统一搜索输入框
 *
 * - 左侧 Search 图标：输入时 primary 色，空闲时 muted-foreground 色
 * - 有输入内容时显示 × 清空按钮
 * - 默认 placeholder 使用 i18n
 */
export default function SearchInput({
  value = "",
  onChange,
  placeholder,
  autoFocus = false,
  className,
  "data-testid": testId,
}: SearchInputProps) {
  const { t } = useTranslation();
  const hasValue = value.length > 0;

  return (
    <div className={`relative ${className ?? ""}`}>
      <Search
        size={16}
        className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
          hasValue
            ? "text-[hsl(var(--primary))]"
            : "text-[hsl(var(--muted-foreground))]"
        }`}
      />
      <input
        data-testid={testId}
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder ?? t("common.search")}
        autoFocus={autoFocus}
        className="flex h-9 w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] pl-9 pr-8 text-sm text-[hsl(var(--foreground))] ring-offset-[hsl(var(--background))] placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
      {hasValue && (
        <button
          type="button"
          onClick={() => onChange?.("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          aria-label={t("common.close")}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
