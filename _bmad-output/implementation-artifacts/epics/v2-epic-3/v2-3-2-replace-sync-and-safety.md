# Story V2-3.2: 替换同步与安全确认

Status: done

## Story

作为一个使用 Skill Manager 的开发者，
我希望同步推送支持替换模式（先删除目标中对应文件夹，再全量复制），
并在执行前弹出确认对话框警告破坏性操作，
以便在需要干净同步时使用，同时避免误操作。

## Acceptance Criteria（验收标准）

1. **Given** `POST /api/sync/push` 的 `mode` 参数为 `replace`，**When** 执行同步，**Then** 先安全删除目标中对应文件夹，再全量复制
2. **Given** 替换模式删除目标文件夹前，**When** 检查路径安全性，**Then** 使用 `isSubPath` 防止路径穿越（AD-47）
3. **Given** 用户在前端点击替换同步，**When** 触发操作，**Then** 弹出 `ReplaceSyncConfirmDialog` 确认对话框，显示 Skill 数量和破坏性警告
4. **Given** 用户确认替换同步，**When** 执行完成，**Then** 显示成功 Toast 通知
5. 全量测试通过，无回归

## Tasks / Subtasks

- [x] Task 1: 实现 `syncService.ts` 替换同步逻辑 — `mode === "replace"` 分支
- [x] Task 2: 添加 `isSubPath` 路径穿越防护
- [x] Task 3: 创建 `ReplaceSyncConfirmDialog.tsx` 确认对话框组件
- [x] Task 4: 在 `SyncExecutor.tsx` 中集成替换同步确认流程
- [x] Task 5: 添加 i18n 翻译键（replaceSyncConfirmTitle/Desc/Warning/confirmReplaceSync）
- [x] Task 6: 编写单元测试
- [x] Task 7: 验证无回归

## Dev Agent Record

### Agent Model Used
claude-4.6-opus-1m-context

### Completion Notes List
- ✅ Task 1-2: 替换同步后端逻辑 + isSubPath 路径穿越防护
- ✅ Task 3: ReplaceSyncConfirmDialog 确认对话框
- ✅ Task 4: SyncExecutor 集成替换同步确认流程
- ✅ Task 5: i18n 翻译键
- ✅ Task 6-7: 测试通过

### Change Log
- 2026-04-14: 实现替换同步后端逻辑和前端确认对话框

### File List
- server/services/syncService.ts（修改）
- src/components/sync/ReplaceSyncConfirmDialog.tsx（新建）
- src/components/sync/SyncExecutor.tsx（修改）
- src/i18n/locales/zh.ts（修改）
- src/i18n/locales/en.ts（修改）
