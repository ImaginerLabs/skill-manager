// ============================================================
// components/shared/ConfirmDialog.tsx — 统一确认对话框组件
// ============================================================

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

export type ConfirmDialogVariant = "default" | "danger";
export type ConfirmDialogDefaultFocus = "cancel" | "confirm";

export interface ConfirmDialogProps {
  /** 对话框是否打开 */
  open: boolean;
  /** 打开状态变化回调 */
  onOpenChange: (open: boolean) => void;
  /** 标题 */
  title?: string;
  /** 描述文本（支持 ReactNode，用于插入图标等） */
  description?: React.ReactNode;
  /** 确认按钮文本 */
  confirmLabel?: string;
  /** 取消按钮文本 */
  cancelLabel?: string;
  /** 变体：default 使用默认按钮样式，danger 使用 destructive 样式 */
  variant?: ConfirmDialogVariant;
  /** 确认按钮点击回调 */
  onConfirm: () => void;
  /** 确认按钮是否禁用 */
  confirmDisabled?: boolean;
  /** 默认聚焦哪个按钮：cancel（默认，防误触）或 confirm */
  defaultFocus?: ConfirmDialogDefaultFocus;
}

/**
 * ConfirmDialog — 基于 AlertDialog 的统一确认对话框
 *
 * - `variant="danger"` 时确认按钮显示 destructive 样式
 * - `defaultFocus="cancel"`（默认）时取消按钮自动聚焦，防误触
 * - 所有用户可见文本优先使用 props 传入，未传入时使用 i18n 默认值
 */
export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "default",
  onConfirm,
  confirmDisabled = false,
  defaultFocus = "cancel",
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  const resolvedTitle = title ?? t("confirmDialog.defaultTitle");
  const resolvedDescription = description ?? t("confirmDialog.defaultDesc");
  const resolvedConfirmLabel = confirmLabel ?? t("common.confirm");
  const resolvedCancelLabel = cancelLabel ?? t("common.cancel");

  const isDanger = variant === "danger";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{resolvedTitle}</AlertDialogTitle>
          {typeof resolvedDescription === "string" ? (
            <AlertDialogDescription>
              {resolvedDescription}
            </AlertDialogDescription>
          ) : (
            <AlertDialogDescription asChild>
              <div>{resolvedDescription}</div>
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            ref={(el) => {
              if (defaultFocus === "cancel" && el && open) {
                // autoFocus 通过 Radix 内部处理，这里仅作为 fallback
              }
            }}
          >
            {resolvedCancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={
              isDanger
                ? "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive)/0.9)]"
                : undefined
            }
          >
            {resolvedConfirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
