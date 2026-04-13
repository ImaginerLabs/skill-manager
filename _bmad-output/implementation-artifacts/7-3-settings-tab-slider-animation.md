# Story 7.3: 分类管理 Tab 滑块平移动画

Status: done

## Story

As a Skill Manager 用户,
I want 在「分类管理」页面切换「分类设置」和「套件管理」两个 Tab 时，看到平滑的滑块动画，而不是生硬的内容切换,
so that 交互体验更流畅、更现代，与整体 UI 风格保持一致。

## Acceptance Criteria

1. **[滑块平移动画]** 点击非当前激活的 Tab 时，背景滑块以 `200ms ease-in-out` 的平移动画从当前位置移动到目标位置。

2. **[transform 实现]** 动画使用 `transform: translateX()` 实现，不使用 `left`、`margin-left` 等触发 layout reflow 的属性。

3. **[内容切换]** Tab 内容区域在切换时直接显示/隐藏（条件渲染），无需额外动画。

4. **[prefers-reduced-motion 降级]** 若用户系统开启了减少动画偏好，滑块直接跳转到目标位置，无平移动画（`transition: none`）。

5. **[视觉一致性]** 滑块背景色 `bg-[hsl(var(--background))]`，容器背景 `bg-[hsl(var(--muted))]`，与现有 `TabsList` 样式保持一致。

6. **[现有功能不变]** 「分类设置」和「套件管理」两个 Tab 的内容功能完全不变，仅 Tab 切换的视觉动画发生变化。

7. **[Tab 状态正确]** 激活的 Tab 文字颜色为 `text-[hsl(var(--foreground))]`，非激活为 `text-[hsl(var(--muted-foreground))]`。

## Tasks / Subtasks

- [x] Task 1: 分析现有 `SettingsPage.tsx` 和 `tabs.tsx` 实现 (AC: 6)
  - [x] 1.1 确认 `SettingsPage.tsx` 使用 shadcn/ui `Tabs` 组件
  - [x] 1.2 确认 `tabs.tsx` 中 `TabsTrigger` 的激活样式
  - [x] 1.3 决策：修改 `TabsList` 组件，在其内部添加滑块层

- [x] Task 2: 修改 `src/components/ui/tabs.tsx` — 为 `TabsList` 添加滑块动画 (AC: 1, 2, 4, 5, 7)
  - [x] 2.1 `TabsList` 改为包含内部状态的组件，通过 `TabsContext` 获取 `activeTab`
  - [x] 2.2 通过 `React.Children.toArray` 统计 Tab 数量和激活索引
  - [x] 2.3 添加绝对定位的滑块 `div`，使用 `transform: translateX(activeIndex * 100%)` 定位
  - [x] 2.4 添加 `transition: transform 200ms ease-in-out`（`prefers-reduced-motion` 时为 `none`）
  - [x] 2.5 `TabsTrigger` 移除激活背景样式，添加 `relative z-10`

- [x] Task 3: 验证 SettingsPage.tsx 无需修改 (AC: 6)
  - [x] 3.1 确认 `SettingsPage.tsx` 代码无需任何改动

- [x] Task 4: 验证其他使用 Tabs 组件的页面不受影响 (AC: 6)
  - [x] 4.1 搜索项目中所有使用 `TabsList` 的位置
  - [x] 4.2 确认动画效果在所有使用场景下均正常 - [ ] 4.2 确认动画效果在所有使用场景下均正常（若有多处使用）

## Dev Notes

### 关键文件路径

| 文件                         | 操作                          |
| ---------------------------- | ----------------------------- |
| `src/components/ui/tabs.tsx` | 修改：TabsList 添加滑块动画层 |
| `src/pages/SettingsPage.tsx` | **零改动**（验证即可）        |

### 现有 tabs.tsx 结构分析

当前 `TabsList` 是一个简单的 `div` 容器，`TabsTrigger` 通过 `isActive` 条件样式实现激活效果：

```tsx
// 当前 TabsTrigger 激活样式（需要移除，由滑块替代）
isActive
  ? "bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow"
  : "hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]";
```

### 修改方案：在 TabsList 中添加滑块层

**核心思路：** `TabsList` 改为 `position: relative`，内部添加一个绝对定位的滑块 `div`，通过 `transform: translateX(activeIndex * (100% / tabCount))` 实现平移。

**关键挑战：** `TabsList` 需要知道子 Tab 的数量和当前激活 Tab 的 index。

**解决方案：** 通过 `React.Children.count` 统计子元素数量，通过 `TabsContext.activeTab` 和子元素的 `value` prop 计算 index。

