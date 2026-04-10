// ============================================================
// stores/sync-store.ts — IDE 同步状态
// ============================================================

import { create } from "zustand";
import type { SyncTarget, SyncResult } from "../../shared/types";

export interface SyncStore {
  targets: SyncTarget[];
  selectedSkillIds: string[];
  syncStatus: "idle" | "syncing" | "done" | "error";
  syncResult: SyncResult | null;
  // actions
  setTargets: (targets: SyncTarget[]) => void;
  toggleSkillSelection: (id: string) => void;
  selectByCategory: (skillIds: string[]) => void;
  clearSelection: () => void;
  setSyncStatus: (status: SyncStore["syncStatus"]) => void;
  setSyncResult: (result: SyncResult | null) => void;
}

export const useSyncStore = create<SyncStore>((set) => ({
  targets: [],
  selectedSkillIds: [],
  syncStatus: "idle",
  syncResult: null,

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
}));
