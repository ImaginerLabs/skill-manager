# Deferred Work

## Deferred from: code review of Epic 2 (2026-04-11)

- **ImportPage 组件过大（386行），缺少组件拆分** — `src/pages/ImportPage.tsx` 承载了扫描、勾选、分类选择、导入、清理确认等所有逻辑，建议后续拆分为 `ScanSection`、`ImportWizard`、`CleanupDialog` 等子组件。Story 2-2 明确说"不要创建新的组件文件"，属于已有架构决策。
- **SKILLS_ROOT 硬编码为相对路径** — `server/services/importService.ts` 中 `SKILLS_ROOT` 通过 `__dirname` 相对计算，在测试或部署路径变化时可能不稳定。建议后续通过配置注入。

## Deferred from: code review of Epic UX-IMPROVEMENT (2026-04-13)

- **WorkflowPage undo 恢复顺序不保证原位置** — `src/pages/WorkflowPage.tsx:98`，撤销删除时工作流被追加到列表末尾而非原位置。UX 可接受（刷新后顺序恢复正确），推迟处理。

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
