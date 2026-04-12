---
story: "6-1"
title: "分类系统数据一致性修复"
epic: 6
status: done
created: "2026-04-12"
---

# Story 6.1：分类系统数据一致性修复

## Story

**As a** 用户，
**I want** 侧边栏分类计数与主区域展示的 Skill 数量完全一致，
**So that** 我点击任意分类时能看到正确的 Skill 列表，分类系统真正可用。

## Acceptance Criteria

1. **[AC-1]** `categoryService.getCategories()` 计算 `skillCount` 时，使用大小写不敏感匹配（`skill.category.toLowerCase() === cat.name.toLowerCase()`），确保 `coding`/`Coding`/`CODING` 均能正确归类
2. **[AC-2]** 前端 `SkillGrid.tsx` 和 `SkillListView.tsx` 的分类过滤逻辑同步更新为大小写不敏感匹配
3. **[AC-3]** 前端 `SkillBrowsePage.tsx` 的分类过滤逻辑同步更新为大小写不敏感匹配
4. **[AC-4]** 当 Skill 的 `category` 字段无法匹配任何已知分类时，`categoryService` 将其归入「未分类」虚拟分类（`name: "uncategorized"`），并在 `getCategories()` 返回结果中追加该虚拟分类（仅当 `skillCount > 0` 时追加）
5. **[AC-5]** `categoryService.updateCategory()` 和 `deleteCategory()` 中的 `skillCount` 计算同步更新为大小写不敏感匹配
6. **[AC-6]** 单元测试覆盖：大小写不敏感匹配逻辑、未分类虚拟分类追加逻辑

## Tasks / Subtasks

- [x] **Task 1：后端 categoryService 修复** (AC: 1, 4, 5)
  - [x] 1.1 修改 `getCategories()` 中的匹配逻辑：`categories.find((c) => c.name.toLowerCase() === skill.category.toLowerCase())`
  - [x] 1.2 当 skill 无法匹配任何分类时，累计到 `uncategorizedCount`
  - [x] 1.3 若 `uncategorizedCount > 0`，在返回数组末尾追加虚拟分类 `{ name: "uncategorized", displayName: "未分类", skillCount: uncategorizedCount }`
  - [x] 1.4 同步修复 `updateCategory()` 和 `deleteCategory()` 中的 `skillCount` 计算（第 104 行和第 128 行）

- [x] **Task 2：前端分类过滤逻辑修复** (AC: 2, 3)
  - [x] 2.1 修改 `src/components/skills/SkillGrid.tsx`：`skills.filter((s) => s.category.toLowerCase() === selectedCategory.toLowerCase())`
  - [x] 2.2 修改 `src/components/skills/SkillListView.tsx`：同上
  - [x] 2.3 修改 `src/pages/SkillBrowsePage.tsx`：同上（第 44-45 行）

- [x] **Task 3：单元测试** (AC: 6)
  - [x] 3.1 在 `tests/unit/server/services/categoryService.test.ts` 中添加测试：大小写不敏感匹配（`Coding` → `coding` 分类）
  - [x] 3.2 添加测试：未分类虚拟分类追加（`category: "unknown"` 的 Skill 归入 `uncategorized`）
  - [x] 3.3 添加测试：`uncategorizedCount === 0` 时不追加虚拟分类

## Dev Notes

### 根因分析

**问题位置：**

- `server/services/categoryService.ts` 第 38 行：`categories.find((c) => c.name === skill.category)` — 严格字符串匹配
- `src/components/skills/SkillGrid.tsx` 第 18 行：`skills.filter((s) => s.category === selectedCategory)` — 严格字符串匹配
- `src/components/skills/SkillListView.tsx` 第 17-18 行：同上
- `src/pages/SkillBrowsePage.tsx` 第 44-45 行：同上

**修复策略：** 只做读取时规范化（大小写不敏感），**不修改源文件**的 `category` 字段值，避免影响现有 Skill 文件。

### 关键约束

- **不修改 Skill 源文件**：只在读取/匹配时做规范化，`SkillMeta.category` 字段保持原始值
- **虚拟分类不持久化**：`uncategorized` 虚拟分类只在 `getCategories()` 返回时动态追加，不写入 `categories.yaml`
- **前端 `selectedCategory` 值来自 `cat.name`**：前端点击分类时存储的是 `cat.name`（如 `"coding"`），过滤时需要与 `skill.category` 做大小写不敏感比较

### 文件修改清单

**后端：**

- `server/services/categoryService.ts` — 修改 `getCategories()`、`updateCategory()`、`deleteCategory()` 中的匹配逻辑

**前端：**

- `src/components/skills/SkillGrid.tsx` — 修改分类过滤逻辑
- `src/components/skills/SkillListView.tsx` — 修改分类过滤逻辑
- `src/pages/SkillBrowsePage.tsx` — 修改分类过滤逻辑

**测试：**

- `tests/unit/server/services/categoryService.test.ts` — 新增测试用例

### 现有测试文件参考

检查是否已有 `categoryService.test.ts`：

```
tests/unit/server/services/categoryService.test.ts
```

若不存在则新建；若存在则在现有 describe 块中追加测试用例。

### 架构合规

- 遵循项目规则：服务层使用函数式导出，不使用 class
- 错误处理：使用 `AppError` 工厂方法
- 类型安全：`Category` 类型在 `shared/types.ts` 中定义，虚拟分类需符合该类型

### References

- [categoryService.ts](server/services/categoryService.ts) — 第 23-45 行（getCategories 实现）
- [SkillGrid.tsx](src/components/skills/SkillGrid.tsx) — 第 17-19 行（分类过滤）
- [SkillListView.tsx](src/components/skills/SkillListView.tsx) — 第 17-19 行（分类过滤）
- [SkillBrowsePage.tsx](src/pages/SkillBrowsePage.tsx) — 第 44-45 行（分类过滤）
- [shared/types.ts](shared/types.ts) — `Category` 接口定义
- [project-context.md](_bmad-output/project-context.md) — 架构规则、测试规范

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-1m-context

### Debug Log References

### Completion Notes List

- Task 1：修改 `categoryService.ts` 的 `getCategories()`、`updateCategory()`、`deleteCategory()` 使用大小写不敏感匹配；`getCategories()` 追加未分类虚拟分类逻辑
- Task 2：修改 `SkillGrid.tsx`、`SkillListView.tsx`、`SkillBrowsePage.tsx` 的分类过滤逻辑为大小写不敏感
- Task 3：在 `categoryService.test.ts` 中新增 4 个测试用例，覆盖大小写不敏感匹配和未分类虚拟分类逻辑
- 全量测试 604/604 通过，TypeScript 零错误

### File List

- `server/services/categoryService.ts`
- `src/components/skills/SkillGrid.tsx`
- `src/components/skills/SkillListView.tsx`
- `src/pages/SkillBrowsePage.tsx`
- `tests/unit/server/services/categoryService.test.ts`
