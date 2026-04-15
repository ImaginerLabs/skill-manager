# Deferred Work

## Accepted Limitations (Won't Fix)

> 以下项目经评估后决定不修复，属于已知限制或设计取舍。

- **`toISOString()` 使用 UTC 时间导致日期与用户本地时区不一致** — `server/routes/statsRoutes.ts` 中 `mtime.toISOString().slice(0, 10)` 和日期序列生成都使用 UTC，在 UTC+ 时区用户看到的日期可能与直觉不一致。预存在问题，非本次引入。
- **触屏设备无法触发 Tooltip** — Radix Tooltip 依赖 hover 事件，移动端无法触发。项目定位桌面端工具，可接受。
- **`ActivityDay` 接口在前后端重复定义** — `server/routes/statsRoutes.ts` 和 `src/lib/api.ts` 各自定义 `ActivityDay`。Story 明确保持现有模式，避免引入重构风险。
- **测试依赖 `new Date()` 当前日期** — UTC 午夜边界可能导致测试不稳定。预存在测试模式，非本次引入。

## Completed: 延期工作全量清理 (2026-04-15)

**已完成的修复工作（7 项）：**

1. **ImportPage 组件拆分** — 将 `src/pages/ImportPage.tsx`（386 行）拆分为 `src/pages/import/` 目录，包含 `index.tsx`、`ScanPathInput.tsx`、`ImportFileList.tsx`、`CleanupConfirmDialog.tsx`、`useImport.ts` 五个模块，职责清晰。
2. **SKILLS_ROOT 配置注入** — `server/services/importService.ts` 中 `SKILLS_ROOT` 改为通过 `configService` 读取配置，不再依赖 `__dirname` 相对计算。
3. **WorkflowPage undo 恢复原位置** — 撤销删除时记录原始索引，恢复时使用 `splice` 插入原位置而非追加到末尾。
4. **TabsContent 条件渲染** — `SettingsPage` 中 `TabsContent` 改为条件渲染，隐藏 Tab 的子组件不再挂载和执行副作用。
5. **ActivityHeatmap useEffect 卸载清理** — 使用 `AbortController` 在组件卸载时取消请求，防止卸载后 setState。
6. **SecondarySidebar ErrorBoundary** — 为 `CategoryTree` 添加 `ErrorBoundary` 包裹，异常时显示降级 UI 而非整个布局崩溃。
7. **isSkillBrowsePage 路由匹配扩展** — 改为 `startsWith("/")` 或正则匹配，支持未来子路径扩展（如 `/skills/xxx`）。

## Completed: 目录结构审计与清理 (2026-04-11)

**已完成的清理工作：**

1. **清理冗余 `.gitkeep` 文件** — 删除了已有实际文件的目录中的 `.gitkeep`：
   - `src/components/skills/.gitkeep`（目录已有 8 个组件文件）
   - `src/components/settings/.gitkeep`（目录已有 `CategoryManager.tsx`）
   - `src/hooks/.gitkeep`（目录已有 `useSkillSearch.ts`）
   - `skills/.gitkeep`（目录已有 3 个分类子目录）
   - `tests/integration/.gitkeep`（目录已有 `api/` 子目录）

2. **删除 `src/types/` 空目录** — 该目录违反"共享层是唯一类型来源"规则，所有类型定义在 `shared/`，`src/types/` 的存在会误导开发者。

3. **统一 E2E 测试位置** — 将根目录 `e2e/` 下的 `app.spec.ts` 和 `import.spec.ts` 移至 `tests/e2e/`，消除测试文件分散在两个位置的问题。同步更新 `playwright.config.ts` 的 `testDir` 为 `./tests/e2e`。

4. **完善 `.gitignore`** — 为 `knowledge/` 和 `test-results/` 添加尾部斜杠和注释，新增 `playwright-report/` 条目。

5. **更新 `project-context.md`** — 同步更新 E2E 测试目录描述，反映统一后的结构。
