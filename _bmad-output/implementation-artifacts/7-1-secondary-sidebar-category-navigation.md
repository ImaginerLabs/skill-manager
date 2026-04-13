# Story 7.1: 分类导航迁移至 Skill 库二级 Sidebar

Status: done

## Story

As a Skill Manager 用户,
I want 当我进入 Skill 库时，在主 Sidebar 右侧看到分类目录，而不是通过顶层导航跳转到独立的「分类」页面,
so that 我可以在不离开 Skill 库的情况下快速切换分类筛选，减少认知跳转成本。

## Acceptance Criteria

1. **[移除主导航「分类」项]** 主 Sidebar 导航列表中不再出现「分类」导航项（原 `{ to: "/settings", icon: Settings, label: "分类" }`），`navItems` 数组中该项被删除。

2. **[移除 Sidebar 底部 CategoryTree]** 主 Sidebar 底部的 `ScrollArea` + `CategoryTree` 区域被完全移除，Sidebar 不再内嵌分类目录树。

3. **[二级 Sidebar 在 Skill 库页面显示]** 当路由为 `/` 时，主 Sidebar 右侧渲染 `SecondarySidebar` 组件，内容包含：顶部「分类」标题、`CategoryTree` 组件、底部「管理分类」链接（跳转 `/settings`）。

4. **[二级 Sidebar 在其他页面隐藏]** 当路由为 `/workflow`、`/sync`、`/import`、`/settings`、`/paths` 时，`SecondarySidebar` 不渲染（条件渲染 `&&`）。

5. **[视觉分隔]** 二级 Sidebar 左侧有 `border-l border-[hsl(var(--border))]`，背景色 `bg-[hsl(var(--card))]`，宽度 `180px`（CSS 变量 `--secondary-sidebar-width: 180px`）。

6. **[CategoryTree 零改动]** `CategoryTree.tsx` 文件内容完全不变，分类筛选交互行为与之前一致。

7. **[主 Sidebar 宽度不变]** 主 Sidebar 宽度仍为 `var(--sidebar-width)`，不受二级 Sidebar 影响。

8. **[「管理分类」链接]** 二级 Sidebar 底部有「管理分类」文字链接，点击跳转到 `/settings`，样式为次要文字色 `text-[hsl(var(--muted-foreground))]`，hover 时变为前景色。

## Tasks / Subtasks

- [x] Task 1: 修改 `Sidebar.tsx` — 移除「分类」导航项和底部 CategoryTree (AC: 1, 2)
  - [x] 1.1 从 `navItems` 数组中删除 `{ to: "/settings", icon: Settings, label: "分类" }` 条目
  - [x] 1.2 删除 `Settings` 图标的 import（若不再使用）
  - [x] 1.3 删除 Sidebar 底部的 `<div className="border-t ...">` 分隔线
  - [x] 1.4 删除 `<ScrollArea className="flex-1"><CategoryTree /></ScrollArea>` 区域
  - [x] 1.5 删除 `CategoryTree` 和 `ScrollArea` 的 import（若不再使用）
  - [x] 1.6 单元测试：验证 Sidebar 不再渲染「分类」导航项和 CategoryTree

- [x] Task 2: 新建 `SecondarySidebar.tsx` (AC: 3, 5, 8)
  - [x] 2.1 创建 `src/components/layout/SecondarySidebar.tsx`
  - [x] 2.2 组件结构：顶部标题「分类」+ `CategoryTree` + 底部「管理分类」NavLink
  - [x] 2.3 应用样式：`border-l border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0 flex flex-col`，宽度 `180px`
  - [x] 2.4 在 `index.css` 或 `globals.css` 中添加 CSS 变量 `--secondary-sidebar-width: 180px`（若项目有此约定）
  - [x] 2.5 组件测试：验证 CategoryTree 被渲染，「管理分类」链接指向 `/settings`

- [x] Task 3: 修改 `AppLayout.tsx` — 条件渲染 SecondarySidebar (AC: 3, 4, 7)
  - [x] 3.1 引入 `SecondarySidebar` 组件
  - [x] 3.2 在 `<Sidebar />` 和 `<main>` 之间，添加 `{isSkillBrowsePage && <SecondarySidebar />}`
  - [x] 3.3 复用已有的 `isSkillBrowsePage` 变量（`location.pathname === "/"`）
  - [x] 3.4 组件测试：路由 `/` 时 SecondarySidebar 存在，路由 `/workflow` 时不存在

- [x] Task 4: 验证 CategoryTree 零改动 (AC: 6)
  - [x] 4.1 确认 `CategoryTree.tsx` 文件 diff 为空（无任何修改）
  - [x] 4.2 手动验证：在 Skill 库页面点击分类，筛选功能正常

## Dev Notes

### 关键文件路径

| 文件                                         | 操作                                               |
| -------------------------------------------- | -------------------------------------------------- |
| `src/components/layout/Sidebar.tsx`          | 修改：移除「分类」导航项、ScrollArea、CategoryTree |
| `src/components/layout/SecondarySidebar.tsx` | **新建**                                           |
| `src/components/layout/AppLayout.tsx`        | 修改：条件渲染 SecondarySidebar                    |
| `src/components/skills/CategoryTree.tsx`     | **零改动**                                         |

### 现有 Sidebar.tsx 结构（需要修改的部分）

