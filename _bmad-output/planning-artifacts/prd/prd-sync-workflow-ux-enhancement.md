---
stepsCompleted: ["step-01-init", "step-02-discovery", "step-02b-vision", "step-02c-executive-summary", "step-03-success", "step-04-journeys", "step-05-domain", "step-06-innovation", "step-07-project-type", "step-08-scoping", "step-09-functional", "step-10-nonfunctional", "step-11-polish", "step-12-complete"]
inputDocuments:
  [
    "brief/product-brief-sync-workflow-ux-enhancement.md",
    "prd/prd-skill-manager-v2.md",
    "architecture.md",
  ]
workflowType: 'prd'
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 0
  projectDocs: 2
classification:
  projectType: developer_tool
  domain: general
  complexity: low
  projectContext: brownfield
---

# Product Requirements Document — 同步链路优化 + 分类编辑增强 + 工作流预览修复

**Author:** Alex
**Date:** 2026-04-16

---

## Executive Summary

Skill Manager V2 已交付同步多模式、工作流自定义步骤、来源视图等核心能力。但实际使用中暴露了三个影响核心体验的问题：

1. **同步目标链路断裂**：用户可添加多个同步目标，但同步/Diff 时无法指定目标，后端能力已具备但前端未对接
2. **分类编辑体验割裂**：元数据编辑器中分类移动使用纯文本输入，用户需手动拼写 `name` 而非选择 `displayName`，且无法创建新分类
3. **工作流预览不可用**：预览区域无法滚动，纯文本 `<pre>` 展示 Markdown，无格式渲染和语法高亮

**本次 PRD 聚焦 3 项增强修复：**

1. **同步目标选择器** — 同步/Diff 前可选择目标，摘要面板展示选择的目标
2. **分类 Combobox 选择器** — 下拉选择分类，支持搜索和创建新分类
3. **工作流预览 Markdown 渲染** — 复用 ReactMarkdown + rehype-highlight + remark-gfm，修复滚动

**目标用户：** 同时使用多个 AI IDE 的个人开发者，技术水平中级以上，已配置 2+ 个同步目标。

**技术约束：** 全部基于现有技术栈（React 19 + Zustand 5 + Express 5 + gray-matter），零新依赖。

---

## Project Classification

| 维度 | 值 |
|------|-----|
| 项目类型 | Developer Tool（开发者工具） |
| 领域 | General（通用软件开发） |
| 复杂度 | Low（标准需求、零新依赖） |
| 项目上下文 | Brownfield（现有系统增强修复） |

---

## Success Criteria

### User Success

- **同步目标选择**：用户可在同步/Diff 前选择目标，不再默认推送到所有目标，选择结果在摘要面板中展示
- **分类移动准确率**：100%（下拉选择消除拼写错误），用户可搜索过滤分类
- **新分类创建**：用户可在 UI 内完成新分类创建（输入 name + displayName），新增分类自动可用
- **工作流预览可用性**：预览内容可滚动、Markdown 格式正确渲染（标题/列表/代码块）、代码块有语法高亮

### Business Success

- **零回归**：现有同步功能（增量/替换/Diff）不受影响
- **零新依赖**：复用项目已有依赖
- **独立可交付**：每项独立可测试、可发布

---

## Functional Requirements

### FR-1: 同步目标选择器（新增）

| ID | 需求描述 | 验收标准 |
|----|---------|----------|
| FR-1.1 | 同步执行前，用户可选择同步到哪个/哪些目标 | 点击同步按钮后，弹窗/下拉展示所有启用的目标，用户可勾选 |
| FR-1.2 | 目标选择支持多选 | 用户可同时选择多个目标执行同步 |
| FR-1.3 | 摘要面板展示已选目标 | SyncSummaryPanel 显示用户选择的目标名称列表 |
| FR-1.4 | 目标选择器有全选/取消全选功能 | 提供快捷操作 |
| FR-1.5 | 未选择目标时提示用户 | 选择目标后才能确认同步 |

### FR-2: Diff 预览目标选择（修改）

