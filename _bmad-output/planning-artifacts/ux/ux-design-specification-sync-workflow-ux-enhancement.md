---
stepsCompleted:
  [
    "step-01-init",
    "step-02-discovery",
    "step-03-core-experience",
    "step-04-emotional-response",
    "step-05-inspiration",
    "step-06-design-system",
    "step-07-defining-experience",
    "step-08-visual-foundation",
    "step-09-design-directions",
    "step-10-user-journeys",
    "step-11-component-strategy",
    "step-12-ux-patterns",
    "step-13-responsive-accessibility",
    "step-14-complete",
  ]
inputDocuments:
  [
    "prd/prd-sync-workflow-ux-enhancement.md",
    "brief/product-brief-sync-workflow-ux-enhancement.md",
    "ux/ux-design-specification-v2.md",
    "project-context.md",
  ]
workflowType: "ux-design"
baseDesignSystem: "ux/ux-design-specification.md"
---

# UX Design Specification — 同步链路优化 + 分类编辑增强 + 工作流预览修复

**Author:** Alex
**Date:** 2026-04-16
**Base:** 本文档继承 `ux-design-specification.md`（V1）和 `ux-design-specification-v2.md`（V2）的设计系统、色彩体系、排版、组件策略。

---

## Executive Summary

### 设计范围

本 UX 设计规范聚焦 3 项增强修复需求的交互设计：

1. **同步目标选择器** — 同步/Diff 前可选择目标
2. **分类 Combobox 选择器** — 下拉选择分类，支持搜索和创建新分类
3. **工作流预览 Markdown 渲染** — 修复滚动，渲染 Markdown 格式

### 设计原则延续

延续 V1/V2 的核心设计原则：
- **Code Dark + Run Green** 暗色主题优先
- **最短路径到价值**的交互模式
- **即时反馈**的操作响应
- **一致性的组件复用**

---

## Component Specifications

### 1. 同步目标选择器（SyncTargetSelector）

#### 触发时机

- 用户点击「同步」按钮 → 打开目标选择弹窗
- 用户点击「预览变更」→ 打开目标选择弹窗（单选模式）

#### 弹窗结构

```
┌─────────────────────────────────────┐
│  选择同步目标              [X]      │
├─────────────────────────────────────┤
│  已选择 3/5                          │
│  ┌────────────────────────────────┐ │
│  │ ☐ CodeBuddy        /Users/...  │ │
│  │ ☑ Cursor           /Users/...  │ │
│  │ ☐ Windsurf         /Users/...  │ │
│  │ ☑ VS Code          /Users/...  │ │
│  │ ☐ Vim              /Users/...  │ │
│  └────────────────────────────────┘ │
│                                     │
│  [全选] [取消全选]                   │
│                                     │
│  [取消]  [确认同步]                 │
└─────────────────────────────────────┘
```

#### 样式规范

| 元素 | 样式 |
|------|------|
| 弹窗宽度 | max-w-md (400px) |
| 目标项高度 | min-h-[48px]，内边距 py-2.5 px-3 |
| 复选框 | 使用现有 Checkbox 组件 |
| 路径文字 | text-xs，font-[var(--font-code)]，text-[muted-foreground] |
| 底部按钮 | 右侧 primary 按钮（确认），左侧 ghost 按钮（取消） |

#### 交互行为

- 悬停目标项：bg-[hsl(var(--muted))/0.5]
- 选中状态：左侧复选框勾选，项背景 subtle highlight
- 全选/取消全选：快捷操作按钮
- 确认后关闭弹窗，传递已选目标 ID 数组到执行逻辑

### 2. Diff 目标选择器

#### 差异

- 单选模式（Radio 替代 Checkbox）
- 确认后直接执行 Diff 并展示报告
- 弹窗标题：「选择预览目标」

### 3. 分类 Combobox 选择器（CategoryCombobox）

#### 触发时机

- 用户点击元数据编辑器的「移动分类」输入框

#### 下拉结构

```
┌─────────────────────────────────────┐
│  🔍 搜索分类...                     │
├─────────────────────────────────────┤
│  编程开发                            │
│  文档写作                            │
│  DevOps                             │
│  工作流                             │
│  文档处理                           │
│  开发工具                           │
│  测试                               │
│  设计                               │
│  元技能                             │
├─────────────────────────────────────┤
│  + 创建新分类                        │
└─────────────────────────────────────┘
```

#### 样式规范

| 元素 | 样式 |
|------|------|
| 组件基础 | 使用 Radix UI Popover + Combobox |
| 搜索输入 | Input 组件，h-8，text-sm |
| 选项项 | h-9，px-2，text-sm |
| 当前分类 | 高亮显示 bg-[hsl(var(--primary))/0.1] |
| 分隔线 | border-t border-[hsl(var(--border))] |
| 创建选项 | text-[primary]，flex items-center gap-2 |

