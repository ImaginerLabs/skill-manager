// ============================================================
// server/routes/skillRoutes.ts — Skill API 路由
// ============================================================

import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import {
  MoveSkillCategoryBodySchema,
  UpdateSkillMetaBodySchema,
} from "../../shared/schemas.js";
import {
  deleteSkill,
  deleteSkillsByPath,
  getAllSkills,
  getParseErrors,
  getSkillFull,
  moveSkillToCategory,
  refreshSkillCache,
  updateSkillMeta,
} from "../services/skillService.js";

export const skillRoutes = Router();

/**
 * GET /api/skills — 获取所有 Skill 元数据列表
 */
skillRoutes.get(
  "/skills",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const skills = getAllSkills();
      res.json({
        success: true,
        data: skills,
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /api/skills/errors — 获取解析失败的文件列表
 * 注意：此路由必须在 /api/skills/:id 之前注册，否则 "errors" 会被当作 :id
 */
skillRoutes.get(
  "/skills/errors",
  (_req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = getParseErrors();
      res.json({
        success: true,
        data: errors,
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /api/skills/:id — 获取单个 Skill 完整内容（meta + Markdown content）
 */
skillRoutes.get(
  "/skills/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const skill = await getSkillFull(id);
      res.json({
        success: true,
        data: skill,
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * POST /api/refresh — 手动触发 Skill 列表刷新（重新扫描 skills/ 目录）
 */
skillRoutes.post(
  "/refresh",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await refreshSkillCache();
      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * PUT /api/skills/:id/meta — 更新 Skill Frontmatter 元数据
 */
skillRoutes.put(
  "/skills/:id/meta",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const parsed = UpdateSkillMetaBodySchema.safeParse(req.body);
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
      const updated = await updateSkillMeta(id, parsed.data);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * PUT /api/skills/:id/category — 移动 Skill 到其他分类
 */
skillRoutes.put(
  "/skills/:id/category",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const parsed = MoveSkillCategoryBodySchema.safeParse(req.body);
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
      const updated = await moveSkillToCategory(id, parsed.data.category);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * DELETE /api/skills/by-path?path=xxx — 删除目标目录下所有 Skill 文件
 */
skillRoutes.delete(
  "/skills/by-path",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { path: targetPath } = req.query;
      if (typeof targetPath !== "string" || !targetPath.trim()) {
        res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "path is required" },
        });
        return;
      }
      const deleted = await deleteSkillsByPath(targetPath);
      res.json({ success: true, data: { deleted } });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * DELETE /api/skills/:id — 删除 Skill 文件
 */
skillRoutes.delete(
  "/skills/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await deleteSkill(id);
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  },
);
