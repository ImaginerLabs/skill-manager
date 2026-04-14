import fs from "fs-extra";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock 依赖
vi.mock("fs-extra");
vi.mock("../../../../server/utils/yamlUtils", () => ({
  readYaml: vi.fn(),
  writeYaml: vi.fn(),
}));
vi.mock("../../../../server/services/skillService", () => ({
  getSkillMeta: vi.fn(),
  getSkillsRoot: vi.fn(),
  refreshSkillCache: vi.fn(),
}));

import {
  getSkillMeta,
  getSkillsRoot,
} from "../../../../server/services/skillService";
import { pushSync } from "../../../../server/services/syncService";
import { readYaml } from "../../../../server/utils/yamlUtils";

describe("syncService — pushSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // 默认 settings：一个启用的同步目标
    vi.mocked(readYaml).mockResolvedValue({
      version: "0.1.0",
      sync: {
        targets: [
          {
            id: "t1",
            name: "项目A",
            path: "/tmp/project-a/skills",
            enabled: true,
          },
          {
            id: "t2",
            name: "项目B",
            path: "/tmp/project-b/skills",
            enabled: false,
          },
        ],
      },
    });

    vi.mocked(getSkillsRoot).mockReturnValue("/mock/skills");
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
    vi.mocked(fs.pathExists).mockResolvedValue(false as never);
    vi.mocked(fs.copy).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("成功同步单个 Skill 文件夹到启用的目标", async () => {
    vi.mocked(getSkillMeta).mockReturnValue({
      id: "skill-1",
      name: "Skill 1",
      description: "desc",
      category: "general",
      tags: [],
      filePath: "general/skill-1/SKILL.md",
      fileSize: 100,
      lastModified: new Date().toISOString(),
    });

    const result = await pushSync(["skill-1"]);

    expect(result.total).toBe(1);
    expect(result.success).toBe(1);
    expect(result.overwritten).toBe(0);
    expect(result.failed).toBe(0);
    expect(result.details[0].skillName).toBe("Skill 1");
    expect(result.details[0].status).toBe("success");
    expect(result.details[0].targetPath).toBe(
      path.join("/tmp/project-a/skills", "skill-1"),
    );
    expect(fs.copy).toHaveBeenCalledWith(
      path.join("/mock/skills", "general/skill-1"),
      path.join("/tmp/project-a/skills", "skill-1"),
      { overwrite: true },
    );
  });

  it("目标文件夹已存在时标记为 overwritten", async () => {
    vi.mocked(getSkillMeta).mockReturnValue({
      id: "skill-1",
      name: "Skill 1",
      description: "desc",
      category: "general",
      tags: [],
      filePath: "general/skill-1/SKILL.md",
      fileSize: 100,
      lastModified: new Date().toISOString(),
    });
    vi.mocked(fs.pathExists).mockResolvedValue(true as never);

    const result = await pushSync(["skill-1"]);

    expect(result.overwritten).toBe(1);
    expect(result.success).toBe(0);
    expect(result.details[0].status).toBe("overwritten");
  });

  it("Skill 不存在时记录失败", async () => {
    vi.mocked(getSkillMeta).mockReturnValue(undefined);

    const result = await pushSync(["nonexistent"]);

    expect(result.failed).toBe(1);
    expect(result.details[0].status).toBe("failed");
    expect(result.details[0].error).toContain("未找到");
  });

  it("空 skillIds 抛出校验错误", async () => {
    await expect(pushSync([])).rejects.toThrow("至少选择一个 Skill");
  });

  it("无启用的同步目标时抛出错误", async () => {
    vi.mocked(readYaml).mockResolvedValue({
      version: "0.1.0",
      sync: {
        targets: [
          {
            id: "t1",
            name: "项目A",
            path: "/tmp/project-a",
            enabled: false,
          },
        ],
      },
    });

    await expect(pushSync(["skill-1"])).rejects.toThrow("没有可用的同步目标");
  });

  it("指定 targetIds 时只同步到指定目标", async () => {
    vi.mocked(readYaml).mockResolvedValue({
      version: "0.1.0",
      sync: {
        targets: [
          {
            id: "t1",
            name: "项目A",
            path: "/tmp/project-a/skills",
            enabled: true,
          },
          {
            id: "t2",
            name: "项目B",
            path: "/tmp/project-b/skills",
            enabled: true,
          },
        ],
      },
    });
    vi.mocked(getSkillMeta).mockReturnValue({
      id: "skill-1",
      name: "Skill 1",
      description: "desc",
      category: "general",
      tags: [],
      filePath: "general/skill-1/SKILL.md",
      fileSize: 100,
      lastModified: new Date().toISOString(),
    });

    const result = await pushSync(["skill-1"], ["t2"]);

    expect(result.total).toBe(1);
    expect(result.details[0].targetPath).toContain("project-b");
    expect(fs.copy).toHaveBeenCalledOnce();
  });

  it("文件夹复制失败时记录错误", async () => {
    vi.mocked(getSkillMeta).mockReturnValue({
      id: "skill-1",
      name: "Skill 1",
      description: "desc",
      category: "general",
      tags: [],
      filePath: "general/skill-1/SKILL.md",
      fileSize: 100,
      lastModified: new Date().toISOString(),
    });
    vi.mocked(fs.copy).mockRejectedValue(
      new Error("EACCES: permission denied"),
    );

    const result = await pushSync(["skill-1"]);

    expect(result.failed).toBe(1);
    expect(result.details[0].status).toBe("failed");
    expect(result.details[0].error).toContain("permission denied");
  });

  it("多个 Skill 同步到多个目标", async () => {
    vi.mocked(readYaml).mockResolvedValue({
      version: "0.1.0",
      sync: {
        targets: [
          {
            id: "t1",
            name: "项目A",
            path: "/tmp/project-a/skills",
            enabled: true,
          },
          {
            id: "t2",
            name: "项目B",
            path: "/tmp/project-b/skills",
            enabled: true,
          },
        ],
      },
    });

    vi.mocked(getSkillMeta).mockImplementation((id: string) => {
      if (id === "s1") {
        return {
          id: "s1",
          name: "Skill A",
          description: "",
          category: "cat",
          tags: [],
          filePath: "cat/s1/SKILL.md",
          fileSize: 50,
          lastModified: new Date().toISOString(),
        };
      }
      if (id === "s2") {
        return {
          id: "s2",
          name: "Skill B",
          description: "",
          category: "cat",
          tags: [],
          filePath: "cat/s2/SKILL.md",
          fileSize: 60,
          lastModified: new Date().toISOString(),
        };
      }
      return undefined;
    });

    const result = await pushSync(["s1", "s2"]);

    // 2 skills × 2 targets = 4 details
    expect(result.total).toBe(4);
    expect(result.success).toBe(4);
    expect(fs.copy).toHaveBeenCalledTimes(4);
  });
});
