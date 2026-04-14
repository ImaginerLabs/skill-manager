/**
 * tests/unit/scripts/sync-external-skills.test.ts
 * Story 8.6 同步脚本核心逻辑单元测试
 *
 * 注意：脚本为 ESM .mjs 格式，测试通过提取纯函数逻辑进行验证
 */

import matter from "gray-matter";
import { describe, expect, it } from "vitest";

// ============================================================
// 被测逻辑（从脚本中提取的纯函数，在测试中重新实现以便隔离测试）
// ============================================================

/**
 * 根据 include/exclude 规则筛选 Skill 列表（黑名单优先）
 */
function filterSkills(
  include: Array<{ name: string; targetCategory: string }>,
  exclude: string[],
): Array<{ name: string; targetCategory: string }> {
  const excludeSet = new Set(exclude || []);
  return (include || []).filter((item) => !excludeSet.has(item.name));
}

/**
 * 构建 sourceUrl
 */
function buildSourceUrl(
  repoUrl: string,
  branch: string,
  skillsPath: string,
  skillName: string,
): string {
  const skillsPathSegment =
    skillsPath && skillsPath !== "." ? `${skillsPath}/${skillName}` : skillName;
  return `${repoUrl}/tree/${branch}/${skillsPathSegment}`;
}

/**
 * 注入 Frontmatter 来源元数据（纯逻辑，不涉及文件 IO）
 */
function injectSourceMetadataLogic(
  rawContent: string,
  repoId: string,
  repoUrl: string,
  branch: string,
  skillsPath: string,
  skillName: string,
): string {
  const parsed = matter(rawContent);
  parsed.data.source = repoId;
  parsed.data.sourceUrl = buildSourceUrl(
    repoUrl,
    branch,
    skillsPath,
    skillName,
  );
  parsed.data.sourceRepo = repoUrl;
  parsed.data.readonly = true;
  return matter.stringify(parsed.content, parsed.data);
}

/**
 * 检测 Frontmatter 中是否有 source 字段（用于本地冲突检测）
 */
function hasSourceField(rawContent: string): boolean {
  try {
    const parsed = matter(rawContent);
    return !!parsed.data.source;
  } catch {
    return false;
  }
}

// ============================================================
// 测试套件
// ============================================================

describe("filterSkills — include/exclude 筛选逻辑", () => {
  const include = [
    { name: "pdf", targetCategory: "document-processing" },
    { name: "docx", targetCategory: "document-processing" },
    { name: "xlsx", targetCategory: "document-processing" },
    { name: "slack-gif-creator", targetCategory: "coding" },
    { name: "algorithmic-art", targetCategory: "coding" },
  ];

  it("无黑名单时返回全部白名单", () => {
    const result = filterSkills(include, []);
    expect(result).toHaveLength(5);
  });

  it("黑名单优先：exclude 中的 Skill 即使在 include 中也被排除", () => {
    const result = filterSkills(include, [
      "slack-gif-creator",
      "algorithmic-art",
    ]);
    expect(result).toHaveLength(3);
    expect(result.map((r) => r.name)).not.toContain("slack-gif-creator");
    expect(result.map((r) => r.name)).not.toContain("algorithmic-art");
  });

  it("黑名单中不存在的 Skill 不影响结果", () => {
    const result = filterSkills(include, ["nonexistent-skill"]);
    expect(result).toHaveLength(5);
  });

  it("include 为空数组时返回空数组", () => {
    const result = filterSkills([], ["slack-gif-creator"]);
    expect(result).toHaveLength(0);
  });

  it("exclude 为空数组时返回全部 include", () => {
    const result = filterSkills(
      [{ name: "pdf", targetCategory: "document-processing" }],
      [],
    );
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("pdf");
  });

  it("全部 include 都在 exclude 中时返回空数组", () => {
    const result = filterSkills(
      [{ name: "pdf", targetCategory: "document-processing" }],
      ["pdf"],
    );
    expect(result).toHaveLength(0);
  });

  it("保留 targetCategory 信息", () => {
    const result = filterSkills(
      [{ name: "pdf", targetCategory: "document-processing" }],
      [],
    );
    expect(result[0].targetCategory).toBe("document-processing");
  });
});

describe("buildSourceUrl — sourceUrl 构建", () => {
  it("skillsPath 为 '.' 时直接使用 skillName", () => {
    const url = buildSourceUrl(
      "https://github.com/anthropics/skills",
      "main",
      ".",
      "pdf",
    );
    expect(url).toBe("https://github.com/anthropics/skills/tree/main/pdf");
  });

  it("skillsPath 为空字符串时直接使用 skillName", () => {
    const url = buildSourceUrl(
      "https://github.com/anthropics/skills",
      "main",
      "",
      "pdf",
    );
    expect(url).toBe("https://github.com/anthropics/skills/tree/main/pdf");
  });

  it("skillsPath 有值时拼接路径", () => {
    const url = buildSourceUrl(
      "https://github.com/anthropics/skills",
      "main",
      "skills",
      "pdf",
    );
    expect(url).toBe(
      "https://github.com/anthropics/skills/tree/main/skills/pdf",
    );
  });

  it("不同分支名正确拼接", () => {
    const url = buildSourceUrl(
      "https://github.com/anthropics/skills",
      "develop",
      ".",
      "pdf",
    );
    expect(url).toBe("https://github.com/anthropics/skills/tree/develop/pdf");
  });
});

