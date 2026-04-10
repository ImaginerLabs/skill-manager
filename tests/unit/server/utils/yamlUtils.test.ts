import fs from "fs-extra";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readYaml, writeYaml } from "../../../../server/utils/yamlUtils";

// Mock fs-extra
vi.mock("fs-extra", () => ({
  default: {
    pathExists: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    ensureDir: vi.fn(),
  },
}));

describe("yamlUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("readYaml", () => {
    it("成功读取并解析 YAML 文件", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.readFile).mockResolvedValue(
        "name: test\nversion: '1.0'\n" as never,
      );

      const result = await readYaml<{ name: string; version: string }>(
        "/config/test.yaml",
      );
      expect(result).toEqual({ name: "test", version: "1.0" });
    });

    it("文件不存在时返回 null", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false as never);

      const result = await readYaml("/config/missing.yaml");
      expect(result).toBeNull();
    });

    it("空文件返回 null", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.readFile).mockResolvedValue("   \n  " as never);

      const result = await readYaml("/config/empty.yaml");
      expect(result).toBeNull();
    });

    it("YAML 语法错误时抛出 AppError", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.readFile).mockResolvedValue(
        "invalid: yaml: content: [" as never,
      );

      await expect(readYaml("/config/bad.yaml")).rejects.toThrow(
        "YAML 解析失败",
      );
    });

    it("读取数组类型的 YAML", async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(true as never);
      vi.mocked(fs.readFile).mockResolvedValue(
        "- name: coding\n  displayName: 编程\n- name: writing\n  displayName: 写作\n" as never,
      );

      const result = await readYaml<Array<{ name: string }>>(
        "/config/categories.yaml",
      );
      expect(result).toHaveLength(2);
      expect(result![0].name).toBe("coding");
    });
  });

  describe("writeYaml", () => {
    it("成功写入 YAML 文件", async () => {
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined as never);

      await writeYaml("/config/test.yaml", { name: "test", version: "1.0" });

      expect(fs.ensureDir).toHaveBeenCalledWith(
        path.dirname("/config/test.yaml"),
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        "/config/test.yaml",
        expect.stringContaining("name: test"),
        "utf-8",
      );
    });

    it("写入前自动创建目录", async () => {
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined as never);

      await writeYaml("/deep/nested/dir/test.yaml", { key: "value" });

      expect(fs.ensureDir).toHaveBeenCalledWith("/deep/nested/dir");
    });

    it("写入数组数据", async () => {
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined as never);

      await writeYaml("/config/list.yaml", [{ name: "a" }, { name: "b" }]);

      expect(fs.writeFile).toHaveBeenCalledWith(
        "/config/list.yaml",
        expect.stringContaining("- name: a"),
        "utf-8",
      );
    });
  });
});
