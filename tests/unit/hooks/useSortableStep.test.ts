// ============================================================
// tests/unit/hooks/useSortableStep.test.ts — useSortableStep Hook 测试
// ============================================================

import { describe, expect, it, vi } from "vitest";

// Mock dnd-kit
vi.mock("@dnd-kit/sortable", () => ({
  useSortable: ({ id }: { id: string }) => ({
    attributes: { "data-sortable-id": id },
    listeners: { onPointerDown: vi.fn() },
    setNodeRef: vi.fn(),
    transform: { x: 0, y: 10, scaleX: 1, scaleY: 1 },
    transition: "transform 200ms",
    isDragging: false,
  }),
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: (t: { x: number; y: number } | null) =>
        t ? `translate(${t.x}px, ${t.y}px)` : "",
    },
  },
}));

import { renderHook } from "@testing-library/react";
import { useSortableStep } from "../../../src/hooks/useSortableStep";

describe("useSortableStep", () => {
  const defaultOpts = {
    id: "step-1",
    index: 1,
    onMoveUp: vi.fn(),
    onMoveDown: vi.fn(),
    isFirst: false,
    isLast: false,
  };

  it("返回 dnd-kit 属性", () => {
    const { result } = renderHook(() => useSortableStep(defaultOpts));
    expect(result.current.attributes).toEqual({ "data-sortable-id": "step-1" });
    expect(result.current.listeners).toBeDefined();
    expect(result.current.setNodeRef).toBeDefined();
    expect(result.current.isDragging).toBe(false);
  });

  it("style 包含 transform 和 transition", () => {
    const { result } = renderHook(() => useSortableStep(defaultOpts));
    expect(result.current.style.transform).toContain("translate");
    expect(result.current.style.transition).toBe("transform 200ms");
  });

  it("Alt+ArrowUp 触发 onMoveUp", () => {
    const onMoveUp = vi.fn();
    const { result } = renderHook(() =>
      useSortableStep({ ...defaultOpts, onMoveUp }),
    );

    const event = {
      altKey: true,
      key: "ArrowUp",
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent;

    result.current.handleKeyDown(event);
    expect(onMoveUp).toHaveBeenCalledWith(1);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("Alt+ArrowDown 触发 onMoveDown", () => {
    const onMoveDown = vi.fn();
    const { result } = renderHook(() =>
      useSortableStep({ ...defaultOpts, onMoveDown }),
    );

    const event = {
      altKey: true,
      key: "ArrowDown",
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent;

    result.current.handleKeyDown(event);
    expect(onMoveDown).toHaveBeenCalledWith(1);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("isFirst=true 时 Alt+ArrowUp 不触发 onMoveUp", () => {
    const onMoveUp = vi.fn();
    const { result } = renderHook(() =>
      useSortableStep({ ...defaultOpts, isFirst: true, onMoveUp }),
    );

    const event = {
      altKey: true,
      key: "ArrowUp",
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent;

    result.current.handleKeyDown(event);
    expect(onMoveUp).not.toHaveBeenCalled();
  });

  it("isLast=true 时 Alt+ArrowDown 不触发 onMoveDown", () => {
    const onMoveDown = vi.fn();
    const { result } = renderHook(() =>
      useSortableStep({ ...defaultOpts, isLast: true, onMoveDown }),
    );

    const event = {
      altKey: true,
      key: "ArrowDown",
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent;

    result.current.handleKeyDown(event);
    expect(onMoveDown).not.toHaveBeenCalled();
  });

  it("非 Alt 键不触发回调", () => {
    const onMoveUp = vi.fn();
    const { result } = renderHook(() =>
      useSortableStep({ ...defaultOpts, onMoveUp }),
    );

    const event = {
      altKey: false,
      key: "ArrowUp",
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent;

    result.current.handleKeyDown(event);
    expect(onMoveUp).not.toHaveBeenCalled();
  });
});
