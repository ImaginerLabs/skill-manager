# Deferred Work

## Deferred from: code review of Epic 2 (2026-04-11)

- **ImportPage 组件过大（386行），缺少组件拆分** — `src/pages/ImportPage.tsx` 承载了扫描、勾选、分类选择、导入、清理确认等所有逻辑，建议后续拆分为 `ScanSection`、`ImportWizard`、`CleanupDialog` 等子组件。Story 2-2 明确说"不要创建新的组件文件"，属于已有架构决策。
- **SKILLS_ROOT 硬编码为相对路径** — `server/services/importService.ts` 中 `SKILLS_ROOT` 通过 `__dirname` 相对计算，在测试或部署路径变化时可能不稳定。建议后续通过配置注入。
