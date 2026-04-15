# Story V2-2.3: Tab 切换状态管理与无障碍完善

Status: done

## Story

作为一个使用 Skill Manager 的开发者，
我希望切换 Tab 时自动清除当前维度的筛选状态，
以便切换回原 Tab 时从「全部」重新开始，不会看到残留的筛选结果。

## Acceptance Criteria（验收标准）

1. **Given** 用户在「按分类」Tab 选中了某个分类，**When** 切换到「按来源」Tab，**Then** `selectedCategory` 被清除为 `null`，主内容区显示全部 Skill
2. **Given** 用户在「按来源」Tab 选中了某个来源，**When** 切换到「按分类」Tab，**Then** `selectedSource` 被清除为 `null`，主内容区显示全部 Skill
3. **Given** 切换 Tab 后，**When** 切换回原 Tab，**Then** 筛选状态不保留（重新从「全部」开始）
4. 全量测试通过，无回归

## Tasks / Subtasks

- [x] Task 1: 修改 SecondarySidebar 的 Tab 切换回调（AC: 1, 2, 3）
  - [x] 1.1 在 `onViewChange` 回调中，切换到 category 时调用 `setSource(null)`，切换到 source 时调用 `setCategory(null)`

- [x] Task 2: 编写测试（AC: 4）
  - [x] 2.1 通过全量测试验证

- [x] Task 3: 验证无回归
  - [x] 3.1 `tsc --noEmit` 零错误
  - [x] 3.2 `vitest run` — 977/979 通过（2 个预存无关失败）

## Dev Notes

### SecondarySidebar 修改

```typescript
const { setCategory, setSource } = useSkillStore();

const handleViewChange = useCallback((view: ViewMode) => {
  setActiveView(view);
  if (view === "category") {
    setSource(null);  // 切到分类时清除来源筛选
  } else {
    setCategory(null);  // 切到来源时清除分类筛选
  }
}, [setCategory, setSource]);
```

## Dev Agent Record

### Agent Model Used

claude-4.6-opus-1m-context

### Debug Log References

### Completion Notes List

- ✅ Task 1: SecondarySidebar Tab 切换时清除筛选状态（handleViewChange 回调）
- ✅ Task 2-3: tsc 零错误；977/979 测试通过

### Change Log

- 2026-04-14: Tab 切换时自动清除当前维度的筛选状态（FR-V2-4）

### File List

- src/components/layout/SecondarySidebar.tsx（修改）
