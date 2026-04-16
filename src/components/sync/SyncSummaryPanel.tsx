// ============================================================
// components/sync/SyncSummaryPanel.tsx — 同步前摘要面板
// ============================================================

import { AlertCircle, FolderSync } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SyncMode, SyncTarget } from "../../../shared/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface SyncSummaryPanelProps {
  skillCount: number;
  targets: SyncTarget[];
  mode: SyncMode;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * SyncSummaryPanel — 同步前摘要确认面板
 * 展示将要同步的 Skill 数量、目标路径列表、同步模式
 */
export default function SyncSummaryPanel({
  skillCount,
  targets,
  mode,
  onConfirm,
  onCancel,
}: SyncSummaryPanelProps) {
  const { t } = useTranslation();

  const modeLabel =
    mode === "incremental"
      ? t("sync.incrementalSync")
      : mode === "replace"
        ? t("sync.replaceSync")
        : t("sync.startSync");

  return (
    <div
      data-testid="sync-summary-panel"
      className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-3"
    >
      {/* 标题 */}
      <div className="flex items-center gap-2">
        <FolderSync size={18} className="text-[hsl(var(--primary))]" />
        <h4 className="text-sm font-medium text-[hsl(var(--foreground))]">
          {t("sync.summaryTitle")}
        </h4>
      </div>

      {/* 摘要内容 */}
      <div className="space-y-2 text-sm">
        {/* Skill 数量 */}
        <div className="flex items-center gap-2">
          <span className="text-[hsl(var(--muted-foreground))]">
            {t("sync.summarySkillCount")}
          </span>
          <Badge variant="default" className="text-[10px] px-1.5 py-0">
            {skillCount}
          </Badge>
        </div>

        {/* 同步模式 */}
        <div className="flex items-center gap-2">
          <span className="text-[hsl(var(--muted-foreground))]">
            {t("sync.summaryMode")}
          </span>
          <Badge
            variant={mode === "replace" ? "destructive" : "secondary"}
            className="text-[10px] px-1.5 py-0"
          >
            {modeLabel}
          </Badge>
        </div>

        {/* 目标路径列表 */}
        <div>
          <span className="text-[hsl(var(--muted-foreground))]">
            {t("sync.summaryTargets")}
          </span>
          <ul className="mt-1 space-y-1">
            {targets.map((target) => (
              <li
                key={target.id}
                className="flex items-center gap-2 text-xs text-[hsl(var(--foreground))] bg-[hsl(var(--muted)/0.3)] rounded px-2 py-1"
              >
                <span className="font-medium truncate max-w-[120px]">
                  {target.name || "Unnamed"}
                </span>
                <span className="text-[hsl(var(--muted-foreground))] truncate flex-1">
                  {target.path}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* 替换模式警告 */}
        {mode === "replace" && (
          <div className="flex items-start gap-2 p-2 rounded bg-[hsl(var(--destructive))/0.1] border border-[hsl(var(--destructive))/0.3]">
            <AlertCircle
              size={14}
              className="text-[hsl(var(--destructive))] mt-0.5 shrink-0"
            />
            <span className="text-xs text-[hsl(var(--destructive))]">
              {t("sync.replaceSyncWarning")}
            </span>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-2 pt-1">
        <Button size="sm" onClick={onConfirm}>
          {t("sync.confirmSync")}
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          {t("sync.cancelSync")}
        </Button>
      </div>
    </div>
  );
}
