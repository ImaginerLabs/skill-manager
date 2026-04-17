// ============================================================
// components/sync/SyncResultFloatCard.tsx — 同步结果浮层卡片
// ============================================================

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Loader2,
  RotateCcw,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { SyncDetail, SyncResult } from "../../../shared/types";
import { Portal } from "../shared/Portal";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface SyncResultFloatCardProps {
  result: SyncResult;
  onRetry: (detail: SyncDetail) => void;
  onClose: () => void;
  retryingSkillId: string | null;
  getRetryCount: (skillId: string) => number;
  maxRetries: number;
}

function StatusIcon({ status }: { status: SyncDetail["status"] }) {
  switch (status) {
    case "success":
      return (
        <CheckCircle2
          size={14}
          className="text-[hsl(var(--primary))] shrink-0"
        />
      );
    case "failed":
      return (
        <XCircle
          size={14}
          className="text-[hsl(var(--destructive))] shrink-0"
        />
      );
    case "deleted":
      return <Trash2 size={14} className="text-red-400 shrink-0" />;
    default:
      return null;
  }
}

function getStatusLabel(status: SyncDetail["status"]) {
  switch (status) {
    case "success":
      return "新建";
    case "overwritten":
      return "覆盖";
    case "updated":
      return "已更新";
    case "skipped":
      return "已跳过";
    case "failed":
      return "失败";
    case "deleted":
      return "已删除";
  }
}

export default function SyncResultFloatCard({
  result,
  onRetry,
  onClose,
  retryingSkillId,
  getRetryCount,
  maxRetries,
}: SyncResultFloatCardProps) {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const hasFailed = result.failed > 0;

  return (
    <Portal>
      <div className="fixed bottom-20 right-6 z-[9999] w-[360px] max-h-[56vh] rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
        {/* 头部 */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[hsl(var(--border))] shrink-0">
          {hasFailed ? (
            <AlertCircle
              size={16}
              className="text-[hsl(var(--destructive))] shrink-0"
            />
          ) : (
            <CheckCircle2
              size={16}
              className="text-[hsl(var(--primary))] shrink-0"
            />
          )}
          <span className="text-sm font-medium text-[hsl(var(--foreground))]">
            {t("sync.syncComplete")}
          </span>

          {/* 统计 badges */}
          <div className="flex items-center gap-1 flex-wrap">
            {result.success > 0 && (
              <Badge variant="default" className="text-[10px] px-1 py-0">
                {t("sync.successCount", { count: result.success })}
              </Badge>
            )}
            {result.updated > 0 && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1 py-0 bg-blue-500/15 text-blue-400"
              >
                {t("sync.updatedCount", { count: result.updated })}
              </Badge>
            )}
            {result.overwritten > 0 && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1 py-0 bg-yellow-500/15 text-yellow-500"
              >
                {t("sync.overwrittenCount", { count: result.overwritten })}
              </Badge>
            )}
            {result.skipped > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0">
                {t("sync.skippedCount", { count: result.skipped })}
              </Badge>
            )}
            {result.deleted > 0 && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1 py-0 bg-red-500/15 text-red-400"
              >
                {t("sync.deletedCount", { count: result.deleted })}
              </Badge>
            )}
            {result.failed > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1 py-0">
                {t("sync.failedCount", { count: result.failed })}
              </Badge>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="ml-auto flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setCollapsed((v) => !v)}
              title={
                collapsed ? t("sync.expandResult") : t("sync.collapseResult")
              }
            >
              {collapsed ? (
                <ChevronRight size={12} />
              ) : (
                <ChevronDown size={12} />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onClose}
              title={t("sync.clearResults")}
            >
              <X size={12} />
            </Button>
          </div>
        </div>

        {/* 下拉列表 */}
        {!collapsed && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            {result.details.map((detail, index) => {
              const retryCount = getRetryCount(detail.skillId);
              const canRetry =
                detail.status === "failed" && retryCount < maxRetries;
              const isRetrying = retryingSkillId === detail.skillId;
              const isExpanded =
                expandedId ===
                `${detail.skillId}-${detail.targetPath}-${index}`;

              return (
                <div key={`${detail.skillId}-${detail.targetPath}-${index}`}>
                  {/* 行头（可点击展开） */}
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[hsl(var(--muted))] transition-colors text-left"
                    onClick={() =>
                      setExpandedId(
                        isExpanded
                          ? null
                          : `${detail.skillId}-${detail.targetPath}-${index}`,
                      )
                    }
                  >
                    <StatusIcon status={detail.status} />
                    <span className="flex-1 text-sm truncate font-[var(--font-code)] text-[hsl(var(--foreground))]">
                      {detail.skillName}
                    </span>
                    <Badge
                      variant={
                        detail.status === "success"
                          ? "default"
                          : detail.status === "failed"
                            ? "destructive"
                            : detail.status === "deleted"
                              ? "secondary"
                              : "secondary"
                      }
                      className={`text-[10px] px-1 py-0 shrink-0 ${
                        detail.status === "overwritten"
                          ? "bg-yellow-500/15 text-yellow-500"
                          : detail.status === "updated"
                            ? "bg-blue-500/15 text-blue-400"
                            : detail.status === "deleted"
                              ? "bg-red-500/15 text-red-400"
                              : ""
                      }`}
                    >
                      {getStatusLabel(detail.status)}
                    </Badge>
                    <ChevronRight
                      size={12}
                      className={`shrink-0 text-[hsl(var(--muted-foreground))] transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    />
                  </button>

                  {/* 展开详情 */}
                  {isExpanded && (
                    <div className="px-3 pb-2 pl-7 text-xs text-[hsl(var(--muted-foreground))] space-y-1">
                      <p>→ {detail.targetPath}</p>
                      {detail.error && (
                        <p className="text-[hsl(var(--destructive))]">
                          {detail.error}
                        </p>
                      )}
                      {detail.status === "failed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] px-2 gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRetry(detail);
                          }}
                          disabled={!canRetry || isRetrying}
                        >
                          {isRetrying ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : (
                            <RotateCcw size={10} />
                          )}
                          {t("sync.retryButton")}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Portal>
  );
}
