# Story 3.2: 拖拽排序与步骤编辑

Status: ready-for-dev

## Story

As a 用户,
I want 通过拖拽调整工作流步骤顺序并编辑每个步骤的描述,
So that 我可以精确控制工作流的执行顺序和每步的说明。

## Acceptance Criteria (BDD)

1. **Given** 工作流中已添加多个步骤 **When** 用户拖拽步骤 **Then** 步骤顺序实时更新（@dnd-kit/sortable）
2. **Given** 工作流中已添加多个步骤 **When** 用户按 Alt+↑/↓ **Then** 当前聚焦步骤上移/下移
3. **Given** 步骤列表 **When** 用户点击步骤描述区域 **Then** 可以 inline 编辑描述文字
4. **Given** 步骤列表 **When** 用户点击 ✕ 按钮 **Then** 该步骤被移除，序号自动更新
5. **Given** 步骤列表 **When** 拖拽排序完成 **Then** 序号自动重新编号

## Tasks / Subtasks

- [ ] Task 1: 创建 StepItem 可拖拽步骤组件 (AC: #1, #2, #3, #4)
  - [ ] 1.1 创建 `src/components/workflow/StepItem.tsx` — 单个可拖拽步骤项
  - [ ] 1.2 拖拽手柄 (≡ GripVertical 图标) + @dnd-kit/sortable useSortable
  - [ ] 1.3 inline 描述编辑（Input 组件）
  - [ ] 1.4 移除按钮 (✕)
  - [ ] 1.5 键盘排序 Alt+↑/↓
- [ ] Task 2: 升级 StepList 为拖拽排序列表 (AC: #1, #5)
  - [ ] 2.1 使用 @dnd-kit DndContext + SortableContext 包裹步骤列表
  - [ ] 2.2 handleDragEnd 调用 workflow-store.reorderSteps
  - [ ] 2.3 拖拽无障碍：aria-grabbed、aria-dropeffect
- [ ] Task 3: 单元测试
  - [ ] 3.1 StepItem 组件测试（渲染、描述编辑、移除）
  - [ ] 3.2 StepList 拖拽排序测试（排序后序号更新）

## Dev Notes

### 依赖

- `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` — 已安装

### 已有代码

- `workflow-store.ts` — reorderSteps(from, to)、updateStepDescription(index, desc)、removeStep(index) 已实现
- `StepList.tsx` — Story 3.1 已创建基础版本，需升级为拖拽排序

### References

- [Source: epics.md#Epic 3 Story 3.2]
- [Source: ux-design-specification.md#WorkflowEditor — 拖拽手柄排序]

## Dev Agent Record

### Agent Model Used

### Completion Notes List

### File List
