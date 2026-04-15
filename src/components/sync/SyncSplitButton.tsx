// ============================================================
// components/sync/SyncSplitButton.tsx — 同步操作按钮组（平铺展示）
// ============================================================

import { ClipboardList, Loader2, RefreshCw, Replace } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { SyncMode } from "../../../shared/types";
import { Button } from "../ui/button";

interface SyncSplitButtonProps {
  onSync: (mode: SyncMode) => void;
  onDiff: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingMode?: "sync" | "diff" | null;
}

/**
 * SyncSplitButton — 同步操作按钮组
 * 平铺展示三个操作：增量同步、替换同步、查看差异
 */
export default function SyncSplitButton({
  onSync,
  onDiff,
  disabled = false,
  loading = false,
  loadingMode = null,
}: SyncSplitButtonProps) {
  const { t } = useTranslation();

  const handleIncremental = useCallback(() => {
    onSync("incremental");
  }, [onSync]);

  const handleReplace = useCallback(() => {
    onSync("replace");
  }, [onSync]);

  const handleDiff = useCallback(() => {
    onDiff();
  }, [onDiff]);

  const isSyncing = loading && loadingMode === "sync";
  const isDiffing = loading && loadingMode === "diff";

  return (
    <div className="inline-flex items-center gap-2">
      {/* 增量同步（主操作） */}
      <Button
        onClick={handleIncremental}
        disabled={disabled || loading}
        className="gap-2"
        aria-label={t("sync.incrementalSync")}
      >
        {isSyncing ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <RefreshCw size={16} />
        )}
        {isSyncing ? t("sync.syncing") : t("sync.incrementalSync")}
      </Button>

      {/* 替换同步 */}
      <Button
        variant="outline"
        onClick={handleReplace}
        disabled={disabled || loading}
        className="gap-2 border-[hsl(var(--destructive))] text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10"
        aria-label={t("sync.replaceSync")}
      >
        <Replace size={16} />
        {t("sync.replaceSync")}
      </Button>

      {/* 查看差异 */}
      <Button
        variant="outline"
        onClick={handleDiff}
        disabled={disabled || loading}
        className="gap-2"
        aria-label={t("sync.viewDiff")}
      >
        {isDiffing ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <ClipboardList size={16} />
        )}
        {isDiffing ? t("sync.diffLoading") : t("sync.viewDiff")}
      </Button>
    </div>
  );
}
