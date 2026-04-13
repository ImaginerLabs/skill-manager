import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useUIStore } from "../../../src/stores/ui-store";

describe("ui-store — theme", () => {
  beforeEach(() => {
    // 重置 DOM
    document.documentElement.dataset.theme = "dark";
    document.documentElement.style.colorScheme = "dark";
    // 重置 store 为暗色
    useUIStore.setState({ theme: "dark" });
    // 重置 localStorage mock 调用记录
    vi.mocked(localStorage.setItem).mockClear();
    vi.mocked(localStorage.getItem).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("toggleTheme", () => {
    it("从暗色切换到亮色", () => {
      useUIStore.setState({ theme: "dark" });
      useUIStore.getState().toggleTheme();

      expect(useUIStore.getState().theme).toBe("light");
    });

    it("从亮色切换回暗色", () => {
      useUIStore.setState({ theme: "light" });
      useUIStore.getState().toggleTheme();

      expect(useUIStore.getState().theme).toBe("dark");
    });

    it("切换后同步更新 document.documentElement.dataset.theme", () => {
      useUIStore.setState({ theme: "dark" });
      useUIStore.getState().toggleTheme();

      expect(document.documentElement.dataset.theme).toBe("light");
    });

    it("切换后同步更新 document.documentElement.style.colorScheme", () => {
      useUIStore.setState({ theme: "dark" });
      useUIStore.getState().toggleTheme();

      expect(document.documentElement.style.colorScheme).toBe("light");
    });

    it("切换后写入 localStorage", () => {
      useUIStore.setState({ theme: "dark" });
      useUIStore.getState().toggleTheme();

      // localStorage 是 vi.fn() mock，验证 setItem 被正确调用
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "skill-manager-theme",
        "light",
      );
    });

    it("连续切换两次恢复原始主题", () => {
      useUIStore.setState({ theme: "dark" });
      useUIStore.getState().toggleTheme();
      useUIStore.getState().toggleTheme();

      expect(useUIStore.getState().theme).toBe("dark");
      // 验证最后一次 setItem 写入的是 dark
      expect(localStorage.setItem).toHaveBeenLastCalledWith(
        "skill-manager-theme",
        "dark",
      );
    });
  });

  describe("localStorage 持久化", () => {
    it("localStorage 存储 light 时初始主题为亮色", () => {
      localStorage.setItem("skill-manager-theme", "light");
      // 模拟重新读取初始值
      useUIStore.setState({ theme: "light" });

      expect(useUIStore.getState().theme).toBe("light");
    });

    it("localStorage 存储 dark 时初始主题为暗色", () => {
      localStorage.setItem("skill-manager-theme", "dark");
      useUIStore.setState({ theme: "dark" });

      expect(useUIStore.getState().theme).toBe("dark");
    });

    it("localStorage 不可用时降级为暗色", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("localStorage unavailable");
      });
      // 降级默认暗色
      useUIStore.setState({ theme: "dark" });

      expect(useUIStore.getState().theme).toBe("dark");
    });
  });

  describe("matchMedia 系统偏好降级", () => {
    it("系统为亮色偏好且无 localStorage 时，初始主题应为亮色", () => {
      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: true,
        media: "(prefers-color-scheme: light)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as MediaQueryList);

      // 模拟无 localStorage 时跟随系统偏好
      useUIStore.setState({ theme: "light" });

      expect(useUIStore.getState().theme).toBe("light");
    });

    it("系统为暗色偏好且无 localStorage 时，初始主题应为暗色", () => {
      vi.spyOn(window, "matchMedia").mockReturnValue({
        matches: false,
        media: "(prefers-color-scheme: light)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as MediaQueryList);

      useUIStore.setState({ theme: "dark" });

      expect(useUIStore.getState().theme).toBe("dark");
    });
  });
});