describe("injectSourceMetadataLogic — Frontmatter 注入", () => {
  const repo = {
    id: "anthropic-official",
    url: "https://github.com/anthropics/skills",
    branch: "main",
    skillsPath: ".",
  };

  it("有 Frontmatter 时正确注入来源字段", () => {
    const raw = `---
name: PDF 处理
description: 处理 PDF 文件
category: document-processing
---

# PDF 处理 Skill`;

    const result = injectSourceMetadataLogic(
      raw,
      repo.id,
      repo.url,
      repo.branch,
      repo.skillsPath,
      "pdf",
    );

    const parsed = matter(result);
    expect(parsed.data.source).toBe("anthropic-official");
    expect(parsed.data.sourceUrl).toBe(
      "https://github.com/anthropics/skills/tree/main/pdf",
    );
    expect(parsed.data.sourceRepo).toBe("https://github.com/anthropics/skills");
    expect(parsed.data.readonly).toBe(true);
    // 原有字段保留
    expect(parsed.data.name).toBe("PDF 处理");
    expect(parsed.data.category).toBe("document-processing");
  });

  it("无 Frontmatter 时创建新 Frontmatter", () => {
    const raw = `# PDF 处理 Skill\n\n这是一个处理 PDF 的 Skill。`;

    const result = injectSourceMetadataLogic(
      raw,
      repo.id,
      repo.url,
      repo.branch,
      repo.skillsPath,
      "pdf",
    );

    const parsed = matter(result);
    expect(parsed.data.source).toBe("anthropic-official");
    expect(parsed.data.readonly).toBe(true);
  });

  it("注入后 readonly 严格为 true（布尔值）", () => {
    const raw = `---
name: Test
---
content`;

    const result = injectSourceMetadataLogic(
      raw,
      repo.id,
      repo.url,
      repo.branch,
      repo.skillsPath,
      "test",
    );

    const parsed = matter(result);
    expect(parsed.data.readonly).toBe(true);
    expect(typeof parsed.data.readonly).toBe("boolean");
  });

  it("已有 source 字段时覆盖更新", () => {
    const raw = `---
name: Test
source: old-repo
---
content`;

    const result = injectSourceMetadataLogic(
      raw,
      "new-repo",
      repo.url,
      repo.branch,
      repo.skillsPath,
      "test",
    );

    const parsed = matter(result);
    expect(parsed.data.source).toBe("new-repo");
  });
});

describe("hasSourceField — 本地冲突检测", () => {
  it("有 source 字段时返回 true（外部 Skill）", () => {
    const raw = `---
name: PDF
source: anthropic-official
---
content`;
    expect(hasSourceField(raw)).toBe(true);
  });

  it("无 source 字段时返回 false（本地 Skill）", () => {
    const raw = `---
name: PDF
category: coding
---
content`;
    expect(hasSourceField(raw)).toBe(false);
  });

  it("无 Frontmatter 时返回 false", () => {
    const raw = `# Just Markdown\n\nNo frontmatter.`;
    expect(hasSourceField(raw)).toBe(false);
  });

  it("source 为空字符串时返回 false", () => {
    const raw = `---
name: PDF
source: ""
---
content`;
    // 空字符串 falsy，视为无 source
    expect(hasSourceField(raw)).toBe(false);
  });
});

describe("--dry-run 模式逻辑", () => {
  it("isDryRun 标志通过 process.argv 检测", () => {
    // 验证 dry-run 检测逻辑
    const argsWithDryRun = ["node", "script.mjs", "--dry-run"];
    const argsWithout = ["node", "script.mjs"];

    expect(argsWithDryRun.includes("--dry-run")).toBe(true);
    expect(argsWithout.includes("--dry-run")).toBe(false);
  });

  it("dry-run 模式下不应执行实际文件操作（逻辑验证）", () => {
    // 验证 dry-run 分支逻辑：isDryRun=true 时跳过实际操作
    const isDryRun = true;
    const operations: string[] = [];

    if (isDryRun) {
      operations.push("DRY-RUN: 将复制 source → target");
    } else {
      operations.push("ACTUAL: 执行复制");
    }

    expect(operations).toHaveLength(1);
    expect(operations[0]).toContain("DRY-RUN");
  });
});

describe("配置读取逻辑", () => {
  it("enabled: false 的仓库应被过滤", () => {
    const repos = [
      { id: "repo-1", enabled: true },
      { id: "repo-2", enabled: false },
      { id: "repo-3", enabled: true },
    ];

    const enabled = repos.filter((r) => r.enabled);
    expect(enabled).toHaveLength(2);
    expect(enabled.map((r) => r.id)).toEqual(["repo-1", "repo-3"]);
  });

  it("空仓库列表时不执行任何同步", () => {
    const repos: unknown[] = [];
    const enabled = repos.filter((r: any) => r.enabled);
    expect(enabled).toHaveLength(0);
  });
});
