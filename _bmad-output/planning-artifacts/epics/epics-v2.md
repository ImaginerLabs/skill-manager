---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories"]
inputDocuments:
  - "prd/prd-skill-manager-v2.md"
  - "architecture-v2.md"
  - "ux/ux-design-specification-v2.md"
---

# Skill Manager V2 — Epic Breakdown

## Overview

本文档提供 Skill Manager V2 的完整 Epic 和 Story 拆分，将 PRD、UX 设计和架构需求分解为可实施的 Story。

## Requirements Inventory

### Functional Requirements

**来源视图浏览（6 项）：**

- FR-V2-1: 用户可在二级 Sidebar 顶部通过 Tab 切换「按分类」和「按来源」两种浏览维度
- FR-V2-2: 用户可在「按来源」视图中查看所有来源的列表，每个来源项显示该来源下的 Skill 数量 Badge
- FR-V2-3: 用户可点击来源项筛选主内容区为该来源的所有 Skill
- FR-V2-4: 系统在切换 Tab 时自动清除当前维度的筛选状态（`selectedCategory` 和 `selectedSource` 互斥）
- FR-V2-5: 来源数据从 `skills` 数组按 `source` 字段聚合，`source` 为空的 Skill 归入"我的 Skill"分组
- FR-V2-6: 未来新增的仓库来源自动出现在来源列表中，无需额外配置

**工作流自定义步骤（6 项）：**

- FR-V2-7: 用户可在工作流编排器中通过「添加自定义步骤」按钮添加自然语言自定义步骤
- FR-V2-8: 用户可在自动扩展的 Textarea 中输入自定义步骤的描述内容
- FR-V2-9: 自定义步骤在 UI 上以虚线边框 + ✏️ 图标的视觉样式与已有 Skill 步骤区分
- FR-V2-10: 自定义步骤的 `skillId` 为 `null`，`skillName` 为 `null`，`type` 为 `custom`
- FR-V2-11: 生成的工作流文件中，自定义步骤不生成 `**使用 Skill:**` 行，直接输出描述内容
- FR-V2-12: 用户可编辑和删除已添加的自定义步骤

**工作流 skill-creator 规范对齐（3 项）：**

- FR-V2-13: 生成的工作流 Skill 文件 Frontmatter 包含 `name`、`description`、`category: workflows`、`type: workflow`、`tags` 字段
- FR-V2-14: 生成的 `description` 采用 "pushy" 触发策略——不仅描述功能，还主动包含触发场景和关键词
- FR-V2-15: 生成的工作流正文顶部有工作流概述段落，说明整体目标和适用场景，然后是 Step 列表

**同步多模式（9 项）：**

- FR-V2-16: 用户可通过主按钮旁的下拉菜单选择同步模式：增量同步、替换同步、查看差异
- FR-V2-17: 增量同步只同步新增或修改的 Skill 文件，采用 mtime + md5 分层比较策略，跳过未变化文件
- FR-V2-18: 增量同步完成后显示同步结果：新增 N 个、更新 N 个、跳过 N 个
- FR-V2-19: 替换同步先删除目标目录中已选 Skill 对应的文件夹，再执行全量同步
- FR-V2-20: 替换同步操作前弹出确认对话框，告知用户将删除哪些文件夹
- FR-V2-21: Diff 查看不执行任何文件操作，对比源目录和目标目录生成差异报告
- FR-V2-22: Diff 报告以列表形式展示每个 Skill 的状态：🟢 新增、🟡 修改、🔴 删除、⚪ 相同
- FR-V2-23: Diff 结果页底部直接放置「执行增量同步」和「执行替换同步」两个操作按钮
- FR-V2-24: 主按钮默认执行增量同步，80% 用户只看到一个按钮

**默认套件全选（2 项）：**

- FR-V2-25: 选择默认套件（`bundle-default`）后，该套件 `categoryNames` 下的全部 Skill 自动被选中
- FR-V2-26: 套件选择逻辑正确遍历每个分类，收集该分类下的所有 Skill ID（包括外部 Skill）

**错误处理（3 项）：**

- FR-V2-27: 替换同步删除文件夹失败时提供详细错误信息（文件被锁定、权限不足等）
- FR-V2-28: Diff 对比时目标目录不存在，系统提示用户并提供自动创建选项
- FR-V2-29: 增量同步的 md5 哈希计算失败时回退到全量覆盖该文件

### Non-Functional Requirements

**性能（5 项）：**

