// ============================================================
// tests/unit/hooks/useSyncSearchParams.test.ts — 筛选状态 ↔ URL 参数双向同步测试（Story 9.5）
// ============================================================

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ── Mock react-router-dom ──
const mockSetSearchParams = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  };
});

// ── Mock skill-store ──
const mockStoreState = {
  selectedCategory: null as string | null,
  selectedSource: null as string | null,
  searchQuery: "",
  setCategory: vi.fn((val: string | null) => {
    mockStoreState.selectedCategory = val;
  }),
  setSource: vi.fn((val: string | null) => {
    mockStoreState.selectedSource = val;
  }),
  setSearchQuery: vi.fn((val: string) => {
    mockStoreState.searchQuery = val;
  }),
};

vi.mock("@/stores/skill-store", () => ({
  useSkillStore: vi.fn(() => mockStoreState),
}));

import { useSyncSearchParams } from "@/hooks/useSyncSearchParams";

/** 从 setSearchParams 调用中提取最后一次调用并验证参数 */
function getLastSetSearchParamsCall(): URLSearchParams | null {
  const calls = mockSetSearchParams.mock.calls;
  if (calls.length === 0) return null;
  const lastCall = calls[calls.length - 1];
  return (lastCall?.[0] as URLSearchParams) ?? null;
}

describe("useSyncSearchParams", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockSearchParams = new URLSearchParams();
    mockStoreState.selectedCategory = null;
    mockStoreState.selectedSource = null;
    mockStoreState.searchQuery = "";
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Store → URL 同步", () => {
    it("无筛选条件时 setSearchParams 被调用且 URL 参数为空", () => {
      renderHook(() => useSyncSearchParams());
      act(() => {
        vi.runAllTimers();
      });

      expect(mockSetSearchParams).toHaveBeenCalled();
      const params = getLastSetSearchParamsCall();
      expect(params).not.toBeNull();
      expect(params!.get("category")).toBeNull();
      expect(params!.get("source")).toBeNull();
      expect(params!.get("q")).toBeNull();
    });

    it("selectedCategory 变化时写入 URL category 参数", () => {
      mockStoreState.selectedCategory = "coding";
      renderHook(() => useSyncSearchParams());
      act(() => {
        vi.runAllTimers();
      });

      const params = getLastSetSearchParamsCall();
      expect(params).not.toBeNull();
      expect(params!.get("category")).toBe("coding");
    });

    it("selectedSource 变化时写入 URL source 参数", () => {
      mockStoreState.selectedSource = "local";
      renderHook(() => useSyncSearchParams());
      act(() => {
        vi.runAllTimers();
      });

      const params = getLastSetSearchParamsCall();
      expect(params).not.toBeNull();
      expect(params!.get("source")).toBe("local");
    });

    it("searchQuery 变化时写入 URL q 参数", () => {
      mockStoreState.searchQuery = "react";
      renderHook(() => useSyncSearchParams());
      act(() => {
        vi.runAllTimers();
      });

      const params = getLastSetSearchParamsCall();
      expect(params).not.toBeNull();
      expect(params!.get("q")).toBe("react");
    });

    it("多个筛选条件同时写入 URL", () => {
      mockStoreState.selectedCategory = "coding";
      mockStoreState.selectedSource = "local";
      mockStoreState.searchQuery = "react";
      renderHook(() => useSyncSearchParams());
      act(() => {
        vi.runAllTimers();
      });

      const params = getLastSetSearchParamsCall();
      expect(params).not.toBeNull();
      expect(params!.get("category")).toBe("coding");
      expect(params!.get("source")).toBe("local");
      expect(params!.get("q")).toBe("react");
    });

    it("空 searchQuery 不写入 URL", () => {
      mockStoreState.searchQuery = "   ";
      renderHook(() => useSyncSearchParams());
      act(() => {
        vi.runAllTimers();
      });

      const params = getLastSetSearchParamsCall();
      expect(params).not.toBeNull();
      expect(params!.get("q")).toBeNull();
    });

    it("使用 replace: true 避免产生浏览器历史记录", () => {
      renderHook(() => useSyncSearchParams());
      act(() => {
        vi.runAllTimers();
      });

      const calls = mockSetSearchParams.mock.calls;
      const lastCall = calls[calls.length - 1];
      const options = lastCall?.[1] as Record<string, unknown>;
      expect(options?.replace).toBe(true);
    });
  });

  describe("URL → Store 同步", () => {
    it("URL 中有 category 参数时同步到 store", () => {
      mockSearchParams = new URLSearchParams("category=coding");
      renderHook(() => useSyncSearchParams());
      act(() => {
        vi.runAllTimers();
      });

      expect(mockStoreState.setCategory).toHaveBeenCalledWith("coding");
    });

    it("URL 中有 source 参数时同步到 store", () => {
      mockSearchParams = new URLSearchParams("source=local");
      renderHook(() => useSyncSearchParams());
      act(() => {
        vi.runAllTimers();
      });

      expect(mockStoreState.setSource).toHaveBeenCalledWith("local");
    });

    it("URL 中有 q 参数时同步到 store", () => {
      mockSearchParams = new URLSearchParams("q=react");
      renderHook(() => useSyncSearchParams());
      act(() => {
        vi.runAllTimers();
      });

      expect(mockStoreState.setSearchQuery).toHaveBeenCalledWith("react");
    });

    it("URL 参数为空字符串时 category 同步为 null", () => {
      mockSearchParams = new URLSearchParams("category=");
      renderHook(() => useSyncSearchParams());
      act(() => {
        vi.runAllTimers();
      });

      expect(mockStoreState.setCategory).toHaveBeenCalledWith(null);
    });

    it("URL 无参数且 store 也无值时不更新 store", () => {
      mockSearchParams = new URLSearchParams();
      mockStoreState.selectedCategory = null;
      mockStoreState.selectedSource = null;
      mockStoreState.searchQuery = "";

      // 需要先清除之前的调用
      mockStoreState.setCategory.mockClear();
      mockStoreState.setSource.mockClear();
      mockStoreState.setSearchQuery.mockClear();

      renderHook(() => useSyncSearchParams());
      act(() => {
        vi.runAllTimers();
      });

      // URL → Store 的 setCategory/setSource/setSearchQuery 不应被调用
      expect(mockStoreState.setCategory).not.toHaveBeenCalled();
      expect(mockStoreState.setSource).not.toHaveBeenCalled();
      expect(mockStoreState.setSearchQuery).not.toHaveBeenCalled();
    });
  });

  describe("返回值", () => {
    it("返回 syncToUrl 手动同步方法", () => {
      const { result } = renderHook(() => useSyncSearchParams());
      act(() => {
        vi.runAllTimers();
      });

      expect(typeof result.current.syncToUrl).toBe("function");
    });

    it("syncToUrl 手动调用时写入当前筛选状态", () => {
      mockStoreState.selectedCategory = "coding";
      mockStoreState.searchQuery = "test";

      const { result } = renderHook(() => useSyncSearchParams());
      act(() => {
        vi.runAllTimers();
      });
      mockSetSearchParams.mockClear();

      act(() => {
        result.current.syncToUrl();
      });

      expect(mockSetSearchParams).toHaveBeenCalled();
      const lastCall = mockSetSearchParams.mock.calls[0];
      const params = lastCall?.[0] as URLSearchParams;
      expect(params.get("category")).toBe("coding");
      expect(params.get("q")).toBe("test");
    });
  });
});
