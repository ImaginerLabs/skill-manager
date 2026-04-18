// ============================================================
// hooks/useSyncFlow.ts — 同步流程状态机 Hook
// ============================================================

import { useCallback, useEffect, useReducer, useRef } from "react";
import type { SyncMode, SyncResult, SyncTarget } from "../../shared/types";

// ── 状态类型 ────────────────────────────────────────────────

export type SyncFlowPhase =
  | "idle"
  | "summary"
  | "syncing"
  | "completed"
  | "error";

export interface SyncFlowState {
  phase: SyncFlowPhase;
  /** 摘要阶段数据 */
  skillCount: number;
  targets: SyncTarget[];
  mode: SyncMode;
  /** 同步进度 */
  completed: number;
  total: number;
  /** 同步结果 */
  result: SyncResult | null;
  /** 错误信息 */
  error: string | null;
  /** 失败项重试计数 */
  retryCountMap: Map<string, number>;
}

// ── Action 类型 ─────────────────────────────────────────────

type SyncFlowAction =
  | {
      type: "START_SUMMARY";
      payload: {
        skillCount: number;
        targets: SyncTarget[];
        mode: SyncMode;
      };
    }
  | { type: "CONFIRM_SYNC" }
  | { type: "PROGRESS"; payload: { completed: number } }
  | { type: "COMPLETE"; payload: { result: SyncResult } }
  | { type: "ERROR"; payload: { error: string } }
  | { type: "RETRY_SUCCESS"; payload: { skillId: string } }
  | { type: "RETRY_FAILED"; payload: { skillId: string } }
  | { type: "CANCEL" }
  | { type: "RESET" };

// ── 初始状态 ────────────────────────────────────────────────

const initialState: SyncFlowState = {
  phase: "idle",
  skillCount: 0,
  targets: [],
  mode: "full",
  completed: 0,
  total: 0,
  result: null,
  error: null,
  retryCountMap: new Map(),
};

// ── Reducer ─────────────────────────────────────────────────

function syncFlowReducer(
  state: SyncFlowState,
  action: SyncFlowAction,
): SyncFlowState {
  switch (action.type) {
    case "START_SUMMARY":
      return {
        ...state,
        phase: "summary",
        skillCount: action.payload.skillCount,
        targets: action.payload.targets,
        mode: action.payload.mode,
        result: null,
        error: null,
        retryCountMap: new Map(),
      };

    case "CONFIRM_SYNC":
      return {
        ...state,
        phase: "syncing",
        completed: 0,
        total: state.skillCount,
      };

    case "PROGRESS":
      return {
        ...state,
        completed: Math.min(action.payload.completed, state.total),
      };

    case "COMPLETE":
      return {
        ...state,
        phase: "completed",
        completed: state.total,
        result: action.payload.result,
      };

    case "ERROR":
      return {
        ...state,
        phase: "error",
        error: action.payload.error,
      };

    case "RETRY_SUCCESS": {
      const newMap = new Map(state.retryCountMap);
      return {
        ...state,
        retryCountMap: newMap,
      };
    }

    case "RETRY_FAILED": {
      const newMap = new Map(state.retryCountMap);
      const current = newMap.get(action.payload.skillId) ?? 0;
      newMap.set(action.payload.skillId, current + 1);
      return {
        ...state,
        retryCountMap: newMap,
      };
    }

    case "CANCEL":
    case "RESET":
      return { ...initialState };

    default:
      return state;
  }
}

// ── Hook ────────────────────────────────────────────────────

export interface UseSyncFlowReturn {
  state: SyncFlowState;
  startSummary: (
    skillCount: number,
    targets: SyncTarget[],
    mode: SyncMode,
  ) => void;
  confirmSync: (skillCount: number) => void;
  updateProgress: (completed: number) => void;
  complete: (result: SyncResult) => void;
  setError: (error: string) => void;
  retrySuccess: (skillId: string) => void;
  retryFailed: (skillId: string) => void;
  cancel: () => void;
  reset: () => void;
  /** 获取某个 Skill 的重试次数 */
  getRetryCount: (skillId: string) => number;
  /** 最大重试次数 */
  maxRetries: number;
}

export function useSyncFlow(): UseSyncFlowReturn {
  const [state, dispatch] = useReducer(syncFlowReducer, initialState);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 清除进度定时器
  const clearProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => clearProgressTimer();
  }, [clearProgressTimer]);

  const startSummary = useCallback(
    (skillCount: number, targets: SyncTarget[], mode: SyncMode) => {
      dispatch({
        type: "START_SUMMARY",
        payload: { skillCount, targets, mode },
      });
    },
    [],
  );

  const confirmSync = useCallback(
    (skillCount: number) => {
      dispatch({ type: "CONFIRM_SYNC" });

      // 启动进度模拟定时器
      clearProgressTimer();
      let simulated = 0;
      const total = skillCount; // 使用传入的 skillCount，避免闭包陈旧
      const step = Math.max(1, Math.ceil(total / 10));
      const maxSimulated = Math.floor(total * 0.9);

      progressTimerRef.current = setInterval(() => {
        simulated = Math.min(simulated + step, maxSimulated);
        dispatch({ type: "PROGRESS", payload: { completed: simulated } });
      }, 500);
    },
    [clearProgressTimer],
  );

  const complete = useCallback(
    (result: SyncResult) => {
      clearProgressTimer();
      dispatch({ type: "COMPLETE", payload: { result } });
    },
    [clearProgressTimer],
  );

  const setError = useCallback(
    (error: string) => {
      clearProgressTimer();
      dispatch({ type: "ERROR", payload: { error } });
    },
    [clearProgressTimer],
  );

  const updateProgress = useCallback((completed: number) => {
    dispatch({ type: "PROGRESS", payload: { completed } });
  }, []);

  const retrySuccess = useCallback((skillId: string) => {
    dispatch({ type: "RETRY_SUCCESS", payload: { skillId } });
  }, []);

  const retryFailed = useCallback((skillId: string) => {
    dispatch({ type: "RETRY_FAILED", payload: { skillId } });
  }, []);

  const cancel = useCallback(() => {
    clearProgressTimer();
    dispatch({ type: "CANCEL" });
  }, [clearProgressTimer]);

  const reset = useCallback(() => {
    clearProgressTimer();
    dispatch({ type: "RESET" });
  }, [clearProgressTimer]);

  const getRetryCount = useCallback(
    (skillId: string) => state.retryCountMap.get(skillId) ?? 0,
    [state.retryCountMap],
  );

  return {
    state,
    startSummary,
    confirmSync,
    updateProgress,
    complete,
    setError,
    retrySuccess,
    retryFailed,
    cancel,
    reset,
    getRetryCount,
    maxRetries: 3,
  };
}
