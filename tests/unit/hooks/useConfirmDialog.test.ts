// ============================================================
// tests/unit/hooks/useConfirmDialog.test.ts — useConfirmDialog Hook 测试
// ============================================================

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useConfirmDialog } from "../../../src/hooks/useConfirmDialog";

describe("useConfirmDialog", () => {
  it("初始状态：open=false, target=null", () => {
    const onConfirm = vi.fn();
    const { result } = renderHook(() => useConfirmDialog(onConfirm));

    expect(result.current.confirmState.open).toBe(false);
    expect(result.current.confirmState.target).toBeNull();
  });

  it("requestConfirm 设置 open=true 和 target", () => {
    const onConfirm = vi.fn();
    const { result } = renderHook(() => useConfirmDialog(onConfirm));

    act(() => {
      result.current.requestConfirm({ id: "1", name: "Test" });
    });

    expect(result.current.confirmState.open).toBe(true);
    expect(result.current.confirmState.target).toEqual({
      id: "1",
      name: "Test",
    });
  });

  it("handleConfirm 调用 onConfirm 并关闭对话框", () => {
    const onConfirm = vi.fn();
    const { result } = renderHook(() => useConfirmDialog(onConfirm));

    act(() => {
      result.current.requestConfirm({ id: "1", name: "Test" });
    });

    act(() => {
      result.current.handleConfirm();
    });

    expect(onConfirm).toHaveBeenCalledWith({ id: "1", name: "Test" });
    expect(result.current.confirmState.open).toBe(false);
    expect(result.current.confirmState.target).toBeNull();
  });

  it("handleCancel 关闭对话框但不调用 onConfirm", () => {
    const onConfirm = vi.fn();
    const { result } = renderHook(() => useConfirmDialog(onConfirm));

    act(() => {
      result.current.requestConfirm({ id: "1", name: "Test" });
    });

    act(() => {
      result.current.handleCancel();
    });

    expect(onConfirm).not.toHaveBeenCalled();
    expect(result.current.confirmState.open).toBe(false);
    expect(result.current.confirmState.target).toBeNull();
  });

  it("handleConfirm 使用最新的 onConfirm 回调（避免闭包过期）", () => {
    const onConfirm1 = vi.fn();
    const onConfirm2 = vi.fn();
    const { result, rerender } = renderHook(
      ({ onConfirm }) => useConfirmDialog(onConfirm),
      { initialProps: { onConfirm: onConfirm1 } },
    );

    act(() => {
      result.current.requestConfirm({ id: "1", name: "Test" });
    });

    // 更新 onConfirm 回调
    rerender({ onConfirm: onConfirm2 });

    act(() => {
      result.current.handleConfirm();
    });

    // 应该调用最新的回调
    expect(onConfirm1).not.toHaveBeenCalled();
    expect(onConfirm2).toHaveBeenCalledWith({ id: "1", name: "Test" });
  });

  it("支持泛型 target 类型", () => {
    const onConfirm = vi.fn();
    const { result } = renderHook(() => useConfirmDialog<string>(onConfirm));

    act(() => {
      result.current.requestConfirm("target-id");
    });

    act(() => {
      result.current.handleConfirm();
    });

    expect(onConfirm).toHaveBeenCalledWith("target-id");
  });
});
