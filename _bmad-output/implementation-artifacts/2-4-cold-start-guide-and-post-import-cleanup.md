# Story 2.4: 冷启动引导与导入后清理

Status: done

## Story

As a 新用户,
I want 首次打开应用时被引导完成 Skill 导入,
So that 我能快速上手而不感到迷茫。

## Acceptance Criteria

1. **AC-1: 冷启动检测 API**
   - Given 用户首次打开应用（skills/ 目录为空）
   - When 前端调用 `GET /api/import/detect-codebuddy`
   - Then 后端检测默认 CodeBuddy IDE 目录是否存在且包含 .md 文件
   - And 返回 `{ detected: boolean, path: string, fileCount: number }`

2. **AC-2: 冷启动引导 UI**
   - Given SkillBrowsePage 加载且 skills 列表为空
   - When 检测到 CodeBuddy IDE 目录有文件
   - Then 显示引导卡片，提示用户导入
   - And 点击引导卡片跳转到 /import 页面

3. **AC-3: 导入后清理**
   - Given 用户完成导入
   - When 用户选择清理原始文件
   - Then 后端 `POST /api/import/cleanup` 删除指定的源文件
   - And 清理前弹出确认对话框
   - And 删除失败时提供清晰错误提示（FR35）

4. **AC-4: TypeScript 编译与测试通过**

## Tasks / Subtasks

- [x] Task 1: 后端冷启动检测 API (AC: #1)
  - [x] 1.1 在 importRoutes 添加 `GET /api/import/detect-codebuddy`
  - [x] 1.2 在 scanService 添加 `detectCodeBuddy()` 函数

- [x] Task 2: 后端清理 API (AC: #3)
  - [x] 2.1 在 importRoutes 添加 `POST /api/import/cleanup`
  - [x] 2.2 在 importService 添加 `cleanupFiles(paths)` 函数
  - [x] 2.3 编写单元测试

- [x] Task 3: 前端冷启动引导 (AC: #2)
  - [x] 3.1 在 api.ts 添加 `detectCodeBuddy()` 和 `cleanupFiles()` API
  - [x] 3.2 在 SkillBrowsePage 添加冷启动引导卡片
  - [x] 3.3 在 ImportPage 添加导入后清理选项

- [x] Task 4: 验证 (AC: #4)

### Review Findings

- [x] [Review][Patch] P2: cleanup 路由未传递 allowedRoot [server/routes/importRoutes.ts] — 已修复
- [x] [Review][Patch] P4: /api/import/cleanup 缺少 Zod Schema 校验 [server/routes/importRoutes.ts, shared/schemas.ts] — 已修复

## Dev Notes

### 已有代码上下文

- `server/services/scanService.ts` — `getDefaultScanPath()`, `scanDirectory()`
- `server/routes/importRoutes.ts` — 已有 scan 和 execute 路由
- `src/pages/SkillBrowsePage.tsx` — 需要添加冷启动引导
- `src/pages/ImportPage.tsx` — 需要添加清理选项

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-2-Story-2.4]

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus-1m-context (Amelia)

### Debug Log References

- tsc --noEmit: 零错误
- vitest run: 233 tests passed (18 test files), 0 failures

### Completion Notes List

- Task 1: GET /api/import/detect-codebuddy 端点 + detectCodeBuddy() 函数
- Task 2: POST /api/import/cleanup 端点 + cleanupFiles() 函数
- Task 3: SkillBrowsePage 冷启动引导卡片 + ImportPage 清理选项
- Task 4: 全量测试通过，无回归

### File List

| 文件                             | 操作                         |
| -------------------------------- | ---------------------------- |
| server/services/scanService.ts   | 修改（添加 detectCodeBuddy） |
| server/services/importService.ts | 修改（添加 cleanupFiles）    |
| server/routes/importRoutes.ts    | 修改（添加 2 个新路由）      |
| src/lib/api.ts                   | 修改（添加 2 个 API 函数）   |
| src/pages/SkillBrowsePage.tsx    | 修改（冷启动引导）           |
| src/pages/ImportPage.tsx         | 修改（清理选项）             |