- NFR-V2-1: 来源视图聚合计算时间 < 50ms（500 个 Skill 规模）
- NFR-V2-2: Tab 切换响应时间 < 100ms（视图切换 + 筛选状态清除）
- NFR-V2-3: 增量同步的 mtime 比较阶段 < 500ms（100 个 Skill 文件）
- NFR-V2-4: Diff 报告生成时间 < 2s（100 个 Skill 文件的双向遍历）
- NFR-V2-5: 自定义步骤 Textarea 输入响应无感知延迟（< 16ms per keystroke）

**安全（2 项）：**

- NFR-V2-6: 替换同步的文件删除操作限制在配置的目标目录范围内，防止路径遍历
- NFR-V2-7: 替换同步只删除 `selectedSkillIds` 对应的文件夹，不使用 `fs.emptyDir` 清空整个目标目录

**无障碍（4 项）：**

- NFR-V2-8: Tab 切换器支持键盘导航（Tab 键切换焦点，Enter/Space 激活）
- NFR-V2-9: 来源列表项提供 ARIA 标签，包含来源名称和 Skill 数量
- NFR-V2-10: 同步模式下拉菜单支持键盘操作（Arrow Up/Down 选择，Enter 确认，Esc 关闭）
- NFR-V2-11: Diff 报告中的状态图标提供文本替代（screen reader 可读）

**兼容性（2 项）：**

- NFR-V2-12: `POST /api/sync/push` 的 `mode` 参数向后兼容——不传 `mode` 时行为等同于 `full`（全量覆盖）
- NFR-V2-13: 增量同步的 mtime 比较在跨文件系统场景（Docker volume、网络挂载）下自动回退到 md5 比较

### Additional Requirements（来自 Architecture V2）

- AD-41: `skill-store` 新增 `selectedSource` 和 `setSource`，与 `selectedCategory` 互斥管理；Tab 状态存储在组件本地 `useState`
- AD-42: `SourceTree` 复用 `CategoryTree` 列表项样式，`filteredSkills` selector 统一处理来源筛选；来源图标硬编码 + 回退策略
- AD-43: `WorkflowStep` 类型扩展（`type: 'skill' | 'custom'`，`skillId` nullable），向后兼容旧格式（缺失 `type` 字段推断为 `'skill'`）
- AD-44: 工作流 Frontmatter 对齐 skill-creator 规范，`generatePushyDescription` 函数生成触发场景丰富的 description
- AD-45: `POST /api/sync/push` 新增 `mode` 参数（默认 `full`），新增 `POST /api/sync/diff` 独立端点；`DiffReport` 和 `DiffItem` 新类型
- AD-46: 增量同步 mtime + md5 分层比较，以 `SKILL.md` 作为代表性文件；`compareSkillFile` 函数
- AD-47: 替换同步安全删除策略，复用 `isSubPath` 路径校验；只删除 `selectedSkillIds` 对应的文件夹
- AD-48: 默认套件全选修复，`applyBundle` 中 Skill ID 收集使用 `toLowerCase()` 归一化

### UX Design Requirements（来自 UX V2）

- UX-DR1: SecondarySidebar 顶部 Tab 切换器（按分类/按来源），选中态底边框 `2px solid #22C55E`（Run Green）
- UX-DR2: SourceTree 组件——来源列表项（图标 + 名称 + Badge），active 态左侧 `3px solid #22C55E` 指示条
- UX-DR3: ViewTab 组件——Tab 样式规格（未选中/选中/Hover/焦点 4 种状态）
- UX-DR4: 自定义步骤卡片——虚线边框 `2px dashed #475569` + ✏️ 图标 + 斜线纹理背景，与 Skill 步骤实线边框视觉区分
- UX-DR5: 自动扩展 Textarea——初始 1 行，最大 6 行，`font-mono`，无边框融入卡片
- UX-DR6: SplitButton 同步按钮——主按钮 `bg-run-green` + 下拉箭头，分割线 `rgba(0,0,0,0.2)`
- UX-DR7: 下拉菜单——增量同步/替换同步/查看差异，分割线分隔非破坏性操作
- UX-DR8: 替换同步确认对话框——AlertDialog，文件夹列表最多 10 个，确认按钮 `bg-destructive`
- UX-DR9: Diff 差异报告——摘要栏 + 分组列表（🟢🟡🔴⚪）+ 底部操作按钮
- UX-DR10: 增量同步结果 Toast——持续 5 秒，新增/更新绿色文字，跳过灰色文字
- UX-DR11: Tab 切换器 ARIA——`role="tablist"`、`role="tab"`、`aria-selected`、Arrow Left/Right
- UX-DR12: SourceTree ARIA——`role="listbox"`、`role="option"`、`aria-label` 含数量信息
- UX-DR13: SplitButton ARIA——`aria-haspopup="menu"`、`aria-expanded`、`role="menu"`
- UX-DR14: 响应式适配——Compact 断点下 SplitButton 文字缩短、Diff 报告按钮纵向堆叠

