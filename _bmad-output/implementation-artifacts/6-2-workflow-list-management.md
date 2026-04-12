---
story: "6-2"
title: "工作流页面已有工作流管理"
epic: 6
status: done
created: "2026-04-12"
---

# Story 6.2：工作流页面已有工作流管理

## Story

**As a** 用户，
**I want** 进入工作流页面时能直接看到已有工作流列表，并能快速切换到新建模式，
**So that** 我无需离开工作流页面就能找到并编辑已有工作流，减少操作路径。

## Acceptance Criteria

1. **[AC-1]** 工作流页面顶部新增模式切换 Tab：「已有工作流」和「新建工作流」，默认显示「已有工作流」Tab（若有工作流）或「新建工作流」Tab（若无工作流）
2. **[AC-2]** 「已有工作流」Tab 展示完整的工作流列表（复用 `WorkflowList` 组件逻辑），每项显示名称、描述，支持点击「编辑」直接加载到编排器并自动切换到「新建工作流」Tab
3. **[AC-3]** 「新建工作流」Tab 展示现有的 `WorkflowEditor` 编排界面（名称输入 + Skill 选择 + 步骤列表 + 预览）
4. **[AC-4]** 「已有工作流」列表中的「删除」操作保留乐观删除 + 5 秒撤销窗口逻辑（复用现有 `WorkflowList` 的 `handleDelete` 逻辑）
5. **[AC-5]** 「新建工作流」Tab 顶部显示「新建」标识，保存成功后自动切换回「已有工作流」Tab 并刷新列表
6. **[AC-6]** 单元测试覆盖：Tab 切换逻辑、编辑触发切换到新建 Tab

## Tasks / Subtasks

- [x] **Task 1：WorkflowPage 重构为 Tab 布局** (AC: 1, 3)
  - [x] 1.1 修改 `src/pages/WorkflowPage.tsx`：引入 Tab 状态 `mode: "list" | "editor"`，默认值由是否有工作流决定（通过 `fetchWorkflows` 初始化）
  - [x] 1.2 顶部渲染 Tab 切换按鈕（「已有工作流」/「新建工作流」），使用现有 `Button` 组件和暗色主题样式
  - [x] 1.3 `mode === "list"` 时渲染工作流列表区域；`mode === "editor"` 时渲染 `WorkflowEditor`

- [x] **Task 2：工作流列表区域实现** (AC: 2, 4)
  - [x] 2.1 在 `WorkflowPage.tsx` 中直接实现列表区域，复用 `WorkflowList.tsx` 的数据加载和操作逻辑
  - [x] 2.2 列表项点击「编辑」时：调用 `fetchWorkflowDetail` + `loadWorkflow`，然后 `setMode("editor")`
  - [x] 2.3 列表项「删除」保留乐观删除逻辑（复用 `WorkflowList.tsx` 的 `handleDelete` 实现）
  - [x] 2.4 列表为空时显示引导文案「还没有工作流，点击「新建工作流」开始创建」

- [x] **Task 3：WorkflowEditor 保存后回调** (AC: 5)
  - [x] 3.1 `WorkflowPreview.tsx` 中的保存成功回调：通过 `onSaveSuccess?: () => void` prop 传入回调
  - [x] 3.2 切换回列表模式时触发列表刷新（重新调用 `fetchWorkflows`）

- [x] **Task 4：WorkflowList 组件调整** (AC: 2)
  - [x] 4.1 移除 `WorkflowEditor.tsx` 内部的 `WorkflowList` 引用，避免 UI 重复
  - [x] 4.2 工作流列表统一由 `WorkflowPage` 的 list 模式管理

- [x] **Task 5：单元测试** (AC: 6)
  - [x] 5.1 新建 `tests/unit/components/workflow/WorkflowPage.test.tsx`
  - [x] 5.2 测试：默认 Tab 为「已有工作流」（有工作流时）
  - [x] 5.3 测试：点击「新建工作流」 Tab 切换到编辑器模式
  - [x] 5.4 测试：点击工作流「编辑」按鈕后切换到编辑器模式

## Dev Notes

