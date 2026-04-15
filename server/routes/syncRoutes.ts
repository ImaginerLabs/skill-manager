// ============================================================
// server/routes/syncRoutes.ts — 同步管理 API 路由
// ============================================================

import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import {
  DiffRequestSchema,
  SyncPushRequestSchema,
  SyncTargetCreateSchema,
  SyncTargetUpdateSchema,
} from "../../shared/schemas.js";
import {
  addSyncTarget,
  diffSync,
  getSyncTargets,
  pushSync,
  removeSyncTarget,
  updateSyncTarget,
  validateSyncPath,
} from "../services/syncService.js";

export const syncRoutes = Router();

/**
 * GET /api/sync/targets — 获取所有同步目标
 */
syncRoutes.get(
  "/sync/targets",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const targets = await getSyncTargets();
      res.json({ success: true, data: targets });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * POST /api/sync/targets — 添加同步目标
 */
syncRoutes.post(
  "/sync/targets",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = SyncTargetCreateSchema.safeParse(req.body);
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
      const target = await addSyncTarget(parsed.data);
      res.status(201).json({ success: true, data: target });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * PUT /api/sync/targets/:id — 更新同步目标
 */
syncRoutes.put(
  "/sync/targets/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const parsed = SyncTargetUpdateSchema.safeParse(req.body);
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
      const target = await updateSyncTarget(id, parsed.data);
      res.json({ success: true, data: target });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * DELETE /api/sync/targets/:id — 删除同步目标
 */
syncRoutes.delete(
  "/sync/targets/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await removeSyncTarget(id);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * POST /api/sync/validate-path — 校验路径是否存在且可写
 */
syncRoutes.post(
  "/sync/validate-path",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { path } = req.body as { path?: string };
      if (!path || typeof path !== "string") {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "path 为必填项",
          },
        });
        return;
      }
      const result = await validateSyncPath(path);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * POST /api/sync/diff — 对比源 Skill 与目标目录的差异（不执行文件操作）
 */
syncRoutes.post(
  "/sync/diff",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = DiffRequestSchema.safeParse(req.body);
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
      const report = await diffSync(parsed.data.skillIds, parsed.data.targetId);
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * POST /api/sync/push — 执行同步推送（支持 full / incremental / replace 模式）
 */
syncRoutes.post(
  "/sync/push",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = SyncPushRequestSchema.safeParse(req.body);
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
      const result = await pushSync(
        parsed.data.skillIds,
        parsed.data.targetIds,
        parsed.data.mode,
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);
