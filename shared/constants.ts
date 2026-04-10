// ============================================================
// shared/constants.ts — 前后端共享常量定义
// ============================================================

/**
 * 错误码常量
 * 使用 UPPER_SNAKE_CASE 命名，与 API 响应中的 error.code 对应
 */
export const ErrorCode = {
  // 通用错误
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",

  // Skill 相关
  SKILL_NOT_FOUND: "SKILL_NOT_FOUND",
  PARSE_ERROR: "PARSE_ERROR",

  // 配置相关
  CONFIG_ERROR: "CONFIG_ERROR",

  // 文件操作相关
  FILE_WRITE_ERROR: "FILE_WRITE_ERROR",
  FILE_READ_ERROR: "FILE_READ_ERROR",

  // 安全相关
  PATH_TRAVERSAL: "PATH_TRAVERSAL",

  // 扫描相关
  SCAN_PATH_NOT_FOUND: "SCAN_PATH_NOT_FOUND",
  SCAN_PERMISSION_DENIED: "SCAN_PERMISSION_DENIED",
} as const;

/** 错误码类型 */
export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * HTTP 状态码常量
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/** HTTP 状态码类型 */
export type HttpStatusValue = (typeof HttpStatus)[keyof typeof HttpStatus];
