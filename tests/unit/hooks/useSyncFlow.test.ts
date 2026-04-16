// ============================================================
// tests/unit/hooks/useSyncFlow.test.ts — useSyncFlow Hook 单元测试
// ============================================================

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSyncFlow } from "../../../src/hooks/useSyncFlow";

const mockTargets = [
  { id: "t1", name: "Project A", path: "/path/a", enabled: true },
  { id: "t2", name: "Project B", path: "/path/b", enabled: true },
];

describe("useSyncFlow", () => {
  describe("初始状态", () => {
    it("phase 初始为 idle", () => {
      const { result } = renderHook(() => useSyncFlow());
      expect(result.current.state.phase).toBe("idle");
    });

    it("初始 skillCount 为 0", () => {
      const { result } = renderHook(() => useSyncFlow());
      expect(result.current.state.skillCount).toBe(0);
    });

    it("maxRetries 为 3", () => {
      const { result } = renderHook(() => useSyncFlow());
      expect(result.current.maxRetries).toBe(3);
    });
  });

  describe("状态转换：idle → summary", () => {
    it("startSummary 切换到 summary 阶段", () => {
      const { result } = renderHook(() => useSyncFlow());
      act(() => {
        result.current.startSummary(5, mockTargets, "incremental");
      });
      expect(result.current.state.phase).toBe("summary");
      expect(result.current.state.skillCount).toBe(5);
      expect(result.current.state.targets).toEqual(mockTargets);
      expect(result.current.state.mode).toBe("incremental");
    });
  });

  describe("状态转换：summary → syncing", () => {
    it("confirmSync 切换到 syncing 阶段", () => {
      const { result } = renderHook(() => useSyncFlow());
      act(() => {
        result.current.startSummary(10, mockTargets, "full");
      });
      act(() => {
        result.current.confirmSync();
      });
      expect(result.current.state.phase).toBe("syncing");
      expect(result.current.state.completed).toBe(0);
      expect(result.current.state.total).toBe(10);
    });
  });

  describe("状态转换：syncing → completed", () => {
    it("complete 切换到 completed 阶段", () => {
      const { result } = renderHook(() => useSyncFlow());
      const mockResult = {
        success: 8,
        failed: 2,
        overwritten: 0,
        updated: 0,
        skipped: 0,
        details: [],
      };
      act(() => {
        result.current.startSummary(10, mockTargets, "incremental");
      });
      act(() => {
        result.current.confirmSync();
      });
      act(() => {
        result.current.complete(mockResult);
      });
      expect(result.current.state.phase).toBe("completed");
      expect(result.current.state.result).toEqual(mockResult);
      expect(result.current.state.completed).toBe(10);
    });
  });

  describe("进度更新", () => {
    it("updateProgress 更新 completed 计数", () => {
      const { result } = renderHook(() => useSyncFlow());
      act(() => {
        result.current.startSummary(10, mockTargets, "incremental");
      });
      act(() => {
        result.current.confirmSync();
      });
      act(() => {
        result.current.updateProgress(5);
      });
      expect(result.current.state.completed).toBe(5);
    });

    it("updateProgress 不超过 total", () => {
      const { result } = renderHook(() => useSyncFlow());
      act(() => {
        result.current.startSummary(10, mockTargets, "incremental");
      });
      act(() => {
        result.current.confirmSync();
      });
      act(() => {
        result.current.updateProgress(15);
      });
      expect(result.current.state.completed).toBe(10);
    });
  });

  describe("错误处理", () => {
    it("setError 切换到 error 阶段", () => {
      const { result } = renderHook(() => useSyncFlow());
      act(() => {
        result.current.startSummary(10, mockTargets, "incremental");
      });
      act(() => {
        result.current.confirmSync();
      });
      act(() => {
        result.current.setError("Network error");
      });
      expect(result.current.state.phase).toBe("error");
      expect(result.current.state.error).toBe("Network error");
    });
  });

  describe("取消和重置", () => {
    it("cancel 回到 idle", () => {
      const { result } = renderHook(() => useSyncFlow());
      act(() => {
        result.current.startSummary(10, mockTargets, "incremental");
      });
      act(() => {
        result.current.cancel();
      });
      expect(result.current.state.phase).toBe("idle");
    });

    it("reset 回到 idle", () => {
      const { result } = renderHook(() => useSyncFlow());
      act(() => {
        result.current.startSummary(10, mockTargets, "incremental");
      });
      act(() => {
        result.current.confirmSync();
      });
      act(() => {
        result.current.reset();
      });
      expect(result.current.state.phase).toBe("idle");
      expect(result.current.state.skillCount).toBe(0);
    });
  });

  describe("重试计数", () => {
    it("getRetryCount 初始为 0", () => {
      const { result } = renderHook(() => useSyncFlow());
      expect(result.current.getRetryCount("skill-1")).toBe(0);
    });

    it("retryFailed 递增重试计数", () => {
      const { result } = renderHook(() => useSyncFlow());
      act(() => {
        result.current.retryFailed("skill-1");
      });
      expect(result.current.getRetryCount("skill-1")).toBe(1);

      act(() => {
        result.current.retryFailed("skill-1");
      });
      expect(result.current.getRetryCount("skill-1")).toBe(2);
    });

    it("不同 Skill 的重试计数独立", () => {
      const { result } = renderHook(() => useSyncFlow());
      act(() => {
        result.current.retryFailed("skill-1");
      });
      act(() => {
        result.current.retryFailed("skill-2");
      });
      expect(result.current.getRetryCount("skill-1")).toBe(1);
      expect(result.current.getRetryCount("skill-2")).toBe(1);
    });

    it("startSummary 重置重试计数", () => {
      const { result } = renderHook(() => useSyncFlow());
      act(() => {
        result.current.retryFailed("skill-1");
      });
      expect(result.current.getRetryCount("skill-1")).toBe(1);

      act(() => {
        result.current.startSummary(5, mockTargets, "incremental");
      });
      expect(result.current.getRetryCount("skill-1")).toBe(0);
    });
  });
});
