# Story 9.5: 面包屑与过渡动效

Status: done

## Story

As a 用户,
I want 看到当前筛选路径的面包屑导航，切换分类时卡片有平滑的淡入过渡,
So that 我时刻清楚当前浏览位置，分类切换不再有视觉跳跃感。

## Acceptance Criteria

1. **面包屑层级显示**：选择分类筛选时显示 `全部 > coding`，"全部"可点击回退（`text-slate-400 hover:text-green-400 cursor-pointer`），"coding"为当前层级（`text-slate-200 font-medium`），层级间用 `>` 分隔（`text-slate-500`）
2. **面包屑三层级**：选择分类+来源时显示 `全部 > coding > 来源: local`，点击"coding"退回仅按 coding 筛选，点击"全部"清除所有筛选
3. **面包屑 × 清除**：右侧 × 按钮清除所有筛选条件，回到"全部"视图，面包屑隐藏
4. **无筛选时隐藏**：没有任何筛选条件时面包屑不显示
5. **列表过渡动效**：切换分类时每张卡片执行淡入动画 opacity 0→1 + translateY 8px→0，150ms ease-in-out，使用 `data-entering` 属性控制
6. **减少动画偏好**：`prefers-reduced-motion` 下所有动画降级为无动画（瞬间切换）
7. **URL 参数同步**：URL 中直接输入筛选参数（如 `?category=coding&source=local`）时面包屑正确显示，刷新后状态保持
8. **浏览器前进/后退**：URL 参数变化时面包屑正确更新
9. **测试覆盖**：`FilterBreadcrumb` 组件有单元测试（层级解析、点击回退、清除筛选）；URL 参数与面包屑同步有集成测试；过渡动效 CSS class 切换有组件测试；所有测试通过

## Tasks / Subtasks

