// ============================================================
// server/middleware/pathValidator.ts — 路径遍历防护中间件
// ============================================================

import type { NextFunction, Request, RequestHandler, Response } from "express";
import path from "node:path";
import { AppError } from "../types/errors.js";
import { isSubPath, normalizePath } from "../utils/pathUtils.js";

/**
 * 检测路径字符串是否包含遍历攻击模式
 * 支持检测：../、..\\、URL 编码的 %2e%2e、%2f、%5c
 *
 * @param value - 待检测的路径字符串
 * @returns 如果包含遍历模式返回 true
 */
function hasTraversalPattern(value: string): boolean {
  // 先 URL 解码（处理 %2e%2e%2f 等编码攻击）
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    // 解码失败视为可疑，拒绝
    return true;
  }

  // 检查是否包含 .. 路径段
  const normalized = normalizePath(decoded);
  const segments = normalized.split("/");
  return segments.some((seg) => seg === "..");
}

/**
 * 独立校验函数 — 可在非中间件场景使用
 * 校验路径参数是否安全（无遍历攻击且在白名单目录内）
 *
 * @param paramValue - 待校验的路径值
 * @param allowedRoots - 白名单目录列表
 * @returns 如果路径安全返回 true
 */
export function validatePathParam(
  paramValue: string,
  allowedRoots: string[],
): boolean {
  // 检查遍历模式
  if (hasTraversalPattern(paramValue)) {
    return false;
  }

  // 如果没有白名单目录，只检查遍历模式
  if (allowedRoots.length === 0) {
    return true;
  }

  // 解码后解析为绝对路径，校验是否在白名单目录内
  let decoded: string;
  try {
    decoded = decodeURIComponent(paramValue);
  } catch {
    return false;
  }

  const resolved = normalizePath(path.resolve(decoded));
  return allowedRoots.some((root) => isSubPath(resolved, root));
}

/**
 * 创建路径遍历防护中间件
 * 校验请求中的路径参数是否安全（NFR6）
 *
 * @param allowedRoots - 白名单目录列表（绝对路径）
 * @returns Express 中间件
 *
 * @example
 * ```typescript
 * // 在路由中使用
 * router.use(createPathValidator(['/project/skills', '/project/config']));
 * ```
 */
export function createPathValidator(allowedRoots: string[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // 校验 URL 路径参数（req.params）
    for (const [key, value] of Object.entries(req.params)) {
      if (typeof value === "string" && value.length > 0) {
        if (hasTraversalPattern(value)) {
          next(AppError.pathTraversal(`路径参数 "${key}" 包含非法遍历模式`));
          return;
        }
      }
    }

    // 校验请求体中的路径字段（常见字段名）
    if (req.body && typeof req.body === "object") {
      const pathFields = [
        "path",
        "filePath",
        "targetPath",
        "sourcePath",
        "directory",
      ];
      for (const field of pathFields) {
        const value = (req.body as Record<string, unknown>)[field];
        if (typeof value === "string" && value.length > 0) {
          if (!validatePathParam(value, allowedRoots)) {
            next(AppError.pathTraversal(`请求体字段 "${field}" 包含非法路径`));
            return;
          }
        }
      }
    }

    next();
  };
}
