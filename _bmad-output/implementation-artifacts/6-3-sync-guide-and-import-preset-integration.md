---
story: "6-3"
title: "同步页引导优化 + 顶部栏引导闭环"
epic: 6
status: done
created: "2026-04-12"
---

# Story 6.3：同步页引导优化 + 顶部栏引导闭环

## Story

**As a** 新用户，
**I want** 进入同步页时看到清晰的分步操作引导，并且点击顶部栏「未配置」按钮后能直接弹出添加目标对话框，
**So that** 我能顺畅完成首次同步配置，不会因为操作顺序不明确而困惑。

## Acceptance Criteria

1. **[AC-1]** 同步页右侧「同步目标为空」状态下，展示分步引导卡片，明确说明操作顺序：「第一步：添加同步目标」→「第二步：选择 Skill」→「第三步：开始同步」
2. **[AC-2]** 引导卡片中的「添加同步目标」按钮点击后，直接展开添加表单（`setShowAddForm(true)`），与现有「添加第一个同步目标」按钮行为一致，但视觉更醒目
3. **[AC-3]** 顶部栏 `SyncStatusIndicator` 的「未配置」按钮点击后，跳转到 `/sync` 并通过 URL 参数（`?action=add-target`）触发 `SyncTargetManager` 自动展开添加表单
4. **[AC-4]** `SyncTargetManager` 在挂载时检测 URL 参数 `action=add-target`，若存在则自动 `setShowAddForm(true)` 并清除该参数（避免刷新后重复触发）
5. **[AC-5]** 导入页预设集成已在 Epic 5 完成（`ScanPathInput.tsx` 已有预设下拉），本 Story 无需重复实现
6. **[AC-6]** 单元测试覆盖：URL 参数触发自动展开表单逻辑

## Tasks / Subtasks

- [x] **Task 1：SyncTargetManager 空状态引导卡片** (AC: 1, 2)
  - [x] 1.1 修改 `src/components/sync/SyncTargetManager.tsx` 的空状态区域
  - [x] 1.2 替换为分步引导卡片：步骤 1（高亮）、步骤 2（灰色）、步骤 3（灰色）
  - [x] 1.3 样式：使用 `hsl(var(--primary))` 高亮步骤 1，步骤 2/3 使用 `hsl(var(--muted-foreground))`

- [x] **Task 2：顶部栏引导闭环** (AC: 3, 4)
  - [x] 2.1 修改 `src/components/sync/SyncStatusIndicator.tsx` 的 `handleClick`：无目标时导航到 `/sync?action=add-target`
  - [x] 2.2 修改 `src/components/sync/SyncTargetManager.tsx`：引入 `useSearchParams`，检测 `action=add-target` 参数并自动展开添加表单

- [x] **Task 3：单元测试** (AC: 6)
  - [x] 3.1 新建 `tests/unit/components/sync/SyncTargetManager.test.tsx`
  - [x] 3.2 测试：URL 参数 `action=add-target` 时自动展开添加表单
  - [x] 3.3 测试：展开后 URL 参数被清除
  - [x] 更新 `SyncStatusIndicator.test.tsx` 中的交互测试，匹配新的导航逻辑

## Dev Notes

### 现有代码分析

**`SyncTargetManager.tsx` 空状态（第 ~175 行）：**

```tsx
{targets.length === 0 && !showAddForm ? (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <FolderOpen size={40} ... />
    <p>尚未配置同步目标</p>
    <p>添加 IDE 项目路径...</p>
    <Button onClick={() => setShowAddForm(true)}>添加第一个同步目标</Button>
  </div>
) : ...}
```

→ 替换为分步引导卡片，保留 `setShowAddForm(true)` 逻辑

**`SyncStatusIndicator.tsx` handleClick（第 ~43 行）：**

```tsx
const handleClick = useCallback(() => {
  navigate("/sync");
}, [navigate]);
```

→ 修改为：`navigate(hasTargets ? "/sync" : "/sync?action=add-target")`

**`SyncTargetManager.tsx` useEffect（第 ~55 行）：**

```tsx
useEffect(() => {
  fetchTargets();
  fetchPathPresets()
    .then(setPathPresets)
    .catch(() => {});
}, [fetchTargets]);
```

→ 追加 URL 参数检测逻辑

### 已完成项（无需实现）

- ✅ `ScanPathInput.tsx` 已集成预设下拉（Epic 5 Story 5-3 完成）
- ✅ `SyncExecutor.tsx` 提示文案已正确（「请先添加并启用同步目标」）

### 关键约束

- **`useSearchParams` 使用**：`react-router-dom` v7 已支持，无需新增依赖
- **清除参数**：`setSearchParams({})` 清除所有参数，避免刷新后重复触发
- **不影响现有功能**：`showAddForm` 状态逻辑不变，只是增加自动触发路径

### 文件修改清单

- `src/components/sync/SyncTargetManager.tsx` — 空状态引导卡片 + URL 参数检测
- `src/components/sync/SyncStatusIndicator.tsx` — handleClick 修改
- `tests/unit/components/sync/SyncTargetManager.test.tsx` — 新增测试（或追加）

### References

- [SyncTargetManager.tsx](src/components/sync/SyncTargetManager.tsx) — 第 ~175 行（空状态）、第 ~55 行（useEffect）
- [SyncStatusIndicator.tsx](src/components/sync/SyncStatusIndicator.tsx) — 第 ~43 行（handleClick）
- [ScanPathInput.tsx](src/pages/import/ScanPathInput.tsx) — 已完成预设集成（参考）
- [project-context.md](_bmad-output/project-context.md) — 架构规则、样式规范

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-1m-context

### Debug Log References

### Completion Notes List

- Task 1：`SyncTargetManager.tsx` 空状态替换为分步引导卡片，步骤 1 高亮显示
- Task 2：`SyncStatusIndicator.tsx` 无目标时跳转到 `/sync?action=add-target`；`SyncTargetManager.tsx` 检测 URL 参数自动展开表单
- Task 3：新建 `SyncTargetManager.test.tsx`（3 个测试）；更新 `SyncStatusIndicator.test.tsx` 交互测试（匹配新导航逻辑）
- 全量测试 597/597 通过

### File List

- `src/components/sync/SyncTargetManager.tsx`
- `src/components/sync/SyncStatusIndicator.tsx`
- `tests/unit/components/sync/SyncTargetManager.test.tsx`
- `tests/unit/components/sync/SyncStatusIndicator.test.tsx`
