// ============================================================
// server/routes/categoryRoutes.ts — 分类管理 API 路由
// ============================================================

import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import {
  CreateCategoryBodySchema,
  UpdateCategoryBodySchema,
} from "../../shared/schemas.js";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../services/categoryService.js";

export const categoryRoutes = Router();

/**
 * GET /api/categories — 获取分类列表（含 Skill 计数）
 */
categoryRoutes.get(
  "/categories",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await getCategories();
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * POST /api/categories — 创建新分类
 */
categoryRoutes.post(
  "/categories",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = CreateCategoryBodySchema.safeParse(req.body);
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
      const category = await createCategory(parsed.data);
      res.status(201).json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * PUT /api/categories/:name — 更新分类
 */
categoryRoutes.put(
  "/categories/:name",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.params;
      const parsed = UpdateCategoryBodySchema.safeParse(req.body);
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
      const category = await updateCategory(name, parsed.data);
      res.json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * DELETE /api/categories/:name — 删除分类
 */
categoryRoutes.delete(
  "/categories/:name",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.params;
      await deleteCategory(name);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  },
);
