// ============================================================
// stores/skill-store.ts — Skill 列表、分类、搜索状态
// ============================================================

import { create } from "zustand";
import type { Category, SkillMeta } from "../../shared/types";
import {
  fetchCategories as apiFetchCategories,
  fetchSkills as apiFetchSkills,
} from "../lib/api";

export interface SkillStore {
  skills: SkillMeta[];
  categories: Category[];
  selectedCategory: string | null;
  /** 当前选中的来源（null = 全部），与 selectedCategory 互斥（AD-41） */
  selectedSource: string | null;
  searchQuery: string;
  selectedSkillId: string | null;
  viewMode: "grid" | "list";
  loading: boolean;
  error: string | null;
  // actions
  fetchSkills: () => Promise<void>;
  setSkills: (skills: SkillMeta[]) => void;
  setCategories: (categories: Category[]) => void;
  setCategory: (category: string | null) => void;
  /** 设置来源筛选（自动清除分类筛选，互斥） */
  setSource: (source: string | null) => void;
  setSearchQuery: (query: string) => void;
  selectSkill: (id: string | null) => void;
  setViewMode: (mode: "grid" | "list") => void;
}

export const useSkillStore = create<SkillStore>((set) => ({
  skills: [],
  categories: [],
  selectedCategory: null,
  selectedSource: null,
  searchQuery: "",
  selectedSkillId: null,
  viewMode: "grid",
  loading: false,
  error: null,

  fetchSkills: async () => {
    set({ loading: true, error: null });
    try {
      // 并行获取 Skill 列表和分类数据（含 displayName）
      const [skills, categories] = await Promise.all([
        apiFetchSkills(),
        apiFetchCategories(),
      ]);
      set({ skills, categories, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "LOAD_FAILED",
        loading: false,
      });
    }
  },
  setSkills: (skills) => set({ skills }),
  setCategories: (categories) => set({ categories }),
  setCategory: (category) =>
    set({ selectedCategory: category, selectedSource: null }),
  setSource: (source) =>
    set({ selectedSource: source, selectedCategory: null }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectSkill: (id) => set({ selectedSkillId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
}));
