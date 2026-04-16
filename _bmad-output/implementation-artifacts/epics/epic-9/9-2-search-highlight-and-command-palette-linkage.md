# Story 9.2: 搜索关键词高亮 + Command Palette 联动

Status: done

## Story

As a 用户,
I want 搜索时关键词在卡片名称和描述中高亮显示，且从 ⌘K 选中 Skill 后页面自动筛选定位到该 Skill,
So that 我能快速定位搜索匹配内容，不再迷失在无高亮的全量列表中。

## Acceptance Criteria

1. **搜索高亮**：用户在搜索框输入关键词后，每张匹配卡片的名称和描述中，关键词片段以 `bg-green-500/20 text-green-400 rounded px-0.5` 样式高亮显示，不区分大小写
2. **多关键词高亮**：用户输入多个关键词（空格分隔），每个关键词分别高亮
3. **匹配计数**：搜索框右侧显示匹配计数（如 `12/35`），样式 `text-xs text-slate-500`；零匹配时文字变红 `text-red-400`
4. **无障碍播报**：匹配计数变化时通过 `aria-live="polite"` 播报"找到 N 个匹配的 Skill"
5. **Command Palette 联动**：⌘K 选中 Skill 后，同步设置页面搜索框 `searchQuery` 为该 Skill 名称，主内容区展示筛选结果，预览面板展示该 Skill 内容，Skill 名称在卡片中高亮
6. **Command Palette 页面跳转**：⌘K 选中页面导航项后，搜索框内容清空
7. **空搜索**：搜索框为空时不显示高亮，不显示匹配计数
8. **测试覆盖**：`HighlightText` 组件有单元测试（单关键词、多关键词、大小写、空查询、特殊字符）；Command Palette 选中 Skill 后的搜索联动有集成测试；匹配计数的 aria-live 行为有可访问性测试；所有测试通过

## Tasks / Subtasks