### 现有代码分析

**`WorkflowList.tsx` 已有完整实现：**

- 数据加载：`fetchWorkflows()` + `useState<WorkflowItem[]>`
- 编辑：`fetchWorkflowDetail(id)` + `loadWorkflow(id, name, desc, steps)`
- 删除：乐观删除 + `toast.undoable()` 5 秒撤销窗口
- 当前位置：`WorkflowEditor.tsx` 左侧底部（`<WorkflowList />`）

**`WorkflowPreview.tsx` 保存逻辑：**

- 需要读取该文件确认保存成功后的回调方式
- 建议通过 `onSaveSuccess?: () => void` prop 传入回调

**`WorkflowEditor.tsx` 当前结构：**

- 顶部：名称/描述输入 + 重置按钮
- 左侧：`SkillSelector` + `WorkflowList`（底部）
- 右侧：`StepList` + `WorkflowPreview`

### 实现策略

**方案：WorkflowPage 作为 Tab 容器**

```
WorkflowPage
├── Tab 切换按钮（已有工作流 / 新建工作流）
├── mode === "list" → 工作流列表（复用 WorkflowList 逻辑）
└── mode === "editor" → WorkflowEditor（传入 onSaveSuccess 回调）
```

**WorkflowEditor 改造：**

- 接受可选 `onSaveSuccess?: () => void` prop
- 保存成功后调用该回调

**WorkflowList 在 WorkflowEditor 中的处理：**

- Story 6-2 完成后，`WorkflowEditor` 左侧底部的 `WorkflowList` 应移除，避免 UI 重复
- 工作流列表统一由 `WorkflowPage` 的 list 模式管理

### 关键文件

- `src/pages/WorkflowPage.tsx` — 主要修改文件（当前仅 6 行，需重构）
- `src/components/workflow/WorkflowEditor.tsx` — 添加 `onSaveSuccess` prop，移除内部 `WorkflowList`
- `src/components/workflow/WorkflowPreview.tsx` — 保存成功后调用 `onSaveSuccess`
- `src/components/workflow/WorkflowList.tsx` — 可能需要调整（移除或保留）

### 样式规范

- Tab 按钮使用 `Button` 组件，`variant="ghost"` 非激活态，激活态使用 `bg-[hsl(var(--accent))]` + `text-[hsl(var(--primary))]`
- 列表区域使用 `ScrollArea` 包裹，最大高度适配页面剩余空间
- 暗色主题 only，遵循现有 `hsl(var(--xxx))` CSS 变量体系

### References

- [WorkflowPage.tsx](src/pages/WorkflowPage.tsx) — 当前仅 6 行，需重构
- [WorkflowEditor.tsx](src/components/workflow/WorkflowEditor.tsx) — 当前结构
- [WorkflowList.tsx](src/components/workflow/WorkflowList.tsx) — 完整的列表/编辑/删除逻辑
- [WorkflowPreview.tsx](src/components/workflow/WorkflowPreview.tsx) — 保存逻辑（需读取）
- [project-context.md](_bmad-output/project-context.md) — 架构规则、组件结构规范

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-1m-context

### Debug Log References

### Completion Notes List

- Task 1：重构 `WorkflowPage.tsx` 为 Tab 布局，包含「已有工作流」列表和「新建工作流」编排器两个 Tab
- Task 2：在 `WorkflowPage.tsx` 中实现工作流列表，支持编辑（加载到编排器）和乐观删除（带撤销窗口）
- Task 3：`WorkflowPreview.tsx` 添加 `onSaveSuccess` prop，保存成功后回调父组件
- Task 4：`WorkflowEditor.tsx` 移除内部 `WorkflowList`，添加 `onSaveSuccess` prop
- Task 5：新建 `WorkflowPage.test.tsx`，5 个测试用例全部通过
- 全量测试 609/609 通过

### File List

- `src/pages/WorkflowPage.tsx`
- `src/components/workflow/WorkflowEditor.tsx`
- `src/components/workflow/WorkflowPreview.tsx`
- `tests/unit/components/workflow/WorkflowPage.test.tsx`
