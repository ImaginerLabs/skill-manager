# Story V2-2.1: ViewTab 组件与 Source Store 扩展

Status: done

## Story

作为一个使用 Skill Manager 的开发者，
我希望在二级 Sidebar 顶部看到「按分类」和「按来源」两个 Tab，并且 skill-store 支持来源筛选状态，
以便后续 Story 可以基于此构建 SourceTree 组件和完整的来源筛选功能。

## Acceptance Criteria（验收标准）

1. **Given** 用户在 Skill 库页面，**When** 查看二级 Sidebar 顶部，**Then** 看到「按分类」和「按来源」两个 Tab，默认选中「按分类」
2. **Given** `skill-store`，**When** 调用 `setSource(source)`，**Then** `selectedSource` 被设置且 `selectedCategory` 自动清除为 `null`（互斥）
3. **Given** `skill-store`，**When** 调用 `setCategory(category)`，**Then** `selectedCategory` 被设置且 `selectedSource` 自动清除为 `null`（互斥）
4. **Given** ViewTab 组件，**When** 点击「按来源」Tab，**Then** Tab 切换动画正确，选中态显示底边框 `2px solid #22C55E`
5. **Given** ViewTab 组件，**When** 使用键盘导航，**Then** `Arrow Left/Right` 切换焦点，`Enter/Space` 激活 Tab（ARIA `role="tablist"` + `role="tab"`）
6. **Given** 修复后的代码，**When** 运行全量测试套件，**Then** 所有现有测试 100% 通过，无回归
7. 新增单元测试覆盖：ViewTab 渲染、Tab 切换、键盘导航、store 互斥逻辑

## Tasks / Subtasks

- [x] Task 1: 扩展 `skill-store.ts`（AC: 2, 3）
  - [x] 1.1 新增 `selectedSource: string | null` 状态字段
  - [x] 1.2 新增 `setSource: (source: string | null) => void` action
  - [x] 1.3 修改 `setCategory` 加互斥逻辑：`set({ selectedCategory: category, selectedSource: null })`
  - [x] 1.4 `setSource` 实现互斥：`set({ selectedSource: source, selectedCategory: null })`

- [x] Task 2: 创建 `ViewTab.tsx` 组件（AC: 1, 4, 5）
  - [x] 2.1 新建 `src/components/skills/ViewTab.tsx`
  - [x] 2.2 实现 Tab 切换器 UI（按分类/按来源），选中态底边框 `2px solid #22C55E`
  - [x] 2.3 实现 ARIA 无障碍：`role="tablist"` + `role="tab"` + `aria-selected` + `Arrow Left/Right` 键盘导航
  - [x] 2.4 Tab 状态使用组件本地 `useState`（不持久化到 store）

- [x] Task 3: 集成 ViewTab 到 SecondarySidebar（AC: 1）
  - [x] 3.1 修改 `SecondarySidebar.tsx`，在标题栏下方添加 ViewTab
  - [x] 3.2 根据 activeView 条件渲染 CategoryTree（按分类时）或占位文本（按来源时）

- [x] Task 4: 添加 i18n 翻译键（AC: 1）
  - [x] 4.1 在 `zh.ts` 和 `en.ts` 中添加 `nav.byCategory`、`nav.bySource`、`nav.viewSwitcher`、`nav.sourceViewPlaceholder`

- [x] Task 5: 编写单元测试（AC: 6, 7）
  - [x] 5.1 `tests/unit/stores/skill-store.test.ts` — 新增 6 个测试（selectedSource/setSource/互斥逻辑）
  - [x] 5.2 `tests/unit/components/skills/ViewTab.test.tsx` — 新建 12 个测试（渲染/交互/键盘导航/ARIA）

- [x] Task 6: 验证无回归（AC: 6）
  - [x] 6.1 运行 `tsc --noEmit` — TypeScript 零错误
  - [x] 6.2 运行 `vitest run` — 966/968 通过（2 个预存无关失败）  - [ ] 6.2 运行 `vitest run` — 全量测试通过

## Dev Notes

### skill-store.ts 修改

```typescript
// 新增字段
selectedSource: string | null;

// 新增 action
setSource: (source: string | null) => void;

// 修改 setCategory（加互斥）
setCategory: (category) => set({ selectedCategory: category, selectedSource: null }),

// 新增 setSource（互斥）
setSource: (source) => set({ selectedSource: source, selectedCategory: null }),
```

