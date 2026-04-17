import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import {
  ensureDefaultBundle,
  migrateBundlesIfNeeded,
} from "./services/bundleService.js";
import { initializeSkillCache } from "./services/skillService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === "production";
const PORT = isProduction
  ? Number(process.env.PORT) || 3000
  : Number(process.env.PORT) || 3001;

const distPath = path.join(__dirname, "..", "dist");
const app = createApp({ isProduction, distPath });

// 启动服务，绑定 127.0.0.1（仅 localhost 访问）
app.listen(PORT, "127.0.0.1", async () => {
  const mode = isProduction ? "生产" : "开发";
  console.log(`\n  🚀 Skill Manager 后端已启动（${mode}模式）`);
  console.log(`  ➜ http://127.0.0.1:${PORT}\n`);

  // 启动后初始化（异步，不阻塞服务启动）
  try {
    await migrateBundlesIfNeeded();
    await initializeSkillCache();
    await ensureDefaultBundle();
  } catch (err) {
    console.error("[启动] 初始化失败:", err);
  }
});
