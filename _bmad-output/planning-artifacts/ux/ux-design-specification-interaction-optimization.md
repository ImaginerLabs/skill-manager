---
stepsCompleted: ["step-01-init", "step-14-complete"]
inputDocuments: ["ux-design-specification.md", "prd-ux-interaction-optimization.md"]
workflowType: 'ux-design-amendment'
type: 'ux-spec-supplement'
status: 'approved'
author: 'Alex / Sally (UX Designer)'
date: '2026-04-15'
---

# UX Design Specification 增补 — 交互优化

**Author:** Alex / Sally (UX Designer)
**Date:** 2026-04-15
**类型:** 现有 UX 规范增补（基于代码实现与规范差距分析）
**关联主规范:** `ux-design-specification.md`
**关联 PRD:** `prd-ux-interaction-optimization.md`

---

## Executive Summary

本增补文档基于 PRD `prd-ux-interaction-optimization.md` 中识别的五条交互优化提案，为主 UX 规范补充具体的交互规格细节。重点覆盖：

1. 预览面板三断点响应式行为的精确规格（主规范已定义 push 模式概念，但缺少实现细节）
2. 搜索高亮组件的视觉与交互规格（主规范附录 B 已提及，但缺少组件规格）
3. 键盘导航和右键菜单的完整规格（主规范已定义快捷键表，但缺少焦点管理和右键菜单规格）
4. 同步流程渐进引导的交互规格（主规范未覆盖）
5. 面包屑与过渡动效的规格（主规范未覆盖）

所有增补内容遵循主规范已建立的设计系统（shadcn/ui + Tailwind CSS、Code Dark + Run Green 色彩系统、Fira Code/Fira Sans 字体系统）。

---

## 增补 1：预览面板智能推拉式

### 1.1 三断点行为规格

主规范已定义三断点布局概念，此处补充精确的交互行为规格：

| 断点 | 触发条件 | 预览面板行为 | 面板宽度 | 动画 |
|------|----------|-------------|---------|------|
| **Wide** (≥1440px) | 默认 | 三栏常驻，预览面板始终可见 | 400px 固定 | 无（常驻） |
| **Standard** (1024-1439px) | 点击 Skill 卡片 | push 模式从右侧推入，主内容区自动收缩 | 360px 固定 | `transform: translateX(0)` 200ms ease-in-out |
| **Standard** (1024-1439px) | 关闭预览 | 预览面板滑出，主内容区恢复宽度 | — | `transform: translateX(100%)` 200ms ease-in-out |
| **Compact** (<1024px) | 点击 Skill 卡片 | overlay 模式覆盖主内容区 | 100% 宽度 | `transform: translateX(0)` 250ms ease-in-out |

### 1.2 触发与关闭行为

