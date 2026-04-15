---
title: "Product Brief: Skill Manager V2 — 浏览增强、工作流自定义、同步多模式与套件修复"
status: "draft"
created: "2026-04-14"
updated: "2026-04-14"
review: "party-mode-round-1"
inputs:
  [
    "用户对话记录（4 项需求方向）",
    "现有 product-brief-skill-package.md",
    "现有 product-brief-external-skills-hub.md",
    "config/repositories.yaml 分析",
    "config/categories.yaml 分析",
    "config/settings.yaml 分析",
    "server/services/syncService.ts 分析",
    "server/services/workflowService.ts 分析",
    "src/components/skills/CategoryTree.tsx 分析",
    "src/components/layout/SecondarySidebar.tsx 分析",
    "skills/meta-skills/skill-creator/SKILL.md 规范分析",
  ]
---

# 产品简报：Skill Manager V2 — 四项增强

## 执行摘要

Skill Manager V1 已经交付了核心的 Skill 浏览、工作流编排、一键同步和 IDE 导入能力。External Skills Hub（Epic 8）引入了多仓库外部 Skill 聚合机制，每个 Skill 都带有 `source` 来源标签。但随着外部仓库从 1 个扩展到 2 个（`anthropic-official` + `awesome-copilot`），以及用户对工作流灵活性和同步精细度的需求浮现，V1 的几个设计假设需要迭代。

**本次产品简报聚焦 4 项增强：**

1. **二级分类视图切换**——在 Skill 预览页的二级 Sidebar 上，新增「按分类」和「按来源」两种浏览维度，让用户既能按功能分类筛选，也能按 GitHub 仓库来源筛选
2. **工作流自定义步骤**——工作流编排器除了选择已有 Skill，还允许用户输入自然语言自定义步骤（如"检查暂存区的代码，并分析意图"），生成的工作流文件符合 `skill-creator` 规范
3. **同步多模式**——同步按钮从单一的"开始同步"扩展为三种模式：增量同步、替换同步（清空后重新同步）、Diff 查看（预览差异）
4. **默认套件全选修复**——确保默认套件（`bundle-default`）包含全部 9 个出厂分类下的所有 Skill

这些增强都是对现有架构的自然延伸，不引入新的技术栈或外部依赖，预计可在 1-2 个 Sprint 内完成。

## 问题

### 问题 1：浏览维度单一

当前 `SecondarySidebar` 中的 `CategoryTree` 只提供「按功能分类」一种浏览方式。随着 `anthropic-official` 和 `awesome-copilot` 两个外部仓库的接入，用户可能想知道"Anthropic 官方提供了哪些 Skill？"或"awesome-copilot 仓库有什么？"——但现在只能通过 SkillCard 上的来源标签逐个辨认，无法按来源批量筛选。

### 问题 2：工作流编排灵活性不足

V1 的工作流编排器只允许从已有 Skill 列表中选择步骤。但很多实际工作流需要"胶水步骤"——不对应任何现有 Skill 的自定义指令。例如"检查暂存区的代码，并分析意图"、"将上一步的输出格式化为 Markdown 表格"。用户被迫先创建一个 Skill 再引用，流程冗余。同时，当前生成的工作流 `.md` 文件格式较为简单，未完全对齐 `skill-creator` 规范中对 Skill 文件结构的要求。

### 问题 3：同步操作粒度粗糙

当前同步只有一个"开始同步"按钮，执行的是全量覆盖式推送（`fs.copy` + `overwrite: true`）。用户无法：
- 只同步新增/修改的文件（增量）
- 先清空目标目录再全量同步（替换）
- 在同步前预览哪些文件会被新增/修改/删除（Diff）

这导致用户对同步操作缺乏信心——不知道会发生什么，也不知道发生了什么。

### 问题 4：默认套件未全选

`settings.yaml` 中的 `bundle-default` 通过 `categoryNames` 列出了全部 9 个出厂分类，但在同步页面的套件选择中，并未自动选中这些分类下的所有 Skill。用户期望"默认套件 = 全部出厂 Skill"，但实际行为不符合预期。

## 解决方案

### 需求 1：二级 Sidebar 视图切换（按分类 / 按来源）

在 `SecondarySidebar` 顶部新增一个 Tab 切换器，提供两种浏览维度：

**「按分类」视图（默认）**——即现有的 `CategoryTree`，按 `categories.yaml` 中定义的 9 个分类展示，点击分类筛选 Skill 列表。

