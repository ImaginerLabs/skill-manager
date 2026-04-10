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
  setSearchQuery: (query: string) => void;
  selectSkill: (id: string | null) => void;
  setViewMode: (mode: "grid" | "list") => void;
}

export const useSkillStore = create<SkillStore>((set) => ({
  skills: [],
  categories: [],
  selectedCategory: null,
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
        error: err instanceof Error ? err.message : "加载 Skill 列表失败",
        loading: false,
      });
    }
  },
  setSkills: (skills) => set({ skills }),
  setCategories: (categories) => set({ categories }),
  setCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectSkill: (id) => set({ selectedSkillId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
}));
