import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock yamlUtils
vi.mock("../../../../server/utils/yamlUtils", () => ({
  readYaml: vi.fn(),
  writeYaml: vi.fn(),
}));

import {
  loadCategories,
  loadConfig,
  loadSettings,
} from "../../../../server/services/configService";
import { readYaml, writeYaml } from "../../../../server/utils/yamlUtils";

describe("configService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 默认 writeYaml 成功
    vi.mocked(writeYaml).mockResolvedValue(undefined);
  });

  describe("loadSettings", () => {
    it("成功加载设置文件", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        version: "0.2.0",
        sync: {
          targets: [{ id: "1", name: "CB", path: "/path", enabled: true }],
        },
        ui: { defaultView: "list", sidebarWidth: 300 },
      });

      const result = await loadSettings();

      expect(result.version).toBe("0.2.0");
      expect(result.sync.targets).toHaveLength(1);
      expect(result.ui.defaultView).toBe("list");
      expect(result.ui.sidebarWidth).toBe(300);
    });

    it("文件不存在时使用默认值并创建文件", async () => {
      vi.mocked(readYaml).mockResolvedValue(null);

      const result = await loadSettings();

      expect(result.version).toBe("0.1.0");
      expect(result.sync.targets).toEqual([]);
      expect(result.ui.defaultView).toBe("grid");
      expect(result.ui.sidebarWidth).toBe(240);
      expect(writeYaml).toHaveBeenCalled();
    });

    it("解析失败时使用默认值", async () => {
      vi.mocked(readYaml).mockRejectedValue(new Error("YAML 解析失败"));

      const result = await loadSettings();

      expect(result.version).toBe("0.1.0");
      expect(result.ui.defaultView).toBe("grid");
    });

    it("部分字段缺失时使用默认值填充", async () => {
      vi.mocked(readYaml).mockResolvedValue({
        version: "0.3.0",
        // sync 和 ui 缺失
      });

      const result = await loadSettings();

      expect(result.version).toBe("0.3.0");
      expect(result.sync.targets).toEqual([]);
      expect(result.ui.defaultView).toBe("grid");
    });
  });

  describe("loadCategories", () => {
    it("成功加载分类列表", async () => {
      vi.mocked(readYaml).mockResolvedValue([
        { name: "coding", displayName: "编程开发", description: "编程" },
        { name: "writing", displayName: "文档写作" },
      ]);

      const result = await loadCategories();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("coding");
      expect(result[0].displayName).toBe("编程开发");
      expect(result[0].skillCount).toBe(0);
      expect(result[1].name).toBe("writing");
    });

    it("文件不存在时使用默认分类并创建文件", async () => {
      vi.mocked(readYaml).mockResolvedValue(null);

      const result = await loadCategories();

      expect(result.length).toBeGreaterThanOrEqual(4);
      expect(result.find((c) => c.name === "coding")).toBeTruthy();
      expect(result.find((c) => c.name === "writing")).toBeTruthy();
      expect(result.find((c) => c.name === "devops")).toBeTruthy();
      expect(result.find((c) => c.name === "workflows")).toBeTruthy();
      expect(writeYaml).toHaveBeenCalled();
    });

    it("解析失败时使用默认分类", async () => {
      vi.mocked(readYaml).mockRejectedValue(new Error("YAML 解析失败"));

      const result = await loadCategories();

      expect(result.length).toBeGreaterThanOrEqual(4);
      expect(result.every((c) => c.skillCount === 0)).toBe(true);
    });

    it("所有分类的 skillCount 默认为 0", async () => {
      vi.mocked(readYaml).mockResolvedValue([
        { name: "test", displayName: "测试" },
      ]);

      const result = await loadCategories();

      expect(result[0].skillCount).toBe(0);
    });
  });

  describe("loadConfig", () => {
    it("合并 settings 和 categories", async () => {
      // loadConfig 内部调用 loadSettings 和 loadCategories
      // 两者都调用 readYaml，第一次返回 settings，第二次返回 categories
      vi.mocked(readYaml)
        .mockResolvedValueOnce({
          version: "0.1.0",
          sync: { targets: [] },
          ui: { defaultView: "grid", sidebarWidth: 240 },
        })
        .mockResolvedValueOnce([{ name: "coding", displayName: "编程开发" }]);

      const result = await loadConfig();

      expect(result.version).toBe("0.1.0");
      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].name).toBe("coding");
      expect(result.ui.defaultView).toBe("grid");
    });
  });
});
