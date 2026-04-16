---
type: 'architecture-supplement'
status: 'approved'
author: 'Alex / Winston (Architect)'
date: '2026-04-15'
parentDocument: 'architecture.md'
relatedPRD: 'prd-ux-interaction-optimization.md'
relatedUXSpec: 'ux-design-specification-interaction-optimization.md'
decisionRange: 'AD-41 ~ AD-47'
---

# 架构决策增补 — 交互优化

**Author:** Alex / Winston (Architect)
**Date:** 2026-04-15
**类型:** 架构决策增补（AD-41 ~ AD-47）
**关联主架构:** `architecture.md`（AD-1 ~ AD-40）
**关联 PRD:** `prd-ux-interaction-optimization.md`
**关联 UX 规范:** `ux-design-specification-interaction-optimization.md`

---

## AD-41: 预览面板响应式推拉布局方案

**决策：** 预览面板采用 CSS `transform` + `transition` 实现三断点响应式推拉，不引入 Framer Motion 或其他动画库。

**理由：**

- 预览面板推拉仅需 `translateX` + `opacity` 两个属性过渡，CSS transition 完全胜任
- 项目现有架构未引入 Framer Motion（AD-1 技术栈决策），避免增加 ~30KB 包体积
- CSS transition 在所有目标浏览器（Chrome、Edge、Electron）中性能表现优异
- 主内容区宽度变化可通过 CSS `calc()` 配合 CSS 变量实现，无需 JS 监听

**实现方案：**

```typescript
// 新增 CSS 变量（tailwind.config.ts 扩展）
{
  previewPanelWidth: '400px',   // Wide 断点
  previewPanelWidthStd: '360px', // Standard 断点
  previewTransitionDuration: '200ms',
}

// 预览面板状态管理（SkillBrowsePage 组件内）
type PreviewMode = 'hidden' | 'push' | 'overlay';

const getPreviewMode = (width: number): PreviewMode => {
  if (width >= 1440) return 'push';   // Wide: 常驻
  if (width >= 1024) return 'push';   // Standard: push 模式
  return 'overlay';                    // Compact: overlay 模式
};
```

**布局计算：**

| 断点 | 主内容区宽度 | 预览面板宽度 | 实现方式 |
|------|------------|------------|---------|
| Wide (≥1440) | `calc(100% - 240px - 400px - 16px)` | 400px 固定 | CSS Grid 三栏 |
| Standard (1024-1439) | `calc(100% - 240px - 360px - 16px)` | 360px 固定 | CSS flex + transition |
| Compact (<1024) | 100% 不变 | 100% | CSS overlay + z-index |

**关键约束：**
- 不使用 `window.resize` 事件监听，改用 `ResizeObserver` 监听容器宽度
- 预览面板的 `transform` 动画在 `prefers-reduced-motion` 下降级为无动画

---

## AD-42: HighlightText 组件实现方案

**决策：** 自行实现轻量级 `HighlightText` 组件，不使用第三方高亮库（如 `react-highlight-words`）。

**理由：**

- 高亮需求简单：仅需在文本中标记搜索关键词，不涉及 HTML 安全渲染或复杂分词
- 自行实现约 30 行代码，引入第三方库增加 ~5KB 包体积不值得
- 可完全控制样式（使用 Tailwind class 而非第三方库的 CSS class）
- 便于后续扩展（如支持 i18n 中的多语言高亮）

**组件实现：**

```typescript
// src/components/shared/HighlightText.tsx
interface HighlightTextProps {
  text: string;       // 原始文本
  query: string;      // 搜索关键词（空格分隔多关键词）
  className?: string; // 容器样式
}

// 核心逻辑：
// 1. query 为空 → 返回纯文本
// 2. 将 query 按空格拆分为关键词数组
// 3. 构建正则：new RegExp(`(${keywords.join('|')})`, 'gi')
// 4. text.split(regex) → 片段数组
// 5. 匹配片段包裹 <mark className="bg-green-500/20 text-green-400 rounded px-0.5">
```

**正则安全处理：**
- 关键词中的正则特殊字符需转义：`keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`
- 超长关键词（>50 字符）截断处理，避免 ReDoS 风险

**应用范围：**
- `SkillCard` 的 `name` 和 `description`
- Command Palette 搜索结果

---

## AD-43: 键盘焦点导航（Roving Tabindex）架构

**决策：** Skill 卡片网格使用自定义 `useRovingFocus` Hook 实现 roving tabindex 模式，不使用第三方 `@react-aria/focus` 库。

**理由：**

- 项目使用 shadcn/ui（基于 Radix），但 Radix 的 `RovingFocusGroup` 仅适用于单维列表，不适合二维网格
- 自定义 Hook 约 60 行代码，可精确控制网格导航逻辑（J/K 按视觉行列方向移动）
- 与现有键盘快捷键体系（AD-9 已定义全局快捷键）解耦，互不干扰

**Hook 设计：**

