---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories"]
inputDocuments:
  [
    "prd/prd-sync-workflow-ux-enhancement.md",
    "architecture-sync-workflow-ux-enhancement.md",
    "ux/ux-design-specification-sync-workflow-ux-enhancement.md",
    "brief/product-brief-sync-workflow-ux-enhancement.md",
  ]
---

# Epic Breakdown — 同步链路优化 + 分类编辑增强 + 工作流预览修复

**Author:** Alex
**Date:** 2026-04-16

---

## Epic Overview

| Epic | 功能 | Story 数量 | 优先级 |
|------|------|-----------|--------|
| Epic-SWU-1 | 同步目标选择器 | 2 | P0 |
| Epic-SWU-2 | 分类编辑增强 | 2 | P0 |
| Epic-SWU-3 | 工作流预览修复 | 1 | P0 |

---

## Epic-SWU-1: 同步目标选择器

### 目标

用户可在同步/Diff 前选择目标，不再默认推送到所有目标。

### Stories

#### Story-SWU-1.1: 同步目标多选器

**Feature:** 同步执行前，用户可选择同步到哪个/哪些目标。

**AC:**
- [ ] 用户点击同步按钮后，显示目标选择弹窗
- [ ] 弹窗展示所有启用的同步目标（Checkbox 列表）
- [ ] 默认全选所有目标
- [ ] 用户可勾选/取消勾选目标
- [ ] 提供「全选」和「取消全选」快捷操作
- [ ] 用户点击确认后，传递已选目标 ID 数组到执行逻辑
- [ ] 用户点击取消关闭弹窗
- [ ] 未选择任何目标时，确认按钮禁用，提示用户至少选择一个目标
- [ ] 摘要面板（SyncSummaryPanel）展示已选目标名称列表

**Technical Notes:**
- 创建 `SyncTargetSelector` 组件（多选模式）
- 修改 `SyncExecutor` 调用目标选择器
- 传递选中 ID 数组到 `executePush(selectedIds, mode)`
- 后端 `pushSync` 已支持 `targetIds` 参数，无需修改

#### Story-SWU-1.2: Diff 预览目标选择器

**Feature:** Diff 预览前，用户可选择对哪个目标进行差异对比。

**AC:**
- [ ] 用户点击「预览变更」按钮后，显示目标选择弹窗（单选模式）
- [ ] 弹窗展示所有启用的同步目标（Radio 列表）
- [ ] 用户选择目标后，直接执行 Diff 并展示差异报告
- [ ] 差异报告对应用户选择的目标（而非硬编码第一个）
- [ ] 弹窗标题显示「选择预览目标」

**Technical Notes:**
- 复用 `SyncTargetSelector` 组件（单选模式）
- 修改 `DiffReportView` 触发流程，增加目标选择步骤

---

## Epic-SWU-2: 分类编辑增强

### 目标

分类移动使用下拉选择器，支持搜索过滤和创建新分类。

### Stories

#### Story-SWU-2.1: 分类 Combobox 选择器

**Feature:** 将「移动分类」的文本输入替换为下拉选择器。

**AC:**
- [ ] 用户点击元数据编辑器的「移动分类」输入框，显示下拉列表
- [ ] 下拉选项展示 `displayName`（如「编程开发」）而非 `name`（如 `coding`）
- [ ] 下拉支持搜索过滤，用户输入关键词后实时过滤分类列表
- [ ] 当前分类在列表中默认选中（高亮状态）
- [ ] 用户选择分类后，调用 `moveSkillCategory` API 执行移动
- [ ] 移动成功后刷新列表，元数据面板更新显示

**Technical Notes:**
- 创建 `CategoryCombobox` 组件
- 基于 Radix UI Popover + 自定义列表实现
- 分类数据从 `skill-store` 获取
- 复用 `MetadataEditor` 中的 `moveSkillCategory` API

#### Story-SWU-2.2: 创建新分类功能

**Feature:** 用户可在分类下拉中创建新分类。

**AC:**
- [ ] 下拉底部显示「+ 创建新分类」选项
- [ ] 用户点击后，下拉展开为创建表单
- [ ] 表单包含 name 输入框（kebab-case）和 displayName 输入框
- [ ] name 输入框实时校验格式（正则 `/^[a-z0-9]+(-[a-z0-9]+)*$/`）
- [ ] 校验失败显示错误提示
- [ ] 提交时校验 name 唯一性（调用 API）
- [ ] 创建成功后：自动选中新分类 → 执行移动 → 刷新列表
- [ ] 创建失败显示错误提示，不关闭表单
- [ ] 新分类持久化到 `config/categories.yaml`

**Technical Notes:**
- 后端新增 `POST /api/categories` 端点
- 创建 `categoryService.ts` 服务
- 校验逻辑：格式 + 唯一性
- 创建成功后返回新分类数据供前端更新

---

## Epic-SWU-3: 工作流预览修复

### 目标

工作流预览支持 Markdown 渲染，代码块有语法高亮，内容可滚动查看。

### Stories

#### Story-SWU-3.1: 工作流预览 Markdown 渲染

**Feature:** 将预览内容从纯文本改为 Markdown 渲染。

**AC:**
- [ ] 预览内容使用 `ReactMarkdown` 渲染
- [ ] Markdown 格式正确渲染（标题/段落/列表/粗斜体/代码块）
- [ ] 代码块使用 `rehype-highlight` 语法高亮
- [ ] 支持 `remark-gfm`（表格/任务列表/删除线）
- [ ] 预览区域高度设为 `max-h-[400px]`
- [ ] 内容超过高度时可滚动查看
- [ ] 暗色主题代码块使用 `github-dark` 主题
- [ ] 亮色主题自动回退到 `github-light`

**Technical Notes:**
- 修改 `WorkflowPreview.tsx` 组件
- 引入 `react-markdown`, `rehype-highlight`, `remark-gfm`
- 修复 ScrollArea 高度策略（添加固定高度 `h-[400px]`）
- 样式使用 Tailwind Typography 插件或手动样式

---

## Story 依赖关系

```
Story-SWU-1.1 (同步目标多选器)
  └─ 后端 pushSync 已支持 targetIds（无需开发）

Story-SWU-1.2 (Diff 目标选择器)
  └─ 依赖 Story-SWU-1.1（复用组件）

Story-SWU-2.1 (分类选择器)
  └─ 无依赖

Story-SWU-2.2 (创建新分类)
  └─ 依赖 Story-SWU-2.1（创建后需执行移动）

Story-SWU-3.1 (工作流预览)
  └─ 无依赖
```

---

## 实施顺序建议

| 顺序 | Story | 理由 |
|------|-------|------|
| 1 | Story-SWU-1.1 | 核心同步功能，用户感知强 |
| 2 | Story-SWU-1.2 | 复用 Story-1.1 组件 |
| 3 | Story-SWU-2.1 | 独立功能 |
| 4 | Story-SWU-2.2 | 依赖 Story-2.1 |
| 5 | Story-SWU-3.1 | 独立功能 |

---

## 验收标准总览

- [ ] 同步目标选择器：多选/单选模式正确，摘要展示已选目标
- [ ] 分类选择器：下拉展示 displayName，支持搜索，默认选中当前分类
- [ ] 创建分类：输入 name + displayName，创建成功执行移动
- [ ] 工作流预览：Markdown 渲染正确，代码块语法高亮，内容可滚动