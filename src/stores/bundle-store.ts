// ============================================================
// stores/bundle-store.ts — 套件状态管理
// ============================================================

import { create } from "zustand";
import type {
  SkillBundleCreate,
  SkillBundleUpdate,
  SkillBundleWithStatus,
} from "../../shared/types";
import {
  createSkillBundle as apiCreateBundle,
  deleteSkillBundle as apiDeleteBundle,
  fetchSkillBundles as apiFetchBundles,
  updateSkillBundle as apiUpdateBundle,
} from "../lib/api";

export interface BundleStore {
  bundles: SkillBundleWithStatus[];
  bundlesLoading: boolean;
  bundlesError: string | null;
  // actions
  fetchBundles: () => Promise<void>;
  createBundle: (data: SkillBundleCreate) => Promise<void>;
  updateBundle: (id: string, data: SkillBundleUpdate) => Promise<void>;
  deleteBundle: (id: string) => Promise<void>;
}

export const useBundleStore = create<BundleStore>((set) => ({
  bundles: [],
  bundlesLoading: false,
  bundlesError: null,

  fetchBundles: async () => {
    set({ bundlesLoading: true, bundlesError: null });
    try {
      const bundles = await apiFetchBundles();
      set({ bundles });
    } catch (err) {
      set({
        bundlesError: err instanceof Error ? err.message : "LOAD_FAILED",
      });
    } finally {
      set({ bundlesLoading: false });
    }
  },

  createBundle: async (data) => {
    const newBundle = await apiCreateBundle(data);
    set((state) => ({ bundles: [...state.bundles, newBundle] }));
    // Toast 消息由调用方（BundleManager.tsx）处理
  },

  updateBundle: async (id, data) => {
    const updated = await apiUpdateBundle(id, data);
    set((state) => ({
      bundles: state.bundles.map((b) => (b.id === id ? updated : b)),
    }));
    // Toast 消息由调用方（BundleManager.tsx）处理
  },

  deleteBundle: async (id) => {
    await apiDeleteBundle(id);
    set((state) => ({
      bundles: state.bundles.filter((b) => b.id !== id),
    }));
    // Toast 消息由调用方（BundleManager.tsx）处理
  },
}));
