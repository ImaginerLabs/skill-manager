---
stepsCompleted: ["step-01-init", "step-02-discovery", "step-02b-vision", "step-02c-executive-summary", "step-03-success", "step-04-journeys", "step-05-domain", "step-06-innovation", "step-07-project-type", "step-08-scoping", "step-09-functional", "step-10-nonfunctional", "step-11-polish", "step-12-complete"]
inputDocuments:
  - "brief/product-brief-skill-manager-v2.md"
  - "brief/product-brief-skill-package.md"
  - "brief/product-brief-external-skills-hub.md"
  - "prd/prd.md"
  - "prd/prd-external-skills-hub.md"
  - "prd/prd-category-settings-and-bundles.md"
  - "prd/prd-sidebar-redesign.md"
  - "prd/prd-epic6-ux-polish.md"
  - "prd/prd-nav-category-fix.md"
  - "project-context.md"
  - "docs/bmad-skills-inventory.md"
  - "docs/execution-pipeline.md"
workflowType: 'prd'
documentCounts:
  briefs: 3
  research: 0
  brainstorming: 0
  projectDocs: 4
classification:
  projectType: developer_tool
  domain: general
  complexity: low
  projectContext: brownfield
---

# Product Requirements Document — Skill Manager V2

**Author:** Alex
**Date:** 2026-04-14

---

## Executive Summary

Skill Manager V1 交付了核心的 Skill 浏览、工作流编排、一键同步和 IDE 导入能力。External Skills Hub（Epic 8）引入了多仓库外部 Skill 聚合机制，每个 Skill 携带 `source` 来源标签。但随着外部仓库从 1 个扩展到 2 个（`anthropic-official` + `awesome-copilot`），以及用户对工作流灵活性和同步精细度的需求浮现，V1 的几个设计假设需要迭代。

**本次 PRD 聚焦 4 项增强：**

1. **二级分类视图切换**——在 Skill 预览页的二级 Sidebar 上，新增「按分类」和「按来源」两种浏览维度，让用户既能按功能分类筛选，也能按 GitHub 仓库来源筛选
2. **工作流自定义步骤**——工作流编排器除了选择已有 Skill，还允许用户输入自然语言自定义步骤（如"检查暂存区的代码，并分析意图"），生成的工作流文件符合 `skill-creator` 规范
3. **同步多模式**——同步按钮从单一的"开始同步"扩展为三种模式：增量同步、替换同步（清空后重新同步）、Diff 查看（预览差异）
4. **默认套件全选修复**——确保默认套件（`bundle-default`）包含全部 9 个出厂分类下的所有 Skill

**目标用户：** 同时使用多个 AI IDE 的个人开发者，技术水平中级以上，熟悉 Git 操作。

**核心洞察：** 这 4 项增强全部基于现有技术栈（React 19 + Zustand 5 + Express 5 + fs-extra），零新依赖，每项独立可交付，互不依赖，可按优先级分批实施。

### What Makes This Special

- **零新依赖的渐进式增强**：4 项需求全部在现有架构上自然延伸，不引入新的 npm 包或外部服务，降低集成风险
- **数据驱动的来源视图**：来源视图从已有的 `source` 字段聚合，无需新增后端 API 或数据存储，前端纯计算
- **分层比较的增量同步**：先比较 `mtime`（O(1) 快速路径），再回退到 `md5` 内容哈希（O(n) 精确判断），兼顾速度和跨文件系统准确性
- **规范对齐的工作流生成**：工作流 Skill 文件对齐 `skill-creator` 官方规范（Frontmatter 字段、"pushy" description 触发策略、正文结构），确保在 Claude 生态中有最佳触发表现
- **Diff 驱动的同步信心**：用户在同步前可预览差异报告（新增/修改/删除/相同），从"盲目推送"变为"知情操作"

## Project Classification

| 维度 | 值 |
|------|-----|
| 项目类型 | Developer Tool（开发者工具） |
| 领域 | General（通用软件开发） |
| 复杂度 | Low（标准需求、基本安全） |
| 项目上下文 | Brownfield（棕地，现有系统 4 项增强） |

---

## Success Criteria

### User Success

- **来源浏览效率**：用户可在「按来源」视图中 1 次点击筛选出指定仓库的所有 Skill，筛选结果准确且即时响应
- **自定义步骤可用性**：用户可在工作流编排器中添加自然语言自定义步骤，生成的 `.md` 文件格式正确且符合 skill-creator 规范的 3 项具体要求（Frontmatter 字段、pushy description、正文结构）
- **同步操作信心**：用户在执行同步前可通过 Diff 查看预览差异报告，了解将发生的变更（新增/修改/删除/相同）
- **增量同步准确性**：增量同步正确跳过未变化文件，同步结果显示新增 N 个、更新 N 个、跳过 N 个
- **默认套件全选**：选择默认套件后，9 个出厂分类下的全部 Skill 自动被选中，无需手动补选

