// ============================================================
// hooks/useSortableStep.ts — 组合式 Hook：可排序步骤的拖拽 + 键盘逻辑
// ============================================================

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCallback } from "react";

export interface UseSortableStepOptions {
  /** sortable ID */
  id: string;
  /** 当前步骤在列表中的索引 */
  index: number;
  /** 上移回调 */
  onMoveUp: (index: number) => void;
  /** 下移回调 */
  onMoveDown: (index: number) => void;
  /** 是否为第一项 */
  isFirst: boolean;
  /** 是否为最后一项 */
  isLast: boolean;
}

export interface UseSortableStepReturn {
  attributes: Record<string, unknown>;
  listeners: Record<string, unknown> | undefined;
  setNodeRef: (node: HTMLElement | null) => void;
  style: React.CSSProperties;
  isDragging: boolean;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * useSortableStep — 封装 useSortable + CSS.Transform + 键盘排序逻辑
 *
 * - 拖拽排序（dnd-kit）
 * - Alt+↑/↓ 键盘排序
 */
export function useSortableStep({
  id,
  index,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: UseSortableStepOptions): UseSortableStepReturn {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.altKey && e.key === "ArrowUp" && !isFirst) {
        e.preventDefault();
        onMoveUp(index);
      } else if (e.altKey && e.key === "ArrowDown" && !isLast) {
        e.preventDefault();
        onMoveDown(index);
      }
    },
    [index, isFirst, isLast, onMoveUp, onMoveDown],
  );

  return {
    attributes,
    listeners,
    setNodeRef,
    style,
    isDragging,
    handleKeyDown,
  };
}
