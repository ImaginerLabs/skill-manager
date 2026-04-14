import { afterEach, describe, expect, it, vi } from "vitest";
import { loadRepositoriesConfig } from "../../../../server/services/repositoryConfigService";
import { AppError } from "../../../../server/types/errors";
import * as yamlUtils from "../../../../server/utils/yamlUtils";

// mock readYaml
vi.mock("../../../../server/utils/yamlUtils", () => ({
  readYaml: vi.fn(),
}));

const mockReadYaml = vi.mocked(yamlUtils.readYaml);

/** 构建合法的仓库配置原始数据 */
function buildValidRawConfig() {
  return {
    repositories: [
      {
        id: "anthropic-official",
        name: "Anthropic Official Skills",
        url: "https://github.com/anthropics/skills",
        branch: "main",
        skillsPath: ".",
        enabled: true,
        include: [{ name: "pdf", targetCategory: "document-processing" }],
        exclude: ["slack-gif-creator"],
      },
    ],
  };
}

describe("loadRepositoriesConfig", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("文件不存在", () => {
    it("readYaml 返回 null 时，返回空配置", async () => {
      mockReadYaml.mockResolvedValue(null);

      const result = await loadRepositoriesConfig();

      expect(result).toEqual({ repositories: [] });
    });

    it("readYaml 返回 undefined 时，返回空配置", async () => {
      mockReadYaml.mockResolvedValue(undefined);

      const result = await loadRepositoriesConfig();

      expect(result).toEqual({ repositories: [] });
    });
  });

  describe("文件格式错误", () => {
    it("YAML 语法错误（readYaml 抛出异常）时，返回空配置，不抛出", async () => {
      mockReadYaml.mockRejectedValue(
        AppError.parseError("YAML 解析失败: unexpected token"),
      );

      const result = await loadRepositoriesConfig();

      expect(result).toEqual({ repositories: [] });
    });

    it("Schema 校验失败（url 不是 GitHub URL）时，返回空配置", async () => {
      mockReadYaml.mockResolvedValue({
        repositories: [
          {
            id: "test",
            name: "Test",
            url: "https://gitlab.com/test/repo", // 非 GitHub URL
            branch: "main",
            skillsPath: ".",
            enabled: true,
            include: [],
            exclude: [],
          },
        ],
      });

      const result = await loadRepositoriesConfig();

      expect(result).toEqual({ repositories: [] });
    });

    it("Schema 校验失败（缺少必填字段）时，返回空配置", async () => {
      mockReadYaml.mockResolvedValue({
        repositories: [
          {
            // 缺少 id、name、url 等必填字段
            enabled: true,
          },
        ],
      });

      const result = await loadRepositoriesConfig();

      expect(result).toEqual({ repositories: [] });
    });

    it("repositories 字段为非数组时，返回空配置", async () => {
      mockReadYaml.mockResolvedValue({ repositories: "not-an-array" });

      const result = await loadRepositoriesConfig();

      expect(result).toEqual({ repositories: [] });
    });
  });

  describe("正常解析", () => {
    it("合法配置正确解析并返回 RepositoriesConfig 对象", async () => {
      mockReadYaml.mockResolvedValue(buildValidRawConfig());

      const result = await loadRepositoriesConfig();

      expect(result.repositories).toHaveLength(1);
      expect(result.repositories[0].id).toBe("anthropic-official");
      expect(result.repositories[0].url).toBe(
        "https://github.com/anthropics/skills",
      );
      expect(result.repositories[0].enabled).toBe(true);
      expect(result.repositories[0].include).toHaveLength(1);
      expect(result.repositories[0].include[0].name).toBe("pdf");
      expect(result.repositories[0].include[0].targetCategory).toBe(
        "document-processing",
      );
      expect(result.repositories[0].exclude).toEqual(["slack-gif-creator"]);
    });

    it("空仓库列表正确解析", async () => {
      mockReadYaml.mockResolvedValue({ repositories: [] });

      const result = await loadRepositoriesConfig();

      expect(result).toEqual({ repositories: [] });
    });

    it("repositories 字段缺失时使用默认空数组", async () => {
      mockReadYaml.mockResolvedValue({});

      const result = await loadRepositoriesConfig();

      expect(result).toEqual({ repositories: [] });
    });

    it("enabled: false 的仓库也被正确解析（过滤由调用方负责）", async () => {
      mockReadYaml.mockResolvedValue({
        repositories: [
          {
            id: "disabled-repo",
            name: "Disabled Repo",
            url: "https://github.com/test/repo",
            branch: "main",
            skillsPath: ".",
            enabled: false,
            include: [],
            exclude: [],
          },
        ],
      });

      const result = await loadRepositoriesConfig();

      expect(result.repositories).toHaveLength(1);
      expect(result.repositories[0].enabled).toBe(false);
    });

    it("include/exclude 字段缺失时使用默认空数组", async () => {
      mockReadYaml.mockResolvedValue({
        repositories: [
          {
            id: "test",
            name: "Test",
            url: "https://github.com/test/repo",
            branch: "main",
            skillsPath: ".",
            enabled: true,
            // include 和 exclude 缺失
          },
        ],
      });

      const result = await loadRepositoriesConfig();

      expect(result.repositories[0].include).toEqual([]);
      expect(result.repositories[0].exclude).toEqual([]);
    });
  });
});
