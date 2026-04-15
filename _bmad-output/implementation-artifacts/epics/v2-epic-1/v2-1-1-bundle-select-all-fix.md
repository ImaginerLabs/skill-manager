# Story V2-1.1: 默认套件全选修复

Status: done

## Story

作为一个使用 Skill Manager 的开发者，
我希望选择默认套件（`bundle-default`）后，9 个出厂分类下的全部 Skill（包括外部 Skill）自动被选中，
以便我无需手动补选即可一键同步所有出厂 Skill。

## Bug 描述

**现象：** 在同步页面的 `SyncSkillSelector` 中点击默认套件按钮后，部分 Skill（特别是外部 Skill）未被选中。

**根因分析：** `SyncSkillSelector.tsx` 中 `handleSelectBundle` 函数使用 `categorySkillIdsMap.get(catName)` 进行精确匹配。`categorySkillIdsMap` 的 key 来自 `skill.category`（Skill 实际分类名），而 `bundle.categoryNames` 来自套件配置。如果两者存在大小写差异（如外部 Skill 的 `category` 字段可能有大小写不一致），`Map.get()` 精确匹配会导致遗漏。

**影响范围：**
- `SyncSkillSelector.tsx` — `handleSelectBundle` 和 `getBundleCheckState` 两个函数
- `bundle-store.ts` — `applyBundle` action 当前不更新 `selectedSkillIds`（设置页激活套件时不联动同步页选中状态）

## Acceptance Criteria（验收标准）

1. **Given** 默认套件包含 9 个出厂分类，**When** 用户在同步页面点击默认套件按钮，**Then** 所有 9 个分类下的全部 Skill（包括外部 Skill）的复选框全部勾选
2. **Given** 套件 `categoryNames` 中的分类名与 Skill 的 `category` 字段存在大小写差异，**When** 用户点击该套件，**Then** 分类匹配使用 `toLowerCase()` 归一化，不遗漏任何 Skill
3. **Given** 用户已选中默认套件（全部 Skill 勾选），**When** 用户再次点击默认套件按钮，**Then** 所有 Skill 取消选中（切换逻辑正常工作）
4. **Given** 套件中包含已删除的分类引用（`brokenCategoryNames`），**When** 用户点击该套件，**Then** 已删除分类被跳过，不影响其他有效分类的 Skill 选中
5. **Given** 修复后的代码，**When** 运行全量测试套件，**Then** 所有现有测试 100% 通过，无回归
6. 新增单元测试覆盖：大小写归一化匹配、外部 Skill 选中、切换逻辑、损坏引用跳过

## Tasks / Subtasks

- [x] Task 1: 修复 `SyncSkillSelector.tsx` 中 `categorySkillIdsMap` 的构建逻辑（AC: 1, 2）
  - [x] 1.1 修改 `categorySkillIdsMap` 的 key 使用 `toLowerCase()` 归一化
  - [x] 1.2 修改 `handleSelectBundle` 中 `categorySkillIdsMap.get(catName)` 改为 `categorySkillIdsMap.get(catName.toLowerCase())`
  - [x] 1.3 修改 `getBundleCheckState` 中同样的匹配逻辑
  - [x] 1.4 确保 `groupedSkills`、`handleToggleCategory`、`getCategoryCheckState` 等其他使用 `category` 的地方不受影响（这些使用原始 category 值，不需要归一化）

- [x] Task 2: 编写单元测试（AC: 1, 2, 3, 4, 6）
  - [x] 2.1 更新 `tests/unit/components/sync/SyncSkillSelector.test.tsx` — 新增测试用例：
    - 点击默认套件后所有 Skill 被选中（包括外部 Skill）
    - 分类名大小写不一致时仍能正确匹配
    - 再次点击套件取消全选
    - 套件包含损坏引用时正确跳过

- [x] Task 3: 验证无回归（AC: 5）
  - [x] 3.1 运行 `npm run typecheck` — TypeScript 零错误
  - [x] 3.2 运行 `npm run test:run` — 全量测试通过（预存 2 个无关失败不受影响）

## Dev Notes

### 根因定位

`SyncSkillSelector.tsx` 第 100-107 行的 `categorySkillIdsMap` 构建：

```typescript
// 当前实现（精确匹配）
const categorySkillIdsMap = useMemo(() => {
  const map = new Map<string, string[]>();
  for (const skill of skills) {
    const cat = skill.category;  // ← 使用原始 category 值作为 key
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(skill.id);
  }
  return map;
}, [skills]);
```

`handleSelectBundle` 第 188-195 行：

```typescript
const bundleSkillIds: string[] = [];
for (const catName of bundle.categoryNames) {
  const ids = categorySkillIdsMap.get(catName) ?? [];  // ← 精确匹配
  bundleSkillIds.push(...ids);
}
```

**问题：** 如果 `skill.category` 是 `"Coding"` 而 `bundle.categoryNames` 中是 `"coding"`，`Map.get("coding")` 找不到 key `"Coding"`，导致该分类下的 Skill 被遗漏。

