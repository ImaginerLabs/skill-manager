// ============================================================
// components/sync/ReplaceSyncConfirmDialog.tsx — 替换同步确认对话框
// ============================================================

import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle
              size={18}
              className="text-[hsl(var(--destructive))]"
            />
            {t("sync.replaceSyncConfirmTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>{t("sync.replaceSyncConfirmDesc", { count: skillCount })}</p>
            <p className="text-[hsl(var(--destructive))] font-medium">
              {t("sync.replaceSyncWarning")}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive))]/90"
          >
            {t("sync.confirmReplaceSync")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
