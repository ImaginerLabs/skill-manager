# Story V2-4.2: 工作流生成 skill-creator 规范对齐

Status: done

## Story

作为一个使用 Skill Manager 的开发者，
我希望生成的工作流 Skill 文件严格对齐 skill-creator 规范（Frontmatter 字段、"pushy" description、正文结构），
以便工作流在 Claude 生态中有最佳触发表现。

## Acceptance Criteria（验收标准）

1. **Given** 用户生成工作流，**When** 查看 Frontmatter，**Then** 包含 `name`、`description`、`category: workflows`、`type: workflow`、`tags` 字段
2. **Given** 生成的工作流，**When** 查看 `description` 字段，**Then** 采用 "pushy" 触发策略——不仅描述功能，还主动包含触发场景和关键词
3. **Given** 生成的工作流正文，**When** 查看结构，**Then** 顶部有工作流概述段落（说明整体目标和适用场景），然后是 Step 列表
4. **Given** 工作流包含自定义步骤，**When** 生成文件，**Then** 自定义步骤不生成 `**使用 Skill:**` 行，直接输出描述内容
5. **Given** 生成的 `tags` 字段，**When** 查看内容，**Then** 从步骤中的 Skill 名称聚合 + "workflow" 标签
6. **Given** 用户输入了工作流描述，**When** 生成文件，**Then** 工作流概述段落使用用户输入的描述
7. **Given** 修改后的代码，**When** 运行全量测试套件，**Then** 所有现有测试 100% 通过，无回归

## Tasks / Subtasks

- [x] Task 1: 实现 `generatePushyDescription` 函数（AC: 2）
  - [x] 1.1 在 `workflowService.ts` 中新增 `generatePushyDescription(workflowName, steps)` 函数
  - [x] 1.2 提取 Skill 步骤的 skillName 和自定义步骤的描述关键词
  - [x] 1.3 生成格式：功能描述 + 触发场景 + 关键词

- [x] Task 2: 增强 `generateWorkflowContent` 函数（AC: 1, 3, 4, 5, 6）
  - [x] 2.1 Frontmatter 中 `description` 使用 `generatePushyDescription` 生成（当用户未输入描述时）
  - [x] 2.2 Frontmatter 中 `tags` 从步骤 Skill 名称聚合 + "workflow"
  - [x] 2.3 正文顶部添加工作流概述段落（使用 `workflow.description` 或自动生成）
  - [x] 2.4 自定义步骤标题使用描述前 30 字符，不生成 `**使用 Skill:**` 行

- [x] Task 3: 编写单元测试（AC: 7）
  - [x] 3.1 测试 `generatePushyDescription` 函数输出格式
  - [x] 3.2 测试 Frontmatter 字段完整性
  - [x] 3.3 测试正文结构（概述段落 + Step 列表）
  - [x] 3.4 测试自定义步骤生成格式

- [x] Task 4: 验证无回归（AC: 7）
  - [x] 4.1 运行 `tsc --noEmit` — TypeScript 零错误
  - [x] 4.2 运行 `vitest run` — 全量测试通过

## Dev Notes

### generatePushyDescription 函数

```typescript
function generatePushyDescription(
  workflowName: string,
  steps: WorkflowStep[],
): string {
  const skillNames = steps
    .filter((s) => s.type === "skill" && s.skillName)
    .map((s) => s.skillName!);
  const customDescriptions = steps
    .filter((s) => s.type === "custom")
    .map((s) => s.description.slice(0, 20));

  const parts = [...skillNames, ...customDescriptions].filter(Boolean);
  const funcDesc = `组合${parts.join("、")}的${workflowName}工作流。`;
  const triggerScene = `当用户需要${workflowName}、${skillNames.join("、")}时使用此工作流。`;

  return `${funcDesc}${triggerScene}`;
}
```

### generateWorkflowContent 增强

```typescript
function generateWorkflowContent(workflow: Workflow): string {
  // tags 从步骤聚合
  const tags = [
    "workflow",
    ...workflow.steps
      .filter((s) => s.type === "skill" && s.skillName)
      .map((s) => s.skillName!.toLowerCase().replace(/\s+/g, "-")),
  ];

  // description 优先使用用户输入，否则自动生成 pushy description
  const description = workflow.description.trim()
    ? workflow.description
    : generatePushyDescription(workflow.name, workflow.steps);

  const frontmatter = {
    name: workflow.name,
    description,
    category: "workflows",
    type: "workflow",
    tags: [...new Set(tags)],
  };

  // 正文：概述段落 + Step 列表
  let body = "";
  if (workflow.description.trim()) {
    body += `${workflow.description.trim()}\n\n---\n\n`;
  }
  body += stepsContent;

  return matter.stringify(`\n${body}\n`, frontmatter);
}
```

### 架构约束

- **AD-44**：工作流 Frontmatter 对齐 skill-creator 规范
- **FR-V2-13**：Frontmatter 必填字段
- **FR-V2-14**：pushy description 触发策略
- **FR-V2-15**：正文结构（概述 + Step 列表）

### References

- [Source: architecture-v2.md#AD-44] 工作流 Frontmatter 对齐 skill-creator 规范
- [Source: prd-skill-manager-v2.md#FR-V2-13~FR-V2-15] 工作流规范对齐需求
- [Source: server/services/workflowService.ts] 当前 workflowService 实现

## Dev Agent Record

### Agent Model Used
claude-4.6-opus-1m-context

### Debug Log References

### Completion Notes List
- ✅ Task 1: generatePushyDescription 函数实现
- ✅ Task 2: generateWorkflowContent 增强（Frontmatter 对齐 + 概述段落 + 自定义步骤格式）
- ✅ Task 3: 单元测试（pushy description + Frontmatter + 正文结构 + 自定义步骤）
- ✅ Task 4: tsc 零错误；全量测试通过

### Change Log
- 2026-04-14: 工作流生成对齐 skill-creator 规范

### File List
- server/services/workflowService.ts（修改）
- tests/unit/services/workflowService.test.ts（修改）
