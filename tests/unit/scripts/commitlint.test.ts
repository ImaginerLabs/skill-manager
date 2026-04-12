// tests/unit/scripts/commitlint.test.ts
// 验证 commitlint 配置能正确接受规范 message、拒绝非规范 message
import { execSync } from "child_process";
import { describe, expect, it } from "vitest";

/**
 * 使用 commitlint CLI 校验 commit message
 * @returns 退出码（0 = 通过，非 0 = 失败）
 */
function lintMessage(message: string): { exitCode: number; output: string } {
  try {
    const output = execSync(
      `echo "${message}" | npx --no -- commitlint --config commitlint.config.js`,
      {
        cwd: process.cwd(),
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      },
    );
    return { exitCode: 0, output };
  } catch (err: unknown) {
    const error = err as { status?: number; stderr?: string; stdout?: string };
    return {
      exitCode: error.status ?? 1,
      output: (error.stderr ?? "") + (error.stdout ?? ""),
    };
  }
}

describe("commitlint 配置校验", () => {
  describe("合规的 commit message（应通过）", () => {
    it("feat: 新增功能", () => {
      const result = lintMessage("feat: 新增功能");
      expect(result.exitCode).toBe(0);
    });

    it("fix: 修复 bug", () => {
      const result = lintMessage("fix: 修复 bug");
      expect(result.exitCode).toBe(0);
    });

    it("chore: 更新依赖", () => {
      const result = lintMessage("chore: 更新依赖");
      expect(result.exitCode).toBe(0);
    });

    it("docs: 更新文档", () => {
      const result = lintMessage("docs: 更新文档");
      expect(result.exitCode).toBe(0);
    });

    it("refactor: 重构代码", () => {
      const result = lintMessage("refactor: 重构代码");
      expect(result.exitCode).toBe(0);
    });

    it("test: 添加测试", () => {
      const result = lintMessage("test: 添加测试");
      expect(result.exitCode).toBe(0);
    });

    it("feat(scope): 带 scope 的功能提交", () => {
      const result = lintMessage("feat(auth): 新增登录功能");
      expect(result.exitCode).toBe(0);
    });

    it("fix!: breaking change 修复", () => {
      const result = lintMessage("fix!: 破坏性变更修复");
      expect(result.exitCode).toBe(0);
    });
  });

  describe("不规范的 commit message（应被拒绝）", () => {
    it("无类型前缀的随意描述", () => {
      const result = lintMessage("随便写");
      expect(result.exitCode).not.toBe(0);
    });

    it("无冒号分隔符", () => {
      const result = lintMessage("feat 新增功能");
      expect(result.exitCode).not.toBe(0);
    });

    it("类型首字母大写（不符合规范）", () => {
      const result = lintMessage("Feat: 新增功能");
      expect(result.exitCode).not.toBe(0);
    });

    it("空 subject", () => {
      const result = lintMessage("feat: ");
      expect(result.exitCode).not.toBe(0);
    });

    it("无效类型", () => {
      const result = lintMessage("update: 更新了一些东西");
      expect(result.exitCode).not.toBe(0);
    });
  });
});