### Business Success

- **功能完整度**：4 项增强全部交付并通过验收测试
- **代码质量**：每项需求的单元测试覆盖率 ≥ 80%，集成测试覆盖核心路径
- **交付效率**：4 项增强在 1-2 个 Sprint 内完成（每 Sprint 约 1 周）

### Technical Success

- **来源视图渲染时间** < 100ms（从 `skills` 数组按 `source` 字段 `reduce` 聚合）
- **增量同步比较时间** < 1s（100 个 Skill 文件的 mtime + md5 分层比较）
- **Diff 报告生成时间** < 2s（100 个 Skill 文件的双向遍历 + SKILL.md 哈希比较）
- **零回归**：现有功能（浏览、搜索、同步、导入、编排）不受影响

### Measurable Outcomes

| 指标 | 目标 | 测量方式 |
|------|------|----------|
| 来源视图筛选准确率 | 100% | 单元测试：按 source 字段聚合结果与预期一致 |
| 自定义步骤生成正确率 | 100% | 生成文件格式校验（Frontmatter 字段、正文结构） |
| 增量同步跳过准确率 | 100% | 集成测试：未变化文件不被复制 |
| Diff 报告状态准确率 | 100% | 集成测试：报告状态与实际文件系统一致 |
| 默认套件全选覆盖率 | 100% | 单元测试：9 个分类下所有 Skill ID 被选中 |

---

## Product Scope

### 本次包含（V2 增强）

**需求 1：二级 Sidebar 视图切换**
- `SecondarySidebar` 顶部 Tab 切换器（按分类 / 按来源）
- `SourceTree` 组件，按 `source` 字段聚合展示来源列表
- `skill-store` 新增 `selectedSource` / `setSource`，与 `selectedCategory` 互斥
- 每个来源项显示 Skill 数量 Badge

**需求 2：工作流自定义步骤 + skill-creator 规范对齐**
- 工作流编排器「添加自定义步骤」按钮 + 自动扩展 Textarea
- `WorkflowStep` 类型扩展（`type: 'skill' | 'custom'`，`skillId: string | null`）
- `workflowService.ts` 生成逻辑适配自定义步骤
- 工作流 Frontmatter 对齐 skill-creator 规范（`name`、`description`、`category: workflows`、`type: workflow`、`tags`）
- description 采用 "pushy" 触发策略

**需求 3：同步多模式**
- 主按钮 + 下拉菜单 UI（增量同步、替换同步、Diff 查看）
- `POST /api/sync/push` 新增 `mode` 参数（`incremental` / `replace` / `full`，默认 `full`）
- `POST /api/sync/diff` 新端点
- 增量同步：mtime + md5 分层比较
- 替换同步：按 selectedSkillIds 删除对应文件夹 + 全量复制
- Diff 查看：双向遍历 + SKILL.md 哈希比较 + 差异报告 UI
- Diff 结果页底部直接放置操作按钮

**需求 4：默认套件全选修复**
- 修复套件选择逻辑，确保 `bundle-default` 的 `categoryNames` 下所有 Skill 被选中

### 本次不包含

- 来源视图的仓库管理（增删改查仓库注册）——仍通过 `repositories.yaml` 配置
- 工作流的条件分支、参数传递等高级逻辑（V3）
- 同步的双向同步能力（IDE → 仓库）
- 同步历史记录和回滚能力
- 自定义步骤的 AI 辅助生成（如根据描述自动推荐 Skill）
- 按来源创建套件

### Vision (Future)

- 工作流编排支持条件分支和并行步骤
- 同步双向能力（IDE → 仓库）
- 同步历史记录和回滚
- 自定义步骤 AI 辅助（根据描述自动推荐 Skill）
- 按来源维度创建套件
- Skill 市场（可选的公共分享）

---

## User Journeys

### Journey 1: Alex — 按来源浏览外部 Skill

**背景：** Alex 刚通过 External Skills Hub 接入了 `anthropic-official` 和 `awesome-copilot` 两个外部仓库，想快速了解 Anthropic 官方提供了哪些 Skill。

**Opening Scene：** Alex 在 Skill 预览页的二级 Sidebar 中看到顶部有两个 Tab：「按分类」和「按来源」。当前默认在「按分类」视图，展示熟悉的 9 个分类目录树。

