// ============================================================
// hooks/useKeyboardNav.ts — 组合式 Hook：roving focus + 键盘导航
// ============================================================

import { useCallback } from "react";
import type { SkillMeta } from "../../shared/types";
import { useRovingFocus } from "./useRovingFocus";

export interface UseKeyboardNavParams {
  /** Skill 列表 */
  skills: SkillMeta[];
  /** 是否激活键盘导航 */
  isActive: boolean;
  /** 选中 Skill 回调 */
  onSelect: (skillId: string) => void;
  /** 预览 Skill 回调 */
  onPreview: (skillId: string) => void;
  /** 删除请求回调 */
  onDeleteRequest: (target: { id: string; name: string }) => void;
}

export interface UseKeyboardNavReturn {
  focusedIndex: number;
  getItemProps: ReturnType<typeof useRovingFocus>["getItemProps"];
  /** 获取包装后的键盘事件处理（用于 SkillGrid） */
  getKeyDownHandler: (index: number) => (e: React.KeyboardEvent) => void;
  /** 获取包装后的 itemProps（用于 SkillListView/SkillList） */
  getWrappedItemProps: (index: number) => {
    tabIndex: number;
    "data-focused": boolean;
    "aria-current": "true" | undefined;
    ref: (el: HTMLElement | null) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
}

/**
 * useKeyboardNav — 封装 roving focus + Space/Enter/Delete 键盘事件
 */
export function useKeyboardNav({
  skills,
  isActive,
  onSelect,
  onPreview,
  onDeleteRequest,
}: UseKeyboardNavParams): UseKeyboardNavReturn {
  const { focusedIndex, getItemProps } = useRovingFocus({
    itemCount: skills.length,
    isActive,
  });

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      const skill = skills[index];
      if (!skill) return;

      if (e.key === " ") {
        e.preventDefault();
        onSelect(skill.id);
        onPreview(skill.id);
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        onSelect(skill.id);
        return;
      }

      if ((e.key === "Delete" || e.key === "Backspace") && !skill.readonly) {
        e.preventDefault();
        onDeleteRequest({ id: skill.id, name: skill.name });
        return;
      }
    },
    [skills, onSelect, onPreview, onDeleteRequest],
  );

  const getKeyDownHandler = useCallback(
    (index: number) => (e: React.KeyboardEvent) => {
      handleKeyDown(e, index);
    },
    [handleKeyDown],
  );

  const getWrappedItemProps = useCallback(
    (index: number) => {
      const props = getItemProps(index);
      return {
        ...props,
        onKeyDown: (e: React.KeyboardEvent) => {
          // 先让 roving focus 处理 J/K
          props.onKeyDown(e);
          // 再处理 Space/Enter/Delete
          if (!e.defaultPrevented) {
            handleKeyDown(e, index);
          }
        },
      };
    },
    [getItemProps, handleKeyDown],
  );

  return { focusedIndex, getItemProps, getKeyDownHandler, getWrappedItemProps };
}
