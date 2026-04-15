# Story V2-3.4: SplitButton UI 与 Diff 报告前端

Status: done

## Story

作为一个使用 Skill Manager 的开发者，
我希望同步按钮从单一按钮升级为 SplitButton（主按钮：增量同步，下拉菜单：替换同步 + 查看差异），
以便快速选择不同的同步模式。

## Acceptance Criteria（验收标准）

1. **Given** 同步页面，**When** 查看同步按钮，**Then** 显示 SplitButton（主按钮「增量同步」+ 下拉箭头）
2. **Given** SplitButton 下拉菜单，**When** 展开，**Then** 显示三个选项：增量同步、替换同步、查看差异
3. **Given** 下拉菜单打开，**When** 点击外部区域，**Then** 菜单自动关闭
4. **Given** 下拉菜单打开，**When** 按 Escape 键，**Then** 菜单关闭
5. **Given** SplitButton，**When** 同步执行中，**Then** 主按钮显示 loading 动画，所有按钮禁用
6. **Given** SplitButton，**When** 使用屏幕阅读器，**Then** 有正确的 ARIA 标签（`aria-haspopup="menu"` + `aria-expanded` + `role="menu"` + `role="menuitem"`）
7. 全量测试通过，无回归

## Tasks / Subtasks

- [x] Task 1: 创建 `SyncSplitButton.tsx` 组件
  - [x] 1.1 主按钮（增量同步）+ 下拉箭头按钮
  - [x] 1.2 下拉菜单（增量同步 / 替换同步 / 查看差异）
  - [x] 1.3 点击外部关闭 + Escape 关闭
  - [x] 1.4 Loading 状态（sync / diff 分别显示）
  - [x] 1.5 ARIA 无障碍标签
- [x] Task 2: 修改 `SyncExecutor.tsx` — 替换原有同步按钮为 SyncSplitButton
- [x] Task 3: 扩展 `sync-store.ts` — 添加 `diffReport`、`executeDiff`、`setDiffReport` 状态
- [x] Task 4: 添加 i18n 翻译键（incrementalSync/replaceSync/viewDiff/moreSyncOptions 等）
- [x] Task 5: 编写单元测试
- [x] Task 6: 验证无回归

## Dev Notes

### SyncSplitButton 组件结构

```
┌─────────────────────┬──────┐
│  🔄 增量同步         │  ▼  │
└─────────────────────┴──────┘
                      ┌──────────────────┐
                      │ 🔄 增量同步       │
                      │ 🔁 替换同步       │
                      │ ─────────────── │
                      │ 📋 查看差异       │
                      └──────────────────┘
```

### sync-store 扩展

新增状态：
- `diffReport: DiffReport | null`
- `executeDiff(targetId: string): Promise<void>`
- `setDiffReport(report: DiffReport | null): void`
- `syncStatus` 新增 `"diffing"` 状态

## Dev Agent Record

### Agent Model Used
claude-4.6-opus-1m-context

### Completion Notes List
- ✅ Task 1: SyncSplitButton 组件（主按钮 + 下拉菜单 + ARIA）
- ✅ Task 2: SyncExecutor 替换为 SyncSplitButton
- ✅ Task 3: sync-store 扩展（diffReport/executeDiff/setDiffReport）
- ✅ Task 4: i18n 翻译键
- ✅ Task 5-6: 测试通过

### Change Log
- 2026-04-14: 实现 SyncSplitButton 和 Diff 报告前端集成

### File List
- src/components/sync/SyncSplitButton.tsx（新建）
- src/components/sync/SyncExecutor.tsx（修改）
- src/stores/sync-store.ts（修改）
- src/i18n/locales/zh.ts（修改）
- src/i18n/locales/en.ts（修改）