**Rising Action：** Alex 点击「按来源」Tab，Sidebar 内容切换为来源列表：
- 🌐 全部 (42)
- 我的 Skill (20)
- Anthropic Official (12)
- Awesome Copilot (10)

每个来源项旁边有数量 Badge。Alex 点击"Anthropic Official"，主内容区立刻筛选为 12 个来自 Anthropic 的 Skill 卡片。

**Climax：** Alex 快速浏览了 Anthropic 的 12 个 Skill，发现了几个之前没注意到的高质量 Skill。他切回「按分类」Tab，之前的来源筛选自动清除，回到全部 Skill 视图。

**Resolution：** Alex 现在可以在两种维度间自由切换，既能按功能分类找 Skill，也能按来源仓库批量浏览。

### Journey 2: Alex — 创建包含自定义步骤的工作流

**背景：** Alex 想创建一个"代码提交前检查"工作流，但其中有一步"检查暂存区的代码，并分析本次修改的意图"不对应任何现有 Skill。

**Opening Scene：** Alex 进入工作流编排器，从 Skill 列表中选择了 `code-review` 作为第一步。

**Rising Action：** Alex 点击「添加自定义步骤」按钮，一个带虚线边框和 ✏️ 图标的自定义步骤卡片出现在工作流中。Alex 在自动扩展的 Textarea 中输入："检查暂存区的代码，并分析本次修改的意图和目的"。然后继续添加 `staged-fast-commit` 作为第三步。

**Climax：** Alex 点击"生成工作流"，预览生成的 `.md` 文件。Frontmatter 中 `type: workflow`、`category: workflows`，description 写着"组合代码审查、暂存区意图分析和快速提交的完整代码提交前检查工作流。当用户需要提交前全面检查、代码质量审查、或规范化提交时使用此工作流。"——这个 "pushy" 的描述让工作流更容易被 Agent 触发。

**Resolution：** 新工作流保存到 `skills/workflows/` 目录，自定义步骤在正文中直接输出描述内容（不带 `**使用 Skill:**` 行），格式清晰规范。

### Journey 3: Alex — 使用 Diff 查看和增量同步

**背景：** Alex 在 Skill Manager 中修改了几个 Skill 的 Frontmatter，想同步到 CodeBuddy 项目，但不确定哪些文件会被更新。

**Opening Scene：** Alex 进入同步管理页面，看到同步按钮旁边有一个小箭头。

**Rising Action：** Alex 点击小箭头，下拉菜单展示三个选项：「增量同步」「替换同步」「查看差异」。Alex 选择「查看差异」。系统对比源目录和目标目录，生成差异报告：
- 🟢 新增：2 个 Skill（新创建的工作流）
- 🟡 修改：3 个 Skill（Frontmatter 被编辑过）
- ⚪ 相同：37 个 Skill
- 🔴 删除：0 个

**Climax：** Alex 确认差异报告符合预期，直接点击 Diff 结果页底部的「执行增量同步」按钮。同步完成，结果显示"新增 2 个、更新 3 个、跳过 37 个"。

**Resolution：** Alex 从"盲目推送"变为"知情操作"，对同步结果完全有信心。

### Journey 4: Alex — 默认套件全选体验

**背景：** Alex 在同步页面选择默认套件，期望所有出厂 Skill 被自动选中。

**Opening Scene：** Alex 在同步页面的套件选择中点击"默认套件"。

**Rising Action：** 系统遍历 `bundle-default` 的 `categoryNames`（全部 9 个出厂分类），收集每个分类下的所有 Skill ID（包括外部 Skill），更新 `selectedSkillIds`。

**Climax：** 所有 42 个 Skill 的复选框全部勾选，包括之前遗漏的外部 Skill。

**Resolution：** "默认套件 = 全部出厂 Skill"的预期行为得到满足，用户无需手动补选。

### Journey Requirements Summary

| 旅程 | 揭示的核心能力 |
|------|----------------|
| 按来源浏览 | Tab 切换、来源聚合、来源筛选、筛选状态互斥、数量 Badge |
| 自定义步骤工作流 | 自定义步骤 UI、Textarea 输入、类型区分、skill-creator 规范生成、pushy description |
| Diff 查看与增量同步 | Diff 端点、双向遍历、状态分类、差异报告 UI、增量比较、操作按钮联动 |
| 默认套件全选 | 套件选择逻辑修复、分类遍历、Skill ID 收集 |

---

## Developer Tool Specific Requirements

### Project-Type Overview

Skill Manager V2 是对现有本地开发者工具的 4 项增强。核心技术栈不变：React 19 + TypeScript 6 + Zustand 5（前端）、Express 5 + fs-extra（后端）、文件系统作为数据层。