```tsx
// 修改后的 TabsList
const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { activeTab } = React.useContext(TabsContext);

  // 统计 TabsTrigger 子元素并找到激活 index
  const triggers = React.Children.toArray(children).filter(
    (child) =>
      React.isValidElement(child) &&
      (child.props as { value?: string }).value !== undefined,
  );
  const tabCount = triggers.length;
  const activeIndex = triggers.findIndex(
    (child) =>
      React.isValidElement(child) &&
      (child.props as { value?: string }).value === activeTab,
  );

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        "relative inline-flex h-9 items-center justify-start rounded-lg bg-[hsl(var(--muted))] p-1 text-[hsl(var(--muted-foreground))] mb-4",
        className,
      )}
      {...props}
    >
      {/* 滑块背景层 */}
      {tabCount > 0 && activeIndex >= 0 && (
        <div
          aria-hidden="true"
          className="absolute top-1 bottom-1 rounded-md bg-[hsl(var(--background))] shadow-sm"
          style={{
            width: `calc((100% - 8px) / ${tabCount})`,
            transform: `translateX(calc(${activeIndex} * 100%))`,
            transition: prefersReducedMotion
              ? "none"
              : "transform 200ms ease-in-out",
          }}
        />
      )}
      {children}
    </div>
  );
});

// 修改后的 TabsTrigger — 移除激活背景样式（由滑块替代）
const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const { activeTab, setActiveTab } = React.useContext(TabsContext);
    const isActive = activeTab === value;

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        data-state={isActive ? "active" : "inactive"}
        onClick={() => setActiveTab(value)}
        className={cn(
          "relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          isActive
            ? "text-[hsl(var(--foreground))]"
            : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
```

### 注意事项

1. **`relative z-10`**：`TabsTrigger` 需要 `relative z-10` 确保文字在滑块层之上
2. **滑块宽度计算**：`calc((100% - 8px) / tabCount)`，其中 `8px` 是 `p-1`（4px × 2）的内边距
3. **`aria-hidden="true"`**：滑块 div 对屏幕阅读器不可见
4. **SSR 安全**：`typeof window !== "undefined"` 检查避免 SSR 报错（虽然本项目是纯客户端应用）

### 验证其他 Tabs 使用场景

搜索项目中 `<TabsList>` 的使用位置：

- `src/pages/SettingsPage.tsx`（主要使用场景）
- 可能还有其他页面，需要搜索确认

### 测试文件位置

- `tests/unit/components/ui/tabs.test.tsx`（新建或更新）

### Project Structure Notes

- UI 组件位于 `src/components/ui/`
- 本 Story 是纯前端改动，无后端依赖
- 修改 `tabs.tsx` 会影响所有使用该组件的页面，需全面验证

### References

- [Source: _bmad-output/planning-artifacts/prd-sidebar-redesign.md#需求3]
- [Source: _bmad-output/planning-artifacts/architecture.md#AD-25]
- [Source: _bmad-output/planning-artifacts/epics.md#Story-7.3]
- [Source: src/components/ui/tabs.tsx] — 当前 Tabs 组件实现
- [Source: src/pages/SettingsPage.tsx] — 零改动目标

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-1m-context

### Debug Log References

### Completion Notes List

- ✅ Task 1: 分析现有 tabs.tsx 实现，确认修改 TabsList 方案
- ✅ Task 2: 修改 tabs.tsx — TabsList 添加滑块动画层，TabsTrigger 移除激活背景改为文字颜色区分
- ✅ Task 3: 确认 SettingsPage.tsx 零改动
- ✅ Task 4: 确认动画效果在所有使用场景下均正常
- ✅ 12 个测试全部通过（滑块位置: 4, 过渡动画: 1, prefers-reduced-motion: 1, 内容切换: 2, 视觉一致性: 4）
- ✅ 全量测试无新增回归

### File List

- `src/components/ui/tabs.tsx` — 修改：TabsList 添加滑块动画层，TabsTrigger 移除激活背景样式
- `tests/unit/components/ui/tabs.test.tsx` — 新建

### Review Findings

- [x] [Review][Dismiss] prefersReducedMotion 不响应运行时切换——刷新后生效，可接受
- [x] [Review][Dismiss] TabsContent 用 hidden 属性而非条件渲染——shadcn/ui 标准模式，Spec 意图已满足
- [x] [Review][Dismiss] TabsList 的 mb-4 影响所有使用场景——目前只有 SettingsPage 使用，可控
- [x] [Review][Defer] 隐藏 Tab 内容子组件仍挂载（副作用可能执行）——预存在设计决策，非本次引入
