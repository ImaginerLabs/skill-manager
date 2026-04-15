# Story V2-4.3: 向后兼容与收尾

Status: done

## Story

作为一个使用 Skill Manager 的开发者，
我希望现有的工作流文件能正确解析（向后兼容），WorkflowPreview 的验证逻辑适配自定义步骤，
以便新旧工作流无缝共存，整体功能完整可用。

## Acceptance Criteria（验收标准）

1. **Given** 旧格式工作流文件（无 `type` 字段），**When** 通过 `loadWorkflow` 加载到编排器，**Then** 步骤自动补全 `type: 'skill'`
2. **Given** WorkflowPreview 的验证逻辑，**When** 工作流只包含自定义步骤（无 Skill 步骤），**Then** 仍然可以生成和保存
3. **Given** WorkflowPreview 的禁用原因提示，**When** 自定义步骤描述为空，**Then** 提示"请填写所有自定义步骤的描述"
4. **Given** 工作流编排器，**When** 用户在编辑模式加载包含自定义步骤的工作流，**Then** 自定义步骤正确渲染为 CustomStepCard
5. **Given** 修改后的代码，**When** 运行全量测试套件，**Then** 所有现有测试 100% 通过，无回归

## Tasks / Subtasks

- [x] Task 1: 向后兼容 — loadWorkflow 步骤类型补全（AC: 1）
  - [x] 1.1 修改 `workflow-store.ts` 的 `loadWorkflow` action：为缺少 `type` 字段的步骤补全 `type: 'skill'`

- [x] Task 2: WorkflowPreview 验证逻辑适配（AC: 2, 3）
  - [x] 2.1 修改 `getDisabledReason` 函数：允许纯自定义步骤工作流
  - [x] 2.2 新增验证：自定义步骤描述不能为空

- [x] Task 3: 验证无回归（AC: 5）
  - [x] 3.1 运行 `tsc --noEmit` — TypeScript 零错误
  - [x] 3.2 运行 `vitest run` — 全量测试通过

## Dev Notes

### workflow-store.ts loadWorkflow 修改

```typescript
loadWorkflow: (id, name, description, steps) => {
  // 向后兼容：为缺少 type 字段的步骤补全
  const normalizedSteps = steps.map((step) => ({
    ...step,
    type: step.type ?? (step.skillId ? 'skill' : 'custom'),
  }));
  saveDraft({ editingWorkflowId: id, workflowName: name, workflowDescription: description, steps: normalizedSteps });
  set({ editingWorkflowId: id, workflowName: name, workflowDescription: description, steps: normalizedSteps });
},
```

### WorkflowPreview getDisabledReason 修改

```typescript
function getDisabledReason(
  workflowName: string,
  steps: WorkflowStep[],
): string | null {
  if (workflowName.trim() === "") return "请先填写工作流名称";
  if (steps.length === 0) return "请至少添加一个步骤";
  // 检查自定义步骤描述是否为空
  const emptyCustomStep = steps.find(
    (s) => s.type === "custom" && !s.description.trim(),
  );
  if (emptyCustomStep) return "请填写所有自定义步骤的描述";
  return null;
}
```

### References

- [Source: architecture-v2.md#AD-43] 向后兼容策略
- [Source: src/stores/workflow-store.ts] 当前 workflow-store 实现
- [Source: src/components/workflow/WorkflowPreview.tsx] 当前 WorkflowPreview 实现

## Dev Agent Record

### Agent Model Used
claude-4.6-opus-1m-context

### Debug Log References

### Completion Notes List
- ✅ Task 1: loadWorkflow 向后兼容（缺少 type 字段自动补全为 'skill'）
- ✅ Task 2: WorkflowPreview 验证逻辑适配（允许纯自定义步骤 + 空描述检查）
- ✅ Task 3: tsc 零错误；全量测试通过

### Change Log
- 2026-04-14: 向后兼容与 WorkflowPreview 验证逻辑适配

### File List
- src/stores/workflow-store.ts（修改）
- src/components/workflow/WorkflowPreview.tsx（修改）
