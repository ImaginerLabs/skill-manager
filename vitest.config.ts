/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify("test"),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./shared"),
      "@server": path.resolve(__dirname, "./server"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: [
      "src/**/*.test.{ts,tsx}",
      "server/**/*.test.ts",
      "shared/**/*.test.ts",
      "tests/**/*.test.{ts,tsx}",
    ],
    // 临时排除 @lobehub/ui ESM 兼容性问题的测试文件（第三方包 bug）
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{bay,cy,comm}ardrc.{js,ts}",
      "**/{bay,bundle,cypress,dist,hot,normalized,output,story,tsOut,var}/**",
      "**/TargetForm.test.tsx",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/types/**",
        "dist/",
        "dist-server/",
      ],
    },
  },
});
