import fs from "fs-extra";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  _clearMutexCache,
  atomicWrite,
  safeWrite,
} from "../../../../server/utils/fileUtils";

// Mock fs-extra
vi.mock("fs-extra", () => ({
  default: {
    ensureDir: vi.fn(),
    writeFile: vi.fn(),
    rename: vi.fn(),
    remove: vi.fn(),
  },
}));

describe("fileUtils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _clearMutexCache();
  });

  describe("atomicWrite", () => {
    it("正常写入：先写临时文件再 rename", async () => {
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined as never);
      vi.mocked(fs.rename).mockResolvedValue(undefined as never);

      await atomicWrite("/project/skills/test.md", "# Hello");

      // 确保目录存在
      expect(fs.ensureDir).toHaveBeenCalledWith("/project/skills");
      // 写入临时文件
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringMatching(/^\/project\/skills\/test\.md\.tmp\.\d+$/),
        "# Hello",
        "utf-8",
      );
      // 原子替换
      expect(fs.rename).toHaveBeenCalledWith(
        expect.stringMatching(/^\/project\/skills\/test\.md\.tmp\.\d+$/),
        "/project/skills/test.md",
      );
    });

    it("写入前自动创建目录", async () => {
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined as never);
      vi.mocked(fs.rename).mockResolvedValue(undefined as never);

      await atomicWrite("/deep/nested/dir/file.md", "content");

      expect(fs.ensureDir).toHaveBeenCalledWith("/deep/nested/dir");
    });

    it("写入失败时清理临时文件", async () => {
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.writeFile).mockRejectedValue(
        new Error("ENOSPC: 磁盘空间不足"),
      );
      vi.mocked(fs.remove).mockResolvedValue(undefined as never);

      await expect(
        atomicWrite("/project/skills/test.md", "content"),
      ).rejects.toThrow("写入文件失败");

      // 确认清理了临时文件
      expect(fs.remove).toHaveBeenCalledWith(
        expect.stringMatching(/^\/project\/skills\/test\.md\.tmp\.\d+$/),
      );
    });

    it("rename 失败时清理临时文件", async () => {
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined as never);
      vi.mocked(fs.rename).mockRejectedValue(new Error("EPERM: 权限不足"));
      vi.mocked(fs.remove).mockResolvedValue(undefined as never);

      await expect(
        atomicWrite("/project/skills/test.md", "content"),
      ).rejects.toThrow("写入文件失败");

      expect(fs.remove).toHaveBeenCalled();
    });

    it("错误信息包含文件路径和原始错误", async () => {
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.writeFile).mockRejectedValue(new Error("EACCES: 权限被拒"));
      vi.mocked(fs.remove).mockResolvedValue(undefined as never);

      await expect(
        atomicWrite("/project/skills/test.md", "content"),
      ).rejects.toThrow(/\/project\/skills\/test\.md/);

      await expect(
        atomicWrite("/project/skills/test.md", "content"),
      ).rejects.toThrow(/EACCES/);
    });

    it("抛出 AppError 类型错误", async () => {
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.writeFile).mockRejectedValue(new Error("写入失败"));
      vi.mocked(fs.remove).mockResolvedValue(undefined as never);

      try {
        await atomicWrite("/project/skills/test.md", "content");
        expect.fail("应该抛出错误");
      } catch (err: unknown) {
        expect((err as { name: string }).name).toBe("AppError");
        expect((err as { code: string }).code).toBe("FILE_WRITE_ERROR");
      }
    });

    it("清理临时文件失败不影响错误抛出", async () => {
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.writeFile).mockRejectedValue(new Error("写入失败"));
      vi.mocked(fs.remove).mockRejectedValue(new Error("清理也失败了"));

      await expect(
        atomicWrite("/project/skills/test.md", "content"),
      ).rejects.toThrow("写入文件失败");
    });
  });

  describe("safeWrite", () => {
    it("单次写入成功", async () => {
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined as never);
      vi.mocked(fs.rename).mockResolvedValue(undefined as never);

      await safeWrite("/project/skills/test.md", "# Hello");

      expect(fs.writeFile).toHaveBeenCalledTimes(1);
      expect(fs.rename).toHaveBeenCalledTimes(1);
    });

    it("并发写入同一文件按顺序执行", async () => {
      const writeOrder: number[] = [];
      let callCount = 0;

      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.writeFile).mockImplementation(async () => {
        const current = ++callCount;
        // 模拟不同的写入耗时
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 10));
        writeOrder.push(current);
      });
      vi.mocked(fs.rename).mockResolvedValue(undefined as never);

      // 并发 10 次写入同一文件
      const promises = Array.from({ length: 10 }, (_, i) =>
        safeWrite("/project/skills/same-file.md", `content-${i}`),
      );

      await Promise.all(promises);

      // 所有写入都应该完成
      expect(writeOrder).toHaveLength(10);
      // 写入顺序应该是递增的（按顺序执行）
      for (let i = 1; i < writeOrder.length; i++) {
        expect(writeOrder[i]).toBeGreaterThan(writeOrder[i - 1]);
      }
    });

    it("不同文件路径使用独立 Mutex（可并行）", async () => {
      const activeWrites = new Set<string>();
      let maxConcurrent = 0;

      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.writeFile).mockImplementation(async (_path) => {
        const filePath = _path as string;
        activeWrites.add(filePath);
        maxConcurrent = Math.max(maxConcurrent, activeWrites.size);
        await new Promise((resolve) => setTimeout(resolve, 20));
        activeWrites.delete(filePath);
      });
      vi.mocked(fs.rename).mockResolvedValue(undefined as never);

      // 并发写入不同文件
      const promises = [
        safeWrite("/project/skills/file-a.md", "content-a"),
        safeWrite("/project/skills/file-b.md", "content-b"),
        safeWrite("/project/skills/file-c.md", "content-c"),
      ];

      await Promise.all(promises);

      // 不同文件应该能并行写入（最大并发 > 1）
      expect(maxConcurrent).toBeGreaterThan(1);
    });

    it("写入失败时正确释放 Mutex", async () => {
      vi.mocked(fs.ensureDir).mockResolvedValue(undefined as never);
      vi.mocked(fs.writeFile)
        .mockRejectedValueOnce(new Error("第一次失败"))
        .mockResolvedValue(undefined as never);
      vi.mocked(fs.rename).mockResolvedValue(undefined as never);
      vi.mocked(fs.remove).mockResolvedValue(undefined as never);

      // 第一次写入失败
      await expect(
        safeWrite("/project/skills/test.md", "content-1"),
      ).rejects.toThrow();

      // 第二次写入应该能成功（Mutex 已释放）
      await safeWrite("/project/skills/test.md", "content-2");

      expect(fs.writeFile).toHaveBeenCalledTimes(2);
    });
  });
});