### Technical Architecture Considerations

**前端新增组件：**
- `SourceTree` 组件：与 `CategoryTree` 平级，按 `source` 字段聚合来源列表
- `SecondarySidebar` Tab 切换：本地 `useState`，不需要持久化
- 工作流编排器自定义步骤 UI：虚线边框 + ✏️ 图标 + 自动扩展 Textarea
- 同步模式选择 UI：主按钮 + 下拉菜单（SplitButton 模式）
- Diff 结果展示组件：状态图标列表 + 底部操作按钮

**后端新增能力：**
- `POST /api/sync/diff`：独立的 `diffSync` 函数，双向遍历源/目标目录
- `POST /api/sync/push` 扩展：新增 `mode` 参数（`incremental` / `replace` / `full`）
- 增量同步：`fs.stat` 比较 `mtime` → `crypto.createHash('md5')` 比较内容
- 替换同步：按 `selectedSkillIds` 删除对应文件夹 + `fs.copy`

**数据模型扩展：**
- `WorkflowStep.type: 'skill' | 'custom'`
- `WorkflowStep.skillId: string | null`（自定义步骤为 `null`）
- `skill-store` 新增 `selectedSource` 状态和 `setSource` action
- `SyncResult` 新增 `skipped` 计数

### Implementation Considerations

- **向后兼容**：`POST /api/sync/push` 的 `mode` 参数默认为 `full`，现有不传 `mode` 的调用行为不变
- **互斥状态管理**：`setCategory` 内部自动执行 `selectedSource = null`，`setSource` 内部自动执行 `selectedCategory = null`
- **Zod Schema 更新**：`WorkflowStep.skillId` 使用 `z.string().nullable()`，避免空字符串误判
- **Diff 性能**：以每个 Skill 文件夹中的 `SKILL.md` 作为代表性文件计算哈希，而非遍历文件夹内所有文件
- **替换同步安全**：只删除 `selectedSkillIds` 对应的文件夹，不使用 `fs.emptyDir` 清空整个目标目录

---

## Functional Requirements

### 来源视图浏览

- FR-V2-1: 用户可在二级 Sidebar 顶部通过 Tab 切换「按分类」和「按来源」两种浏览维度
- FR-V2-2: 用户可在「按来源」视图中查看所有来源的列表，每个来源项显示该来源下的 Skill 数量 Badge
- FR-V2-3: 用户可点击来源项筛选主内容区为该来源的所有 Skill
- FR-V2-4: 系统在切换 Tab 时自动清除当前维度的筛选状态（`selectedCategory` 和 `selectedSource` 互斥）
- FR-V2-5: 来源数据从 `skills` 数组按 `source` 字段聚合，`source` 为空的 Skill 归入"我的 Skill"分组
- FR-V2-6: 未来新增的仓库来源自动出现在来源列表中，无需额外配置

### 工作流自定义步骤

- FR-V2-7: 用户可在工作流编排器中通过「添加自定义步骤」按钮添加自然语言自定义步骤
- FR-V2-8: 用户可在自动扩展的 Textarea 中输入自定义步骤的描述内容
- FR-V2-9: 自定义步骤在 UI 上以虚线边框 + ✏️ 图标的视觉样式与已有 Skill 步骤区分
- FR-V2-10: 自定义步骤的 `skillId` 为 `null`，`skillName` 为 `null`，`type` 为 `custom`
- FR-V2-11: 生成的工作流文件中，自定义步骤不生成 `**使用 Skill:**` 行，直接输出描述内容
- FR-V2-12: 用户可编辑和删除已添加的自定义步骤

### 工作流 skill-creator 规范对齐

- FR-V2-13: 生成的工作流 Skill 文件 Frontmatter 包含 `name`、`description`、`category: workflows`、`type: workflow`、`tags` 字段
- FR-V2-14: 生成的 `description` 采用 "pushy" 触发策略——不仅描述功能，还主动包含触发场景和关键词
- FR-V2-15: 生成的工作流正文顶部有工作流概述段落，说明整体目标和适用场景，然后是 Step 列表

### 同步多模式

