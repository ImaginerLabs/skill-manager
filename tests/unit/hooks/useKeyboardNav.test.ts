// ============================================================
// tests/unit/hooks/useKeyboardNav.test.ts — useKeyboardNav Hook 测试
// ============================================================

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SkillMeta } from "../../../shared/types";
import { useKeyboardNav } from "../../../src/hooks/useKeyboardNav";

// ── Mock useRovingFocus ──
const mockGetItemProps = vi.fn((index: number) => ({
  tabIndex: index === 0 ? 0 : -1,
  "data-focused": index === 0,
  "aria-current": index === 0 ? ("true" as const) : undefined,
  ref: vi.fn(),
  onKeyDown: vi.fn(),
}));

vi.mock("../../../src/hooks/useRovingFocus", () => ({
  useRovingFocus: () => ({
    focusedIndex: 0,
    getItemProps: mockGetItemProps,
  }),
}));

const sampleSkills: SkillMeta[] = [
  {
    id: "skill-1",
    name: "Code Review",
    category: "coding",
    type: "workflow",
    tags: [],
    author: "Test",
    version: "1.0",
    filePath: "test.md",
    fileSize: 100,
    lastModified: "2025-01-01",
    readonly: false,
  },
  {
    id: "skill-2",
    name: "Write Docs",
    category: "writing",
    tags: [],
    author: "Test",
    version: "1.0",
    filePath: "test2.md",
    fileSize: 100,
    lastModified: "2025-01-01",
    readonly: true,
  },
];

describe("useKeyboardNav", () => {
  const onSelect = vi.fn();
  const onPreview = vi.fn();
  const onDeleteRequest = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetItemProps.mockClear();
    mockGetItemProps.mockImplementation((index: number) => ({
      tabIndex: index === 0 ? 0 : -1,
      "data-focused": index === 0,
      "aria-current": index === 0 ? ("true" as const) : undefined,
      ref: vi.fn(),
      onKeyDown: vi.fn(),
    }));
  });

  it("Space 键触发 onSelect 和 onPreview", () => {
    const { result } = renderHook(() =>
      useKeyboardNav({
        skills: sampleSkills,
        isActive: true,
        onSelect,
        onPreview,
        onDeleteRequest,
      }),
    );

    const handler = result.current.getKeyDownHandler(0);
    act(() => {
      handler({
        key: " ",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(onSelect).toHaveBeenCalledWith("skill-1");
    expect(onPreview).toHaveBeenCalledWith("skill-1");
  });

  it("Enter 键触发 onSelect", () => {
    const { result } = renderHook(() =>
      useKeyboardNav({
        skills: sampleSkills,
        isActive: true,
        onSelect,
        onPreview,
        onDeleteRequest,
      }),
    );

    const handler = result.current.getKeyDownHandler(0);
    act(() => {
      handler({
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(onSelect).toHaveBeenCalledWith("skill-1");
    // Enter 不触发 onPreview
    expect(onPreview).not.toHaveBeenCalled();
  });

  it("Delete 键触发 onDeleteRequest（非 readonly）", () => {
    const { result } = renderHook(() =>
      useKeyboardNav({
        skills: sampleSkills,
        isActive: true,
        onSelect,
        onPreview,
        onDeleteRequest,
      }),
    );

    const handler = result.current.getKeyDownHandler(0);
    act(() => {
      handler({
        key: "Delete",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(onDeleteRequest).toHaveBeenCalledWith({
      id: "skill-1",
      name: "Code Review",
    });
  });

  it("Delete 键不触发 onDeleteRequest（readonly skill）", () => {
    const { result } = renderHook(() =>
      useKeyboardNav({
        skills: sampleSkills,
        isActive: true,
        onSelect,
        onPreview,
        onDeleteRequest,
      }),
    );

    const handler = result.current.getKeyDownHandler(1);
    act(() => {
      handler({
        key: "Delete",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(onDeleteRequest).not.toHaveBeenCalled();
  });

  it("Backspace 键触发 onDeleteRequest（非 readonly）", () => {
    const { result } = renderHook(() =>
      useKeyboardNav({
        skills: sampleSkills,
        isActive: true,
        onSelect,
        onPreview,
        onDeleteRequest,
      }),
    );

    const handler = result.current.getKeyDownHandler(0);
    act(() => {
      handler({
        key: "Backspace",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(onDeleteRequest).toHaveBeenCalledWith({
      id: "skill-1",
      name: "Code Review",
    });
  });

  it("其他键不触发任何回调", () => {
    const { result } = renderHook(() =>
      useKeyboardNav({
        skills: sampleSkills,
        isActive: true,
        onSelect,
        onPreview,
        onDeleteRequest,
      }),
    );

    const handler = result.current.getKeyDownHandler(0);
    act(() => {
      handler({
        key: "a",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(onSelect).not.toHaveBeenCalled();
    expect(onPreview).not.toHaveBeenCalled();
    expect(onDeleteRequest).not.toHaveBeenCalled();
  });

  it("getWrappedItemProps 合并 roving focus 和键盘导航", () => {
    const { result } = renderHook(() =>
      useKeyboardNav({
        skills: sampleSkills,
        isActive: true,
        onSelect,
        onPreview,
        onDeleteRequest,
      }),
    );

    const props = result.current.getWrappedItemProps(0);
    expect(props).toHaveProperty("tabIndex");
    expect(props).toHaveProperty("onKeyDown");
  });

  it("getWrappedItemProps onKeyDown 在 e.defaultPrevented=true 时不处理", () => {
    const { result } = renderHook(() =>
      useKeyboardNav({
        skills: sampleSkills,
        isActive: true,
        onSelect,
        onPreview,
        onDeleteRequest,
      }),
    );

    const props = result.current.getWrappedItemProps(0);
    const event = {
      key: " ",
      preventDefault: vi.fn(),
      defaultPrevented: true,
    } as unknown as React.KeyboardEvent;

    act(() => {
      props.onKeyDown(event);
    });

    // Space 不会触发，因为 e.defaultPrevented = true
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("无效 index 不触发回调", () => {
    const { result } = renderHook(() =>
      useKeyboardNav({
        skills: sampleSkills,
        isActive: true,
        onSelect,
        onPreview,
        onDeleteRequest,
      }),
    );

    const handler = result.current.getKeyDownHandler(99);
    act(() => {
      handler({
        key: " ",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent);
    });

    expect(onSelect).not.toHaveBeenCalled();
  });
});