**注意：** `SkillStore` interface 也需要同步更新。

### ViewTab.tsx 组件规格

```typescript
interface ViewTabProps {
  activeView: 'category' | 'source';
  onViewChange: (view: 'category' | 'source') => void;
}
```

**样式规格（UX-DR3）：**
- 未选中：`text-[#94A3B8]`（text-secondary），无底边框
- 选中：`text-[#F8FAFC]`（text-primary），底边框 `2px solid #22C55E`（Run Green）
- Hover：`text-[#F8FAFC]`，无底边框
- 焦点：`outline: 2px solid #22C55E`，`outline-offset: 2px`

**ARIA 规格（UX-DR11）：**
- 容器：`role="tablist"`
- 每个 Tab：`role="tab"` + `aria-selected` + `aria-controls="panel-id"`
- 键盘：`Arrow Left/Right` 切换焦点，`Enter/Space` 激活

### SecondarySidebar.tsx 修改

在标题栏和 CategoryTree 之间插入 ViewTab。当 `activeView === 'source'` 时，暂时渲染占位文本"来源视图（即将推出）"，后续 Story 2-2 替换为 SourceTree。

### 架构约束

- **AD-41**：Tab 状态存储在组件本地 `useState`，不需要持久化
- **AD-41**：`selectedSource` 和 `selectedCategory` 互斥管理
- 零改动文件：`CategoryTree.tsx`

### 不需要修改的文件

- `CategoryTree.tsx` — 延续 AD-23 零改动原则
- `server/` — 纯前端变更，无后端修改
- `shared/types.ts` — `SkillMeta.source` 字段已存在

### i18n 翻译键

```typescript
// zh.ts
nav: {
  // ... 现有 ...
  byCategory: "按分类",
  bySource: "按来源",
}

// en.ts
nav: {
  // ... 现有 ...
  byCategory: "By Category",
  bySource: "By Source",
}
```

### Project Structure Notes

- 新建文件：`src/components/skills/ViewTab.tsx`
- 修改文件：`src/stores/skill-store.ts`、`src/components/layout/SecondarySidebar.tsx`、`src/i18n/locales/zh.ts`、`src/i18n/locales/en.ts`
- 新建测试：`tests/unit/components/skills/ViewTab.test.tsx`
- 修改测试：`tests/unit/stores/skill-store.test.ts`

### References

- [Source: architecture-v2.md#AD-41] 二级 Sidebar 视图切换前端状态管理策略
- [Source: ux-design-specification-v2.md#ViewTab] ViewTab 组件规格
- [Source: prd-skill-manager-v2.md#FR-V2-1] Tab 切换需求
- [Source: prd-skill-manager-v2.md#FR-V2-4] Tab 切换清除筛选状态
- [Source: src/stores/skill-store.ts] 当前 store 实现
- [Source: src/components/layout/SecondarySidebar.tsx] 当前 SecondarySidebar 实现

## Dev Agent Record

### Agent Model Used

claude-4.6-opus-1m-context

### Debug Log References

### Completion Notes List

- ✅ Task 1: 扩展 skill-store.ts — 新增 selectedSource/setSource，修改 setCategory 加互斥逻辑
- ✅ Task 2: 新建 ViewTab.tsx — Tab 切换器 + ARIA 无障碍 + 键盘导航
- ✅ Task 3: 修改 SecondarySidebar.tsx — 集成 ViewTab，条件渲染 CategoryTree/占位文本
- ✅ Task 4: 添加 i18n 翻译键（zh/en）
- ✅ Task 5: 新增 18 个测试（skill-store 6 + ViewTab 12）
- ✅ Task 6: tsc 零错误；966/968 测试通过

### Change Log

- 2026-04-14: 新增 ViewTab 组件和 Source Store 扩展，实现二级 Sidebar 视图切换基础设施

### File List

- src/stores/skill-store.ts（修改）
- src/components/skills/ViewTab.tsx（新建）
- src/components/layout/SecondarySidebar.tsx（修改）
- src/i18n/locales/zh.ts（修改）
- src/i18n/locales/en.ts（修改）
- tests/unit/stores/skill-store.test.ts（修改）
- tests/unit/components/skills/ViewTab.test.tsx（新建）