- [x] Task 1: 创建 `FilterBreadcrumb` 组件 (AC: #1, #2, #3, #4)
  - [x] 1.1 新建 `src/components/shared/FilterBreadcrumb.tsx`
  - [x] 1.2 从 `useSkillStore` 读取 `selectedCategory` / `selectedSource`
  - [x] 1.3 构建面包屑层级：`全部 > 分类名` / `全部 > 分类名 > 来源: xxx` / `全部 > 来源: xxx`
  - [x] 1.4 点击"全部"清除所有筛选；点击分类层级清除来源；点击来源层级无操作（当前项）
  - [x] 1.5 × 清除按钮调用 `setCategory(null)` + `setSource(null)`
  - [x] 1.6 无筛选条件时不渲染
  - [x] 1.7 nav `aria-label` 为"筛选路径"语义

- [x] Task 2: 实现列表过渡动效 (AC: #5, #6)
  - [x] 2.1 `SkillGrid.tsx` 中添加 `entering` 状态，分类/来源/搜索变化时触发
  - [x] 2.2 卡片包裹 `skill-grid-item` CSS class + `data-entering` 属性
  - [x] 2.3 CSS: `.skill-grid-item[data-entering]` → opacity 0, translateY 8px
  - [x] 2.4 CSS: `.skill-grid-item:not([data-entering])` → opacity 1, translateY 0
  - [x] 2.5 transition 150ms ease-in-out
  - [x] 2.6 `prefers-reduced-motion` 下降级

- [x] Task 3: URL 参数同步 (AC: #7, #8)
  - [x] 3.1 复用 `useSyncSearchParams` Hook（已有）
  - [x] 3.2 URL 参数变化触发 store 更新，面包屑自动同步

- [x] Task 4: 添加 i18n 翻译 (AC: #1, #2, #3)
  - [x] 4.1 在 `zh.ts` 添加面包屑翻译 key（`breadcrumbAll`, `breadcrumbSource`, `breadcrumbClearFilter`, `breadcrumbNavLabel`）
  - [x] 4.2 在 `en.ts` 添加对应英文翻译

- [x] Task 5: 单元测试 (AC: #9)
  - [x] 5.1 `FilterBreadcrumb.test.tsx`：渲染条件、层级内容、点击交互、三层级逻辑、样式、无障碍
  - [x] 5.2 SkillGrid 过渡动效组件测试：`data-entering` 属性切换
  - [x] 5.3 URL + 面包屑集成测试：`useSyncSearchParams.test.ts`

## Dev Notes

### 面包屑层级逻辑

```
无筛选 → 不渲染
仅分类 → 全部 > Coding (isCurrent=true)
仅来源 → 全部 > 来源: local (isCurrent=true)
分类+来源 → 全部 > Coding (isCurrent=false, 可点击) > 来源: local (isCurrent=true)
```

点击行为：
- 点击"全部"→ 清除所有（`setCategory(null)`）
- 点击分类层级（三层级时）→ 仅清除来源（`setSource(null)`）
- 点击分类层级（两层级时）→ 清除分类（`setCategory(null)`）
- 当前层级（isCurrent=true）→ span 不可点击
- × 清除按钮 → 清除所有

### 过渡动效实现

使用双 `requestAnimationFrame` 确保 `data-entering` 属性先设置后移除，触发 CSS transition：

```typescript
const [entering, setEntering] = useState(false);
useEffect(() => {
  setEntering(true);
  const raf = requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setEntering(false);
    });
  });
  return () => cancelAnimationFrame(raf);
}, [selectedCategory, selectedSource, searchQuery]);
```

### 现有文件清单（需修改）

| 文件 | 修改内容 |
|------|---------|
| `src/components/shared/FilterBreadcrumb.tsx` | 修复 onClick 逻辑 + aria-label 语义 |
| `src/i18n/locales/zh.ts` | 新增 `breadcrumbNavLabel` 翻译 |
| `src/i18n/locales/en.ts` | 新增 `breadcrumbNavLabel` 翻译 |

### 新建文件清单

| 文件 | 说明 |
|------|------|
| `tests/unit/components/skills/SkillGrid.test.tsx` | 过渡动效组件测试 |

### 防护栏：避免常见错误

1. **不要在面包屑中直接操作 URL**：数据源来自 `useSkillStore`，URL 同步由 `useSyncSearchParams` 处理
2. **不要引入 Framer Motion**：过渡动效使用 CSS transition（AD-47）
3. **分类+来源三层级时，点击分类层级仅清除来源**：不要错误清除分类
4. **`aria-label` 应描述导航用途**：nav 的 aria-label 为"筛选路径"，清除按钮的 aria-label 为"清除筛选"

### Project Structure Notes

- 面包屑组件在 `src/components/shared/FilterBreadcrumb.tsx`
- URL 参数同步 Hook 在 `src/hooks/useSyncSearchParams.ts`
- 过渡动效样式在 `src/index.css` 的 `.skill-grid-item` 和 `.preview-content-*` 规则
- 预览面板内容过渡在 `SkillPreview.tsx`（`contentSwitching` 状态 + CSS class 切换）

### References

- [Source: architecture-interaction-optimization.md#AD-46] 面包屑组件与筛选路径追踪
- [Source: architecture-interaction-optimization.md#AD-47] 列表过渡动效方案
- [Source: prd-ux-interaction-optimization.md#FR-UX-17~20] 面包屑与过渡动效功能需求
- [Source: ux-design-specification-interaction-optimization.md#UX-DR5] 面包屑与过渡动效 UX 规范
- [Source: useSyncSearchParams.ts] URL 参数同步 Hook

## Dev Agent Record

### Agent Model Used

claude-4.6-opus-1m-context

### Completion Notes List:

- ✅ Task 1: 修复 `FilterBreadcrumb.tsx` onClick 逻辑（三层级时点击分类仅清除来源）
- ✅ Task 1: 修复 nav `aria-label` 语义（"筛选路径"而非"清除筛选"）
- ✅ Task 4: 在 zh.ts 和 en.ts 中添加 `breadcrumbNavLabel` 翻译 key
- ✅ Task 5.1: 更新 `FilterBreadcrumb.test.tsx`，新增三层级测试、修复 onClick 测试、修复 aria-label 测试
- ✅ Task 5.2: 新建 `SkillGrid.test.tsx` 过渡动效组件测试（4 个测试用例）
- ✅ Task 5.3: 新建 `breadcrumb-url-sync.test.tsx` 集成测试（10 个测试用例）

### QA Results

- **Unit Tests**: 88 test files, 1085 test cases — ALL PASSED ✅
- **TypeScript**: `tsc --noEmit` — zero errors ✅
- **New Test Coverage**:
  - `FilterBreadcrumb.test.tsx`: 20 test cases (层级渲染、点击回退、三层级逻辑、aria-label、清除筛选)
  - `SkillGrid.test.tsx`: 4 test cases (CSS class、data-entering 属性、Grid 布局、role=grid)
  - `breadcrumb-url-sync.test.tsx`: 10 test cases (面包屑点击→store 更新、三层级交互、URL→面包屑显示)

### File List

- `src/components/shared/FilterBreadcrumb.tsx` — 修复 onClick 逻辑 + aria-label 语义
- `src/i18n/locales/zh.ts` — 新增 `breadcrumbNavLabel: "筛选路径"`
- `src/i18n/locales/en.ts` — 新增 `breadcrumbNavLabel: "Filter Path"`
- `tests/unit/components/shared/FilterBreadcrumb.test.tsx` — 更新测试（20 cases）
- `tests/unit/components/skills/SkillGrid.test.tsx` — 新建过渡动效测试（4 cases）
- `tests/unit/integration/breadcrumb-url-sync.test.tsx` — 新建集成测试（10 cases）
