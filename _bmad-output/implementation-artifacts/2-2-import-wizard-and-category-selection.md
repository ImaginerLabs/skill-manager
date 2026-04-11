# Story 2.2: 导入向导与分类选择

Status: done

## Story

As a 用户,
I want 选择需要导入的 Skill 并为它们分配分类,
So that 导入的 Skill 能被正确归类管理。

## Acceptance Criteria

1. **AC-1: 文件勾选**
   - Given 扫描结果列表已展示
   - When 用户操作勾选
   - Then 用户可以逐个勾选需要导入的 Skill 文件（FR22）
   - And 用户可以全选/取消全选所有文件
   - And 顶部显示已选数量统计

2. **AC-2: 分类选择**
   - Given 用户已勾选文件
   - When 用户选择分类
   - Then 用户可以为选中的 Skill 选择分类归属（FR23）
   - And 支持批量为多个 Skill 统一设置分类（FR23）
   - And 分类列表从 `GET /api/categories` 获取

3. **AC-3: ImportWizard 组件**
   - Given 扫描结果存在
   - When 页面渲染
   - Then ImportWizard 组件展示扫描结果列表、分类选择器（UX-DR8）
   - And 无扫描结果时显示空状态引导（FR36）

4. **AC-4: 导入按钮状态**
   - Given 用户操作导入向导
   - When 未选择任何文件或未选择分类时
   - Then "导入"按钮禁用
   - And 选择了文件且选择了分类后按钮启用

5. **AC-5: TypeScript 编译通过**
   - Given 所有文件已修改
   - When 运行 `tsc --noEmit` 和 `vitest run`
   - Then 编译通过，无错误，无回归

## Tasks / Subtasks

- [x] Task 1: 更新 ImportPage — 添加勾选功能 (AC: #1)
  - [x] 1.1 为每个扫描结果项添加 checkbox
  - [x] 1.2 实现全选/取消全选
  - [x] 1.3 顶部显示已选数量统计

- [x] Task 2: 添加分类选择器 (AC: #2)
  - [x] 2.1 从 API 获取分类列表
  - [x] 2.2 实现分类下拉选择器
  - [x] 2.3 支持批量设置分类

- [x] Task 3: 导入按钮与状态管理 (AC: #3, #4)
  - [x] 3.1 添加“导入选中”按钮（当前仅 UI，实际导入在 Story 2-3）
  - [x] 3.2 按钮禁用逻辑（未选文件或未选分类时禁用）

- [x] Task 4: 验证 (AC: #5)
  - [x] 4.1 运行 `tsc --noEmit` 确认编译通过
  - [x] 4.2 运行 `vitest run` 确认无回归

### Review Findings

- [x] [Review][Patch] P1: 前端 importFiles() 未传递 scanRoot，自定义扫描路径场景下导入不可用 [src/pages/ImportPage.tsx] — 已修复
- [x] [Review][Defer] ImportPage 组件过大，缺少组件拆分 — deferred, pre-existing

## Dev Notes

### 纯前端 Story — 无后端修改

本 Story 仅修改 `src/pages/ImportPage.tsx`，不涉及后端代码。

### 已有代码上下文

- `src/pages/ImportPage.tsx` — Story 2-1 已实现扫描路径输入、扫描按钮、结果列表
- `src/lib/api.ts` — `fetchCategories()` 已存在，可直接使用
- `shared/types.ts` — `ScanResultItem`, `Category` 类型已定义

### 不要做的事情

- ❌ 不要实现实际的文件导入（Story 2-3 负责）
- ❌ 不要创建新的后端 API
- ❌ 不要创建新的组件文件（直接在 ImportPage 中实现）

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-2-Story-2.2]

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus-1m-context (Amelia)

### Debug Log References

- tsc --noEmit: 零错误
- vitest run: 227 tests passed, 0 failures

### Completion Notes List

- Task 1: 添加 checkbox 勾选、全选/取消全选、已选统计
- Task 2: 分类下拉选择器，从 API 加载分类列表
- Task 3: 导入按钮仅 UI，禁用逻辑完成
- Task 4: 全量测试通过，无回归

### File List

| 文件                     | 操作 |
| ------------------------ | ---- |
| src/pages/ImportPage.tsx | 修改 |