```tsx
// 需要从 navItems 中删除：
{ to: "/settings", icon: Settings, label: "分类" }

// 需要删除的 Sidebar 底部区域：
{/* 分隔线 */}
<div className="border-t border-[hsl(var(--border))]" />
{/* 分类目录树 — 使用 ScrollArea */}
<ScrollArea className="flex-1">
  <CategoryTree />
</ScrollArea>
```

### SecondarySidebar.tsx 实现参考

```tsx
import { Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import CategoryTree from "../skills/CategoryTree";

export default function SecondarySidebar() {
  return (
    <aside
      className="flex flex-col border-l border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0"
      style={{ width: "180px" }}
    >
      {/* 标题 */}
      <div className="px-4 py-3 border-b border-[hsl(var(--border))]">
        <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
          分类
        </span>
      </div>
      {/* 分类目录树 */}
      <div className="flex-1 overflow-auto">
        <CategoryTree />
      </div>
      {/* 底部管理入口 */}
      <div className="border-t border-[hsl(var(--border))] p-2">
        <NavLink
          to="/settings"
          className="flex items-center gap-2 px-2 py-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] rounded-md transition-colors duration-200"
        >
          <Settings size={12} />
          管理分类
        </NavLink>
      </div>
    </aside>
  );
}
```

### AppLayout.tsx 修改参考

```tsx
// 现有代码（已有 isSkillBrowsePage 变量）：
const isSkillBrowsePage = location.pathname === "/";

// 在布局中添加（Sidebar 和 main 之间）：
<Sidebar />
{isSkillBrowsePage && <SecondarySidebar />}
<main className="flex-1 overflow-auto p-6 min-w-[480px]">
```

### 架构约束（来自 AD-23）

- 二级 Sidebar 宽度固定 `180px`，不使用 CSS 变量（避免过度工程化）
- 条件渲染使用 `&&` 操作符，不使用 `opacity/width` 动画（保持简单）
- `CategoryTree` 零改动原则严格执行

### 测试文件位置

- 单元测试：`tests/unit/components/layout/Sidebar.test.tsx`（已有，需更新）
- 新建测试：`tests/unit/components/layout/SecondarySidebar.test.tsx`
- 新建测试：`tests/unit/components/layout/AppLayout.test.tsx`（或更新已有）

### Project Structure Notes

- 布局组件位于 `src/components/layout/`
- 测试文件位于 `tests/unit/components/layout/`
- 遵循项目现有命名规范：PascalCase 组件名，kebab-case 文件名

### References

- [Source: _bmad-output/planning-artifacts/prd-sidebar-redesign.md#需求1]
- [Source: _bmad-output/planning-artifacts/architecture.md#AD-23]
- [Source: _bmad-output/planning-artifacts/epics.md#Story-7.1]
- [Source: src/components/layout/Sidebar.tsx] — 当前 Sidebar 实现
- [Source: src/components/layout/AppLayout.tsx] — 当前布局实现
- [Source: src/components/skills/CategoryTree.tsx] — 零改动目标

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-1m-context

### Debug Log References

### Completion Notes List

- ✅ Task 1: 修改 Sidebar.tsx — 移除「分类」导航项（Settings）、CategoryTree、ScrollArea import 及渲染
- ✅ Task 2: 新建 SecondarySidebar.tsx — 包含分类标题、CategoryTree、底部「管理分类」NavLink
- ✅ Task 3: 修改 AppLayout.tsx — 引入 SecondarySidebar，在 isSkillBrowsePage 条件下渲染
- ✅ Task 4: 确认 CategoryTree.tsx 零改动（git diff 为空）
- ✅ 26 个测试全部通过（Sidebar: 13, SecondarySidebar: 7, AppLayout: 6）
- ✅ 全量测试无回归（预存在的 CategoryTree.test.tsx 和 SyncTargetManager.test.tsx 失败与本次修改无关）

### File List

- `src/components/layout/Sidebar.tsx` — 修改：移除「分类」导航项、CategoryTree、ScrollArea
- `src/components/layout/SecondarySidebar.tsx` — 新建
- `src/components/layout/AppLayout.tsx` — 修改：条件渲染 SecondarySidebar
- `tests/unit/components/layout/Sidebar.test.tsx` — 修改：更新测试反映导航项变更
- `tests/unit/components/layout/SecondarySidebar.test.tsx` — 新建
- `tests/unit/components/layout/AppLayout.test.tsx` — 新建

### Review Findings

- [x] [Review][Patch] SecondarySidebar 宽度 220px 与 Spec 要求的 180px 不符 [src/components/layout/SecondarySidebar.tsx:27]
- [x] [Review][Patch] 未添加 CSS 变量 `--secondary-sidebar-width`，Task 2.4 要求写入 index.css [src/index.css]
- [x] [Review][Patch] sidebarOpen=false 时主 Sidebar 隐藏但 SecondarySidebar 仍显示，AppLayout 需同步判断 sidebarOpen [src/components/layout/AppLayout.tsx:65]
- [x] [Review][Defer] CategoryTree 无 ErrorBoundary 包裹 [src/components/layout/SecondarySidebar.tsx] — deferred, pre-existing
- [x] [Review][Defer] isSkillBrowsePage 精确匹配 "/" 未来扩展性有限 [src/components/layout/AppLayout.tsx:33] — deferred, pre-existing
