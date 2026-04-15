# Story V2-2.2: SourceTree 组件与来源筛选

Status: done

## Story

作为一个使用 Skill Manager 的开发者，
我希望在「按来源」Tab 下看到来源列表（含数量 Badge），点击来源项后主内容区只显示该来源的 Skill，
以便我可以按 GitHub 仓库来源快速浏览和筛选 Skill。

## Acceptance Criteria（验收标准）

1. **Given** 用户切换到「按来源」Tab，**When** 查看来源列表，**Then** 看到所有来源项（含"全部"和"我的 Skill"），每项显示 Skill 数量 Badge
2. **Given** 来源列表，**When** 用户点击某个来源项，**Then** 主内容区只显示该来源的 Skill 卡片
3. **Given** `source` 为空或 undefined 的 Skill，**When** 聚合来源数据，**Then** 归入"我的 Skill"分组
4. **Given** 未来新增仓库来源，**When** Skill 数据中出现新的 `source` 值，**Then** 自动出现在来源列表中
5. **Given** SourceTree 组件，**When** 使用屏幕阅读器，**Then** 有正确的 ARIA 标签（`role="listbox"` + `role="option"` + `aria-label` 含数量）
6. 修改 `SkillGrid.tsx`、`SkillListView.tsx`、`SkillBrowsePage.tsx` 中的筛选逻辑，支持 `selectedSource` 筛选
7. 全量测试通过，无回归

## Tasks / Subtasks

- [x] Task 1: 创建 `SourceTree.tsx` 组件（AC: 1, 3, 4, 5）
  - [x] 1.1 新建 `src/components/skills/SourceTree.tsx`
  - [x] 1.2 从 `skills` 数组按 `source` 字段聚合来源数据（`useMemo`）
  - [x] 1.3 渲染来源列表（图标 + 名称 + Badge），复用 CategoryTree 列表项样式
  - [x] 1.4 实现 ARIA 无障碍（`role="listbox"` + `role="option"` + `aria-label`）
  - [x] 1.5 点击来源项调用 `setSource()`，点击"全部"调用 `setSource(null)`

- [x] Task 2: 集成 SourceTree 到 SecondarySidebar（AC: 1）
  - [x] 2.1 替换占位文本为 SourceTree 组件

- [x] Task 3: 修改 Skill 列表筛选逻辑支持来源筛选（AC: 2）
  - [x] 3.1 修改 `SkillGrid.tsx` — 在分类筛选后加来源筛选
  - [x] 3.2 修改 `SkillListView.tsx` — 同上
  - [x] 3.3 修改 `SkillBrowsePage.tsx` — 同上（用于计数）

- [x] Task 4: 添加 i18n 翻译键
  - [x] 4.1 在 zh.ts/en.ts 中添加 `nav.allSources`、`nav.mySkills`、`nav.sourceListLabel`

- [x] Task 5: 编写单元测试（AC: 7）
  - [x] 5.1 新建 `tests/unit/components/skills/SourceTree.test.tsx` — 11 个测试

- [x] Task 6: 验证无回归
  - [x] 6.1 `tsc --noEmit` 零错误
  - [x] 6.2 `vitest run` — 977/979 通过（2 个预存无关失败）

## Dev Notes

### SourceTree 来源聚合逻辑（AD-42）

```typescript
const sources = useMemo(() => {
  const map = new Map<string, number>();
  skills.forEach((skill) => {
    const key = skill.source || "";
    map.set(key, (map.get(key) || 0) + 1);
  });
  return [
    { key: null, name: t("nav.allSources"), count: skills.length, icon: "🌐" },
    ...Array.from(map.entries()).map(([key, count]) => ({
      key,
      name: key || t("nav.mySkills"),
      count,
      icon: getSourceIcon(key),
    })),
  ];
}, [skills, t]);
```

### 来源图标映射

```typescript
const SOURCE_ICONS: Record<string, string> = {
  "": "👤",
  "anthropic-official": "🏢",
  "awesome-copilot": "🌟",
};
function getSourceIcon(source: string): string {
  return SOURCE_ICONS[source] || "📦";
}
```

### 筛选逻辑修改（SkillGrid/SkillListView/SkillBrowsePage）

```typescript
// 现有：只按 selectedCategory 筛选
const categoryFiltered = selectedCategory
  ? skills.filter(s => s.category.toLowerCase() === selectedCategory.toLowerCase())
  : skills;

// 修改后：加来源筛选（互斥，两者不会同时有值）
let filtered = skills;
if (selectedCategory) {
  filtered = filtered.filter(s => s.category.toLowerCase() === selectedCategory.toLowerCase());
}
if (selectedSource !== null && selectedSource !== undefined) {
  if (selectedSource === "") {
    filtered = filtered.filter(s => !s.source);
  } else {
    filtered = filtered.filter(s => s.source === selectedSource);
  }
}
const filteredSkills = useSkillSearch(filtered, searchQuery);
```

### 不需要修改的文件

- `CategoryTree.tsx` — 零改动原则
- `skill-store.ts` — Story 2-1 已完成扩展
- `ViewTab.tsx` — Story 2-1 已完成

### References

- [Source: architecture-v2.md#AD-42] SourceTree 组件与筛选联动
- [Source: ux-design-specification-v2.md#SourceTree] SourceTree 组件规格
- [Source: src/components/skills/CategoryTree.tsx] 列表项样式参考

## Dev Agent Record

### Agent Model Used

claude-4.6-opus-1m-context

### Debug Log References

### Completion Notes List

- ✅ Task 1: 新建 SourceTree.tsx — 来源聚合 + 图标映射 + ARIA 无障碍
- ✅ Task 2: SecondarySidebar 集成 SourceTree 替换占位文本
- ✅ Task 3: SkillGrid/SkillListView/SkillBrowsePage 添加 selectedSource 筛选逻辑
- ✅ Task 4: i18n 翻译键（zh/en）
- ✅ Task 5: 11 个 SourceTree 单元测试
- ✅ Task 6: tsc 零错误；977/979 测试通过

### Change Log

- 2026-04-14: 新增 SourceTree 组件和来源筛选功能，实现「按来源」浏览维度

### File List

- src/components/skills/SourceTree.tsx（新建）
- src/components/layout/SecondarySidebar.tsx（修改）
- src/components/skills/SkillGrid.tsx（修改）
- src/components/skills/SkillListView.tsx（修改）
- src/pages/SkillBrowsePage.tsx（修改）
- src/i18n/locales/zh.ts（修改）
- src/i18n/locales/en.ts（修改）
- tests/unit/components/skills/SourceTree.test.tsx（新建）
