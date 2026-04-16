// ============================================================
// components/sync/ReplaceSyncConfirmDialog.tsx — 替换同步确认对话框
// ============================================================

import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "../shared/ConfirmDialog";

interface ReplaceSyncConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillCount: number;
  onConfirm: () => void;
}

/**
 * ReplaceSyncConfirmDialog — 替换同步确认对话框
 * 警告用户替换同步将删除目标目录中对应的 Skill 文件夹
 */
export default function ReplaceSyncConfirmDialog({
  open,
  onOpenChange,
  skillCount,
  onConfirm,
}: ReplaceSyncConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      variant="danger"
      title={
        <span className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-[hsl(var(--destructive))]" />
          {t("sync.replaceSyncConfirmTitle")}
        </span>
      }
      description={
        <div className="space-y-2">
          <p>{t("sync.replaceSyncConfirmDesc", { count: skillCount })}</p>
          <p className="text-[hsl(var(--destructive))] font-medium">
            {t("sync.replaceSyncWarning")}
          </p>
        </div>
      }
      confirmLabel={t("sync.confirmReplaceSync")}
      onConfirm={onConfirm}
    />
  );
}