```typescript
// src/hooks/useRovingFocus.ts
interface UseRovingFocusOptions {
  itemCount: number;         // 卡片总数
  columnsPerRow: number;     // 每行列数（响应式计算）
  isActive: boolean;         // 是否激活（页面可见且搜索框未聚焦）
}

interface UseRovingFocusReturn {
  focusedIndex: number;      // 当前聚焦卡片索引
  setFocusedIndex: (i: number) => void;
  getCardProps: (index: number) => {
    tabIndex: number;        // 0 或 -1
    onKeyDown: (e: KeyboardEvent) => void;
    onClick: () => void;
  };
}
```

**导航方向映射：**

| 按键 | 行为 | 计算 |
|------|------|------|
| `J` | 下一张 | `focusedIndex + 1`（列表）或 `focusedIndex + columnsPerRow`（网格，超出时 +1） |
| `K` | 上一张 | `focusedIndex - 1`（列表）或 `focusedIndex - columnsPerRow`（不足时 -1） |
| `Enter` | 打开预览 | 调用 `selectSkill()` |
| `Space` | 预览选中 Skill | 调用 `selectSkill()` + 打开预览面板 |

**列数计算：**
- 使用 `ResizeObserver` 监听网格容器宽度
- `columnsPerRow = Math.floor(containerWidth / cardWidth)`
- 卡片宽度固定为 280px（含间距）

**作用域控制：**
- `isActive` 由页面路由和搜索框焦点状态共同决定
- 搜索框聚焦时，J/K 不触发卡片导航
- 页面切换时重置 `focusedIndex` 为 0

---

## AD-44: 右键上下文菜单架构

**决策：** 使用 shadcn/ui `ContextMenu` 组件，菜单操作通过现有服务层函数调用。

**理由：**

- shadcn/ui `ContextMenu` 已在项目依赖中（基于 Radix `ContextMenu`），无需额外引入
- 菜单项操作复用现有服务层（`skillService`、`syncService`），无新 API 需求
- 与 SkillCard 组件解耦，通过 `onContextMenu` prop 传入 skillId

**组件结构：**

```typescript
// src/components/skills/SkillContextMenu.tsx
interface SkillContextMenuProps {
  skillId: string;
  skillName: string;
  skillPath: string;
  isReadonly: boolean;
  children: React.ReactNode; // 触发区域（SkillCard）
}

// 菜单项操作映射：
// 编辑元数据 → 打开 EditMetadataDialog（现有组件）
// 同步到 IDE → 调用 syncService.syncSkill(id, target)
// 复制路径 → navigator.clipboard.writeText(path)
// 删除 → 打开 ConfirmDeleteDialog（现有组件）
```

**与 SkillCard 集成：**

```typescript
// SkillCard.tsx 改动
<SkillContextMenu skillId={skill.id} skillName={skill.name} skillPath={skill.path} isReadonly={skill.readonly}>
  <div className="skill-card ...">
    {/* 现有卡片内容 */}
  </div>
</SkillContextMenu>
```

**只读 Skill 菜单处理：**
- 只读 Skill 的菜单中隐藏"编辑元数据"和"删除"项
- 保留"同步到 IDE"和"复制路径"项

---

## AD-45: 同步流程渐进引导状态管理

**决策：** 同步流程状态使用 React `useReducer` 管理，不引入新的全局状态（Zustand store）。

**理由：**

- 同步流程状态是临时的 UI 状态，仅在同步操作期间存在，不需要全局共享
- `useReducer` 提供清晰的状态机模型，适合多步骤流程（摘要确认 → 执行中 → 完成/失败）
- 现有 `useSync` Hook 已包含同步逻辑，在其基础上扩展即可

**状态机设计：**

```typescript
// src/hooks/useSyncFlow.ts（扩展现有 useSync）
type SyncFlowState =
  | { phase: 'idle' }
  | { phase: 'summary'; targetCount: number; skillCount: number; conflictCount: number; conflicts: ConflictItem[] }
  | { phase: 'syncing'; completed: number; total: number; failedItems: FailedItem[] }
  | { phase: 'completed'; completed: number; total: number; failedItems: FailedItem[] }
  | { phase: 'error'; error: string };

type SyncFlowAction =
  | { type: 'START_SUMMARY'; payload: { targets: SyncTarget[]; skills: Skill[] } }
  | { type: 'CONFIRM_SYNC' }
  | { type: 'PROGRESS'; payload: { completed: number } }
  | { type: 'ITEM_FAILED'; payload: { skillId: string; skillName: string; error: string } }
  | { type: 'ITEM_RETRY_SUCCESS'; payload: { skillId: string } }
  | { type: 'COMPLETE' }
  | { type: 'ERROR'; payload: { error: string } }
  | { type: 'RESET' };
```

**同步摘要预计算：**
- "开始同步"按钮点击 → 先执行 `syncService.previewSync(targets)` 获取摘要数据
- 摘要包括：目标列表、Skill 数量、同名文件冲突列表
- 用户确认后执行 `syncService.executeSync(targets)`

**失败重试机制：**
- 重试仅针对单个 Skill：`syncService.syncSkill(skillId, target)`
- 重试成功后从 `failedItems` 移除，`completed` 计数 +1
- 最多允许 3 次重试，超过后显示"请联系管理员"

---

## AD-46: 面包屑组件与筛选路径追踪

