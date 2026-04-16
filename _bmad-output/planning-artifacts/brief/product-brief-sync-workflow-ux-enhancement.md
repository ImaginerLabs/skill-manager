---
title: "Product Brief: 同步链路优化 + 分类编辑增强 + 工作流预览修复"
status: "approved"
created: "2026-04-16"
updated: "2026-04-16"
inputs:
  [
    "用户需求描述",
    "SyncExecutor.tsx 代码分析",
    "MetadataEditor.tsx 代码分析",
    "WorkflowPreview.tsx 代码分析",
    "sync-store.ts 状态分析",
    "prd-skill-manager-v2.md",
    "architecture.md",
  ]
---

# 产品简报：同步链路优化 + 分类编辑增强 + 工作流预览修复

## 执行摘要

Skill Manager V2 已交付同步多模式（增量/替换/Diff）、工作流自定义步骤、来源视图等核心能力。但在实际使用中暴露了三个影响核心体验的问题：

1. **同步目标链路断裂**：用户可添加多个同步目标，但同步时无法指定推送到哪个目标，Diff 预览硬编码取第一个目标——多目标场景下用户完全失去控制力
2. **分类编辑体验割裂**：元数据编辑器中分类移动使用纯文本输入，用户需手动拼写 `name`（如 `coding`）而非选择 `displayName`（如 `编程开发`），且无法创建新分类
3. **工作流预览不可用**：预览区域无法滚动查看长内容，且以纯文本 `<pre>` 展示 Markdown 格式的工作流文件，无语法高亮

这三项修复和增强全部基于现有技术栈，零新依赖，每项独立可交付。

## 问题

### P1：同步目标链路断裂

**现状**：`SyncExecutor` 调用 `executePush(undefined, mode)` 时 `targetIds` 始终为 `undefined`，后端 `pushSync` 收到空数组后默认推送到所有启用目标。Diff 预览硬编码取 `enabledTargets[0]`。用户添加了 3 个目标（如 CodeBuddy、Cursor、Windsurf），但无法选择"只同步到 Cursor"。

**影响**：多目标场景下同步行为不可控，Diff 预览可能展示错误目标的差异，用户信心受损。

### P2：分类编辑体验割裂

**现状**：`MetadataEditor` 的「移动分类」使用 `<Input>` 文本框，用户需输入 `name`（如 `meta-skills`），但用户更熟悉 `displayName`（如 `元技能`）。无法创建新分类，需手动编辑 `categories.yaml`。

**影响**：分类移动操作易出错（拼写错误），新分类创建流程割裂（需离开 UI 编辑配置文件）。

### P3：工作流预览不可用

**现状**：`WorkflowPreview` 使用 `<pre>` 纯文本展示 Markdown 内容，无格式渲染。`ScrollArea` 的 `max-h-[300px]` 在 flex 布局中可能不生效，长内容无法滚动查看。

**影响**：工作流预览形同虚设——用户无法有效查看生成结果，也无法滚动查看完整内容。

## 解决方案

### S1：同步目标选择器

- 同步执行前，用户可选择同步到哪个/哪些目标（多选）
- Diff 预览前，用户可选择对哪个目标进行差异对比（单选）
- 摘要面板展示用户选择的目标
- 后端 `pushSync` 已支持 `targetIds` 参数，仅需前端对接

### S2：分类 Combobox 选择器

- 将「移动分类」的文本输入替换为 Combobox 下拉选择器
- 展示 `displayName`，值为 `name`
- 支持搜索过滤
- 底部提供「创建新分类」选项，允许输入 name + displayName

### S3：工作流预览 Markdown 渲染

- 将 `<pre>` 替换为 `ReactMarkdown` + `rehype-highlight` + `remark-gfm`（复用 SkillPreview 已有方案）
- 修复 ScrollArea 高度策略，确保预览区域可滚动
- 代码块语法高亮，适配暗色/亮色主题

## 目标用户

同时使用多个 AI IDE 的个人开发者，技术水平中级以上，已配置 2+ 个同步目标。

## 成功指标

| 指标 | 目标 |
|------|------|
| 同步目标选择 | 用户可在同步/Diff 前选择目标，不再默认推送到所有目标 |
| 分类移动准确率 | 100%（下拉选择消除拼写错误） |
| 新分类创建 | 用户可在 UI 内完成新分类创建，无需手动编辑配置文件 |
| 工作流预览可用性 | 预览内容可滚动、Markdown 格式正确渲染、代码块有语法高亮 |

## 范围

### In Scope

- 同步目标选择 UI 和逻辑
- Diff 预览目标选择
- 分类 Combobox 组件
- 创建新分类 API 和 UI
- 工作流预览 Markdown 渲染
- 预览区域滚动修复

### Out of Scope

- 双向同步（仓库 ↔ IDE）
- 同步目标分组/标签
- 分类拖拽排序
- 工作流实时协作编辑