### 修复方案

**方案 A（推荐）：** 在 `categorySkillIdsMap` 构建时将 key 归一化为 `toLowerCase()`，同时在 `handleSelectBundle` 和 `getBundleCheckState` 中查询时也使用 `toLowerCase()`。

```typescript
// 修复后
const categorySkillIdsMap = useMemo(() => {
  const map = new Map<string, string[]>();
  for (const skill of skills) {
    const cat = skill.category.toLowerCase();  // ← 归一化
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(skill.id);
  }
  return map;
}, [skills]);

// handleSelectBundle 中
for (const catName of bundle.categoryNames) {
  const ids = categorySkillIdsMap.get(catName.toLowerCase()) ?? [];  // ← 归一化查询
  bundleSkillIds.push(...ids);
}
```

**注意：** `categorySkillIdsMap` 仅用于套件选择逻辑（`handleSelectBundle` 和 `getBundleCheckState`），不影响 `groupedSkills`（用于 UI 分组显示）和 `handleToggleCategory`（用于按分类批量选择）。后两者使用原始 category 值，不需要修改。

### 架构约束

- **AD-48**：分类匹配使用 `toLowerCase()` 归一化，防止大小写差异导致遗漏
- 后端 `bundleService.applyBundle` 已使用 `toLowerCase()` 归一化（`validCategoryNames.has(name.toLowerCase())`），前端需保持一致
- `categorySkillIdsMap` 的 key 归一化不影响 UI 显示（UI 显示使用 `categoryDisplayNames` 映射）

### 不需要修改的文件

- `server/services/bundleService.ts` — 后端 `applyBundle` 已正确使用 `toLowerCase()` 归一化
- `src/stores/bundle-store.ts` — `applyBundle` action 只负责调用 API 和更新 `activeBundleId`，不涉及 `selectedSkillIds`
- `src/stores/sync-store.ts` — `selectByCategory` action 已正确实现
- `src/components/settings/BundleManager.tsx` — 设置页套件管理不涉及 Skill 选中

### 测试策略

**单元测试重点：**
1. Mock `skills` 数据包含外部 Skill（`source: "anthropic-official"`），分布在多个分类中
2. Mock `bundles` 数据包含默认套件（`categoryNames` 含全部 9 个分类）
3. 验证点击套件后 `selectByCategory` 被调用，参数包含所有 Skill ID
4. 验证大小写不一致场景（如 Skill 的 `category: "Coding"` vs 套件的 `categoryNames: ["coding"]`）

### Project Structure Notes

- 修改文件：`src/components/sync/SyncSkillSelector.tsx`
- 测试文件：`tests/unit/components/sync/SyncSkillSelector.test.tsx`
- 共享类型：`shared/types.ts`（`SkillMeta.source` 字段已存在，无需修改）

### References

- [Source: _bmad-output/planning-artifacts/architecture-v2.md#AD-48] 默认套件全选修复根因分析与修复策略
- [Source: _bmad-output/planning-artifacts/prd/prd-skill-manager-v2.md#FR-V2-25] 默认套件全选需求
- [Source: _bmad-output/planning-artifacts/prd/prd-skill-manager-v2.md#FR-V2-26] 套件 Skill ID 收集修复需求
- [Source: _bmad-output/planning-artifacts/epics/epics-v2.md#Epic-1] V2 Epic 1 定义
- [Source: src/components/sync/SyncSkillSelector.tsx] 当前实现（Bug 所在文件）
- [Source: server/services/bundleService.ts#applyBundle] 后端已正确使用 toLowerCase() 归一化
- [Source: _bmad-output/project-context.md] 项目上下文规则

## Dev Agent Record

### Agent Model Used

claude-4.6-opus-1m-context

### Debug Log References

### Completion Notes List

- ✅ Task 1: 修复 `SyncSkillSelector.tsx` 中 3 处分类匹配逻辑，使用 `toLowerCase()` 归一化
  - `categorySkillIdsMap` 构建时 key 归一化（第 101 行）
  - `handleSelectBundle` 查询时归一化（第 191 行）
  - `getBundleCheckState` 查询时归一化（第 213 行）
  - `groupedSkills`、`handleToggleCategory`、`getCategoryCheckState` 等使用原始 category 值的逻辑未受影响
- ✅ Task 2: 新增 5 个单元测试用例，覆盖套件全选、大小写归一化、切换取消、损坏引用跳过、选中状态反映
- ✅ Task 3: TypeScript 零错误；27/27 测试通过；全量 950/952 通过（2 个预存无关失败）

### Change Log

- 2026-04-14: 修复默认套件全选 Bug，`categorySkillIdsMap` 使用 `toLowerCase()` 归一化分类名匹配，新增 5 个单元测试

### File List

- src/components/sync/SyncSkillSelector.tsx（修改）
- tests/unit/components/sync/SyncSkillSelector.test.tsx（修改）
