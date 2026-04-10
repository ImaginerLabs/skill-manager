// ============================================================
// server/routes/configRoutes.ts — 配置 API 路由
// ============================================================

import { Router } from "express";
import { loadConfig, loadCategories } from "../services/configService.js";

export const configRoutes = Router();

/**
 * GET /api/config — 获取完整应用配置
 */
configRoutes.get("/config", async (_req, res, next) => {
  try {
    const config = await loadConfig();
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/categories — 获取分类列表
 */
configRoutes.get("/categories", async (_req, res, next) => {
  try {
    const categories = await loadCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});
