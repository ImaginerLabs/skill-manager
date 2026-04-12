// ============================================================
// server/routes/workflowRoutes.ts — 工作流编排 API 路由
// ============================================================

import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { WorkflowSchema } from "../../shared/schemas.js";
import {
  createWorkflow,
  deleteWorkflow,
  getWorkflowById,
  getWorkflows,
  previewWorkflow,
  updateWorkflow,
} from "../services/workflowService.js";

export const workflowRoutes = Router();

/**
 * GET /api/workflows — 获取所有工作流列表
 */
workflowRoutes.get(
  "/workflows",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const workflows = await getWorkflows();
      res.json({ success: true, data: workflows });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * POST /api/workflows — 创建新工作流（生成 .md 文件）
 */
workflowRoutes.post(
  "/workflows",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = WorkflowSchema.safeParse(req.body);
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
      const result = await createWorkflow(parsed.data);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * POST /api/workflows/preview — 预览工作流内容（不保存）
 */
workflowRoutes.post(
  "/workflows/preview",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = WorkflowSchema.safeParse(req.body);
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
      const content = previewWorkflow(parsed.data);
      res.json({ success: true, data: { content } });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /api/workflows/:id — 获取单个工作流详情（结构化数据）
 */
workflowRoutes.get(
  "/workflows/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const workflow = await getWorkflowById(id);
      res.json({ success: true, data: workflow });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * PUT /api/workflows/:id — 更新工作流
 */
workflowRoutes.put(
  "/workflows/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const parsed = WorkflowSchema.safeParse(req.body);
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
      const result = await updateWorkflow(id, parsed.data);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * DELETE /api/workflows/:id — 删除工作流
 */
workflowRoutes.delete(
  "/workflows/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await deleteWorkflow(id);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  },
);
