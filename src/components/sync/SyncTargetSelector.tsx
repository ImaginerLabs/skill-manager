// ============================================================
// components/sync/SyncTargetSelector.tsx — 同步目标选择器弹窗
// ============================================================

import { Check, FolderSync } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import type { SyncTarget } from "../../../shared/types";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

export type TargetSelectorMode = "multi" | "single";

interface SyncTargetSelectorProps {
  mode: TargetSelectorMode;
  targets: SyncTarget[];
  defaultSelected?: string[];
  onConfirm: (selectedIds: string[]) => void;
  onCancel: () => void;
}

/**
 * SyncTargetSelector — 同步目标选择器弹窗
 * 支持多选（同步）和单选（Diff）两种模式
 */
export default function SyncTargetSelector({
  mode,
  targets,
  defaultSelected = [],
  onConfirm,
  onCancel,
}: SyncTargetSelectorProps) {
  const { t } = useTranslation();
  const enabledTargets = targets.filter((t) => t.enabled);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    if (mode === "single") {
      return new Set(defaultSelected.slice(0, 1));
    }
    return new Set(
      defaultSelected.length > 0
        ? defaultSelected
        : enabledTargets.map((t) => t.id),
    );
  });

  const handleToggle = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (mode === "single") {
          next.clear();
          next.add(id);
        } else {
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
        }
        return next;
      });
    },
    [mode],
  );

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(enabledTargets.map((t) => t.id)));
  }, [enabledTargets]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedIds.size > 0) {
      onConfirm(Array.from(selectedIds));
    }
  }, [selectedIds, onConfirm]);

  const canConfirm = selectedIds.size > 0;

  const title =
    mode === "single"
      ? t("sync.selectDiffTarget")
      : t("sync.selectSyncTargets");

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderSync size={18} className="text-[hsl(var(--primary))]" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {mode === "multi" && (
            <div className="flex items-center gap-2 text-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="h-7 px-2 text-xs"
              >
                {t("sync.selectAll")}
              </Button>
              <span className="text-[hsl(var(--muted-foreground))]">|</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeselectAll}
                className="h-7 px-2 text-xs"
              >
                {t("sync.deselectAll")}
              </Button>
            </div>
          )}

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {enabledTargets.map((target) => {
              const isSelected = selectedIds.has(target.id);
              return (
                <button
                  key={target.id}
                  onClick={() => handleToggle(target.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-md border transition-colors ${
                    isSelected
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))/0.1]"
                      : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary))/0.5] hover:bg-[hsl(var(--muted))/0.3]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-[hsl(var(--primary))] border-[hsl(var(--primary))]"
                        : "border-[hsl(var(--muted-foreground))]"
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-white" />}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                      {target.name || "Unnamed"}
                    </div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                      {target.path}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {enabledTargets.length === 0 && (
            <div className="text-center py-4 text-sm text-[hsl(var(--muted-foreground))]">
              {t("sync.noEnabledTargets")}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-[hsl(var(--border))]">
          <Button variant="ghost" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm}>
            {mode === "single" ? t("sync.viewDiff") : t("sync.confirmSync")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
