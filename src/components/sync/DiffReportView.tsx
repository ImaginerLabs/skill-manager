// ============================================================
// components/sync/DiffReportView.tsx — Diff 差异报告浮窗展示
// ============================================================

import {
  ChevronDown,
  ChevronRight,
  CircleMinus,
  CirclePlus,
  Equal,
  Pencil,
  RefreshCw,
  Replace,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { DiffItem, DiffReport } from "../../../shared/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface DiffReportViewProps {
  report: DiffReport;
  targetName?: string;
  onSyncIncremental: () => void;
  onSyncReplace: () => void;
  onClose: () => void;
}

/**
 * DiffReportView — Diff 差异报告浮窗展示组件
 * 按状态分组展示：新增、修改、删除、相同
 * 底部提供操作按钮
 */
export default function DiffReportView({
  report,
  targetName,
  onSyncIncremental,
  onSyncReplace,
  onClose,
}: DiffReportViewProps) {
  const { t } = useTranslation();
  const [showUnchanged, setShowUnchanged] = useState(false);

  const { added, modified, deleted, unchanged } = report;
  const hasChanges =
    added.length > 0 || modified.length > 0 || deleted.length > 0;

  // 浮窗打开时禁止背景滚动
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ESC 关闭浮窗
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    // 遮罩层
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        // 点击遮罩关闭
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* 浮窗面板 */}
      <div className="relative w-full max-w-2xl max-h-[80vh] mx-4 flex flex-col rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl shadow-black/40 ring-1 ring-white/5">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
            📋 {t("sync.diffReport")}
            {targetName && (
              <span className="ml-2 text-xs font-normal text-[hsl(var(--muted-foreground))]">
                — {targetName}
              </span>
            )}
          </h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* 摘要统计 */}
        <div
          className="flex items-center gap-3 px-5 py-2.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]"
          aria-live="polite"
        >
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {t("sync.diffSummary")}:
          </span>
          {added.length > 0 && (
            <Badge className="text-[10px] px-1.5 py-0 bg-green-500/15 text-green-400">
              {t("sync.diffAdded")} {added.length}
            </Badge>
          )}
          {modified.length > 0 && (
            <Badge className="text-[10px] px-1.5 py-0 bg-yellow-500/15 text-yellow-400">
              {t("sync.diffModified")} {modified.length}
            </Badge>
          )}
          {deleted.length > 0 && (
            <Badge className="text-[10px] px-1.5 py-0 bg-red-500/15 text-red-400">
              {t("sync.diffDeleted")} {deleted.length}
            </Badge>
          )}
          {unchanged.length > 0 && (
            <Badge className="text-[10px] px-1.5 py-0 bg-[hsl(var(--muted-foreground))]/15 text-[hsl(var(--muted-foreground))]">
              {t("sync.diffUnchanged")} {unchanged.length}
            </Badge>
          )}
        </div>

        {/* 详细列表 — 可滚动区域 */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="divide-y divide-[hsl(var(--border))]">
            {/* 新增 */}
            {added.length > 0 && (
              <DiffSection
                icon={<CirclePlus size={14} className="text-green-400" />}
                label={t("sync.diffAdded")}
                items={added}
                colorClass="text-green-400"
              />
            )}

            {/* 修改 */}
            {modified.length > 0 && (
              <DiffSection
                icon={<Pencil size={14} className="text-yellow-400" />}
                label={t("sync.diffModified")}
                items={modified}
                colorClass="text-yellow-400"
              />
            )}

            {/* 删除 */}
            {deleted.length > 0 && (
              <DiffSection
                icon={<CircleMinus size={14} className="text-red-400" />}
                label={t("sync.diffDeleted")}
                items={deleted}
                colorClass="text-red-400"
              />
            )}

            {/* 相同（可折叠） */}
            {unchanged.length > 0 && (
              <div className="px-5 py-2">
                <button
                  onClick={() => setShowUnchanged(!showUnchanged)}
                  className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors w-full"
                >
                  <Equal size={14} />
                  <span>
                    {t("sync.diffUnchanged")} ({unchanged.length})
                  </span>
                  {showUnchanged ? (
                    <ChevronDown size={12} />
                  ) : (
                    <ChevronRight size={12} />
                  )}
                </button>
                {showUnchanged && (
                  <div className="mt-1.5 space-y-1 pl-5">
                    {unchanged.map((item) => (
                      <p
                        key={item.skillId}
                        className="text-xs text-[hsl(var(--muted-foreground))] font-[var(--font-code)] truncate"
                      >
                        {item.path}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 无变化 */}
            {!hasChanges && unchanged.length > 0 && (
              <div className="px-5 py-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
                {t("sync.diffNoChanges")}
              </div>
            )}
          </div>
        </div>

        {/* 底部操作按钮 */}
        {hasChanges && (
          <div className="flex items-center gap-3 px-5 py-3 border-t border-[hsl(var(--border))]">
            <Button onClick={onSyncIncremental} className="gap-2" size="sm">
              <RefreshCw size={14} />
              {t("sync.execIncremental")}
            </Button>
            <Button
              onClick={onSyncReplace}
              variant="outline"
              size="sm"
              className="gap-2 border-[hsl(var(--destructive))] text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10"
            >
              <Replace size={14} />
              {t("sync.execReplace")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- 内部子组件 ----

function DiffSection({
  icon,
  label,
  items,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  items: DiffItem[];
  colorClass: string;
}) {
  return (
    <div className="px-5 py-2" role="list" aria-label={label}>
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className={`text-xs font-medium ${colorClass}`}>{label}</span>
      </div>
      <div className="space-y-1 pl-5">
        {items.map((item) => (
          <div
            key={item.skillId}
            role="listitem"
            className="flex items-center gap-2"
          >
            <p className="text-sm font-[var(--font-code)] text-[hsl(var(--foreground))] truncate">
              {item.skillName}
            </p>
            <span className="text-xs text-[hsl(var(--muted-foreground))] truncate">
              {item.path}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
