// ============================================================
// hooks/useConfirmDialog.ts — 通用确认对话框状态管理 Hook
// ============================================================

import { useCallback, useRef, useState } from "react";

export interface ConfirmState<T> {
  open: boolean;
  target: T | null;
}

export interface UseConfirmDialogReturn<T> {
  confirmState: ConfirmState<T>;
  requestConfirm: (target: T) => void;
  handleConfirm: () => void;
  handleCancel: () => void;
}

/**
 * useConfirmDialog — 管理确认对话框的 open/target 状态
 *
 * @param onConfirm 确认回调，接收 target 参数
 * @returns confirmState / requestConfirm / handleConfirm / handleCancel
 *
 * @example
 * ```tsx
 * const { confirmState, requestConfirm, handleConfirm, handleCancel } =
 *   useConfirmDialog<{ id: string; name: string }>(async (target) => {
 *     await deleteItem(target.id);
 *   });
 *
 * <button onClick={() => requestConfirm({ id: "1", name: "Foo" })}>Delete</button>
 * <ConfirmDialog
 *   open={confirmState.open}
 *   onOpenChange={(open) => !open && handleCancel()}
 *   onConfirm={handleConfirm}
 * />
 * ```
 */
export function useConfirmDialog<T>(
  onConfirm: (target: T) => void | Promise<void>,
): UseConfirmDialogReturn<T> {
  const [confirmState, setConfirmState] = useState<ConfirmState<T>>({
    open: false,
    target: null,
  });

  // 使用 ref 保存最新的 onConfirm 和 target，避免闭包过期问题
  const onConfirmRef = useRef(onConfirm);
  onConfirmRef.current = onConfirm;

  const targetRef = useRef<T | null>(null);

  const requestConfirm = useCallback((target: T) => {
    targetRef.current = target;
    setConfirmState({ open: true, target });
  }, []);

  const handleConfirm = useCallback(() => {
    if (targetRef.current) {
      onConfirmRef.current(targetRef.current);
    }
    targetRef.current = null;
    setConfirmState({ open: false, target: null });
  }, []);

  const handleCancel = useCallback(() => {
    targetRef.current = null;
    setConfirmState({ open: false, target: null });
  }, []);

  return { confirmState, requestConfirm, handleConfirm, handleCancel };
}
