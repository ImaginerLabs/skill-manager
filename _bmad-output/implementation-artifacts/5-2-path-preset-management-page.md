---
story: "5-2"
title: "路径预设管理页面"
epic: 5
status: done
created: "2026-04-12"
completed: "2026-04-12"
type: backfill
note: "代码已在 Epic 5 实现阶段完成，此文件为补建的 Story 记录"
---

# Story 5-2：路径预设管理页面

## Story

**As a** 用户，
**I want** 一个独立的「路径配置」页面来管理预设路径，
**So that** 我可以在一处统一增删改预设路径，供同步和导入时快速选择。

## Acceptance Criteria

- [x] 新建 `src/components/settings/PathPresetManager.tsx` — 增删改列表组件
- [x] 新建 `src/pages/PathsPage.tsx` — 路径配置页面，嵌入 `PathPresetManager`
- [x] `src/App.tsx` 注册 `/paths` 路由
- [x] `src/components/layout/Sidebar.tsx` 追加「路径配置」导航入口（`FolderOpen` 图标）
- [x] 添加路径：输入绝对路径 + 可选备注，提交后出现在列表，`settings.yaml` 更新
- [x] 编辑路径：内联编辑模式，支持修改路径和备注
- [x] 删除路径：AlertDialog 二次确认，删除后列表更新
- [x] 空状态：无预设时展示引导文案「暂无路径预设，点击「添加路径」开始配置」
- [x] 错误处理：非绝对路径、重复路径均通过 `toast.error` 提示

## Tasks

- [x] **Task 1：PathPresetManager.tsx 组件**
  - 参考 `CategoryManager.tsx` 模式
  - 状态管理：`presets`、`showAddForm`、`editingId`
  - 新建表单：路径输入框 + 备注输入框 + 确认/取消按钮
  - 内联编辑：点击编辑图标进入编辑模式，支持保存/取消
  - 删除：AlertDialog 二次确认
  - 加载/错误状态处理

- [x] **Task 2：PathsPage.tsx 页面**
  - 简洁页面：标题 + 描述 + `PathPresetManager` 组件
  - 最大宽度 `max-w-2xl` 保持与其他设置页一致

- [x] **Task 3：路由注册**
  - `src/App.tsx` 注册 `/paths` 路由，懒加载 `PathsPage`

- [x] **Task 4：侧边栏导航**
  - `src/components/layout/Sidebar.tsx` 追加「路径配置」入口
  - 图标：`FolderOpen`，路径：`/paths`

## Dev Agent Record

### Implementation Notes

**PathPresetManager.tsx 设计决策：**
- 参考 `CategoryManager.tsx` 的内联编辑模式，保持 UI 一致性
- 编辑状态通过 `editingId` 控制，同一时间只能编辑一条记录
- 新建表单与列表分离，`showAddForm` 控制显示/隐藏
- 删除使用 `AlertDialog` 二次确认，与项目其他删除操作保持一致
- `label` 字段为可选，空字符串不传给 API（`trim() || undefined`）

**PathsPage.tsx 设计决策：**
- 页面结构简洁：`max-w-2xl` 容器 + 标题 + 描述 + 组件
- 与 `SettingsPage` 风格保持一致

**侧边栏集成：**
- 使用 `FolderOpen` 图标，语义清晰
- 路由路径 `/paths`，与页面功能对应

### QA Results

- `npm run typecheck` — ✅ 零 TypeScript 错误
- `npm run test:run` — ✅ 所有现有测试通过
- `npm run build` — ✅ 构建成功
- 手动验证：访问 `/paths`，添加预设路径，刷新后数据持久化 ✅

### Code Review

- 组件结构清晰，职责单一
- 遵循项目 UI 组件规范（shadcn/ui 组件库）
- 错误处理完整（加载失败、操作失败均有 toast 提示）
- 无阻塞性问题，Story 通过 Code Review

---

_补建日期：2026-04-12_
_原始实现：Epic 5 开发阶段_
