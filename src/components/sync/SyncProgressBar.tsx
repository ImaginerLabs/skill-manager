// ============================================================
// components/sync/SyncProgressBar.tsx — 同步进度条
// ============================================================

import { useTranslation } from "react-i18next";

interface SyncProgressBarProps {
  completed: number;
  total: number;
}

/**
 * SyncProgressBar — 同步进度条 + 文字
 * 进度条颜色使用 primary，高度 6px，圆角
 */
export default function SyncProgressBar({
  completed,
  total,
}: SyncProgressBarProps) {
  const { t } = useTranslation();
  const percent = total > 0 ? Math.min((completed / total) * 100, 100) : 0;

  return (
    <div data-testid="sync-progress-bar" className="space-y-2">
      {/* 进度条 */}
      <div className="w-full h-1.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden">
        <div
          className="h-full bg-[hsl(var(--primary))] rounded-full transition-[width] duration-300 ease-in-out"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={completed}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>

      {/* 进度文字 */}
      <p className="text-xs text-[hsl(var(--muted-foreground))]">
        {t("sync.progressText", { completed, total })}
      </p>
    </div>
  );
}
