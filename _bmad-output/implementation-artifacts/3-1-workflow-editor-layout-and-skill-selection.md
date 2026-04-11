# Story 3.1: 工作流编排器布局与 Skill 选择

Status: ready-for-dev

## Story

As a 用户,
I want 在编排器中浏览和选择 Skill 加入工作流,
So that 我可以开始组合多个 Skill 为一个工作流。

## Acceptance Criteria (BDD)

1. **Given** 用户进入工作流编排页面（/workflow）**When** 页面加载完成 **Then** 展示工作流编排器双栏布局：左侧 Skill 选择列表 + 右侧工作流步骤列表
2. **Given** 左侧 Skill 列表已加载 **When** 用户在搜索框输入关键词 **Then** 列表实时筛选匹配的 Skill（复用 fuse.js 搜索）
3. **Given** 左侧展示可用 Skill **When** 用户点击某个 Skill **Then** 该 Skill 被添加到右侧工作流步骤列表（调用 workflow-store.addStep）
4. **Given** 编排器页面 **When** 用户填写工作流名称和描述 **Then** 输入值同步到 workflow-store（setWorkflowName / setWorkflowDescription）
5. **Given** 工作流步骤列表为空 **When** 页面渲染 **Then** 显示空状态引导（FR36, UX-DR15）
6. **Given** 屏幕宽度 < 1024px **When** 页面渲染 **Then** 双栏变为上下堆叠布局

## Tasks / Subtasks

- [ ] Task 1: 创建 WorkflowEditor 主组件 (AC: #1, #6)
  - [ ] 1.1 创建 `src/components/workflow/WorkflowEditor.tsx` — 双栏布局容器（左侧 SkillSelector + 右侧 StepList）
  - [ ] 1.2 响应式布局：>= 1024px 左右双栏，< 1024px 上下堆叠
  - [ ] 1.3 顶部区域：工作流名称 Input + 描述 Input，绑定 workflow-store
- [ ] Task 2: 创建 SkillSelector 组件 (AC: #2, #3)
  - [ ] 2.1 创建 `src/components/workflow/SkillSelector.tsx` — 左侧 Skill 选择列表
  - [ ] 2.2 调用 skill-store.fetchSkills 加载 Skill 列表
  - [ ] 2.3 搜索框 + fuse.js 模糊搜索（复用 useSkillSearch hook）
  - [ ] 2.4 点击 Skill 项调用 workflow-store.addStep(skillId, skillName)
  - [ ] 2.5 已添加的 Skill 显示已添加标记（视觉区分）
- [ ] Task 3: 创建 StepList 占位组件 (AC: #5)
  - [ ] 3.1 创建 `src/components/workflow/StepList.tsx` — 右侧步骤列表（本 story 仅展示基础列表 + 空状态）
  - [ ] 3.2 空状态引导：图标 + 提示文字"从左侧选择 Skill 开始编排工作流"
  - [ ] 3.3 展示已添加的步骤（序号 + Skill 名称 + 描述占位）
- [ ] Task 4: 更新 WorkflowPage 页面 (AC: #1)
  - [ ] 4.1 替换 WorkflowPage.tsx 中的 Coming Soon 占位为 WorkflowEditor 组件
- [ ] Task 5: 单元测试
  - [ ] 5.1 WorkflowEditor 组件测试（渲染、响应式布局）
  - [ ] 5.2 SkillSelector 组件测试（搜索、点击添加）
  - [ ] 5.3 StepList 组件测试（空状态、步骤展示）

## Dev Notes

### 架构约束

- **组件位置**：`src/components/workflow/` 目录
- **状态管理**：使用已有的 `workflow-store.ts`（已完整实现 addStep/removeStep/reorderSteps/updateStepDescription/setWorkflowName/setWorkflowDescription/reset）
- **Skill 数据**：通过 `skill-store.ts` 的 `fetchSkills()` 获取，类型为 `SkillMeta[]`
- **搜索**：复用 `src/hooks/useSkillSearch.ts`（基于 fuse.js）
- **API 客户端**：本 story 不需要新增 API 端点，仅使用前端已有的 skill-store 数据
- **样式**：暗色主题 only，使用 Tailwind CSS v4 + CSS 变量（HSL 格式）
- **UI 组件**：使用已有的 `src/components/ui/` 组件（Input、Badge、ScrollArea、Card 等）

### 已有代码复用

- `workflow-store.ts` — 完整的工作流状态管理（无需修改）
- `skill-store.ts` — Skill 列表获取（fetchSkills、skills、categories）
- `useSkillSearch.ts` — fuse.js 搜索 hook
- `src/components/ui/input.tsx` — Input 组件
- `src/components/ui/scroll-area.tsx` — ScrollArea 组件
- `src/components/ui/badge.tsx` — Badge 组件
- `src/components/ui/card.tsx` — Card 组件
- `src/components/skills/EmptyState.tsx` — 空状态参考实现

### 关键类型

```typescript
// shared/types.ts
interface SkillMeta { id, name, description, category, tags, type?, ... }
interface WorkflowStep { order, skillId, skillName, description }

// workflow-store.ts
interface WorkflowStore {
  steps: WorkflowStep[];
  workflowName: string;
  workflowDescription: string;
  addStep: (skillId: string, skillName: string) => void;
  removeStep: (index: number) => void;
  // ...
}
```

### UX 设计要点

- 双栏布局：左侧 Skill 选择器（含搜索）+ 右侧步骤列表
- Compact 断点 < 1024px：上下堆叠
- 左侧搜索框 + 分类筛选 + 点击添加
- 空状态引导使用 Lucide 图标 + 提示文字
- 工作流 Skill 在列表中使用 ⚡ 图标 + workflow 标签区分

### 禁止事项

- ❌ 不要在组件中直接调用 fetch — 通过 skill-store
- ❌ 不要创建新的类型定义 — 使用 shared/types.ts
- ❌ 不要使用亮色主题样式
- ❌ 不要使用 @tailwind 指令

### Project Structure Notes

- 新文件：`src/components/workflow/WorkflowEditor.tsx`、`SkillSelector.tsx`、`StepList.tsx`
- 修改文件：`src/pages/WorkflowPage.tsx`
- 测试文件：`tests/unit/components/workflow/WorkflowEditor.test.tsx`、`SkillSelector.test.tsx`、`StepList.test.tsx`

### References

- [Source: epics.md#Epic 3 Story 3.1]
- [Source: architecture.md#Frontend Architecture — WorkflowStore]
- [Source: architecture.md#Component Structure — workflow/]
- [Source: ux-design-specification.md#WorkflowEditor]
- [Source: ux-design-specification.md#Journey 3: 工作流编排]
- [Source: project-context.md#前端规则]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
