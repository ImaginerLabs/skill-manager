// ============================================================
// server/types/errors.ts — AppError 类定义
// ============================================================

import { ErrorCode, HttpStatus } from "../../shared/constants.js";

/**
 * 应用错误类 — 所有后端业务错误必须使用此类
 * 包含 code（错误码）和 statusCode（HTTP 状态码）
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;

    // 确保 instanceof 正确工作
    Object.setPrototypeOf(this, AppError.prototype);
  }

  // ---- 静态工厂方法 ----

  /** 404 资源未找到 */
  static notFound(message = "资源未找到"): AppError {
    return new AppError(ErrorCode.NOT_FOUND, message, HttpStatus.NOT_FOUND);
  }

  /** 400 请求参数错误 */
  static badRequest(message = "请求参数错误"): AppError {
    return new AppError(
      ErrorCode.VALIDATION_ERROR,
      message,
      HttpStatus.BAD_REQUEST,
    );
  }

  /** 500 内部服务器错误 */
  static internal(message = "内部服务器错误"): AppError {
    return new AppError(
      ErrorCode.INTERNAL_ERROR,
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /** 校验错误 */
  static validationError(message = "数据校验失败"): AppError {
    return new AppError(
      ErrorCode.VALIDATION_ERROR,
      message,
      HttpStatus.BAD_REQUEST,
    );
  }

  /** 解析错误 */
  static parseError(message = "文件解析失败"): AppError {
    return new AppError(ErrorCode.PARSE_ERROR, message, HttpStatus.BAD_REQUEST);
  }

  /** Skill 未找到 */
  static skillNotFound(skillId: string): AppError {
    return new AppError(
      ErrorCode.SKILL_NOT_FOUND,
      `Skill "${skillId}" 未找到`,
      HttpStatus.NOT_FOUND,
    );
  }

  /** 配置错误 */
  static configError(message = "配置读取失败"): AppError {
    return new AppError(
      ErrorCode.CONFIG_ERROR,
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /** 文件写入错误 */
  static fileWriteError(message = "文件写入失败"): AppError {
    return new AppError(
      ErrorCode.FILE_WRITE_ERROR,
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /** 路径遍历攻击 */
  static pathTraversal(message = "非法路径访问"): AppError {
    return new AppError(
      ErrorCode.PATH_TRAVERSAL,
      message,
      HttpStatus.BAD_REQUEST,
    );
  }

  /** 扫描路径不存在 */
  static scanPathNotFound(scanPath: string): AppError {
    return new AppError(
      ErrorCode.SCAN_PATH_NOT_FOUND,
      `扫描路径不存在: ${scanPath}`,
      HttpStatus.NOT_FOUND,
    );
  }

  /** 扫描路径权限被拒 */
  static scanPermissionDenied(scanPath: string): AppError {
    return new AppError(
      ErrorCode.SCAN_PERMISSION_DENIED,
      `扫描路径权限被拒: ${scanPath}`,
      HttpStatus.FORBIDDEN,
    );
  }
}