- [x] Task 1: 创建 `HighlightText` 组件 (AC: #1, #2, #7)
  - [x] 1.1 新建 `src/components/shared/HighlightText.tsx`
  - [x] 1.2 实现 Props 接口：`{ text: string; query: string; className?: string }`
  - [x] 1.3 核心逻辑：query 为空 → 返回纯文本；按空格拆分关键词 → 构建正则 `new RegExp(\`(${keywords.join('|')})\`, 'gi')` → `text.split(regex)` → 匹配片段包裹 `<mark>`
  - [x] 1.4 正则安全处理：关键词中特殊字符转义 `keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`
  - [x] 1.5 超长关键词（>50 字符）截断处理，防止 ReDoS
  - [x] 1.6 高亮样式：`<mark className="bg-green-500/20 text-green-400 rounded px-0.5">`

- [x] Task 2: 集成 HighlightText 到 SkillCard (AC: #1, #2)
  - [x] 2.1 修改 `src/components/skills/SkillCard.tsx`：从 `useSkillStore` 获取 `searchQuery`
  - [x] 2.2 将 `{skill.name}` 替换为 `<HighlightText text={skill.name} query={searchQuery} />`
  - [x] 2.3 将 `{skill.description || t("common.noDescription")}` 替换为 `<HighlightText text={skill.description || t("common.noDescription")} query={searchQuery} />`

- [x] Task 3: 搜索匹配计数 (AC: #3, #4, #7)
  - [x] 3.1 修改 `src/pages/SkillBrowsePage.tsx`：在搜索框右侧添加匹配计数
  - [x] 3.2 计数格式：`{filteredSkills.length}/{totalSkills}` 其中 totalSkills = categorySourceFiltered.length（分类筛选后的总数）
  - [x] 3.3 样式：有搜索词时显示，`text-xs text-slate-500`；零结果时 `text-red-400`
  - [x] 3.4 添加 `aria-live="polite"` 区域，播报文本使用 i18n key

- [x] Task 4: Command Palette 搜索联动 (AC: #5, #6)
  - [x] 4.1 修改 `src/components/shared/CommandPalette.tsx` 的 `handleSelectSkill` 回调
  - [x] 4.2 在 `selectSkill(skillId)` 后新增 `setSearchQuery(skill.name)` 调用（需从 skills 数组中找到对应 skill）
  - [x] 4.3 修改 `handleSelectPage` 回调：新增 `setSearchQuery("")` 清空搜索
  - [x] 4.4 从 `useSkillStore` 解构 `setSearchQuery`

- [x] Task 5: 添加 i18n 翻译 (AC: #4)
  - [x] 5.1 在 `src/i18n/locales/zh.ts` 添加搜索计数相关翻译 key
  - [x] 5.2 在 `src/i18n/locales/en.ts` 添加对应英文翻译

- [x] Task 6: 单元测试 (AC: #8)
  - [x] 6.1 新建 `tests/unit/components/shared/HighlightText.test.tsx`
  - [x] 6.2 测试用例：单关键词高亮、多关键词高亮、大小写不敏感、空查询返回纯文本、特殊字符安全、超长关键词截断
  - [x] 6.3 Command Palette 联动测试：选中 Skill 后 searchQuery 被设置
  - [x] 6.4 匹配计数 aria-live 测试

## Dev Notes

### 当前代码分析

**`SkillCard.tsx`（第 73-78 行）** 当前直接渲染文本：
```typescript
<h3 data-testid="skill-name" className="...">
  {skill.name}
</h3>
<p data-testid="skill-description" className="...">
  {skill.description || t("common.noDescription")}
</p>
```
需要替换为 `<HighlightText>` 组件包裹。

**`CommandPalette.tsx`（第 74-80 行）** 当前 `handleSelectSkill`：
```typescript
const handleSelectSkill = useCallback(
  (skillId: string) => {
    selectSkill(skillId);
    setCommandPaletteOpen(false);
    navigate("/");
  },
  [selectSkill, setCommandPaletteOpen, navigate],
);
```
需要新增 `setSearchQuery(skill.name)` 调用。注意：需要从 `skills` 数组中通过 `skillId` 找到对应的 `skill.name`。

**`SkillBrowsePage.tsx`（第 25-60 行）** 搜索框区域：
```typescript
const filteredSkills = useSkillSearch(categorySourceFiltered, searchQuery);
```
`filteredSkills.length` 和 `categorySourceFiltered.length` 可直接用于计数显示。

### 关键实现约束

1. **不引入第三方高亮库**（AD-42）：自行实现 `HighlightText` 组件（约 30 行代码）
2. **正则安全**：关键词中的正则特殊字符必须转义，超长关键词截断
3. **性能**：高亮渲染不得影响 Skill 列表加载性能（< 200ms，500 Skill 规模）
4. **i18n 兼容**：所有新增文本使用 `t()` 函数

### HighlightText 组件实现参考（AD-42）

```typescript
// src/components/shared/HighlightText.tsx
interface HighlightTextProps {
  text: string;
  query: string;
  className?: string;
}

export default function HighlightText({ text, query, className }: HighlightTextProps) {
  if (!query.trim()) return <span className={className}>{text}</span>;

  // 按空格拆分关键词，转义特殊字符，截断超长关键词
  const keywords = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(kw => kw.length > 50 ? kw.slice(0, 50) : kw)
    .map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (keywords.length === 0) return <span className={className}>{text}</span>;

  const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-green-500/20 text-green-400 rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}
```

**⚠️ 注意**：`regex.test()` 会改变 `lastIndex`，需要在每次 `parts.map` 迭代前重置，或改用 `keywords.some(kw => part.toLowerCase().includes(kw.toLowerCase()))` 判断。

### 现有文件清单（需修改）

| 文件 | 修改内容 |
|------|---------|
| `src/components/skills/SkillCard.tsx` | 引入 HighlightText，替换 name 和 description 渲染 |
| `src/components/shared/CommandPalette.tsx` | handleSelectSkill 新增 setSearchQuery，handleSelectPage 清空搜索 |
| `src/pages/SkillBrowsePage.tsx` | 搜索框右侧添加匹配计数 + aria-live |
| `src/i18n/locales/zh.ts` | 新增搜索计数翻译 key |
| `src/i18n/locales/en.ts` | 新增搜索计数翻译 key |

### 新建文件清单

| 文件 | 说明 |
|------|------|
| `src/components/shared/HighlightText.tsx` | 搜索关键词高亮组件 |
| `tests/unit/components/shared/HighlightText.test.tsx` | 高亮组件单元测试 |

### 防护栏：避免常见错误

1. **不要修改 `useSkillSearch` Hook**：高亮是纯展示层逻辑，搜索过滤逻辑不变
2. **不要在 HighlightText 中使用 `dangerouslySetInnerHTML`**：使用 React 元素数组渲染，避免 XSS
3. **不要修改 SkillCard 的 `data-testid` 属性**：现有测试依赖这些 testid
4. **不要修改 SkillCard 的 `line-clamp-1` 和 `line-clamp-2` 样式**：HighlightText 的 `<span>` 和 `<mark>` 是内联元素，不影响截断
5. **regex.test() 的 lastIndex 陷阱**：使用全局正则 `g` 标志时，`test()` 会改变 `lastIndex`，建议改用 `match()` 或重新创建正则
6. **CommandPalette 中获取 skill.name**：`handleSelectSkill` 接收的是 `skillId`，需要从 `skills` 数组中 `find` 对应的 skill 来获取 name
7. **保持现有测试通过**：SkillCard 测试中可能直接检查文本内容，HighlightText 包裹后文本仍然可见

### Project Structure Notes

- 项目使用 Tailwind CSS v4，`bg-green-500/20` 等 opacity 修饰符语法已支持
- `useSkillSearch` Hook 使用 Fuse.js 进行模糊搜索，位于 `src/hooks/useSkillSearch.ts`
- `useFilteredSkills` Hook 负责分类/来源筛选，位于 `src/hooks/useFilteredSkills.ts`
- i18n 使用 react-i18next，翻译文件在 `src/i18n/locales/` 目录

### References

- [Source: architecture-interaction-optimization.md#AD-42] HighlightText 组件实现方案
- [Source: ux-design-specification-interaction-optimization.md#增补2] 搜索高亮与 Command Palette 联动规格
- [Source: prd-ux-interaction-optimization.md#FR-UX-06~08] 搜索体验增强功能需求
- [Source: SkillCard.tsx] 当前卡片渲染实现
- [Source: CommandPalette.tsx] 当前 Command Palette 实现
- [Source: SkillBrowsePage.tsx] 当前搜索框和筛选逻辑

### Review Findings

- [x] [Review][Defer] HighlightText 每次渲染重新创建正则 [HighlightText.tsx:48-55] — deferred, 性能可接受，后续可用 useMemo 优化

## Dev Agent Record

### Agent Model Used

claude-4.6-opus-1m-context

### Completion Notes List

- ✅ Task 1: 新建 `HighlightText.tsx` 组件，支持多关键词、大小写不敏感、正则安全、超长截断
- ✅ Task 2: 在 `SkillCard.tsx` 中集成 HighlightText，替换 name 和 description 渲染
- ✅ Task 3: 在 `SkillBrowsePage.tsx` 搜索框右侧添加匹配计数 + aria-live 播报
- ✅ Task 4: 修改 `CommandPalette.tsx`，选中 Skill 后同步 searchQuery，页面跳转时清空
- ✅ Task 5: 在 zh.ts 和 en.ts 中添加 `searchMatchCount` 翻译 key
- ✅ Task 6: 15 个单元测试全部通过，全量 996 个测试零回归

### File List

- `src/components/shared/HighlightText.tsx` — 新建，搜索关键词高亮组件
- `src/components/skills/SkillCard.tsx` — 集成 HighlightText
- `src/pages/SkillBrowsePage.tsx` — 添加搜索匹配计数
- `src/components/shared/CommandPalette.tsx` — 搜索联动
- `src/i18n/locales/zh.ts` — 新增翻译 key
- `src/i18n/locales/en.ts` — 新增翻译 key
- `tests/unit/components/shared/HighlightText.test.tsx` — 新建，15 个单元测试