| ID | 需求描述 | 验收标准 |
|----|---------|----------|
| FR-2.1 | Diff 预览前，用户可选择对哪个目标进行差异对比 | 点击 Diff 按钮后，展示目标选择器（单选） |
| FR-2.2 | 目标名称展示完整（名称 + 路径） | 避免混淆同名目标 |
| FR-2.3 | 目标选择后展示该目标的差异报告 | 差异报告对应用户选择的目标 |

### FR-3: 分类 Combobox 选择器（新增）

| ID | 需求描述 | 验收标准 |
|----|---------|----------|
| FR-3.1 | 「移动分类」使用 Combobox 下拉选择器 | 用户点击后展开分类下拉列表 |
| FR-3.2 | 下拉选项展示 displayName | 选项显示「编程开发」而非「coding」 |
| FR-3.3 | 下拉支持搜索过滤 | 用户可输入关键词过滤分类 |
| FR-3.4 | 当前分类默认选中 | 移动分类输入框默认填充当前分类 |
| FR-3.5 | 选择分类后执行移动 | 用户选择分类后自动移动 |

### FR-4: 创建新分类（新增）

| ID | 需求描述 | 验收标准 |
|----|---------|----------|
| FR-4.1 | 下拉底部提供「创建新分类」选项 | 用户可点击进入创建模式 |
| FR-4.2 | 创建模式需输入 name 和 displayName | 两字段均为必填 |
| FR-4.3 | name 需符合 kebab-case 规范 | 自动校验并提示 |
| FR-4.4 | 创建成功后自动选中新分类并执行移动 | 用户操作无缝衔接 |
| FR-4.5 | 创建分类 API 持久化到 categories.yaml | 重启后新分类保持 |

### FR-5: 工作流预览 Markdown 渲染（修改）

| ID | 需求描述 | 验收标准 |
|----|---------|----------|
| FR-5.1 | 预览内容使用 ReactMarkdown 渲染 | Markdown 格式（标题/列表/粗斜体）正确展示 |
| FR-5.2 | 代码块使用 rehype-highlight 语法高亮 | 代码块有颜色区分 |
| FR-5.3 | 支持 remark-gfm（表格/任务列表/删除线） | GFM 特性正确渲染 |
| FR-5.4 | 预览区域可滚动 | ScrollArea 高度策略正确，长内容可滚动 |
| FR-5.5 | 适配暗色/亮色主题 | 语法高亮颜色与主题一致 |

---

## User Journeys

### Journey 1: 选择目标并同步

```
用户：已配置 CodeBuddy、Cursor、Windsurf 三个同步目标
1. 用户在 SyncPage 选择 5 个 Skill
2. 点击同步按钮
3. 弹窗展示目标选择器（默认全选）
4. 用户取消「Windsurf」，只保留「CodeBuddy」+「Cursor」
5. 点击确认
6. 摘要面板展示：5 Skill → 2 targets (CodeBuddy, Cursor)
7. 同步执行，结果展示正确
```

### Journey 2: Diff 查看特定目标

```
用户：想查看 CodeBuddy 的差异情况
1. 用户选择 3 个 Skill
2. 点击「预览变更」按钮
3. 目标选择器出现，用户选择「CodeBuddy」
4. 展示 CodeBuddy 的差异报告（不是 Cursor 或 Windsurf）
5. 用户可执行同步或关闭
```

### Journey 3: 移动 Skill 到新分类

```
用户：想创建一个「ai-prompts」分类，并将 skill-creator 移入
1. 用户打开 skill-creator 的元数据编辑器
2. 点击「移动到分类」下拉框
3. 搜索框输入「ai」
4. 看到现有分类列表（无匹配）
5. 滚动到底部，点击「+ 创建新分类」
6. 输入 name: ai-prompts, displayName: AI 提示词
7. 点击确认
8. 系统创建分类并自动将 skill-creator 移动到新分类
9. UI 刷新，新分类显示在列表中
```

### Journey 4: 查看工作流预览

