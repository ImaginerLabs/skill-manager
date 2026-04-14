// ============================================================
// server/middleware/errorHandler.ts — Express 全局错误处理中间件
// ============================================================

import type { NextFunction, Request, Response } from "express";
import { ErrorCode, HttpStatus } from "../../shared/constants.js";
import { AppError } from "../types/errors.js";

/**
 * Express 全局错误处理中间件
 * 捕获所有路由中抛出的错误，返回统一的 ApiResponse 格式
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // 判断是否为已知的 AppError
  const isAppError = err instanceof AppError;
  const statusCode = isAppError
    ? err.statusCode
    : HttpStatus.INTERNAL_SERVER_ERROR;
  const code = isAppError ? err.code : ErrorCode.INTERNAL_ERROR;
  const message = isAppError ? err.message : "内部服务器错误";

  // 开发模式下包含 stack trace
  const isDevMode = process.env.NODE_ENV !== "production";
  const details = isDevMode && !isAppError ? err.stack : undefined;

  // 非 AppError 在服务端打印完整错误信息
  if (!isAppError) {
    console.error("[ErrorHandler] 未处理的错误:", err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined && { details }),
    },
  });
}
