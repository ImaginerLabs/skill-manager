import { memo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
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
  return (
    <AlertDialog
      open={dialog.open}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除源文件</AlertDialogTitle>
          <AlertDialogDescription>
            确认删除 {dialog.paths.length}{" "}
            个已导入的源文件？此操作不可撤销，将永久删除原始文件。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm(dialog.paths, dialog.scanRoot);
              onClose();
            }}
          >
            确认删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});
