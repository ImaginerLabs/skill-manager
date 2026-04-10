// ============================================================
// server/routes/importRoutes.ts — 导入 API 路由
// ============================================================

import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import {
  ImportRequestBodySchema,
  ScanRequestBodySchema,
} from "../../shared/schemas.js";
import { cleanupFiles, importFiles } from "../services/importService.js";
import { detectCodeBuddy, scanDirectory } from "../services/scanService.js";

export const importRoutes = Router();

/**
 * POST /api/import/scan — 扫描 IDE 目录中的 Skill 文件
 *
 * 请求体（可选）：{ path?: string }
 * - 无 path 时扫描默认 CodeBuddy 路径 (~/.codebuddy/skills/)
 * - 有 path 时扫描指定路径
 */
importRoutes.post(
  "/import/scan",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = ScanRequestBodySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues
              .map((i) => `${i.path.join(".")}: ${i.message}`)
              .join("; "),
          },
        });
        return;
      }

      const result = await scanDirectory(parsed.data.path);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * POST /api/import/execute — 执行文件导入
 *
 * 请求体：{ items: [{ absolutePath, name }], category: string }
 */
importRoutes.post(
  "/import/execute",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = ImportRequestBodySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues
              .map((i) => `${i.path.join(".")}: ${i.message}`)
              .join("; "),
          },
        });
        return;
      }

      const result = await importFiles(parsed.data);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /api/import/detect-codebuddy — 检测 CodeBuddy IDE 目录
 * 用于冷启动引导
 */
importRoutes.get(
  "/import/detect-codebuddy",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await detectCodeBuddy();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * POST /api/import/cleanup — 清理源文件（导入后删除原始文件）
 *
 * 请求体：{ filePaths: string[] }
 */
importRoutes.post(
  "/import/cleanup",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filePaths } = req.body as { filePaths?: string[] };
      if (!Array.isArray(filePaths) || filePaths.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "filePaths 为必填项且不能为空",
          },
        });
        return;
      }

      const result = await cleanupFiles(filePaths);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);