```
用户：编辑完工作流，点击预览
1. 用户在 WorkflowEditor 中编排 8 个步骤
2. 点击「预览」按钮
3. 预览区域展示渲染后的 Markdown 内容
   - 标题正确渲染（大标题、段落标题）
   - 列表正确渲染（有序/无序）
   - 代码块有语法高亮（深色背景、关键字着色）
4. 内容超过 300px 时可滚动查看
5. 用户可滚动完整查看所有内容
```

---

## Domain Model

### 新增组件

```
components/sync/
├── SyncTargetSelector.tsx    # 目标选择器（多选/单选模式）
├── TargetCheckboxList.tsx    # 目标复选框列表

components/skills/
├── CategoryCombobox.tsx      # 分类下拉选择器（新建+选择）

components/workflow/
└── WorkflowPreview.tsx       # 修改：Markdown 渲染 + 滚动修复
```

### 后端 API（扩展）

```
POST /api/categories          # 创建新分类
PUT  /api/categories/:id     # 更新分类（可选）

GET  /api/categories          # 获取分类列表（已有）
```

---

## Innovation Opportunities

### Io-1: 同步预设

用户可保存常用目标组合（如「主力 IDE + 测试 IDE」），一键调用。

### Io-2: 分类模板

预置常用分类模板，用户可一键创建多个分类。

### Io-3: 预览主题切换

工作流预览支持亮色/暗色/系统主题切换。

---

## Non-Functional Requirements

### Performance

| NFR | 要求 | 验证方法 |
|-----|------|----------|
| NFR-1 | 目标选择器加载 < 50ms | 500ms 档位 UI 冻结测试 |
| NFR-2 | 分类下拉搜索响应 < 100ms | 50 个分类下输入过滤 |
| NFR-3 | Markdown 渲染 < 500ms | 1000 行工作流内容 |
| NFR-4 | 新分类创建 < 200ms | 包含文件 I/O |

### Security

| NFR | 要求 | 验证方法 |
|-----|------|----------|
| NFR-5 | 替换同步的文件删除限制在目标目录 | 路径遍历攻击测试 |
| NFR-6 | 新分类 name 校验 kebab-case | 非法字符拒绝 |

### Compatibility

| NFR | 要求 | 验证方法 |
|-----|------|----------|
| NFR-7 | 暗色主题语法高亮 | 视觉检查 |
| NFR-8 | 亮色主题语法高亮 | 视觉检查 |
| NFR-9 | macOS/Windows/Linux 路径兼容 | 跨平台测试 |

---

## Scoping

### In Scope

| 功能 | 优先级 | 预估工作量 |
|------|--------|-----------|
| 同步目标选择器 | P0 | 1 Story |
| Diff 目标选择 | P0 | 0.5 Story（复用选择器） |
| 分类 Combobox | P0 | 1 Story |
| 创建新分类 | P0 | 0.5 Story |
| 工作流预览 Markdown | P0 | 0.5 Story |
| 预览滚动修复 | P1 | 0.25 Story |

### Out of Scope

- 双向同步（仓库 ↔ IDE）
- 同步目标分组/标签
- 分类拖拽排序
- 工作流实时协作编辑

---

## Acceptance Criteria Summary

| 功能 | AC |
|------|-----|
| 同步目标选择 | 用户可多选目标，确认同步；摘要面板展示已选目标 |
| Diff 目标选择 | 用户可单选目标，Diff 报告对应选择的目标 |
| 分类选择 | 下拉展示 displayName，支持搜索，默认选中当前分类 |
| 创建分类 | 输入 name + displayName，创建成功后执行移动 |
| 工作流预览 | Markdown 渲染正确，代码块有语法高亮，内容可滚动 |

---

## Dependencies

### 前端依赖（已存在）

- `react-markdown` — Markdown 渲染
- `rehype-highlight` — 代码高亮
- `remark-gfm` — GitHub 风格 Markdown
- `@radix-ui/react-popover` / `@radix-ui/react-combobox` — 下拉组件（检查现有 UI 组件）

### 后端依赖（已存在）

- `gray-matter` — Frontmatter 解析
- `yaml` — YAML 读写
- `fs-extra` — 文件操作

### 无新增依赖

本次 PRD 所有功能复用现有依赖，零新引入。