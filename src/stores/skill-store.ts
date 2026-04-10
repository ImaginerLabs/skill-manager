// ============================================================
// stores/skill-store.ts — Skill 列表、分类、搜索状态
// ============================================================

import { create } from "zustand";
import type { SkillMeta, Category } from "../../shared/types";

export interface SkillStore {
  skills: SkillMeta[];
  categories: Category[];
  selectedCategory: string | null;
  searchQuery: string;
  selectedSkillId: string | null;
  viewMode: "grid" | "list";
  // actions
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

  setSkills: (skills) => set({ skills }),
  setCategories: (categories) => set({ categories }),
  setCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectSkill: (id) => set({ selectedSkillId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),
}));