**「按来源」视图**——按 `source` 字段分组展示：
- **我的 Skill**（`source` 为空）——用户自有的 Skill
- **Anthropic Official**（`source: anthropic-official`）
- **Awesome Copilot**（`source: awesome-copilot`）
- 未来新增的仓库自动出现在列表中

每个来源项显示该来源下的 Skill 数量 Badge。点击来源项时，主内容区筛选为该来源的所有 Skill。

**Tab 切换时的筛选状态管理：**
- 切换 Tab 时**自动清除**当前维度的筛选状态（即 `selectedCategory` 和 `selectedSource` 互斥，选了来源就清除分类，反之亦然）
- 切换回原 Tab 时，筛选状态不保留（重新从「全部」开始）
- `skill-store` 中 `setCategory` 和 `setSource` 互斥：调用 `setCategory` 时自动清空 `selectedSource`，反之亦然

**交互说明：**

```
二级 Sidebar
┌──────────────────────┐
│ [按分类] [按来源]     │  ← Tab 切换
├──────────────────────┤
│ 📁 全部 (42)         │  ← 视图 A: 按分类
│ ├─ 编程开发 (12)     │
│ ├─ 文档写作 (5)      │
│ ├─ 工作流 (3)        │
│ └─ ...               │
├──────────────────────┤
│ 🌐 全部 (42)         │  ← 视图 B: 按来源
│ ├─ 我的 Skill (20)   │
│ ├─ Anthropic (12)    │
│ └─ Awesome Copilot (10)│
├──────────────────────┤
│ ⚙️ 管理分类          │
└──────────────────────┘
```

**技术要点：**
- 新增 `SourceTree` 组件，与 `CategoryTree` 平级
- 来源数据从 `skill-store` 中的 `skills` 数组按 `source` 字段聚合，无需新增后端 API
- Tab 切换状态存储在 `SecondarySidebar` 本地 state（不需要持久化）
- `skill-store` 新增 `selectedSource` 筛选状态和 `setSource` action
- `selectedCategory` 和 `selectedSource` 互斥——`setCategory` 内部自动执行 `selectedSource = null`，`setSource` 内部自动执行 `selectedCategory = null`

### 需求 2：工作流自定义步骤 + skill-creator 规范对齐

#### 2a. 自定义步骤

在工作流编排器的步骤列表中，新增「添加自定义步骤」按钮。用户可以：
- 通过**自动扩展的 Textarea**（初始 1 行，随内容增长自动扩展）输入自然语言指令作为步骤内容（如"检查暂存区的代码，并分析意图"）
- 自定义步骤不关联任何已有 Skill，`skillId` 为 `null`，`skillName` 为 `null`
- 自定义步骤在 UI 上用不同的视觉样式区分（如虚线边框 + ✏️ 图标）

**数据模型扩展：**

```typescript
interface WorkflowStep {
  order: number;
  skillId: string | null;    // 已有 Skill 的 ID（自定义步骤为 null）
  skillName: string | null;  // 已有 Skill 的名称（自定义步骤为 null）
  description: string;       // 步骤描述（自定义步骤的核心内容）
  type: 'skill' | 'custom';  // 新增：步骤类型
}
```

> **设计说明**：自定义步骤的 `skillId` 使用 `null` 而非空字符串，避免下游代码（如 `pushSync` 中的 `getSkillMeta(skillId)`）将空字符串误判为有效 ID。Zod schema 使用 `z.string().nullable()`。

**生成的工作流文件格式：**

```markdown
## Step 1: 代码审查

**使用 Skill:** `code-review`

执行全面的代码审查，检查代码风格、潜在 bug、性能问题等。

## Step 2: 分析暂存区意图

检查暂存区的代码，并分析本次修改的意图和目的。
```

自定义步骤不生成 `**使用 Skill:**` 行，直接输出描述内容。

#### 2b. skill-creator 规范对齐

参照 `skills/meta-skills/skill-creator/SKILL.md` 中的 **Skill Writing Guide** 章节（非 eval/benchmark 等评估流程），确保生成的工作流 Skill 文件对齐以下 3 项具体规范：

1. **Frontmatter 字段规范**：包含 `name`、`description`、`category: workflows`、`type: workflow`、`tags`。其中 `name` 和 `description` 为必填（Claude 官方标准字段）
2. **description 的 "pushy" 触发策略**：description 不仅描述功能，还主动包含触发场景和关键词，稍微"pushy"一些以提高触发率。例如：`"组合代码审查和暂存区分析的完整代码质量工作流。当用户需要对代码进行全面质量检查、提交前审查、或代码分析时使用此工作流。"`
3. **正文结构与渐进式加载**：顶部有工作流概述段落，说明整体目标和适用场景，然后是 Step 列表。保持在 500 行以内（工作流 Skill 通常远低于此限制）

