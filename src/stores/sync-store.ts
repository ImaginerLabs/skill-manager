// ============================================================
// stores/sync-store.ts — IDE 同步状态
// ============================================================

import { create } from "zustand";
import type { SyncResult, SyncTarget } from "../../shared/types";
import {
  addSyncTarget as apiAddSyncTarget,
  deleteSyncTarget as apiDeleteSyncTarget,
  fetchSyncTargets as apiFetchSyncTargets,
  pushSync as apiPushSync,
  updateSyncTarget as apiUpdateSyncTarget,
} from "../lib/api";

export interface SyncStore {
  targets: SyncTarget[];
  targetsLoading: boolean;
  selectedSkillIds: string[];
  syncStatus: "idle" | "syncing" | "done" | "error";
  syncResult: SyncResult | null;
  /** 最后一次同步成功的时间戳（ISO 8601） */
  lastSyncTime: string | null;
  /** 最后一次同步失败的错误信息 */
  lastSyncError: string | null;
  // actions
  fetchTargets: () => Promise<void>;
  addTarget: (data: {
    name: string;
    path: string;
    enabled?: boolean;
  }) => Promise<SyncTarget>;
  updateTarget: (
    id: string,
    data: Partial<Omit<SyncTarget, "id">>,
  ) => Promise<void>;
  removeTarget: (id: string) => Promise<void>;
  setTargets: (targets: SyncTarget[]) => void;
  toggleSkillSelection: (id: string) => void;
  selectByCategory: (skillIds: string[]) => void;
  clearSelection: () => void;
  setSyncStatus: (status: SyncStore["syncStatus"]) => void;
  setSyncResult: (result: SyncResult | null) => void;
  executePush: (targetIds?: string[]) => Promise<SyncResult>;
}

export const useSyncStore = create<SyncStore>((set) => ({
  targets: [],
  targetsLoading: false,
  selectedSkillIds: [],
  syncStatus: "idle",
  syncResult: null,
  lastSyncTime: null,
  lastSyncError: null,

  fetchTargets: async () => {
    set({ targetsLoading: true });
    try {
      const targets = await apiFetchSyncTargets();
      set({ targets });
    } catch {
      // 静默处理错误，loading 状态由 finally 重置
    } finally {
      set({ targetsLoading: false });
    }
  },

  addTarget: async (data) => {
    const target = await apiAddSyncTarget(data);
    set((state) => ({ targets: [...state.targets, target] }));
    return target;
  },

  updateTarget: async (id, data) => {
    const updated = await apiUpdateSyncTarget(id, data);
    set((state) => ({
      targets: state.targets.map((t) => (t.id === id ? updated : t)),
    }));
  },

  removeTarget: async (id) => {
    await apiDeleteSyncTarget(id);
    set((state) => ({
      targets: state.targets.filter((t) => t.id !== id),
    }));
  },

  setTargets: (targets) => set({ targets }),

  toggleSkillSelection: (id) =>
    set((state) => ({
      selectedSkillIds: state.selectedSkillIds.includes(id)
        ? state.selectedSkillIds.filter((sid) => sid !== id)
        : [...state.selectedSkillIds, id],
    })),

  selectByCategory: (skillIds) => set({ selectedSkillIds: skillIds }),
  clearSelection: () => set({ selectedSkillIds: [] }),
  setSyncStatus: (status) => set({ syncStatus: status }),
  setSyncResult: (result) => set({ syncResult: result }),

  executePush: async (targetIds) => {
    const { selectedSkillIds } = useSyncStore.getState();
    if (selectedSkillIds.length === 0) {
      throw new Error("SYNC_NO_SKILL_SELECTED");
    }
    set({ syncStatus: "syncing", syncResult: null });
    try {
      const result = await apiPushSync(selectedSkillIds, targetIds);
      set({
        syncStatus: "done",
        syncResult: result,
        lastSyncTime: new Date().toISOString(),
        lastSyncError: null,
      });
      return result;
    } catch (err) {
      set({
        syncStatus: "error",
        lastSyncError: err instanceof Error ? err.message : "SYNC_FAILED",
      });
      throw err;
    }
  },
}));
