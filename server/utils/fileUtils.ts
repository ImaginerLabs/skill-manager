// ============================================================
// server/utils/fileUtils.ts — 原子写入与并发安全写入工具
// ============================================================

import { Mutex } from "async-mutex";
import fs from "fs-extra";
import path from "node:path";
import { AppError } from "../types/errors.js";
import { normalizePath } from "./pathUtils.js";

/**
 * 原子写入文件
 * 先写入 .tmp 临时文件，再通过 fs.rename 原子替换目标文件
 * 中途中断不会产生损坏的目标文件（AR11）
 *
 * @param filePath - 目标文件绝对路径
 * @param content - 文件内容（UTF-8）
 */
export async function atomicWrite(
  filePath: string,
  content: string,
): Promise<void> {
  const tmpPath = `${filePath}.tmp.${Date.now()}`;

  try {
    // 确保目标目录存在
    await fs.ensureDir(path.dirname(filePath));
    // 写入临时文件
    await fs.writeFile(tmpPath, content, "utf-8");
    // 原子替换目标文件
    await fs.rename(tmpPath, filePath);
  } catch (err) {
    // 清理临时文件（忽略清理失败）
    await fs.remove(tmpPath).catch(() => {});
    throw AppError.fileWriteError(
      `写入文件失败 [${filePath}]: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

// ---- 并发控制 ----

/** 每个文件路径一个独立 Mutex，不同文件可并行写入 */
const mutexMap = new Map<string, Mutex>();

/**
 * 获取文件路径对应的 Mutex 实例
 * 使用归一化后的绝对路径作为 key，确保同一文件使用同一把锁
 */
function getMutex(filePath: string): Mutex {
  const normalized = normalizePath(path.resolve(filePath));
  let mutex = mutexMap.get(normalized);
  if (!mutex) {
    mutex = new Mutex();
    mutexMap.set(normalized, mutex);
  }
  return mutex;
}

/**
 * 并发安全写入文件
 * 基于 async-mutex 的并发控制，同一文件的写入按顺序执行（AR12）
 * 不同文件路径使用独立 Mutex，可并行写入
 *
 * @param filePath - 目标文件绝对路径
 * @param content - 文件内容（UTF-8）
 */
export async function safeWrite(
  filePath: string,
  content: string,
): Promise<void> {
  const mutex = getMutex(filePath);
  const release = await mutex.acquire();
  try {
    await atomicWrite(filePath, content);
  } finally {
    release();
  }
}

/**
 * 清除所有 Mutex 缓存（仅用于测试）
 */
export function _clearMutexCache(): void {
  mutexMap.clear();
}
