// ============================================================
// stores/ui-store.ts — UI 状态
// ============================================================

import { create } from "zustand";

type Theme = "dark" | "light";

/** 从 localStorage 或系统偏好读取初始主题，默认暗色 */
function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem("skill-manager-theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // localStorage 不可用时降级
  }
  // 跟随系统偏好，但项目默认暗色，仅当系统明确为亮色时才使用亮色
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  ) {
    return "light";
  }
  return "dark";
}

/** 将主题同步到 DOM 和 localStorage */
function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  try {
    localStorage.setItem("skill-manager-theme", theme);
  } catch {
    // ignore
  }
}

export interface UIStore {
  sidebarOpen: boolean;
  previewOpen: boolean;
  commandPaletteOpen: boolean;
  theme: Theme;
  // actions
  toggleSidebar: () => void;
  togglePreview: () => void;
  toggleCommandPalette: () => void;
  setSidebarOpen: (open: boolean) => void;
  setPreviewOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  previewOpen: false,
  commandPaletteOpen: false,
  theme: getInitialTheme(),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  togglePreview: () => set((state) => ({ previewOpen: !state.previewOpen })),
  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setPreviewOpen: (open) => set({ previewOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  toggleTheme: () =>
    set((state) => {
      const next: Theme = state.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      return { theme: next };
    }),
}));
