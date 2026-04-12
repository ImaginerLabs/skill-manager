---
story: "5-3"
title: "同步/导入页集成预设选择"
epic: 5
status: done
created: "2026-04-12"
completed: "2026-04-12"
type: backfill
note: "代码已在 Epic 5 实现阶段完成，此文件为补建的 Story 记录"
---

# Story 5-3：同步/导入页集成预设选择

## Story

**As a** 用户，
**I want** 在同步页和导入页的路径输入框旁看到「从预设选择」下拉，
**So that** 我可以快速填入已配置的预设路径，无需重复手动输入。

## Acceptance Criteria

- [x] `src/components/sync/SyncTargetManager.tsx` — 路径输入框旁增加「从预设选择」下拉（仅有预设时渲染）
- [x] `src/pages/import/ScanPathInput.tsx` — 扫描路径输入框旁增加「从预设选择」下拉（仅有预设时渲染）
- [x] 选中预设后自动填入路径输入框，不改变手动输入能力
- [x] `pathPresets` 为空时，下拉不渲染（不占用 UI 空间）
- [x] 下拉选项展示格式：有备注时显示 `备注 (路径)`，无备注时显示路径
- [x] 导入页将 `ImportPage.tsx` 中的扫描路径区域拆分为独立的 `ScanPathInput.tsx` 组件

## Tasks

- [x] **Task 1：SyncTargetManager.tsx 集成**
  - `useEffect` 中调用 `fetchPathPresets()` 加载预设列表
  - 添加表单的路径输入框旁增加 `<select>` 下拉
  - 仅 `pathPresets.length > 0` 时渲染下拉
  - 选中后调用 `setNewPath(e.target.value)` 填入路径

- [x] **Task 2：ImportPage 拆分 + ScanPathInput.tsx**
  - 将扫描路径区域拆分为独立的 `ScanPathInput.tsx` 组件（`memo` 包裹）
  - 组件 Props：`scanPath`、`scanState`、`pathPresets`、`onScanPathChange`、`onScan`
  - 路径输入框旁增加预设下拉（同 SyncTargetManager 模式）
  - `ImportPage` 父组件通过 `useImport` hook 加载 `pathPresets` 并传入

- [x] **Task 3：useImport hook 更新**
  - `useImport.ts` 新增 `pathPresets` 状态
  - `useEffect` 中调用 `fetchPathPresets()` 加载预设列表
  - 暴露 `pathPresets` 供 `ImportPage` 使用

## Dev Agent Record

### Implementation Notes

**SyncTargetManager.tsx 集成决策：**
- 在 `useEffect` 中与 `fetchTargets()` 并行调用 `fetchPathPresets()`，失败时静默处理（不影响主功能）
- 使用原生 `<select>` 而非 shadcn/ui 的 `Select` 组件，保持与输入框的高度对齐（`h-9`）
- `value=""` + `onChange` 模式：每次选择后重置为空，允许重复选择同一预设

**ImportPage 拆分决策：**
- `ImportPage.tsx` 原本 386 行（Epic 2 遗留技术债务），此次拆分 `ScanPathInput` 组件
- 使用 `memo` 包裹避免不必要的重渲染
- 拆分后 `ImportPage.tsx` 减少约 50 行，组件职责更清晰

**预设下拉 UI 一致性：**
- 同步页和导入页使用相同的 `<select>` 样式（`h-9 rounded-md border ...`）
- 选项格式统一：`label ? \`${label} (${path})\` : path`

**边界处理：**
- `pathPresets` 为空时不渲染下拉，不占用 UI 空间（`{pathPresets.length > 0 && <select>...}`）
- 预设加载失败时静默处理，不影响主功能（同步/导入）

### QA Results

- `npm run typecheck` — ✅ 零 TypeScript 错误
- `npm run test:run` — ✅ 所有现有测试通过
- `npm run build` — ✅ 构建成功
- 手动验证：
  - 访问 `/sync`，路径输入框旁出现「从预设选择」，选中后路径自动填入 ✅
  - 访问 `/import`，扫描路径旁出现「从预设选择」，选中后路径自动填入 ✅
  - 删除所有预设后，两处下拉均消失 ✅

### Code Review

- 组件拆分合理，`ScanPathInput` 职责单一
- 预设加载失败静默处理，不影响主功能
- UI 样式与项目设计系统一致
- 无阻塞性问题，Story 通过 Code Review

---

_补建日期：2026-04-12_
_原始实现：Epic 5 开发阶段_