#### 创建新分类模式

点击「+ 创建新分类」后，下拉展开为表单：

```
┌─────────────────────────────────────┐
│  name: [____________] (kebab-case) │
│  displayName: [____________]        │
│                                     │
│  [取消]  [创建]                     │
└─────────────────────────────────────┘
```

- name 输入框：实时校验 kebab-case（a-z 0-9 -）
- displayName 输入框：纯中文/英文/数字
- 创建成功后：关闭下拉，执行分类移动

### 4. 工作流预览 Markdown 渲染

#### 预览区域结构

```
┌─────────────────────────────────────┐
│  预览：工作流名称.md          [关闭]│
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │ # 工作流名称                    ││
│  │                                 ││
│  │ 工作流描述...                   ││
│  │                                 ││
│  │ ## 步骤列表                     ││
│  │ 1. 步骤1：xxx                   ││
│  │ 2. 步骤2：yyy                   ││
│  │                                 ││
│  │ ```javascript                   ││
│  │ const example = "code";         ││
│  │ ```                            ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

#### 样式规范

| 元素 | 样式 |
|------|------|
| 容器 | border rounded-md bg-[background] |
| 标题 | text-lg font-bold |
| 段落 | text-sm leading-relaxed |
| 列表 | pl-4，list-disc |
| 代码块 | rounded bg-[hsl(var(--muted))] p-3 overflow-x-auto |
| 语法高亮 | 使用 highlight.js 的 github-dark 主题 |

#### 滚动策略

| 方案 | 说明 |
|------|------|
| 容器高度 | max-h-[400px]（而非 300px） |
| ScrollArea | 正确包裹内容区域 |
| 溢出处理 | overflow-y-auto |

---

## Interaction Patterns

### IP-1: 同步流程目标选择

```
Flow: 选择 Skill → 点击同步按钮
                ↓
        显示目标选择弹窗
                ↓
    用户选择目标（默认全选）
                ↓
          点击确认
                ↓
    显示摘要面板（已选目标列表）
                ↓
          执行同步
                ↓
        显示结果报告
```

### IP-2: 分类移动流程

```
Flow: 选择 Skill → 打开详情 → 点击编辑
                ↓
        显示元数据面板
                ↓
    点击「移动分类」下拉
                ↓
        显示分类列表
                ↓
    用户选择分类 OR 创建新分类
                ↓
      执行移动 → 刷新列表
```

### IP-3: 工作流预览流程

```
Flow: 编辑工作流 → 输入名称和步骤
                ↓
          点击「预览」按钮
                ↓
    加载 Markdown 内容（loading 态）
                ↓
    渲染 Markdown（ReactMarkdown）
                ↓
    用户滚动查看完整内容
                ↓
    点击关闭 → 隐藏预览
```

---

## Responsive Behavior

### 桌面端 (≥1024px)

- 同步目标选择弹窗：居中显示，max-w-md
- 分类 Combobox：下拉宽度与输入框一致
- 工作流预览：占满编辑区域底部

### 移动端 (<640px)

- 同步目标选择：底部抽屉（sheet）
- 分类 Combobox：全宽下拉
- 工作流预览：占满屏幕，max-h-[60vh]

---

## Accessibility

| 组件 | 需求 |
|------|------|
| 目标选择弹窗 | 支持 ESC 关闭，Tab 焦点导航 |
| 分类下拉 | 键盘上下选择，Enter 确认 |
| 预览区域 | 支持屏幕阅读器读取内容 |
| 按钮焦点 | visible-focus ring |

---

## Dark/Light Theme

本次需求重点确保暗色主题体验：

| 组件 | 暗色 | 亮色 |
|------|------|------|
| 目标选择弹窗 | bg-[card] | bg-[card] |
| 分类下拉项 hover | bg-[muted]/0.5 | bg-[muted]/0.5 |
| 代码块背景 | github-dark | github-light |
| 语法高亮 | 自动适配 | 自动适配 |

---

## Animation

| 元素 | 动效 |
|------|------|
| 弹窗打开 | fade-in + scale-up (150ms ease-out) |
| 弹窗关闭 | fade-out (100ms) |
| 下拉展开 | slide-down (100ms) |
| 预览加载 | skeleton pulse |

---

## Success Checkpoints

- [ ] 目标选择器弹窗打开/关闭动画流畅
- [ ] 分类下拉搜索响应 < 100ms
- [ ] 创建新分类 name 校验实时反馈
- [ ] 工作流预览 Markdown 渲染正确
- [ ] 代码块语法高亮在暗色/亮色主题下可见
- [ ] 预览区域可滚动，无内容截断
- [ ] 所有交互支持键盘操作