| 操作 | 效果 | 适用断点 |
|------|------|---------|
| 点击 Skill 卡片 | 展开预览面板并显示该 Skill 内容 | 所有 |
| 再次点击同一卡片 | 关闭预览面板 | Standard |
| 点击另一张卡片 | 切换预览内容，不关闭面板 | 所有 |
| 按 `Escape` | 关闭预览面板 | Standard / Compact |
| 按 `⌘\` | 切换预览面板开关 | 所有 |
| 点击预览面板 × 按钮 | 关闭预览面板 | Standard / Compact |

### 1.3 主内容区收缩规格

- **Wide**：主内容区不受预览面板影响（三栏常驻）
- **Standard push 模式**：主内容区宽度 = `容器宽度 - 240px(Sidebar) - 360px(预览) - 16px(间距)`，最小宽度 `380px`
- **Compact overlay 模式**：主内容区宽度不变，预览面板通过 `z-index: 50` 覆盖

### 1.4 预览面板头部规格

```
┌──────────────────────────────────┐
│  × 关闭    │    code-review      │  ← 关闭按钮 + Skill 名称
│            │    ⭐ coding         │  ← 分类标签
├──────────────────────────────────┤
│                                  │
│  Markdown 渲染内容区域             │
│                                  │
└──────────────────────────────────┘
```

- 关闭按钮：Ghost 按钮，`<X className="h-4 w-4" />` 图标，`aria-label="关闭预览"`
- Standard / Compact 断点下关闭按钮始终可见
- Wide 断点下关闭按钮隐藏（面板常驻无需关闭）

---

## 增补 2：搜索高亮与 Command Palette 联动

### 2.1 HighlightText 组件规格

**组件签名：**
```typescript
interface HighlightTextProps {
  text: string;          // 原始文本
  query: string;         // 搜索关键词
  className?: string;    // 容器样式
}
```

**高亮样式：**

| 元素 | 样式 | 说明 |
|------|------|------|
| 匹配片段 `<mark>` | `bg-green-500/20 text-green-400 rounded px-0.5` | 半透明绿色背景 + 绿色文字 |
| 非匹配文本 | 继承父元素文本色 | 无变化 |

**匹配逻辑：**
- 不区分大小写（`case-insensitive`）
- 多关键词（空格分隔）分别高亮
- 关键词在单词中间也高亮（如搜索 "view" 匹配 "review"）
- 空搜索词时不渲染 `<mark>`，直接输出原文

**应用范围：**
- SkillCard 名称（`skill.name`）
- SkillCard 描述（`skill.description`，截断后仍高亮）
- Command Palette 搜索结果名称和描述

### 2.2 搜索匹配计数

**位置：** 搜索输入框右侧，作为输入框的尾部附加元素

```
┌─────────────────────────────┐
│ 🔍 搜索 Skill...    12/35 │
└─────────────────────────────┘
```

**样式：**
- 计数文字：`text-xs text-slate-500`
- 无搜索词时隐藏计数
- 零结果时文字变红：`text-red-400`

**无障碍：**
- 计数更新时通过 `aria-live="polite"` 播报
- 播报文本："找到 N 个匹配的 Skill"

### 2.3 Command Palette 联动

**当前行为（问题）：** ⌘K 选中 Skill → `selectSkill(id)` + `navigate("/")` → 页面显示全量列表

**改进行为：**

| 场景 | 改进 |
|------|------|
| ⌘K 选中 Skill | `selectSkill(id)` + `navigate("/")` + `setSearchQuery(skill.name)` |
| ⌘K 选中页面跳转 | `navigate(target)` + `setSearchQuery("")` 清空搜索 |
| ⌘K 选中快速操作 | 执行操作，不修改搜索状态 |

**效果：** 用户从 ⌘K 选中 Skill 后，页面搜索框自动填入 Skill 名称，主内容区展示筛选结果，预览面板展示该 Skill 内容。

---

## 增补 3：键盘导航与右键菜单

### 3.1 J/K 焦点导航规格

**焦点管理模型：**
- Skill 卡片网格使用 `roving tabindex` 模式
- 同一时刻只有一张卡片 `tabIndex={0}`，其余 `tabIndex={-1}`
- Tab 键进入卡片网格时，焦点落在当前活跃卡片上
- Tab 键离开卡片网格时，焦点移至下一个可聚焦元素

**J/K 导航行为：**

| 按键 | 行为 | 补充说明 |
|------|------|---------|
| `J` | 聚焦下一张卡片 | 网格模式下按视觉顺序（从左到右、从上到下），列表模式下按列表顺序 |
| `K` | 聚焦上一张卡片 | 同上 |
| `Enter` | 打开预览 | 等同于鼠标点击 |
| `Space` | 预览选中 Skill | 选中并展示预览面板，不再切换面板开关 |
| `Delete` | 弹出确认删除对话框 | 仅在非输入框焦点时激活 |

**视觉反馈：**
- 聚焦卡片：`ring-2 ring-green-500 ring-offset-2 ring-offset-slate-900`
- 滚动保证：`scrollIntoView({ block: 'nearest', behavior: 'smooth' })`

### 3.2 右键上下文菜单规格

**组件：** shadcn/ui `ContextMenu`

**菜单项：**

| 菜单项 | 图标 | 快捷键提示 | 操作 |
|--------|------|-----------|------|
| 编辑元数据 | `Pencil` | — | 打开 Frontmatter 编辑对话框 |
| 同步到 IDE | `Upload` | — | 弹出同步目标选择，执行单项同步 |
| 复制路径 | `Copy` | ⌘C | 复制 Skill 文件路径到剪贴板 |
| 删除 | `Trash2` | Delete | 弹出确认删除对话框 |

**视觉规格：**
- 菜单宽度：`min-w-[180px]`
- 危险操作（删除）文字使用 `text-red-400`
- 菜单项之间用 `Separator` 分隔删除项

**无障碍：**
- 右键菜单支持键盘操作：Shift+F10 或 Context Menu 键触发
- 方向键导航菜单项，Enter 确认，Escape 关闭
- 菜单项提供 `aria-label`

### 3.3 Space 键语义修正

**当前行为（问题）：** Space 键 = 切换预览面板开关

**修正行为：**

| 按键 | 行为 | 作用域 |
|------|------|--------|
| `Space` | 预览选中 Skill（选中并展示预览面板） | Skill 卡片获得焦点时 |
| `Escape` | 关闭预览面板 | 预览面板打开时 |
| `⌘\` | 切换预览面板开关 | 全局（非输入框） |

**注意：** Space 键不再作为预览面板的"开关"快捷键，改为"预览"语义。切换预览面板的操作统一由 `⌘\` 承担。

---

## 增补 4：同步流程渐进引导

### 4.1 同步前摘要面板

**触发方式：** 点击"开始同步"按钮后，在按钮下方展开摘要面板

**面板内容：**

```
┌────────────────────────────────────────────────┐
│  📋 同步摘要                                    │
│                                                │
│  将同步 12 个 Skill 到以下目标：                    │
│                                                │
│  🎯 CodeBuddy — project-a  (.codebuddy/skills) │
│  🎯 Cursor — project-b     (.cursor/rules)     │
│                                                │
│  ⚠️ 2 个同名文件将被覆盖                          │
│                                                │
│            [取消]    [确认同步]                    │
└────────────────────────────────────────────────┘
```

**样式：**
- 面板背景：`bg-slate-800 border border-slate-700 rounded-lg`
- Skill 数量：`text-green-400 font-medium`
- 覆盖警告：`text-amber-500` + ⚠️ 图标
- 按钮层级：取消为 Secondary，确认同步为 Primary

**展开动画：** `max-height` 过渡 200ms ease-in-out + `opacity` 过渡 150ms

### 4.2 Diff 预览按钮独立

**当前行为：** Diff 按钮隐藏在 SplitButton 下拉中

**改进行为：**

```
┌──────────────────────────────────┐
│  [预览变更]    [开始同步 ▾]       │
└──────────────────────────────────┘
```

- "预览变更"按钮：Secondary 样式，与"开始同步"按钮平级
- 多目标场景：点击"预览变更"弹出目标选择下拉，选择后执行 Diff

### 4.3 失败项重试

**当前行为：** 失败项仅显示红色 Badge 和错误文本

**改进行为：**

```
┌────────────────────────────────────────────────┐
│  ❌ code-review.md  — 权限被拒                   │
│                                  [重试]          │
└────────────────────────────────────────────────┘
```

- 重试按钮：Ghost 样式 + `text-green-400`，位于错误文本右侧
- 点击重试后仅重新同步该单个 Skill
- 重试成功后，该项从失败列表移至成功列表

### 4.4 同步进度条

**位置：** 同步按钮区域上方，替代按钮位置

**样式：**

```
┌────────────────────────────────────────────────┐
│  ████████████░░░░░░░░░  12/35 Skill 已同步      │
└────────────────────────────────────────────────┘
```

- 进度条：`bg-green-500` 填充 + `bg-slate-700` 轨道
- 进度文字：`text-sm text-slate-300`
- 进度条高度：`h-2 rounded-full`
- 更新频率：每完成一个 Skill 更新一次，最低 500ms 间隔

**完成状态：**
- 成功：进度条变绿全满 + Toast "同步完成"
- 部分失败：进度条变绿全满 + 黄色 Toast "同步完成，N 项失败"
- 全部失败：进度条变红 + 红色 Toast "同步失败"

---

## 增补 5：面包屑与过渡动效

### 5.1 筛选路径面包屑

**位置：** 主内容区顶部，工具栏标题下方

**样式规格：**

```
全部 > coding > code-review                    ×
```

- 面包屑层级之间用 `>` 分隔，`text-slate-500`
- 当前层级文字：`text-slate-200 font-medium`
- 上级层级文字：`text-slate-400 hover:text-green-400 cursor-pointer`，可点击回退
- 清除筛选 × 按钮：`text-slate-500 hover:text-slate-300`，位于面包屑最右侧
- 无筛选时面包屑隐藏

**交互行为：**

| 操作 | 效果 |
|------|------|
| 点击上级层级 | 退回该层级筛选 |
| 点击 × 按钮 | 清除所有筛选，回到"全部" |
| 分类变化时 | 面包屑自动更新 |

**数据来源：**
- 分类面包屑：`category` 字段的层级路径（如 `coding > code-review`）
- 来源面包屑：`来源: {source_name}` 格式
- 无层级分类时仅显示一级：`全部 > coding`

### 5.2 列表过渡动效

**实现方案：** CSS transition + 条件渲染动画

**原则：** 考虑到项目当前未引入 Framer Motion，优先使用 CSS transition 方案，避免增加包体积。若后续动效需求增加，再评估引入 Framer Motion。

**列表切换动效（CSS 方案）：**

```css
.skill-grid-item {
  transition: opacity 150ms ease-in-out, transform 150ms ease-in-out;
}
.skill-grid-item-enter {
  opacity: 0;
  transform: translateY(8px);
}
.skill-grid-item-active {
  opacity: 1;
  transform: translateY(0);
}
```

- 分类切换时，新卡片淡入（opacity 0→1 + translateY 8px→0）
- 动画时长 150ms，缓动 ease-in-out
- 使用 `prefers-reduced-motion` 媒体查询跳过动画

### 5.3 预览面板内容过渡

**场景：** 切换不同 Skill 的预览时，预览面板内容瞬间替换

**改进方案：**

```css
.preview-content {
  transition: opacity 150ms ease-in-out;
}
.preview-content-switching {
  opacity: 0.3;  /* 轻微淡出而非完全消失 */
}
```

- 切换 Skill 时，预览内容 opacity 从 1 → 0.3 → 1（总时长 150ms）
- 不使用完全淡出（0），避免内容消失的闪烁感
- 内容加载完成后恢复 opacity: 1

---

## 受影响的主规范章节

以下主规范章节需要同步更新：

| 章节 | 变更内容 |
|------|---------|
| 布局网格 | 更新 Standard 断点预览面板行为描述 |
| 键盘快捷键体系 | 修正 Space 键语义，补充 J/K/Delete 细节 |
| SkillCard 组件 | 补充右键菜单、聚焦状态、HighlightText 集成 |
| 搜索结果高亮（附录 B） | 补充 HighlightText 组件精确样式和匹配逻辑 |
| 空状态模式 | 无变更 |
| 反馈模式 | 补充同步进度条、失败重试的反馈规格 |

---

_增补日期：2026-04-15_
_增补人：Alex / Sally (UX Designer Agent)_
_关联文档：prd-ux-interaction-optimization.md, ux-design-specification.md_
