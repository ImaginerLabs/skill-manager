// ============================================================
// components/sync/SyncExecutor.tsx — 同步执行与结果日志
// ============================================================

import {
  AlertCircle,
  CheckCircle2,
  FileWarning,
  Loader2,
  RefreshCw,
  SkipForward,
  XCircle,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import type { SyncDetail, SyncMode } from "../../../shared/types";
import { useSyncStore } from "../../stores/sync-store";
import { toast } from "../shared/toast-store";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import DiffReportView from "./DiffReportView";
import ReplaceSyncConfirmDialog from "./ReplaceSyncConfirmDialog";
import SyncSplitButton from "./SyncSplitButton";

/**
 * SyncExecutor — 同步执行按钮 + 进度展示 + 结果日志
 * V2: 支持增量同步、替换同步、Diff 查看三种模式
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

  // 替换同步确认对话框状态
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  // 当前加载模式
  const [loadingMode, setLoadingMode] = useState<"sync" | "diff" | null>(null);

  const enabledTargets = targets.filter((t) => t.enabled);
  const canSync = selectedSkillIds.length > 0 && enabledTargets.length > 0;
  const isBusy = syncStatus === "syncing" || syncStatus === "diffing";

  // 执行同步（增量或替换）
  const handleSync = useCallback(
    async (mode: SyncMode) => {
      if (mode === "replace") {
        setShowReplaceConfirm(true);
        return;
      }

      setLoadingMode("sync");
      try {
        const result = await executePush(undefined, mode);
        if (mode === "incremental") {
          // 增量同步结果 Toast
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
          // full 模式
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
        toast.error(err instanceof Error ? err.message : t("sync.syncFailed"));
      } finally {
        setLoadingMode(null);
      }
    },
    [executePush, t],
  );

  // 确认替换同步
  const handleConfirmReplace = useCallback(async () => {
    setShowReplaceConfirm(false);
    setLoadingMode("sync");
    try {
      const result = await executePush(undefined, "replace");
      if (result.failed > 0) {
        toast.error(t("sync.syncPartialFail", { failed: result.failed }));
      } else {
        toast.success(t("sync.replaceSyncSuccess", { count: result.success }), {
          duration: 5000,
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("sync.syncFailed"));
    } finally {
      setLoadingMode(null);
    }
  }, [executePush, t]);

  // 执行 Diff（预览变更）
  const handleDiff = useCallback(async () => {
    if (enabledTargets.length === 0) return;
    // 对比第一个启用的目标，多目标时提示用户当前对比的目标
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
    await handleSync("incremental");
  }, [handleSync, setDiffReport]);

  const handleDiffSyncReplace = useCallback(() => {
    setDiffReport(null);
    setShowReplaceConfirm(true);
  }, [setDiffReport]);

  const handleReset = useCallback(() => {
    setSyncStatus("idle");
    setSyncResult(null);
    setDiffReport(null);
  }, [setSyncStatus, setSyncResult, setDiffReport]);

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
        {(syncResult || diffReport) && (
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
      {syncResult && (
        <div className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          {/* 摘要统计 */}
          <div className="flex items-center gap-4 px-4 py-3 border-b border-[hsl(var(--border))]">
            {syncResult.failed > 0 ? (
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
              {syncResult.success > 0 && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                  {t("sync.successCount", { count: syncResult.success })}
                </Badge>
              )}
              {syncResult.updated > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 bg-blue-500/15 text-blue-400"
                >
                  {t("sync.updatedCount", { count: syncResult.updated })}
                </Badge>
              )}
              {syncResult.overwritten > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 bg-yellow-500/15 text-yellow-500"
                >
                  {t("sync.overwrittenCount", {
                    count: syncResult.overwritten,
                  })}
                </Badge>
              )}
              {syncResult.skipped > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {t("sync.skippedCount", { count: syncResult.skipped })}
                </Badge>
              )}
              {syncResult.failed > 0 && (
                <Badge
                  variant="destructive"
                  className="text-[10px] px-1.5 py-0"
                >
                  {t("sync.failedCount", { count: syncResult.failed })}
                </Badge>
              )}
            </div>
          </div>

          {/* 详细列表 */}
          <ScrollArea className="max-h-[300px]">
            <div className="divide-y divide-[hsl(var(--border))]">
              {syncResult.details.map((detail, index) => (
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
                    className={`text-[10px] px-1.5 py-0 shrink-0 ${
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
              ))}
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