**决策：** 面包屑组件作为独立 UI 组件，数据源来自 URL 查询参数（`?category=xxx&source=yyy`）。

**理由：**

- 面包屑与 URL 同步确保：刷新页面后面包屑状态不丢失、前进后退按钮正常工作
- 不需要新增 Zustand store，复用现有 `useSearchParams`（React Router）
- 面包屑层级从 URL 参数解析，无需维护额外的状态

**组件设计：**

```typescript
// src/components/shared/FilterBreadcrumb.tsx
interface BreadcrumbItem {
  label: string;      // 显示文本
  param: string;      // URL 参数名（category / source）
  value: string;      // URL 参数值
}

// 数据流：
// URL ?category=coding&source=local
// → 解析为面包屑：[全部 > coding > 来源: local]
// → 点击 "coding" → 设置 ?category=coding（移除 source）
// → 点击 "全部" → 清除所有筛选参数
```

**与现有筛选逻辑集成：**
- 面包屑读取当前 `searchParams`，与 SkillBrowsePage 的筛选逻辑共用数据源
- 点击面包屑通过 `setSearchParams()` 修改 URL，触发现有筛选逻辑重新计算
- × 清除按钮 = `setSearchParams({})` 清除所有参数

**布局位置：**
- 位于工具栏标题下方、卡片网格上方
- 仅在有筛选条件时显示（`searchParams.size > 0`）

---

## AD-47: 列表过渡动效方案

**决策：** 优先使用 CSS transition 实现列表过渡动效，不引入 Framer Motion。若 CSS 方案无法满足需求，再评估引入。

**理由：**

- 当前动效需求简单：分类切换时的卡片淡入（opacity + translateY），CSS transition 完全胜任
- Framer Motion 增加 ~30KB gzipped 包体积，对于 2-3 个简单过渡动效性价比低
- CSS transition 性能更优（浏览器原生优化），不依赖 JS 运行时
- 项目现有架构明确使用 CSS transition（AD-1 技术栈决策，未列出 Framer Motion）

**实现方案：**

```css
/* src/index.css 新增 */
.skill-grid-item {
  transition: opacity 150ms ease-in-out, transform 150ms ease-in-out;
}

.skill-grid-item[data-entering="true"] {
  opacity: 0;
  transform: translateY(8px);
}

.skill-grid-item[data-entering="false"] {
  opacity: 1;
  transform: translateY(0);
}

/* prefers-reduced-motion 降级 */
@media (prefers-reduced-motion: reduce) {
  .skill-grid-item {
    transition: none;
  }
}
```

**React 集成：**

```typescript
// SkillGrid 组件内
const [enteringIds, setEnteringIds] = useState<Set<string>>(new Set());

// 筛选条件变化时
useEffect(() => {
  const newIds = new Set(filteredSkills.map(s => s.id));
  setEnteringIds(newIds);
  const timer = setTimeout(() => setEnteringIds(new Set()), 150); // 动画完成后移除
  return () => clearTimeout(timer);
}, [categoryFilter, sourceFilter, searchQuery]);
```

**预览面板内容过渡：**
- 切换 Skill 时内容 opacity: 1 → 0.3 → 1（150ms）
- 不使用完全淡出，避免内容闪烁
- 实现：`useState` 控制 `opacity` class，`useEffect` 在 skillId 变化时触发

**升级路径：**
- 若后续需要 FLIP 动画（位置过渡）或 `AnimatePresence`（卸载动画），再引入 Framer Motion
- 引入时需更新 AD-1 技术栈决策文档

---

## 架构一致性验证

| 验证项 | 结果 | 说明 |
|--------|------|------|
| 技术栈一致性 | ✅ | 所有决策基于现有技术栈（React + shadcn/ui + Tailwind + CSS transition） |
| 命名规范 | ✅ | 新增组件 PascalCase、Hook camelCase、CSS class kebab-case |
| 无新增依赖 | ✅ | 仅新增自行实现的组件和 Hook，不引入第三方库 |
| 状态管理一致 | ✅ | useReducer + useSearchParams，与现有模式一致 |
| 与现有架构解耦 | ✅ | 新增功能通过 props 和现有服务层集成，不修改核心架构 |
| 性能考量 | ✅ | ResizeObserver 替代 resize 事件、CSS transition 替代 JS 动画 |
| 无障碍 | ✅ | roving tabindex、aria-label、prefers-reduced-motion 降级 |
| 向后兼容 | ✅ | 所有新增功能可选，不影响现有功能 |

---

## 受影响的现有架构决策

| 现有决策 | 影响说明 |
|---------|---------|
| AD-1（技术栈） | 确认不引入 Framer Motion，维持 CSS transition 方案 |
| AD-9（全局快捷键） | 补充 J/K/Delete 键绑定和 Space 键语义修正 |
| AD-11（组件架构） | 新增 HighlightText、SkillContextMenu、FilterBreadcrumb 组件 |

---

_增补日期：2026-04-15_
_增补人：Alex / Winston (Architect Agent)_
_关联文档：architecture.md, prd-ux-interaction-optimization.md, ux-design-specification-interaction-optimization.md_
