import path from "node:path";
import express from "express";
import cors from "cors";
import { healthRoutes } from "./routes/healthRoutes.js";
import { configRoutes } from "./routes/configRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

interface AppOptions {
  isProduction: boolean;
  distPath: string;
}

export function createApp(options: AppOptions) {
  const app = express();

  // 中间件
  app.use(cors());
  app.use(express.json());

  // 生产模式：serve Vite 构建产物（静态文件优先）
  if (options.isProduction) {
    app.use(express.static(options.distPath));
  }

  // API 路由
  app.use("/api", healthRoutes);
  app.use("/api", configRoutes);

  // API 404 处理器：未匹配的 /api/* 路由返回 JSON 404
  app.all("/api/{*path}", (_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "API endpoint not found",
      },
    });
  });

  // 生产模式：SPA fallback — 所有非 API 路由返回 index.html
  if (options.isProduction) {
    app.get("{*path}", (_req, res) => {
      res.sendFile(path.join(options.distPath, "index.html"));
    });
  }

  // 全局错误处理中间件（必须在所有路由之后注册）
  app.use(errorHandler);

  return app;
}
