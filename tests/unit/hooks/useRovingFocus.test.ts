// ============================================================
// tests/unit/hooks/useRovingFocus.test.ts — useRovingFocus Hook 单元测试
// ============================================================

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useRovingFocus } from "../../../src/hooks/useRovingFocus";

describe("useRovingFocus", () => {
  describe("初始状态", () => {
    it("focusedIndex 初始为 0", () => {
      const { result } = renderHook(() =>
        useRovingFocus({ itemCount: 5, isActive: true }),
      );
      expect(result.current.focusedIndex).toBe(0);
    });

    it("getItemProps 返回正确的 tabIndex", () => {
      const { result } = renderHook(() =>
        useRovingFocus({ itemCount: 5, isActive: true }),
      );
      expect(result.current.getItemProps(0).tabIndex).toBe(0);
      expect(result.current.getItemProps(1).tabIndex).toBe(-1);
      expect(result.current.getItemProps(4).tabIndex).toBe(-1);
    });

    it("getItemProps 返回正确的 data-focused", () => {
      const { result } = renderHook(() =>
        useRovingFocus({ itemCount: 5, isActive: true }),
      );
      expect(result.current.getItemProps(0)["data-focused"]).toBe(true);
      expect(result.current.getItemProps(1)["data-focused"]).toBe(false);
    });

    it("getItemProps 返回正确的 aria-current", () => {
      const { result } = renderHook(() =>
        useRovingFocus({ itemCount: 5, isActive: true }),
      );
      expect(result.current.getItemProps(0)["aria-current"]).toBe("true");
      expect(result.current.getItemProps(1)["aria-current"]).toBeUndefined();
    });
  });

  describe("setFocusedIndex", () => {
    it("手动设置 focusedIndex", () => {
      const { result } = renderHook(() =>
        useRovingFocus({ itemCount: 5, isActive: true }),
      );
      act(() => {
        result.current.setFocusedIndex(3);
      });
      expect(result.current.focusedIndex).toBe(3);
      expect(result.current.getItemProps(3).tabIndex).toBe(0);
      expect(result.current.getItemProps(0).tabIndex).toBe(-1);
    });
  });

  describe("itemCount 变化时重置", () => {
    it("itemCount 变化时 focusedIndex 重置为 0", () => {
      const { result, rerender } = renderHook(
        ({ itemCount }) => useRovingFocus({ itemCount, isActive: true }),
        { initialProps: { itemCount: 5 } },
      );

      act(() => {
        result.current.setFocusedIndex(3);
      });
      expect(result.current.focusedIndex).toBe(3);

      rerender({ itemCount: 3 });
      expect(result.current.focusedIndex).toBe(0);
    });
  });

  describe("isActive 控制", () => {
    it("isActive 为 false 时 getItemProps 仍返回正确的 tabIndex", () => {
      const { result } = renderHook(() =>
        useRovingFocus({ itemCount: 5, isActive: false }),
      );
      // tabIndex 仍然正确（roving tabindex 模式不受 isActive 影响）
      expect(result.current.getItemProps(0).tabIndex).toBe(0);
      expect(result.current.getItemProps(1).tabIndex).toBe(-1);
    });
  });

  describe("边界处理", () => {
    it("itemCount 为 0 时 focusedIndex 为 0", () => {
      const { result } = renderHook(() =>
        useRovingFocus({ itemCount: 0, isActive: true }),
      );
      expect(result.current.focusedIndex).toBe(0);
    });

    it("itemCount 为 1 时只有一个项可聚焦", () => {
      const { result } = renderHook(() =>
        useRovingFocus({ itemCount: 1, isActive: true }),
      );
      expect(result.current.getItemProps(0).tabIndex).toBe(0);
    });
  });
});
