// ============================================================
// components/sync/SyncExecutor.tsx — 同步执行与结果日志
// ============================================================

import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import type { SyncDetail, SyncMode } from "../../../shared/types";
import { useSyncFlow } from "../../hooks/useSyncFlow";
import { pushSync } from "../../lib/api";
import { useSyncStore } from "../../stores/sync-store";
import { toast } from "../shared/toast-store";
import DiffReportView from "./DiffReportView";
import ReplaceSyncConfirmDialog from "./ReplaceSyncConfirmDialog";
import SyncProgressBar from "./SyncProgressBar";
import SyncResultFloatCard from "./SyncResultFloatCard";
import SyncSplitButton from "./SyncSplitButton";
import SyncSummaryPanel from "./SyncSummaryPanel";
import SyncTargetSelector from "./SyncTargetSelector";

export default function SyncExecutor() {
  const {
    targets,
    selectedSkillIds,
    syncStatus,
    syncResult,
    diffReport,
    executePush,
    executeDiff,
    setSyncStatus,
    setSyncResult,
    setDiffReport,
  } = useSyncStore();
  const { t } = useTranslation();

  const syncFlow = useSyncFlow();

  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const [loadingMode, setLoadingMode] = useState<"sync" | "diff" | null>(null);
  const [retryingSkillId, setRetryingSkillId] = useState<string | null>(null);
  const [pendingMode, setPendingMode] = useState<SyncMode>("incremental");
  const [showTargetSelector, setShowTargetSelector] = useState(false);
  const [targetSelectorMode, setTargetSelectorMode] = useState<"sync" | "diff">(
    "sync",
  );
  const [showResultCard, setShowResultCard] = useState(false);

  const enabledTargets = targets.filter((t) => t.enabled);
  const canSync = selectedSkillIds.length > 0 && enabledTargets.length > 0;
  const isBusy =
    syncStatus === "syncing" ||
    syncStatus === "diffing" ||
    syncFlow.state.phase === "syncing";

  // 目标选择器确认（同步模式）
  const handleTargetSelectorConfirm = useCallback(
    (selectedIds: string[]) => {
      setShowTargetSelector(false);

      if (pendingMode === "replace") {
        syncFlow.startSummary(
          selectedIds.length,
          enabledTargets.filter((t) => selectedIds.includes(t.id)),
          "replace",
        );
        return;
      }

      syncFlow.startSummary(
        selectedIds.length,
        enabledTargets.filter((t) => selectedIds.includes(t.id)),
        pendingMode,
      );
    },
    [pendingMode, syncFlow, enabledTargets],
  );

  // 点击同步按钮
  const handleSync = useCallback(
    (mode: SyncMode) => {
      setPendingMode(mode);
      if (enabledTargets.length === 1) {
        handleTargetSelectorConfirm([enabledTargets[0].id]);
        return;
      }
      setTargetSelectorMode("sync");
      setShowTargetSelector(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 修复闭包陷阱：pendingMode 变化时必须重新创建 handleSync
    [enabledTargets, handleTargetSelectorConfirm, pendingMode],
  );

  const handleTargetSelectorCancel = useCallback(() => {
    setShowTargetSelector(false);
  }, []);

  // 摘要面板确认 → 执行同步
  const handleSummaryConfirm = useCallback(async () => {
    if (loadingMode === "sync") return;

    if (pendingMode === "replace") {
      setShowReplaceConfirm(true);
      return;
    }

    syncFlow.confirmSync();
    setLoadingMode("sync");
    try {
      const result = await executePush(undefined, pendingMode);
      syncFlow.complete(result);
      if (pendingMode === "incremental") {
        if (result.failed > 0) {
          toast.error(t("sync.syncPartialFail", { failed: result.failed }));
        } else {
          toast.success(
            t("sync.incrementalSyncSuccess", {
              added: result.success,
              updated: result.updated,
              skipped: result.skipped,
            }),
            { duration: 5000 },
          );
        }
      } else {
        if (result.failed > 0) {
          toast.error(t("sync.syncPartialFail", { failed: result.failed }));
        } else {
          toast.success(
            t("sync.syncSuccess", {
              count: result.success + result.overwritten,
            }),
          );
        }
      }
      setShowResultCard(true);
    } catch (err) {
      syncFlow.setError(
        err instanceof Error ? err.message : t("sync.syncFailed"),
      );
      toast.error(err instanceof Error ? err.message : t("sync.syncFailed"));
    } finally {
      setLoadingMode(null);
    }
  }, [pendingMode, loadingMode, syncFlow, executePush, t]);

  const handleSummaryCancel = useCallback(() => {
    syncFlow.cancel();
  }, [syncFlow]);

  // 确认替换同步
  const handleConfirmReplace = useCallback(async () => {
    if (loadingMode === "sync") return;

    setShowReplaceConfirm(false);
    syncFlow.confirmSync();
    setLoadingMode("sync");
    try {
      const result = await executePush(undefined, "replace");
      syncFlow.complete(result);
      if (result.failed > 0) {
        toast.error(t("sync.syncPartialFail", { failed: result.failed }));
      } else {
        toast.success(
          t("sync.replaceSyncSuccess", {
            count: result.success,
            deleted: result.deleted,
          }),
          { duration: 5000 },
        );
      }
      setShowResultCard(true);
    } catch (err) {
      syncFlow.setError(
        err instanceof Error ? err.message : t("sync.syncFailed"),
      );
      toast.error(err instanceof Error ? err.message : t("sync.syncFailed"));
    } finally {
      setLoadingMode(null);
    }
  }, [syncFlow, loadingMode, executePush, t]);

  // Diff 目标选择器确认
  const handleDiffTargetSelectorConfirm = useCallback(
    async (selectedIds: string[]) => {
      setShowTargetSelector(false);
      if (selectedIds.length === 0) return;

      setLoadingMode("diff");
      try {
        await executeDiff(selectedIds[0]);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t("sync.diffFailed"));
      } finally {
        setLoadingMode(null);
      }
    },
    [executeDiff, t],
  );

  const handleDiff = useCallback(() => {
    if (enabledTargets.length === 0) return;
    if (enabledTargets.length === 1) {
      handleDiffTargetSelectorConfirm([enabledTargets[0].id]);
      return;
    }
    setTargetSelectorMode("diff");
    setShowTargetSelector(true);
  }, [enabledTargets, handleDiffTargetSelectorConfirm]);

  // 从 Diff 报告执行同步
  const handleDiffSyncIncremental = useCallback(async () => {
    setDiffReport(null);
    handleSync("incremental");
  }, [handleSync, setDiffReport]);

  const handleDiffSyncReplace = useCallback(() => {
    setDiffReport(null);
    handleSync("replace");
  }, [handleSync, setDiffReport]);

  // 失败项重试
  const handleRetry = useCallback(
    async (detail: SyncDetail) => {
      const retryCount = syncFlow.getRetryCount(detail.skillId);
      if (retryCount >= syncFlow.maxRetries) return;

      setRetryingSkillId(detail.skillId);
      try {
        const target = targets.find(
          (t) =>
            detail.targetPath === t.path ||
            detail.targetPath.endsWith("/" + t.path),
        );
        const targetIds = target ? [target.id] : undefined;
        await pushSync([detail.skillId], targetIds, pendingMode);
        syncFlow.retrySuccess(detail.skillId);
        toast.success(t("sync.retrySuccess", { name: detail.skillName }));
      } catch {
        syncFlow.retryFailed(detail.skillId);
        toast.error(t("sync.retryFailed", { name: detail.skillName }));
      } finally {
        setRetryingSkillId(null);
      }
    },
    [syncFlow, targets, pendingMode, t],
  );

  // 关闭浮层卡片并清除结果
  const handleCloseResultCard = useCallback(() => {
    setShowResultCard(false);
    setSyncStatus("idle");
    setSyncResult(null);
    setDiffReport(null);
  }, [setSyncStatus, setSyncResult, setDiffReport]);

  const displayResult = syncFlow.state.result ?? syncResult;

  return (
    <div className="space-y-4">
      {/* 同步按钮区域 */}
      <div className="flex items-center gap-3">
        <SyncSplitButton
          onSync={handleSync}
          onDiff={handleDiff}
          disabled={!canSync}
          loading={isBusy}
          loadingMode={loadingMode}
        />

        {/* 同步信息摘要 */}
        <div className="flex items-center gap-2">
          <div className="text-xs text-[hsl(var(--muted-foreground))]">
            {selectedSkillIds.length === 0 ? (
              t("sync.noSkillSelected")
            ) : enabledTargets.length === 0 ? (
              t("sync.noTargetEnabled")
            ) : (
              <span>
                {selectedSkillIds.length} Skill → {enabledTargets.length}{" "}
                targets
              </span>
            )}
          </div>
          {displayResult && (
            <button
              type="button"
              onClick={handleCloseResultCard}
              className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] underline-offset-2 hover:underline"
            >
              {t("sync.clearResults")}
            </button>
          )}
        </div>
      </div>

      {/* 同步前摘要面板 */}
      {syncFlow.state.phase === "summary" && (
        <SyncSummaryPanel
          skillCount={syncFlow.state.skillCount}
          targets={syncFlow.state.targets}
          mode={syncFlow.state.mode}
          onConfirm={handleSummaryConfirm}
          onCancel={handleSummaryCancel}
        />
      )}

      {/* 同步进度条 */}
      {syncFlow.state.phase === "syncing" && (
        <SyncProgressBar
          completed={syncFlow.state.completed}
          total={syncFlow.state.total}
        />
      )}

      {/* Diff 差异报告 */}
      {diffReport && (
        <DiffReportView
          report={diffReport}
          targetName={enabledTargets[0]?.name || enabledTargets[0]?.path}
          onSyncIncremental={handleDiffSyncIncremental}
          onSyncReplace={handleDiffSyncReplace}
          onClose={() => setDiffReport(null)}
        />
      )}

      {/* Diff 加载中 */}
      {syncStatus === "diffing" && !diffReport && (
        <div className="flex items-center gap-3 px-4 py-6 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <Loader2
            size={18}
            className="animate-spin text-[hsl(var(--primary))]"
          />
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            {t("sync.diffLoading")}
          </span>
        </div>
      )}

      {/* 同步结果浮层卡片 */}
      {showResultCard && displayResult && (
        <SyncResultFloatCard
          result={displayResult}
          onRetry={handleRetry}
          onClose={handleCloseResultCard}
          retryingSkillId={retryingSkillId}
          getRetryCount={syncFlow.getRetryCount}
          maxRetries={syncFlow.maxRetries}
        />
      )}

      {/* 替换同步确认对话框 */}
      <ReplaceSyncConfirmDialog
        open={showReplaceConfirm}
        onOpenChange={setShowReplaceConfirm}
        skillCount={selectedSkillIds.length}
        onConfirm={handleConfirmReplace}
      />

      {/* 目标选择器弹窗 */}
      {showTargetSelector && (
        <SyncTargetSelector
          mode={targetSelectorMode === "sync" ? "multi" : "single"}
          targets={enabledTargets}
          onConfirm={
            targetSelectorMode === "sync"
              ? handleTargetSelectorConfirm
              : handleDiffTargetSelectorConfirm
          }
          onCancel={handleTargetSelectorCancel}
        />
      )}
    </div>
  );
}
