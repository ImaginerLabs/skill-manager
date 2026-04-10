// ============================================================
// server/utils/yamlUtils.ts — YAML 配置文件读写工具
// ============================================================

import fs from "fs-extra";
import yaml from "js-yaml";
import path from "node:path";

import { AppError } from "../types/errors.js";

/**
 * 读取并解析 YAML 文件
 *
 * @param filePath - YAML 文件的绝对路径
 * @returns 解析后的对象，文件不存在时返回 null
 * @throws AppError 当 YAML 语法错误时
 */
export async function readYaml<T>(filePath: string): Promise<T | null> {
  // 文件不存在时返回 null（不抛异常）
  const exists = await fs.pathExists(filePath);
  if (!exists) {
    return null;
  }

  const content = await fs.readFile(filePath, "utf-8");

  // 空文件返回 null
  if (!content.trim()) {
    return null;
  }

  try {
    const data = yaml.load(content) as T;
    return data;
  } catch (err) {
    throw AppError.parseError(
      `YAML 解析失败 (${filePath}): ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

/**
 * 将数据序列化为 YAML 并写入文件
 * 写入前自动确保目标目录存在
 *
 * 注意：当前阶段直接使用 fs.writeFile，原子写入在 Story 2.0 实现
 *
 * @param filePath - YAML 文件的绝对路径
 * @param data - 要序列化的数据
 */
export async function writeYaml(
  filePath: string,
  data: unknown,
): Promise<void> {
  const yamlString = yaml.dump(data, {
    indent: 2,
    lineWidth: -1, // 不自动换行
    noRefs: true, // 不使用 YAML 引用
  });

  // 确保目标目录存在
  await fs.ensureDir(path.dirname(filePath));

  await fs.writeFile(filePath, yamlString, "utf-8");
}
