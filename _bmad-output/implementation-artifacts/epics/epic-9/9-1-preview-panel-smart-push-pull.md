# Story 9.1: 预览面板智能推拉式

Status: done

## Story

As a 用户,
I want 预览面板根据屏幕宽度自动切换 push/overlay 模式，点击卡片时平滑推入预览内容而非跳转页面,
So that 我可以在浏览 Skill 列表的同时无缝查看 Skill 详情，不丢失列表上下文。

## Acceptance Criteria

1. **Wide 断点（≥1440px）**：预览面板常驻显示在右侧（400px 宽），主内容区自动适配三栏布局，预览面板显示最后选中或第一个 Skill 的内容
2. **Standard 断点（1024-1439px）push 模式**：预览面板默认隐藏；点击 Skill 卡片后从右侧 push 推入（360px 宽），主内容区宽度自动收缩；推入动画 `translateX(0)` 200ms ease-in-out
3. **Standard 断点关闭**：点击关闭按钮或按 Escape 后预览面板向右滑出，主内容区恢复原宽度；滑出动画 `translateX(100%)` 200ms ease-in-out
4. **Compact 断点（<1024px）overlay 模式**：点击 Skill 卡片后预览面板以 overlay 模式从右侧滑入覆盖主内容区（100% 宽度，z-index: 50）；滑入动画 250ms ease-in-out
5. **内容切换过渡**：预览面板打开时点击另一张卡片，面板不关闭，内容切换有 opacity 1→0.3→1 过渡（150ms）
6. **快捷键 `⌘\`**：在 Standard/Compact 断点下切换预览面板显示/隐藏
7. **prefers-reduced-motion**：所有动画降级为无动画（瞬间切换）
8. **测试覆盖**：`getPreviewMode()` 函数有单元测试（覆盖三个断点）；SkillBrowsePage 在 Standard 断点下的 push 行为有集成测试；Compact 断点下的 overlay 行为有集成测试；所有测试通过

## Tasks / Subtasks

- [x] Task 1: 新增 CSS 变量和过渡样式 (AC: #2, #3, #4, #5, #7)
  - [x] 1.1 在 `src/index.css` 的 `:root` 中新增 `--preview-panel-width-std: 360px` 和 `--preview-transition-duration: 200ms`
  - [x] 1.2 新增 `.preview-panel` 过渡类：`transition: transform var(--preview-transition-duration) ease-in-out, opacity 150ms ease-in-out`
  - [x] 1.3 新增 `.preview-panel-hidden` 类：`transform: translateX(100%)`
  - [x] 1.4 新增 `.preview-panel-overlay` 类：`position: fixed; right: 0; top: 48px; bottom: 28px; z-index: 50; width: 100%`
  - [x] 1.5 新增 `.preview-content-switching` 类：`opacity: 0.3`（内容切换过渡）
  - [x] 1.6 确保 `@media (prefers-reduced-motion: reduce)` 覆盖所有新增过渡

- [x] Task 2: 创建 `usePreviewMode` Hook (AC: #1, #2, #4)
  - [x] 2.1 新建 `src/hooks/usePreviewMode.ts`
  - [x] 2.2 实现 `getPreviewMode(width: number): 'always' | 'push' | 'overlay'` 纯函数（≥1440→always, 1024-1439→push, <1024→overlay）
  - [x] 2.3 使用 `ResizeObserver` 监听容器宽度变化（不使用 `window.resize`）
  - [x] 2.4 返回 `{ previewMode, containerRef }` 供 AppLayout 使用

- [x] Task 3: 重构 `AppLayout.tsx` 预览面板逻辑 (AC: #1, #2, #3, #4, #6)
  - [x] 3.1 引入 `usePreviewMode` Hook，替换当前 `showPreview = isSkillBrowsePage` 硬编码逻辑
  - [x] 3.2 Wide 断点：预览面板始终渲染，使用 `--preview-width: 400px`
  - [x] 3.3 Standard 断点：预览面板始终渲染但默认 `translateX(100%)`，点击卡片后 `translateX(0)`；主内容区宽度通过 CSS `calc()` 自动收缩
  - [x] 3.4 Compact 断点：预览面板使用 overlay 模式（fixed 定位 + z-index: 50）
  - [x] 3.5 预览面板顶部添加关闭按钮（× Ghost 按钮），Wide 断点下隐藏
  - [x] 3.6 修改全局快捷键：移除 Space 切换预览面板，新增 `⌘\` 切换预览面板
  - [x] 3.7 保留 Escape 关闭预览面板（Standard/Compact 断点）

- [x] Task 4: 实现预览内容切换过渡 (AC: #5)
  - [x] 4.1 在 `SkillPreview.tsx` 中监听 `selectedSkillId` 变化
  - [x] 4.2 切换时先添加 `.preview-content-switching`（opacity: 0.3），150ms 后移除
  - [x] 4.3 确保首次加载不触发过渡效果

- [x] Task 5: 更新 `ui-store.ts` 预览状态管理 (AC: #2, #3)
  - [x] 5.1 确保 `previewOpen` 状态在 Standard/Compact 断点下正确控制面板显示
  - [x] 5.2 Wide 断点下 `previewOpen` 始终为 true（面板常驻）
  - [x] 5.3 点击同一卡片时关闭预览面板（Standard 断点）

- [x] Task 6: 单元测试 (AC: #8)
  - [x] 6.1 `getPreviewMode()` 纯函数测试：三个断点边界值（1023, 1024, 1439, 1440）
  - [x] 6.2 `usePreviewMode` Hook 测试：ResizeObserver mock
  - [x] 6.3 AppLayout 预览面板渲染测试：各断点下的 class 和 style 验证

## Dev Notes

### 当前代码分析（问题根因）

**`AppLayout.tsx`（第 30-33 行）** 当前逻辑：
```typescript
const isSkillBrowsePage = location.pathname === "/" || location.pathname.startsWith("/skills");
const showPreview = isSkillBrowsePage; // ← 问题：始终显示，无响应式行为
```
预览面板在 Skill 浏览页始终渲染，宽度固定 `var(--preview-width)` = 400px，无法关闭。

**`ui-store.ts`** 中 `previewOpen` 状态已定义但在 AppLayout 中未使用。`togglePreview` 方法存在但仅被 Space 键调用，且 Space 键语义与 UX 规范不一致。

### 关键实现约束

1. **不引入 Framer Motion**（AD-41）：所有动画使用 CSS `transform` + `transition`
2. **使用 `ResizeObserver`**（AD-41）：不使用 `window.resize` 事件监听
3. **CSS 变量驱动**：预览面板宽度通过 CSS 变量控制，不在 JS 中硬编码
4. **主内容区最小宽度 380px**（UX 规范）：Standard 断点下预览面板推入后，主内容区不得小于 380px

### 布局计算参考

| 断点 | 主内容区宽度 | 预览面板宽度 | 实现方式 |
|------|------------|------------|---------|
| Wide (≥1440) | `calc(100% - 240px - 400px - 间距)` | 400px 固定 | CSS flex 三栏 |
| Standard (1024-1439) 预览关闭 | `calc(100% - 240px - 间距)` | 0（隐藏） | CSS flex |
| Standard (1024-1439) 预览打开 | `calc(100% - 240px - 360px - 间距)` | 360px | CSS flex + transition |
| Compact (<1024) | 100% 不变 | 100% overlay | fixed 定位 |

### 现有文件清单（需修改）

| 文件 | 修改内容 |
|------|---------|
| `src/index.css` | 新增 CSS 变量、过渡类、overlay 类 |
| `src/components/layout/AppLayout.tsx` | 重构预览面板逻辑、快捷键修改 |
| `src/components/skills/SkillPreview.tsx` | 添加内容切换过渡效果 |
| `src/stores/ui-store.ts` | 可能需要调整 previewOpen 逻辑 |

### 新建文件清单

| 文件 | 说明 |
|------|------|
| `src/hooks/usePreviewMode.ts` | 响应式预览模式 Hook |
| `tests/unit/hooks/usePreviewMode.test.ts` | Hook 单元测试 |

### 防护栏：避免常见错误

1. **不要删除现有的 `animate-slide-in-preview` 动画**：它用于首次加载时的滑入效果，新的过渡类是叠加的
2. **不要修改 `SkillPreview.tsx` 的数据加载逻辑**：仅添加 opacity 过渡，不改变 `fetchSkillById` 调用
3. **不要修改 `Sidebar.tsx` 或 `SecondarySidebar.tsx`**：它们的宽度和行为不在本 Story 范围内
4. **不要使用 `window.innerWidth`**：使用 `ResizeObserver` 监听容器宽度
5. **保持 i18n 兼容**：关闭按钮的 `aria-label` 需使用 `t()` 函数
6. **保持现有测试通过**：`tests/unit/components/layout/AppLayout.test.tsx` 中的 mock 需要适配新的 Hook

### 快捷键变更说明

| 按键 | 当前行为 | 修改后行为 |
|------|---------|-----------|
| `Space`（非输入框） | 切换预览面板 | **移除**（Story 9.3 将改为"预览选中 Skill"） |
| `⌘\` | 无 | **新增**：切换预览面板显示/隐藏 |
| `Escape` | 无 | **新增**：关闭预览面板（Standard/Compact） |

### Project Structure Notes

- 项目使用 Tailwind CSS v4（`@import "tailwindcss"` 语法），CSS 变量定义在 `src/index.css` 的 `:root` 中
- 没有 `tailwind.config.ts` 文件，Tailwind v4 使用 CSS-first 配置
- 组件使用 shadcn/ui（基于 Radix），Button 组件路径 `src/components/ui/button.tsx`
- 状态管理使用 Zustand，store 文件在 `src/stores/` 目录
- 测试框架 Vitest + @testing-library/react，测试文件在 `tests/unit/` 目录

### References

- [Source: architecture-interaction-optimization.md#AD-41] 预览面板响应式推拉布局方案
- [Source: ux-design-specification-interaction-optimization.md#增补1] 预览面板三断点行为规格
- [Source: prd-ux-interaction-optimization.md#FR-UX-01~05] 预览面板功能需求
- [Source: ux-design-specification.md#布局适配] 主 UX 规范断点策略
- [Source: AppLayout.tsx] 当前布局实现
- [Source: ui-store.ts] 当前 UI 状态管理
- [Source: index.css] 当前 CSS 变量和动画定义

### Review Findings

- [x] [Review][Patch] 内容切换过渡定时器未清理 — `setTimeout` 在 effect cleanup 中未被清理，快速切换 Skill 时可能对已卸载组件调用 setState [SkillPreview.tsx:68-76] — ✅ 已修复
- [x] [Review][Patch] `prevSkillIdRef` 冗余赋值 — if 分支内和外各赋值一次，分支内的赋值是冗余的 [SkillPreview.tsx:75,77] — ✅ 已修复
- [x] [Review][Patch] 关闭按钮 `aria-label` 硬编码中文 — Dev Notes 要求使用 `t()` 函数，实际硬编码了 `"关闭预览"` [AppLayout.tsx:173] — ✅ 已修复
- [x] [Review][Patch] Escape 键与 CommandPalette 冲突 — 未检查 `commandPaletteOpen` 状态，两者同时打开时按 Escape 会同时触发 [AppLayout.tsx:89-98] — ✅ 已修复
- [x] [Review][Defer] HighlightText 每次渲染重新创建正则 [HighlightText.tsx:48-55] — deferred, 性能可接受，后续可用 useMemo 优化

## Dev Agent Record

### Agent Model Used

claude-4.6-opus-1m-context

### Completion Notes List

- ✅ Task 1: 在 `src/index.css` 新增 CSS 变量和过渡类
- ✅ Task 2: 新建 `src/hooks/usePreviewMode.ts`，实现 ResizeObserver 响应式 Hook
- ✅ Task 3: 重构 `AppLayout.tsx`，三断点预览面板（always/push/overlay）
- ✅ Task 4: `SkillPreview.tsx` 内容切换过渡（opacity 1→0.3→1）
- ✅ Task 5: `ui-store.ts` 无需修改，previewOpen 已在 AppLayout 中正确使用
- ✅ Task 6: 12 个单元测试全部通过，全量 981 个测试零回归

### File List

- `src/index.css` — 新增 CSS 变量和过渡类
- `src/hooks/usePreviewMode.ts` — 新建，响应式预览模式 Hook
- `src/components/layout/AppLayout.tsx` — 重构预览面板逻辑
- `src/components/skills/SkillPreview.tsx` — 添加内容切换过渡
- `tests/unit/hooks/usePreviewMode.test.ts` — 新建，12 个单元测试
