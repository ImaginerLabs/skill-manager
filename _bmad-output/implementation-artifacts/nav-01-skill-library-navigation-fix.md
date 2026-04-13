---
story: NAV-01
epic: NAV-FIX
title: 修复 Skill 库导航重置分类筛选行为
status: done
priority: P1
created: 2026-04-13
author: Winston (Architect) — 基于 Party Mode 圆桌讨论
prd_source: _bmad-output/planning-artifacts/prd-nav-category-fix.md
---

# Story NAV-01: 修复 Skill 库导航重置分类筛选行为

## 用户故事

```
作为 Skill Manager 用户，
当我正在浏览某个分类（如"编程开发"）时，
我希望点击左侧导航的"Skill 库"能清除当前分类筛选、回到全部 Skill 列表，
以便我可以在不刷新页面的情况下重置浏览状态，符合"首页导航 = 回到起点"的直觉预期。
```

## 背景与根因

**问题复现路径：**

1. 进入 Skill 库页面（`/`）
2. 点击左侧分类列表中的任意分类（如"编程开发"）
3. 点击左侧导航的"Skill 库"
4. ❌ 无任何响应 — 页面无变化，分类筛选状态未清除

**根因：**

- `selectedCategory` 存储在全局 Zustand store 中，与路由生命周期解耦
- `NavLink to="/"` 在已处于 `/` 路由时不触发任何事件（React Router v6 行为）
- 没有机制在点击"Skill 库"时清除 `selectedCategory`

**相关文件：**

- `src/components/layout/Sidebar.tsx` — 需要修改的主要文件
- `src/stores/skill-store.ts` — `selectedCategory` 状态所在位置（只读，不修改）

## 验收标准

| #    | Given                      | When                         | Then                                                           |
| ---- | -------------------------- | ---------------------------- | -------------------------------------------------------------- |
| AC-1 | 用户已选中任意分类         | 点击"Skill 库"导航项         | `selectedCategory` 被清空，列表显示全部 Skill                  |
| AC-2 | 用户未选分类（全部视图）   | 点击"Skill 库"导航项         | 保持全部视图，无副作用（幂等性）                               |
| AC-3 | 用户在其他路由（如设置页） | 点击"Skill 库"导航项         | 跳转 `/` 并显示全部 Skill（原有行为保留）                      |
| AC-4 | 用户已选中某分类           | 点击"Skill 库"后             | 分类列表中无任何分类项处于高亮/激活状态                        |
| AC-5 | 用户已选中某分类           | 查看"Skill 库"导航项视觉状态 | "Skill 库"显示为"父级弱激活态"（无左侧绿线，保留 accent 背景） |

## 技术实现方案

### 架构决策

采用**方案 C — 自定义导航处理**（Winston 推荐，Party Mode 圆桌共识）：

- 将"Skill 库"的 `NavLink` 替换为自定义导航处理
- `onClick` 时：执行 `setCategory(null)` + 条件性 `navigate("/")`
- 激活样式通过 `location.pathname === '/'` 手动计算，区分"有筛选"和"无筛选"两种激活态

### 变更范围

**仅修改 `src/components/layout/Sidebar.tsx`**

### 实现细节

#### 1. 引入必要的 hooks 和 store

```tsx
import { useLocation, useNavigate } from "react-router-dom";
import { useSkillStore } from "../../stores/skill-store";
```

#### 2. 在 Sidebar 组件中添加逻辑

```tsx
export default function Sidebar() {
  const { sidebarOpen } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const setCategory = useSkillStore((s) => s.setCategory);
  const selectedCategory = useSkillStore((s) => s.selectedCategory);

  // 处理"Skill 库"点击：清除分类筛选 + 条件导航
  const handleSkillLibraryClick = () => {
    setCategory(null);
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  // ...
}
```

#### 3. 替换"Skill 库"的 NavLink

将原来的 `NavLink` 替换为自定义按钮，手动维护激活样式：

```tsx
// 原来（有问题）：
<NavLink to="/" end className={({ isActive }) => ...}>
  <BookOpen size={18} />
  Skill 库
</NavLink>

// 修改后：
<button
  onClick={handleSkillLibraryClick}
  className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-200 cursor-pointer w-full ${
    location.pathname === "/"
      ? selectedCategory !== null
        // 有分类筛选时：父级弱激活态（无左侧绿线，保留 accent 背景）
        ? "border-l-2 border-transparent bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] font-medium pl-[14px]"
        // 无分类筛选时：强激活态（左侧绿线 + accent 背景）
        : "border-l-2 border-[hsl(var(--primary))] bg-[hsl(var(--accent))] text-[hsl(var(--primary))] font-medium pl-[14px]"
      // 非激活态
      : "border-l-2 border-transparent text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] pl-[14px]"
  }`}
>
  <BookOpen size={18} />
  Skill 库