### FR Coverage Map

| FR | Epic | 简述 |
|----|------|------|
| FR-V2-1 | Epic 2 | Tab 切换按分类/按来源 |
| FR-V2-2 | Epic 2 | 来源列表 + 数量 Badge |
| FR-V2-3 | Epic 2 | 点击来源项筛选 Skill |
| FR-V2-4 | Epic 2 | Tab 切换清除筛选状态 |
| FR-V2-5 | Epic 2 | 来源数据聚合 + "我的 Skill" |
| FR-V2-6 | Epic 2 | 新仓库自动出现 |
| FR-V2-7 | Epic 4 | 添加自定义步骤按钮 |
| FR-V2-8 | Epic 4 | 自动扩展 Textarea |
| FR-V2-9 | Epic 4 | 自定义步骤视觉区分 |
| FR-V2-10 | Epic 4 | 自定义步骤数据模型 |
| FR-V2-11 | Epic 4 | 自定义步骤生成格式 |
| FR-V2-12 | Epic 4 | 编辑和删除自定义步骤 |
| FR-V2-13 | Epic 4 | Frontmatter 规范字段 |
| FR-V2-14 | Epic 4 | pushy description |
| FR-V2-15 | Epic 4 | 正文结构（概述 + Step 列表） |
| FR-V2-16 | Epic 3 | 同步模式下拉菜单 |
| FR-V2-17 | Epic 3 | 增量同步 mtime + md5 |
| FR-V2-18 | Epic 3 | 增量同步结果展示 |
| FR-V2-19 | Epic 3 | 替换同步删除 + 全量复制 |
| FR-V2-20 | Epic 3 | 替换同步确认对话框 |
| FR-V2-21 | Epic 3 | Diff 查看生成差异报告 |
| FR-V2-22 | Epic 3 | Diff 报告状态列表 |
| FR-V2-23 | Epic 3 | Diff 结果页操作按钮 |
| FR-V2-24 | Epic 3 | 主按钮默认增量同步 |
| FR-V2-25 | Epic 1 | 默认套件全选 |
| FR-V2-26 | Epic 1 | 套件 Skill ID 收集修复 |
| FR-V2-27 | Epic 3 | 替换同步删除失败错误信息 |
| FR-V2-28 | Epic 3 | Diff 目标目录不存在处理 |
| FR-V2-29 | Epic 3 | md5 失败回退全量覆盖 |

## Epic List

### Epic 1: 默认套件全选修复
用户选择默认套件后，9 个出厂分类下的全部 Skill（包括外部 Skill）自动被选中，无需手动补选。
**FRs covered:** FR-V2-25, FR-V2-26
**Architecture:** AD-48

### Epic 2: 二级 Sidebar 来源视图浏览
用户可在 Skill 预览页的二级 Sidebar 中通过 Tab 切换「按分类」和「按来源」两种浏览维度，按 GitHub 仓库来源筛选 Skill。
**FRs covered:** FR-V2-1, FR-V2-2, FR-V2-3, FR-V2-4, FR-V2-5, FR-V2-6
**Architecture:** AD-41, AD-42
**UX Design:** UX-DR1, UX-DR2, UX-DR3, UX-DR11, UX-DR12
**NFRs:** NFR-V2-1, NFR-V2-2, NFR-V2-8, NFR-V2-9

### Epic 3: 同步多模式
用户可选择增量同步、替换同步或 Diff 查看三种同步模式，从"盲目推送"变为"知情操作"。
**FRs covered:** FR-V2-16, FR-V2-17, FR-V2-18, FR-V2-19, FR-V2-20, FR-V2-21, FR-V2-22, FR-V2-23, FR-V2-24, FR-V2-27, FR-V2-28, FR-V2-29
**Architecture:** AD-45, AD-46, AD-47
**UX Design:** UX-DR6, UX-DR7, UX-DR8, UX-DR9, UX-DR10, UX-DR13, UX-DR14
**NFRs:** NFR-V2-3, NFR-V2-4, NFR-V2-6, NFR-V2-7, NFR-V2-10, NFR-V2-11, NFR-V2-12, NFR-V2-13

### Epic 4: 工作流自定义步骤与规范对齐
用户可在工作流编排器中添加自然语言自定义步骤，生成的工作流文件符合 skill-creator 规范，在 Claude 生态中有最佳触发表现。
**FRs covered:** FR-V2-7, FR-V2-8, FR-V2-9, FR-V2-10, FR-V2-11, FR-V2-12, FR-V2-13, FR-V2-14, FR-V2-15
**Architecture:** AD-43, AD-44
**UX Design:** UX-DR4, UX-DR5
**NFRs:** NFR-V2-5
