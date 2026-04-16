import { memo } from "react";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import type { CleanupDialogState } from "./useImport";

interface CleanupConfirmDialogProps {
  dialog: CleanupDialogState;
  onConfirm: (paths: string[], scanRoot?: string) => void;
  onClose: () => void;
}

/** 清理源文件确认弹窗 */
export const CleanupConfirmDialog = memo(function CleanupConfirmDialog({
  dialog,
  onConfirm,
  onClose,
}: CleanupConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <ConfirmDialog
      open={dialog.open}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      variant="danger"
      title={t("importCleanup.confirmTitle")}
      description={t("importCleanup.confirmDesc", {
        count: dialog.paths.length,
      })}
      confirmLabel={t("importCleanup.confirmButton")}
      onConfirm={() => {
        onConfirm(dialog.paths, dialog.scanRoot);
        onClose();
      }}
    />
  );
});
