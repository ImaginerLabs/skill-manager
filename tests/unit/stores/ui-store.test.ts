import { beforeEach, describe, expect, it } from "vitest";
import { useUIStore } from "../../../src/stores/ui-store";

describe("ui-store", () => {
  beforeEach(() => {
    // 重置 store 到初始状态
    useUIStore.setState({
      sidebarOpen: true,
      previewOpen: false,
      commandPaletteOpen: false,
    });
  });

  describe("初始状态", () => {
    it("应该有正确的初始值", () => {
      const state = useUIStore.getState();
      expect(state.sidebarOpen).toBe(true);
      expect(state.previewOpen).toBe(false);
      expect(state.commandPaletteOpen).toBe(false);
    });
  });

  describe("toggleSidebar", () => {
    it("切换侧边栏状态", () => {
      const { toggleSidebar } = useUIStore.getState();
      toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(false);

      toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });
  });

  describe("togglePreview", () => {
    it("切换预览面板状态", () => {
      const { togglePreview } = useUIStore.getState();
      togglePreview();
      expect(useUIStore.getState().previewOpen).toBe(true);

      togglePreview();
      expect(useUIStore.getState().previewOpen).toBe(false);
    });
  });

  describe("toggleCommandPalette", () => {
    it("切换命令面板状态", () => {
      const { toggleCommandPalette } = useUIStore.getState();
      toggleCommandPalette();
      expect(useUIStore.getState().commandPaletteOpen).toBe(true);

      toggleCommandPalette();
      expect(useUIStore.getState().commandPaletteOpen).toBe(false);
    });
  });

  describe("setSidebarOpen", () => {
    it("设置侧边栏打开", () => {
      useUIStore.setState({ sidebarOpen: false });

      const { setSidebarOpen } = useUIStore.getState();
      setSidebarOpen(true);

      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it("设置侧边栏关闭", () => {
      const { setSidebarOpen } = useUIStore.getState();
      setSidebarOpen(false);

      expect(useUIStore.getState().sidebarOpen).toBe(false);
    });
  });

  describe("setPreviewOpen", () => {
    it("设置预览面板打开", () => {
      const { setPreviewOpen } = useUIStore.getState();
      setPreviewOpen(true);

      expect(useUIStore.getState().previewOpen).toBe(true);
    });

    it("设置预览面板关闭", () => {
      useUIStore.setState({ previewOpen: true });

      const { setPreviewOpen } = useUIStore.getState();
      setPreviewOpen(false);

      expect(useUIStore.getState().previewOpen).toBe(false);
    });
  });

  describe("setCommandPaletteOpen", () => {
    it("设置命令面板打开", () => {
      const { setCommandPaletteOpen } = useUIStore.getState();
      setCommandPaletteOpen(true);

      expect(useUIStore.getState().commandPaletteOpen).toBe(true);
    });

    it("设置命令面板关闭", () => {
      useUIStore.setState({ commandPaletteOpen: true });

      const { setCommandPaletteOpen } = useUIStore.getState();
      setCommandPaletteOpen(false);

      expect(useUIStore.getState().commandPaletteOpen).toBe(false);
    });
  });
});