</button>
```

#### 4. 其他导航项保持不变

`navItems` 数组中的其他项（工作流、同步、导入、路径配置、分类）继续使用 `NavLink`，无需修改。

### 视觉状态说明（来自 Sally UX 规范）

| 场景                    | 视觉效果                                                      |
| ----------------------- | ------------------------------------------------------------- |
| 在 `/` 路由，无分类筛选 | 左侧 2px 绿线 + accent 背景 + primary 文字色（强激活）        |
| 在 `/` 路由，有分类筛选 | 无左侧绿线 + accent 背景 + foreground 文字色（弱激活/父级态） |
| 在其他路由              | 无背景 + muted 文字色（非激活）                               |

## 任务清单

- [x] **Task 1：** 在 `Sidebar.tsx` 中引入 `useNavigate`、`useLocation`、`useSkillStore`
- [x] **Task 2：** 添加 `handleSkillLibraryClick` 处理函数
- [x] **Task 3：** 将"Skill 库" `NavLink` 替换为自定义 `button`，实现三态激活样式
- [x] **Task 4：** 验证 AC-1 ~ AC-5 全部通过（手动测试）
- [x] **Task 5：** 确认其他导航项（工作流、同步等）行为不受影响

## 测试要求

### 单元测试

在 `tests/unit/components/layout/Sidebar.test.tsx`（如不存在则新建）中添加：

```typescript
describe("Sidebar - Skill 库导航", () => {
  it("AC-1: 有分类筛选时点击 Skill 库应清除 selectedCategory", () => {
    // 设置 selectedCategory = '编程开发'
    // 点击 Skill 库按钮
    // 断言 setCategory 被调用，参数为 null
  });

  it("AC-2: 无分类筛选时点击 Skill 库应幂等（不触发额外操作）", () => {
    // 设置 selectedCategory = null
    // 点击 Skill 库按钮
    // 断言 setCategory 被调用，参数为 null（幂等）
    // 断言 navigate 未被调用（已在 / 路由）
  });

  it("AC-3: 在其他路由点击 Skill 库应导航到 /", () => {
    // 设置 location.pathname = '/settings'
    // 点击 Skill 库按钮
    // 断言 navigate('/') 被调用
  });

  it("AC-5: 有分类筛选时 Skill 库应显示父级弱激活态（无绿线）", () => {
    // 设置 selectedCategory = '编程开发'，pathname = '/'
    // 断言按钮不包含 border-[hsl(var(--primary))] 类
    // 断言按钮包含 bg-[hsl(var(--accent))] 类
  });
});
```

## Dev Agent 执行记录

> 此区域由 Dev Agent（Amelia）在实现过程中填写

### 实现说明

**实现方案：** 方案 C — 自定义导航处理

**核心变更（仅 `src/components/layout/Sidebar.tsx`）：**

1. 将"Skill 库"从 `navItems` 数组中移除，单独渲染为自定义 `<button>`
2. 引入 `useNavigate`、`useLocation`（react-router-dom）和 `useSkillStore`
3. `handleSkillLibraryClick`：始终调用 `setCategory(null)`，若不在 `/` 则 `navigate("/")`
4. 三态样式：强激活（在 `/` 无筛选）/ 弱激活父级态（在 `/` 有筛选）/ 非激活（其他路由）
5. 添加 `data-testid="nav-skill-library"` 便于测试定位

**测试：** 新建 `tests/unit/components/layout/Sidebar.test.tsx`，12 个测试用例全部通过，覆盖 AC-1 ~ AC-5。

### 测试结果

```
✓ AC-1: 有分类筛选时点击 Skill 库清除筛选 (2 tests)
✓ AC-2: 无分类筛选时点击 Skill 库幂等 (2 tests)
✓ AC-3: 在其他路由点击 Skill 库导航到 / (3 tests)
✓ AC-5: Skill 库三态视觉样式 (3 tests)
✓ 其他导航项行为不受影响 (2 tests)

Test Files: 1 passed | Tests: 12 passed
TypeScript: tsc --noEmit 零错误
回归测试: 无新增失败（预存失败 CategoryTree/SyncTargetManager 与本次无关）
Chrome MCP 走查: AC-1/AC-4/AC-5 视觉验证通过
```

### 完成时间

2026-04-13

### Code Review 结果

**审查日期：** 2026-04-13
**审查结论：** ✅ Clean review — all layers passed

| 审查层             | 结论                               |
| ------------------ | ---------------------------------- |
| Blind Hunter       | 无 blocking 问题，代码质量高       |
| Edge Case Hunter   | 边界条件均已处理，无 blocking 问题 |
| Acceptance Auditor | AC-1 ~ AC-5 全部满足，无偏差       |

**Decision-needed:** 0 | **Patch:** 0 | **Defer:** 0 | **Dismissed:** 0

**Story 状态：** `done`

---

_Story 创建时间：2026-04-13_
_创建者：Winston (Architect)_
_来源：Party Mode 圆桌讨论 + Chrome MCP 走查_
_PRD 文档：`_bmad-output/planning-artifacts/prd-nav-category-fix.md`_
