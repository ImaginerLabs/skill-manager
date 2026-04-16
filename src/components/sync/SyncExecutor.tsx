// ============================================================
// components/sync/SyncExecutor.tsx — 同步执行与结果日志
// ============================================================

import {
  AlertCircle,
  CheckCircle2,
  FileWarning,
  Loader2,
  RefreshCw,
  RotateCcw,
  SkipForward,
  XCircle,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import type { SyncDetail, SyncMode } from "../../../shared/types";
import { useSyncFlow } from "../../hooks/useSyncFlow";
import { pushSync } from "../../lib/api";
import { useSyncStore } from "../../stores/sync-store";
import { toast } from "../shared/toast-store";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import DiffReportView from "./DiffReportView";
import ReplaceSyncConfirmDialog from "./ReplaceSyncConfirmDialog";
import SyncProgressBar from "./SyncProgressBar";
import SyncSplitButton from "./SyncSplitButton";
import SyncSummaryPanel from "./SyncSummaryPanel";

/**
 * SyncExecutor — 同步执行按钮 + 摘要确认 + 进度展示 + 结果日志
 * V2: 支持增量同步、替换同步、Diff 查看三种模式
 * Story 9.4: 新增同步前摘要面板、进度条、失败重试
 */
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

  // 同步流程状态机（Story 9.4）
  const syncFlow = useSyncFlow();

  // 替换同步确认对话框状态
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  // 当前加载模式
  const [loadingMode, setLoadingMode] = useState<"sync" | "diff" | null>(null);
  // 重试中的 Skill ID
  const [retryingSkillId, setRetryingSkillId] = useState<string | null>(null);
  // 当前待确认的同步模式（用于摘要面板确认后执行）
  const [pendingMode, setPendingMode] = useState<SyncMode>("incremental");

  const enabledTargets = targets.filter((t) => t.enabled);
  const canSync = selectedSkillIds.length > 0 && enabledTargets.length > 0;
  const isBusy =
    syncStatus === "syncing" ||
    syncStatus === "diffing" ||
    syncFlow.state.phase === "syncing";

  // 点击同步按钮 → 展示摘要面板（而非直接执行）
  const handleSync = useCallback(
    (mode: SyncMode) => {
      if (mode === "replace") {
        // 替换同步：先展示摘要，确认后再弹出替换确认对话框
        setPendingMode("replace");
        syncFlow.startSummary(
          selectedSkillIds.length,
          enabledTargets,
          "replace",
        );
        return;
      }

      // 增量/全量同步：展示摘要面板
      setPendingMode(mode);
      syncFlow.startSummary(selectedSkillIds.length, enabledTargets, mode);
    },
    [selectedSkillIds.length, enabledTargets, syncFlow],
  );

  // 摘要面板确认 → 执行同步
  const handleSummaryConfirm = useCallback(async () => {
    // 防重复提交：同步进行中时忽略重复点击
    if (loadingMode === "sync") return;

    if (pendingMode === "replace") {
      // 替换同步需要二次确认
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
    } catch (err) {
      syncFlow.setError(
        err instanceof Error ? err.message : t("sync.syncFailed"),
      );
      toast.error(err instanceof Error ? err.message : t("sync.syncFailed"));
    } finally {
      setLoadingMode(null);
    }
  }, [pendingMode, loadingMode, syncFlow, executePush, t]);

  // 摘要面板取消
  const handleSummaryCancel = useCallback(() => {
    syncFlow.cancel();
  }, [syncFlow]);

  // 确认替换同步
  const handleConfirmReplace = useCallback(async () => {
    // 防重复提交：同步进行中时忽略重复点击
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
        toast.success(t("sync.replaceSyncSuccess", { count: result.success }), {
          duration: 5000,
        });
      }
    } catch (err) {
      syncFlow.setError(
        err instanceof Error ? err.message : t("sync.syncFailed"),
      );
      toast.error(err instanceof Error ? err.message : t("sync.syncFailed"));
    } finally {
      setLoadingMode(null);
    }
  }, [syncFlow, loadingMode, executePush, t]);

  // 执行 Diff（预览变更）
  const handleDiff = useCallback(async () => {
    if (enabledTargets.length === 0) return;
    const target = enabledTargets[0];
    if (enabledTargets.length > 1) {
      toast.info(
        t("sync.diffTargetHint", { name: target.name || target.path }),
      );
    }
    setLoadingMode("diff");
    try {
      await executeDiff(target.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("sync.diffFailed"));
    } finally {
      setLoadingMode(null);
    }
  }, [enabledTargets, executeDiff, t]);

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
        // 从 targets 中通过精确路径匹配找到 targetId
        // 使用 endsWith 替代 startsWith，避免路径前缀包含导致的误匹配
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

  const handleReset = useCallback(() => {
    setSyncStatus("idle");
    setSyncResult(null);
    setDiffReport(null);
    syncFlow.reset();
  }, [setSyncStatus, setSyncResult, setDiffReport, syncFlow]);

  // 结果详情中的状态图标
  const StatusIcon = ({ status }: { status: SyncDetail["status"] }) => {
    switch (status) {
      case "success":
        return (
          <CheckCircle2
            size={14}
            className="text-[hsl(var(--primary))] shrink-0"
          />
        );
      case "overwritten":
      case "updated":
        return <FileWarning size={14} className="text-yellow-500 shrink-0" />;
      case "skipped":
        return (
          <SkipForward
            size={14}
            className="text-[hsl(var(--muted-foreground))] shrink-0"
          />
        );
      case "failed":
        return (
          <XCircle
            size={14}
            className="text-[hsl(var(--destructive))] shrink-0"
          />
        );
    }
  };

  const getStatusLabel = (status: SyncDetail["status"]) => {
    switch (status) {
      case "success":
        return t("sync.statusNew");
      case "overwritten":
        return t("sync.statusOverwritten");
      case "updated":
        return t("sync.statusUpdated");
      case "skipped":
        return t("sync.statusSkipped");
      case "failed":
        return t("sync.statusFailed");
    }
  };

  // 当前显示的结果（优先使用 syncFlow 的结果）
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
        <div className="text-xs text-[hsl(var(--muted-foreground))]">
          {selectedSkillIds.length === 0 ? (
            t("sync.noSkillSelected")
          ) : enabledTargets.length === 0 ? (
            t("sync.noTargetEnabled")
          ) : (
            <span>
              {selectedSkillIds.length} Skill → {enabledTargets.length} targets
            </span>
          )}
        </div>

        {/* 重置按钮（有结果时显示） */}
        {(displayResult || diffReport) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="gap-1.5 ml-auto"
          >
            <RefreshCw size={14} />
            {t("sync.clearResults")}
          </Button>
        )}
      </div>

      {/* 同步前摘要面板（Story 9.4） */}
      {syncFlow.state.phase === "summary" && (
        <SyncSummaryPanel
          skillCount={syncFlow.state.skillCount}
          targets={syncFlow.state.targets}
          mode={syncFlow.state.mode}
          onConfirm={handleSummaryConfirm}
          onCancel={handleSummaryCancel}
        />
      )}

      {/* 同步进度条（Story 9.4） */}
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

      {/* 同步结果摘要 */}
      {displayResult && (
        <div className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          {/* 摘要统计 */}
          <div className="flex items-center gap-4 px-4 py-3 border-b border-[hsl(var(--border))]">
            {displayResult.failed > 0 ? (
              <AlertCircle
                size={18}
                className="text-[hsl(var(--destructive))] shrink-0"
              />
            ) : (
              <CheckCircle2
                size={18}
                className="text-[hsl(var(--primary))] shrink-0"
              />
            )}
            <div className="flex items-center gap-3 text-sm flex-wrap">
              <span className="font-medium text-[hsl(var(--foreground))]">
                {t("sync.syncComplete")}
              </span>
              {displayResult.success > 0 && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                  {t("sync.successCount", { count: displayResult.success })}
                </Badge>
              )}
              {displayResult.updated > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 bg-blue-500/15 text-blue-400"
                >
                  {t("sync.updatedCount", { count: displayResult.updated })}
                </Badge>
              )}
              {displayResult.overwritten > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 bg-yellow-500/15 text-yellow-500"
                >
                  {t("sync.overwrittenCount", {
                    count: displayResult.overwritten,
                  })}
                </Badge>
              )}
              {displayResult.skipped > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {t("sync.skippedCount", { count: displayResult.skipped })}
                </Badge>
              )}
              {displayResult.failed > 0 && (
                <Badge
                  variant="destructive"
                  className="text-[10px] px-1.5 py-0"
                >
                  {t("sync.failedCount", { count: displayResult.failed })}
                </Badge>
              )}
            </div>
          </div>

          {/* 详细列表 */}
          <ScrollArea className="max-h-[300px]">
            <div className="divide-y divide-[hsl(var(--border))]">
              {displayResult.details.map((detail, index) => {
                const retryCount = syncFlow.getRetryCount(detail.skillId);
                const canRetry =
                  detail.status === "failed" &&
                  retryCount < syncFlow.maxRetries;
                const isRetrying = retryingSkillId === detail.skillId;

                return (
                  <div
                    key={`${detail.skillId}-${detail.targetPath}-${index}`}
                    className="flex items-start gap-3 px-4 py-2.5"
                  >
                    <StatusIcon status={detail.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-[var(--font-code)] text-[hsl(var(--foreground))] truncate">
                        {detail.skillName}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] truncate mt-0.5">
                        → {detail.targetPath}
                      </p>
                      {detail.error && (
                        <p className="text-xs text-[hsl(var(--destructive))] mt-0.5">
                          {detail.error}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* 失败项重试按钮（Story 9.4） */}
                      {detail.status === "failed" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRetry(detail)}
                          disabled={!canRetry || isRetrying}
                          title={
                            retryCount >= syncFlow.maxRetries
                              ? t("sync.retryLimitReached")
                              : t("sync.retryButton")
                          }
                        >
                          {isRetrying ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <RotateCcw size={12} />
                          )}
                        </Button>
                      )}

                      <Badge
                        variant={
                          detail.status === "success"
                            ? "default"
                            : detail.status === "overwritten" ||
                                detail.status === "updated"
                              ? "secondary"
                              : detail.status === "skipped"
                                ? "outline"
                                : "destructive"
                        }
                        className={`text-[10px] px-1.5 py-0 ${
                          detail.status === "overwritten"
                            ? "bg-yellow-500/15 text-yellow-500"
                            : detail.status === "updated"
                              ? "bg-blue-500/15 text-blue-400"
                              : ""
                        }`}
                      >
                        {getStatusLabel(detail.status)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* 替换同步确认对话框 */}
      <ReplaceSyncConfirmDialog
        open={showReplaceConfirm}
        onOpenChange={setShowReplaceConfirm}
        skillCount={selectedSkillIds.length}
        onConfirm={handleConfirmReplace}
      />
    </div>
  );
}
