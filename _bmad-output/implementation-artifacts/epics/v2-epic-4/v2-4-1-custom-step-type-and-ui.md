# Story V2-4.1: 自定义步骤类型扩展与 UI

Status: done

## Story

作为一个使用 Skill Manager 的开发者，
我希望在工作流编排器中通过「添加自定义步骤」按钮添加自然语言自定义步骤，
以便创建包含非 Skill 步骤的灵活工作流。

## Acceptance Criteria（验收标准）

1. **Given** `shared/types.ts` 中的 `WorkflowStep`，**When** 查看类型定义，**Then** 新增 `type: 'skill' | 'custom'` 字段，`skillId` 和 `skillName` 改为 `string | null`
2. **Given** `shared/schemas.ts` 中的 `WorkflowStepSchema`，**When** 校验自定义步骤数据，**Then** `skillId` 和 `skillName` 接受 `null` 值，`type` 为 `z.enum(["skill", "custom"])`
3. **Given** 工作流编排器步骤列表底部，**When** 用户查看操作按钮，**Then** 看到「✏️ 添加自定义」按钮（虚线边框 `variant="outline"` + `border-dashed`）
4. **Given** 用户点击「✏️ 添加自定义」，**When** 自定义步骤卡片出现，**Then** 卡片使用虚线边框 `2px dashed #475569` + ✏️ 图标，与 Skill 步骤（实线边框 + ⚡ 图标）视觉区分
5. **Given** 自定义步骤卡片，**When** 用户在 Textarea 中输入描述，**Then** Textarea 自动扩展（初始 1 行，最大 6 行），`font-mono`，无边框融入卡片
6. **Given** 自定义步骤卡片，**When** 用户拖拽排序或使用 Alt+↑/↓，**Then** 自定义步骤与 Skill 步骤可混合排序
7. **Given** 自定义步骤卡片，**When** 用户点击 ✕ 按钮，**Then** 步骤被移除
8. **Given** `workflow-store.ts`，**When** 调用 `addCustomStep()`，**Then** 新增一个 `{ type: 'custom', skillId: null, skillName: null, description: '', order: N }` 步骤
9. **Given** 修改后的代码，**When** 运行全量测试套件，**Then** 所有现有测试 100% 通过，无回归
10. 新增单元测试覆盖：类型/Schema 变更、CustomStepCard 渲染与交互、store addCustomStep

## Tasks / Subtasks

- [x] Task 1: 扩展 `shared/types.ts` — WorkflowStep 类型（AC: 1）
  - [x] 1.1 `WorkflowStep.skillId` 从 `string` 改为 `string | null`
  - [x] 1.2 `WorkflowStep.skillName` 从 `string` 改为 `string | null`
  - [x] 1.3 新增 `WorkflowStep.type: 'skill' | 'custom'`

- [x] Task 2: 扩展 `shared/schemas.ts` — WorkflowStepSchema（AC: 2）
  - [x] 2.1 `skillId` 改为 `z.string().nullable()`
  - [x] 2.2 `skillName` 改为 `z.string().nullable()`
  - [x] 2.3 新增 `type: z.enum(["skill", "custom"])`

- [x] Task 3: 修复现有代码中的类型兼容性（AC: 9）
  - [x] 3.1 修改 `workflow-store.ts` 的 `addStep` action：新增 `type: 'skill'` 字段
  - [x] 3.2 修改 `workflowService.ts` 的 `getWorkflowById` 解析逻辑：为解析出的步骤添加 `type: 'skill'` 默认值
  - [x] 3.3 修改 `workflowService.ts` 的 `generateWorkflowContent`：保持现有 Skill 步骤生成逻辑不变
  - [x] 3.4 修改 `StepList.tsx` 的 sortableIds 生成逻辑：适配 `skillId` 可能为 `null` 的情况
  - [x] 3.5 修改 `StepItem.tsx`：适配 `skillId`/`skillName` 可能为 `null`

- [x] Task 4: 扩展 `workflow-store.ts` — 新增 `addCustomStep` action（AC: 8）
  - [x] 4.1 在 `WorkflowStore` interface 新增 `addCustomStep: () => void`
  - [x] 4.2 实现 `addCustomStep`：`set(state => ({ steps: [...state.steps, { order: state.steps.length + 1, skillId: null, skillName: null, description: '', type: 'custom' }] }))`
  - [x] 4.3 `addCustomStep` 内调用 `saveDraft` 持久化

- [x] Task 5: 创建 `CustomStepCard.tsx` 组件（AC: 4, 5, 6, 7）
  - [x] 5.1 新建 `src/components/workflow/CustomStepCard.tsx`
  - [x] 5.2 实现虚线边框 `2px dashed #475569` + ✏️ 图标 + 斜线纹理背景
  - [x] 5.3 实现自动扩展 Textarea（初始 1 行，最大 6 行，`font-mono`，`text-sm`，无边框）
  - [x] 5.4 实现拖拽排序支持（复用 `@dnd-kit/sortable`）
  - [x] 5.5 实现删除按钮（✕）
  - [x] 5.6 ARIA 无障碍：`aria-label="自定义步骤描述"`、`aria-label="移除此步骤"`

