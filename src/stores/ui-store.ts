// ============================================================
// stores/ui-store.ts — UI 状态
// ============================================================

import { create } from "zustand";

export interface UIStore {
  sidebarOpen: boolean;
  previewOpen: boolean;
  commandPaletteOpen: boolean;
  // actions
  toggleSidebar: () => void;
  togglePreview: () => void;
  toggleCommandPalette: () => void;
  setSidebarOpen: (open: boolean) => void;
  setPreviewOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  previewOpen: false,
  commandPaletteOpen: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  togglePreview: () => set((state) => ({ previewOpen: !state.previewOpen })),
  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setPreviewOpen: (open) => set({ previewOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
}));