### 需求 3：同步多模式

将同步按钮从单一操作扩展为三种模式，通过下拉菜单或分段按钮选择：

#### 模式 A：增量同步（默认）

- 只同步**新增或修改**的 Skill 文件
- 采用**分层比较策略**：先比较 `mtime`（O(1) 快速路径），若 `mtime` 不同再比较内容哈希 `md5`（O(n) 精确判断）。纯 `mtime` 在跨文件系统场景（Docker volume、网络挂载）不可靠，纯 `md5` 在大量文件时性能差，分层策略兼顾速度和准确性
- 跳过未变化的文件，减少 I/O 操作
- 同步结果显示：新增 N 个、更新 N 个、跳过 N 个

#### 模式 B：替换同步

- 先**删除目标目录中已知的 Skill 文件夹**（即本次选中的 `selectedSkillIds` 对应的文件夹），而非清空整个目标目录——避免误删用户手动放入的非 Skill 文件
- 再执行全量同步
- 适用于目标目录被手动修改过、需要恢复到仓库状态的场景
- 操作前弹出确认对话框："替换同步将删除目标目录中已选 Skill 的文件夹，然后重新同步。确定继续？"

#### 模式 C：Diff 查看

- **不执行任何文件操作**
- 对比源目录和目标目录，生成差异报告：
  - 🟢 新增：仓库中有但目标目录中没有的 Skill
  - 🟡 修改：两边都有但内容不同的 Skill
  - 🔴 删除：目标目录中有但仓库中没有的 Skill（可能是用户手动添加的）
  - ⚪ 相同：两边内容一致的 Skill
- 差异报告在 UI 中以列表形式展示，每个 Skill 显示状态图标和文件路径
- Diff 对比以每个 Skill 文件夹中的 `SKILL.md` 作为代表性文件计算哈希，而非遍历文件夹内所有文件——兼顾准确性和性能
- Diff 结果页底部**直接放置**「执行增量同步」和「执行替换同步」两个操作按钮，用户无需返回同步页面重新选择模式

**UI 交互：**
- 主按钮为「同步」（执行增量同步），旁边一个小箭头展开下拉菜单显示「替换同步」和「查看差异」。80% 的用户只看到一个按钮，高级用户通过下拉访问其他模式

**技术要点：**
- 后端新增 `POST /api/sync/diff` 端点，返回差异报告（独立的新函数 `diffSync`，因为 Diff 需要双向遍历源/目标目录，逻辑与单向推送的 `pushSync` 完全不同）
- 后端 `POST /api/sync/push` 新增**可选** `mode` 参数：`incremental`（增量）、`replace`（替换）、`full`（全量）。**默认值为 `full`**，保持向后兼容——现有不传 `mode` 的调用行为不变
- 前端同步页面新增模式选择 UI（主按钮 + 下拉菜单）和 Diff 结果展示组件
- `SyncResult` 类型扩展，新增 `skipped` 计数

### 需求 4：默认套件全选修复

**期望行为：** 选择默认套件（`bundle-default`）后，该套件所有分类下的全部 Skill 应自动被选中。

**实际行为：** 选择默认套件后，部分 Skill 未被选中，用户需要手动勾选。

**修复方向：** 确保套件选择逻辑正确遍历 `categoryNames` 中的每个分类，收集该分类下的所有 Skill ID（包括外部 Skill），并更新 `selectedSkillIds`。具体根因在开发阶段定位。

## 差异化优势

- **零新依赖**：4 项增强全部基于现有技术栈（React + Zustand + Express + fs-extra），不引入新的 npm 包或外部服务
- **渐进式增强**：每项需求独立可交付，互不依赖，可按优先级分批实施
- **数据驱动**：来源视图从已有的 `source` 字段聚合，Diff 从文件系统对比生成，不需要额外的数据存储
- **规范对齐**：工作流生成对齐 `skill-creator` 官方规范，确保生成的 Skill 文件在 Claude 生态中有最佳的触发表现

## 目标用户

与 Skill Manager 主产品一致——**个人开发者**，特别是：

- 管理多个外部仓库来源 Skill 的用户（需求 1）
- 需要灵活编排包含自定义步骤的工作流的高级用户（需求 2）
- 对同步操作有精细控制需求的用户（需求 3）
- 期望"开箱即用"体验的所有用户（需求 4）

## 成功标准

> **说明**：本项目为本地应用，无后端埋点服务。以下标准以功能验证和定性评估为主。