- [x] Task 6: 修改 `StepList.tsx` — 集成 CustomStepCard（AC: 3, 6）
  - [x] 6.1 根据 `step.type` 条件渲染 `StepItem`（skill）或 `CustomStepCard`（custom）
  - [x] 6.2 修改 sortableIds 生成逻辑：使用 `step.type + '-' + step.order` 作为唯一 ID
  - [x] 6.3 在步骤列表底部添加「✏️ 添加自定义」按钮
  - [x] 6.4 修改空状态提示文案：包含自定义步骤的说明

- [x] Task 7: 添加 i18n 翻译键（AC: 3, 4）
  - [x] 7.1 在 `zh.ts` 和 `en.ts` 中添加 `workflow.addCustomStep`、`workflow.customStep`、`workflow.customStepPlaceholder`、`workflow.removeStep`

- [x] Task 8: 编写单元测试（AC: 9, 10）
  - [x] 8.1 `tests/unit/shared/schemas.test.ts` — 新增 WorkflowStepSchema nullable 测试
  - [x] 8.2 `tests/unit/stores/workflow-store.test.ts` — 新增 addCustomStep 测试
  - [x] 8.3 `tests/unit/components/workflow/CustomStepCard.test.tsx` — 新建测试（渲染/Textarea 交互/删除）

- [x] Task 9: 验证无回归（AC: 9）
  - [x] 9.1 运行 `tsc --noEmit` — TypeScript 零错误
  - [x] 9.2 运行 `vitest run` — 全量测试通过

## Dev Notes

### shared/types.ts 修改

```typescript
/** 工作流步骤 */
export interface WorkflowStep {
  order: number;
  skillId: string | null;     // 修改：从 string → string | null
  skillName: string | null;   // 修改：从 string → string | null
  description: string;
  type: 'skill' | 'custom';  // 新增：步骤类型
}
```

### shared/schemas.ts 修改

```typescript
export const WorkflowStepSchema = z.object({
  order: z.number().int().nonnegative(),
  skillId: z.string().nullable(),       // 修改：nullable
  skillName: z.string().nullable(),     // 修改：nullable
  description: z.string(),
  type: z.enum(["skill", "custom"]),    // 新增
});
```

**设计决策：** `skillId` 使用 `z.string().nullable()` 而非 `z.string().optional()`。`nullable` 要求字段存在但值为 `null`，语义更明确。

### workflow-store.ts 修改

```typescript
// 新增 action
addCustomStep: () => void;

// 实现
addCustomStep: () =>
  set((state) => {
    const steps = [
      ...state.steps,
      {
        order: state.steps.length + 1,
        skillId: null,
        skillName: null,
        description: '',
        type: 'custom' as const,
      },
    ];
    saveDraft({ steps, workflowName: state.workflowName, workflowDescription: state.workflowDescription, editingWorkflowId: state.editingWorkflowId });
    return { steps };
  }),

// 修改 addStep — 添加 type: 'skill'
addStep: (skillId, skillName) =>
  set((state) => {
    const steps = [
      ...state.steps,
      {
        order: state.steps.length + 1,
        skillId,
        skillName,
        description: '',
        type: 'skill' as const,
      },
    ];
    // ... saveDraft
    return { steps };
  }),
```

### CustomStepCard.tsx 组件规格

```typescript
interface CustomStepCardProps {
  step: WorkflowStep;  // type === 'custom'
  index: number;
  onDescriptionChange: (index: number, description: string) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
}
```

**视觉规格（UX-DR4）：**
- 边框：`border-dashed 2px #475569`（对比 Skill 步骤的 `border-solid 1px #334155`）
- 图标：✏️（铅笔）（对比 Skill 步骤的 ⚡ 闪电）
- 标题：固定文字"自定义步骤"
- 背景：`bg-card` + 微弱斜线纹理 `bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(71,85,105,0.05)_10px,rgba(71,85,105,0.05)_20px)]`

**Textarea 规格（UX-DR5）：**
- 初始高度：1 行（约 40px）
- 自动扩展：`rows={1}` + `style={{ height: 'auto' }}` + `onInput` 动态调整
- 最大 6 行（`max-h-[144px]`，每行约 24px）
- 占位符：`"输入自定义步骤描述，如：检查暂存区的代码，并分析意图"`
- 字体：`font-mono text-sm`
- 颜色：`text-[hsl(var(--foreground))]`
- 边框：无（`border-0 focus:ring-0`）
- 焦点：卡片整体获得 `outline: 2px solid #22C55E`

### StepList.tsx 修改