- FR-V2-16: 用户可通过主按钮旁的下拉菜单选择同步模式：增量同步、替换同步、查看差异
- FR-V2-17: 增量同步只同步新增或修改的 Skill 文件，采用 mtime + md5 分层比较策略，跳过未变化文件
- FR-V2-18: 增量同步完成后显示同步结果：新增 N 个、更新 N 个、跳过 N 个
- FR-V2-19: 替换同步先删除目标目录中已选 Skill 对应的文件夹，再执行全量同步
- FR-V2-20: 替换同步操作前弹出确认对话框，告知用户将删除哪些文件夹
- FR-V2-21: Diff 查看不执行任何文件操作，对比源目录和目标目录生成差异报告
- FR-V2-22: Diff 报告以列表形式展示每个 Skill 的状态：🟢 新增、🟡 修改、🔴 删除、⚪ 相同
- FR-V2-23: Diff 结果页底部直接放置「执行增量同步」和「执行替换同步」两个操作按钮
- FR-V2-24: 主按钮默认执行增量同步，80% 用户只看到一个按钮

### 默认套件全选

- FR-V2-25: 选择默认套件（`bundle-default`）后，该套件 `categoryNames` 下的全部 Skill 自动被选中
- FR-V2-26: 套件选择逻辑正确遍历每个分类，收集该分类下的所有 Skill ID（包括外部 Skill）

### 错误处理

- FR-V2-27: 替换同步删除文件夹失败时提供详细错误信息（文件被锁定、权限不足等）
- FR-V2-28: Diff 对比时目标目录不存在，系统提示用户并提供自动创建选项
- FR-V2-29: 增量同步的 md5 哈希计算失败时回退到全量覆盖该文件

---

## Non-Functional Requirements

### Performance

- NFR-V2-1: 来源视图聚合计算时间 < 50ms（500 个 Skill 规模）
- NFR-V2-2: Tab 切换响应时间 < 100ms（视图切换 + 筛选状态清除）
- NFR-V2-3: 增量同步的 mtime 比较阶段 < 500ms（100 个 Skill 文件）
- NFR-V2-4: Diff 报告生成时间 < 2s（100 个 Skill 文件的双向遍历）
- NFR-V2-5: 自定义步骤 Textarea 输入响应无感知延迟（< 16ms per keystroke）

### Security

- NFR-V2-6: 替换同步的文件删除操作限制在配置的目标目录范围内，防止路径遍历
- NFR-V2-7: 替换同步只删除 `selectedSkillIds` 对应的文件夹，不使用 `fs.emptyDir` 清空整个目标目录

### Accessibility

- NFR-V2-8: Tab 切换器支持键盘导航（Tab 键切换焦点，Enter/Space 激活）
- NFR-V2-9: 来源列表项提供 ARIA 标签，包含来源名称和 Skill 数量
- NFR-V2-10: 同步模式下拉菜单支持键盘操作（Arrow Up/Down 选择，Enter 确认，Esc 关闭）
- NFR-V2-11: Diff 报告中的状态图标提供文本替代（screen reader 可读）

### Compatibility

- NFR-V2-12: `POST /api/sync/push` 的 `mode` 参数向后兼容——不传 `mode` 时行为等同于 `full`（全量覆盖）
- NFR-V2-13: 增量同步的 mtime 比较在跨文件系统场景（Docker volume、网络挂载）下自动回退到 md5 比较

---

## Priority & Implementation Order

| 优先级 | 需求 | 理由 | 预估工作量 |
|--------|------|------|------------|
| P0 | 需求 4：默认套件全选修复 | Bug 修复，影响所有用户的基础体验 | 0.5d |
| P1 | 需求 3：同步多模式 | 高频操作的体验提升，用户反馈最强烈 | 3-4d |
| P1 | 需求 1：按来源浏览 | 随着外部仓库增多，需求越来越迫切 | 2-3d |
| P2 | 需求 2：工作流自定义步骤 | 高级功能，面向进阶用户 | 2-3d |

**建议实施顺序：** P0（需求 4）→ P1（需求 1 + 需求 3 可并行）→ P2（需求 2）

---

## Cross-Requirement Interactions

| 交互点 | 说明 | 决策 |
|--------|------|------|
| 需求 1 × 需求 3 | 用户可能想"只同步 Anthropic 来源的 Skill"。来源筛选是否影响同步页面的 Skill 选择？ | V2 不联动——同步页面的 Skill 选择独立于浏览页面的来源筛选。V3 考虑在同步页面也提供按来源筛选 |
| 需求 2 × 需求 3 | 包含自定义步骤的工作流 Skill 同步到 IDE 后，自定义步骤的执行依赖 IDE 的 Agent 能力 | 不添加兼容性提示——自定义步骤本质是自然语言指令，任何 Agent 都能理解 |
| 需求 1 × 需求 4 | 默认套件包含 9 个分类，但来源视图按仓库分组。套件选择是否应支持按来源维度？ | V2 不支持——套件仍按分类维度。"按来源创建套件"列入 Vision |