| 指标 | 目标 |
|------|------|
| 来源视图可用性 | 用户可在「按来源」视图中按仓库来源筛选 Skill，筛选结果准确 |
| 自定义步骤可用性 | 用户可在工作流中添加自定义步骤，生成的 `.md` 文件格式正确且符合 skill-creator 规范 |
| 同步多模式可用性 | 三种同步模式均可正常执行，增量同步正确跳过未变化文件，替换同步正确清理已知 Skill 文件夹 |
| Diff 准确性 | Diff 报告正确识别新增/修改/删除/相同状态，与实际文件系统状态一致 |
| 默认套件全选 | 选择默认套件后，9 个出厂分类下的全部 Skill 被选中（单元测试覆盖） |

## 范围

### 本次包含

- `SecondarySidebar` Tab 切换 + `SourceTree` 组件
- `skill-store` 新增 `selectedSource` / `setSource`
- `WorkflowStep` 类型扩展（`type: 'skill' | 'custom'`）
- 工作流编排器「添加自定义步骤」UI
- `workflowService.ts` 生成逻辑适配自定义步骤
- 工作流 Frontmatter `description` 优化（对齐 skill-creator 规范）
- `syncService.ts` 新增增量同步、替换同步、Diff 对比逻辑
- `POST /api/sync/diff` 新端点
- `POST /api/sync/push` 新增 `mode` 参数
- 同步页面模式选择 UI + Diff 结果展示
- 默认套件全选 bug 修复
- 各项功能的单元测试

### 本次不包含

- 来源视图的仓库管理（增删改查仓库注册）——仍通过 `repositories.yaml` 配置
- 工作流的条件分支、参数传递等高级逻辑（V3）
- 同步的双向同步能力（IDE → 仓库）
- 同步历史记录和回滚能力
- 自定义步骤的 AI 辅助生成（如根据描述自动推荐 Skill）

## 技术方案概要

| 维度 | 选型 |
|------|------|
| 来源视图 | `SourceTree` 组件，从 `skills` 数组按 `source` 字段 `reduce` 聚合 |
| Tab 切换 | `SecondarySidebar` 内部 `useState`，无需持久化 |
| 自定义步骤 | `WorkflowStep.type` 字段区分，`workflowService` 条件生成 |
| 增量同步 | 分层策略：`fs.stat` 比较 `mtime`（快速路径）→ `crypto.createHash('md5')` 比较内容（精确回退） |
| 替换同步 | 按 `selectedSkillIds` 删除对应文件夹 + 全量 `fs.copy`（不使用 `fs.emptyDir`） |
| Diff 对比 | 独立 `diffSync` 函数，双向遍历源/目标目录，以 `SKILL.md` 哈希为代表性比较 |
| 套件全选 | 修复 `selectByCategory` 逻辑，确保大小写不敏感匹配 |

## 优先级建议

| 优先级 | 需求 | 理由 |
|--------|------|------|
| P0 | 需求 4：默认套件全选修复 | Bug 修复，影响所有用户的基础体验 |
| P1 | 需求 3：同步多模式 | 高频操作的体验提升，用户反馈最强烈 |
| P1 | 需求 1：按来源浏览 | 随着外部仓库增多，需求越来越迫切 |
| P2 | 需求 2：工作流自定义步骤 | 高级功能，面向进阶用户 |

## 需求间交互分析

| 交互点 | 说明 | PRD 阶段需明确 |
|--------|------|----------------|
| 需求 1 × 需求 3 | 用户可能想"只同步 Anthropic 来源的 Skill"。来源筛选是否影响同步页面的 Skill 选择？ | 是否在同步页面也提供按来源筛选的能力 |
| 需求 2 × 需求 3 | 包含自定义步骤的工作流 Skill 同步到 IDE 后，自定义步骤的执行依赖 IDE 的 Agent 能力 | 是否在同步时对自定义步骤添加兼容性提示 |
| 需求 1 × 需求 4 | 默认套件包含 9 个分类，但来源视图按仓库分组。套件选择是否应支持按来源维度？ | 是否在 V2+ 支持"按来源创建套件" |

## 愿景

这 4 项增强是 Skill Manager 从"能用"走向"好用"的关键一步：

- **短期**：修复套件全选 bug，补齐同步多模式，让日常操作更顺畅
- **中期**：来源视图为未来的"Skill 市场"奠定浏览基础；自定义步骤为工作流的 AI 辅助编排铺路
- **长期**：同步 Diff 能力是双向同步的前置条件；自定义步骤 + skill-creator 规范对齐，让用户生成的工作流在 Claude 生态中有最佳表现