```typescript
// sortableIds 修改 — 适配 skillId 可能为 null
const sortableIds = steps.map((s) =>
  s.type === 'custom' ? `custom-${s.order}` : `${s.skillId}-${s.order}`
);

// 条件渲染
{steps.map((step, index) =>
  step.type === 'custom' ? (
    <CustomStepCard key={sortableIds[index]} step={step} index={index} ... />
  ) : (
    <StepItem key={sortableIds[index]} step={step} index={index} ... />
  )
)}

// 底部添加按钮区域
<div className="flex gap-2 mt-3">
  {/* 现有的 "添加 Skill" 按钮由 SkillSelector 处理 */}
  <Button variant="outline" className="border-dashed" onClick={addCustomStep}>
    <Pencil size={14} /> 添加自定义
  </Button>
</div>
```

### StepItem.tsx 修改

- `step.skillName` 可能为 `null`，需要添加空值保护
- `step.skillId` 可能为 `null`，sortable ID 生成需要适配
- 不需要大幅修改，只需添加 `!` 或 `?? ''` 保护

### 向后兼容

- 现有工作流文件解析时，若 `type` 字段缺失，默认推断为 `'skill'`
- `getWorkflowById` 中的步骤解析需要添加 `type: 'skill'` 默认值
- `loadWorkflow` 加载已有工作流时，步骤缺少 `type` 字段需要补全

### 架构约束

- **AD-43**：WorkflowStep 类型扩展，向后兼容旧格式
- **NFR-V2-5**：Textarea 输入响应无感知延迟（< 16ms per keystroke）
- 零改动文件：`workflowRoutes.ts`（路由层不变）

### i18n 翻译键

```typescript
// zh.ts
workflow: {
  // ... 现有 ...
  addCustomStep: "添加自定义",
  customStep: "自定义步骤",
  customStepPlaceholder: "输入自定义步骤描述，如：检查暂存区的代码，并分析意图",
  removeStep: "移除此步骤",
}

// en.ts
workflow: {
  // ... 现有 ...
  addCustomStep: "Add Custom",
  customStep: "Custom Step",
  customStepPlaceholder: "Enter custom step description, e.g.: Check staged code and analyze intent",
  removeStep: "Remove this step",
}
```

### Project Structure Notes

- 新建文件：`src/components/workflow/CustomStepCard.tsx`
- 修改文件：`shared/types.ts`、`shared/schemas.ts`、`src/stores/workflow-store.ts`、`src/components/workflow/StepList.tsx`、`src/components/workflow/StepItem.tsx`、`server/services/workflowService.ts`、`src/i18n/locales/zh.ts`、`src/i18n/locales/en.ts`
- 新建测试：`tests/unit/components/workflow/CustomStepCard.test.tsx`
- 修改测试：`tests/unit/shared/schemas.test.ts`、`tests/unit/stores/workflow-store.test.ts`

### References

- [Source: architecture-v2.md#AD-43] 工作流自定义步骤数据模型与服务层扩展
- [Source: ux-design-specification-v2.md#需求2] 工作流自定义步骤交互设计
- [Source: prd-skill-manager-v2.md#FR-V2-7~FR-V2-12] 自定义步骤功能需求
- [Source: shared/types.ts#WorkflowStep] 当前 WorkflowStep 类型定义
- [Source: shared/schemas.ts#WorkflowStepSchema] 当前 WorkflowStep Schema
- [Source: src/stores/workflow-store.ts] 当前 workflow-store 实现
- [Source: src/components/workflow/StepItem.tsx] 当前 StepItem 组件
- [Source: src/components/workflow/StepList.tsx] 当前 StepList 组件

## Dev Agent Record

### Agent Model Used
claude-4.6-opus-1m-context

### Debug Log References

### Completion Notes List
- ✅ Task 1-2: WorkflowStep 类型和 Schema 扩展（type + nullable skillId/skillName）
- ✅ Task 3: 现有代码类型兼容性修复（workflow-store/workflowService/StepList/StepItem）
- ✅ Task 4: addCustomStep action 实现
- ✅ Task 5: CustomStepCard 组件（虚线边框 + 自动扩展 Textarea + 拖拽排序 + ARIA）
- ✅ Task 6: StepList 集成 CustomStepCard + 添加自定义按钮
- ✅ Task 7: i18n 翻译键（zh/en）
- ✅ Task 8: 单元测试（schemas + workflow-store + CustomStepCard）
- ✅ Task 9: tsc 零错误；全量测试通过

### Change Log
- 2026-04-14: 实现自定义步骤类型扩展和 CustomStepCard UI

### File List
- shared/types.ts（修改）
- shared/schemas.ts（修改）
- src/stores/workflow-store.ts（修改）
- src/components/workflow/CustomStepCard.tsx（新建）
- src/components/workflow/StepList.tsx（修改）
- src/components/workflow/StepItem.tsx（修改）
- server/services/workflowService.ts（修改）
- src/i18n/locales/zh.ts（修改）
- src/i18n/locales/en.ts（修改）
- tests/unit/shared/schemas.test.ts（修改）
- tests/unit/stores/workflow-store.test.ts（修改）
- tests/unit/components/workflow/CustomStepCard.test.tsx（新建）
