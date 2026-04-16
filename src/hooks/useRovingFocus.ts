// ============================================================
// hooks/useRovingFocus.ts — 键盘焦点导航 Hook（Roving Tabindex）
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";

interface UseRovingFocusOptions {
  /** 可聚焦项总数 */
  itemCount: number;
  /** 是否激活键盘导航（搜索框聚焦时应禁用） */
  isActive: boolean;
}

interface ItemProps {
  tabIndex: number;
  "data-focused": boolean;
  "aria-current": "true" | undefined;
  ref: (el: HTMLElement | null) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

interface UseRovingFocusReturn {
  /** 当前聚焦项索引（-1 表示无聚焦） */
  focusedIndex: number;
  /** 手动设置聚焦索引 */
  setFocusedIndex: (i: number) => void;
  /** 获取每个项的 props */
  getItemProps: (index: number) => ItemProps;
}

/**
 * useRovingFocus — Roving Tabindex 键盘焦点导航
 *
 * 实现 J/K 上下导航，同一时刻只有一个项 tabIndex=0，其余 tabIndex=-1。
 * 聚焦变化时自动 scrollIntoView + focus。
 */
export function useRovingFocus({
  itemCount,
  isActive,
}: UseRovingFocusOptions): UseRovingFocusReturn {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const itemRefs = useRef<Map<number, HTMLElement>>(new Map());

  // itemCount 变化时重置 focusedIndex（筛选条件变化）
  useEffect(() => {
    setFocusedIndex(-1);
  }, [itemCount]);

  // 聚焦变化时自动 scrollIntoView + focus
  useEffect(() => {
    if (!isActive || focusedIndex < 0 || focusedIndex >= itemCount) return;
    const el = itemRefs.current.get(focusedIndex);
    if (el) {
      el.scrollIntoView({ block: "nearest" });
      el.focus({ preventScroll: true });
    }
  }, [focusedIndex, isActive, itemCount]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (!isActive) return;
      // 事件来源过滤：仅当事件来自当前聚焦项时才处理
      // 防止嵌套可聚焦元素（如卡片内的链接）冒泡触发 J/K 导航
      const el = itemRefs.current.get(index);
      if (el && e.target !== el) return;

      switch (e.key) {
        case "j":
        case "J": {
          e.preventDefault();
          // 首次按键时激活焦点到当前项
          if (focusedIndex === -1) {
            setFocusedIndex(index);
            break;
          }
          const next = Math.min(index + 1, itemCount - 1);
          if (next !== index) setFocusedIndex(next);
          break;
        }
        case "k":
        case "K": {
          e.preventDefault();
          // 首次按键时激活焦点到当前项
          if (focusedIndex === -1) {
            setFocusedIndex(index);
            break;
          }
          const prev = Math.max(index - 1, 0);
          if (prev !== index) setFocusedIndex(prev);
          break;
        }
        // Space 和 Enter 由调用方处理（通过 onKeyDown 冒泡）
        default:
          break;
      }
    },
    [isActive, itemCount, focusedIndex],
  );

  const getItemProps = useCallback(
    (index: number): ItemProps => ({
      tabIndex:
        index === focusedIndex || (focusedIndex === -1 && index === 0) ? 0 : -1,
      "data-focused": index === focusedIndex,
      "aria-current": index === focusedIndex ? "true" : undefined,
      ref: (el: HTMLElement | null) => {
        if (el) {
          itemRefs.current.set(index, el);
        } else {
          itemRefs.current.delete(index);
        }
      },
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, index),
    }),
    [focusedIndex, handleKeyDown],
  );

  return { focusedIndex, setFocusedIndex, getItemProps };
}
