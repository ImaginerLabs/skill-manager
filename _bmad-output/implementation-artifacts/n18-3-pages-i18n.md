# Story N18-3: 核心页面 i18n 化 — SkillBrowse + Sync + Settings + Workflow + Import + Paths

Status: ready-for-dev

## Story

As a Skill Manager 用户,
I want 所有核心页面的文本（标题、按钮、状态提示、空状态等）根据当前语言显示,
so that 切换语言后整个应用界面完整地呈现目标语言，没有遗漏的硬编码文本。

## Acceptance Criteria

1. **[SkillBrowsePage i18n 化]** `SkillBrowsePage.tsx` 中所有硬编码中文字符串替换为 `t()` 调用，包括：页面标题、Skill 数量统计（含插值）、搜索框占位符、视图切换 title、刷新按钮 title、冷启动引导文本、空状态文本、加载状态文本、错误提示。

2. **[SyncPage + SyncExecutor i18n 化]** `SyncPage.tsx` 和 `SyncExecutor.tsx` 中所有硬编码中文字符串替换为 `t()` 调用，包括：页面标题/副标题、同步按钮文本、状态摘要、结果统计（含插值）、状态标签（新建/覆盖/失败）。

3. **[SyncSkillSelector i18n 化]** `SyncSkillSelector.tsx` 中所有硬编码中文字符串替换为 `t()` 调用，包括：「选择 Skill」标题、已选数量（含插值）、「清除选择」按钮、「按套件选择」标签。

4. **[SettingsPage i18n 化]** `SettingsPage.tsx` 中页面标题和 Tab 标签替换为 `t()` 调用：`t("settings.title")`、`t("settings.tabCategories")`、`t("settings.tabBundles")`。

5. **[WorkflowPage i18n 化]** `WorkflowPage.tsx` 中所有硬编码中文字符串替换为 `t()` 调用，包括：Tab 标签（已有工作流/新建工作流）、空状态文本、加载状态、Toast 消息（工作流加载/删除/撤销）。

6. **[ImportPage i18n 化]** `src/pages/import/index.tsx` 及相关子组件（`ScanPathInput.tsx`、`ImportFileList.tsx`、`CleanupConfirmDialog.tsx`）中所有硬编码中文字符串替换为 `t()` 调用。

7. **[PathsPage i18n 化]** `PathsPage.tsx` 中页面标题和副标题替换为 `t()` 调用。

8. **[CommandPalette i18n 化]** `CommandPalette.tsx` 中所有硬编码中文字符串替换为 `t()` 调用：搜索框占位符、空结果提示、分组标题（Skills/工作流/页面）、`PAGE_ITEMS` 中的页面标签。

9. **[WorkflowPage Toast 消息提升]** `WorkflowPage.tsx` 中的 Toast 消息从硬编码中文改为 `t()` 调用（含插值），包括：工作流加载成功/失败、删除成功/失败、撤销删除。

10. **[TypeScript 零错误]** `tsc --noEmit` 通过，无类型错误。

11. **[单元测试通过]** 所有新增和修改的单元测试 100% 通过。

## Tasks / Subtasks

- [ ] Task 1: `SkillBrowsePage.tsx` i18n 化 (AC: 1)
  - [ ] 1.1 添加 `import { useTranslation } from "react-i18next";`，获取 `const { t } = useTranslation();`
  - [ ] 1.2 替换页面标题 `"Skill 库"` → `{t("skillBrowse.title")}`
  - [ ] 1.3 替换 Skill 数量统计（含条件插值）：
    - `${skills.length} 个 Skill` → `t("skillBrowse.skillCount", { count: skills.length })`
    - `${filteredSkills.length} / ${skills.length} 个 Skill` → `t("skillBrowse.skillCountFiltered", { filtered: filteredSkills.length, total: skills.length })`
  - [ ] 1.4 替换搜索框 `placeholder="筛选 Skill..."` → `placeholder={t("skillBrowse.searchPlaceholder")}`
  - [ ] 1.5 替换视图切换 `title="卡片视图"` → `title={t("skillBrowse.cardView")}`，`title="列表视图"` → `title={t("skillBrowse.listView")}`
  - [ ] 1.6 替换刷新按钮 `title="刷新 Skill 列表"` → `title={t("skillBrowse.refresh")}`
  - [ ] 1.7 替换冷启动引导文本（含插值）
  - [ ] 1.8 替换空状态文本 `"暂无 Skill"` → `{t("skillBrowse.emptyTitle")}`
  - [ ] 1.9 替换加载状态 `"加载中..."` → `{t("skillBrowse.loadingText")}`
  - [ ] 1.10 单元测试：验证关键文本通过 `t()` 渲染

- [ ] Task 2: `SyncPage.tsx` + `SyncExecutor.tsx` i18n 化 (AC: 2)
  - [ ] 2.1 `SyncPage.tsx`：替换 `"IDE 同步"` 标题 → `{t("sync.title")}`，副标题 → `{t("sync.subtitle")}`
  - [ ] 2.2 `SyncExecutor.tsx`：添加 `useTranslation`
  - [ ] 2.3 替换同步按钮文本：`"同步中..."` → `{t("sync.syncing")}`，`"开始同步"` → `{t("sync.startSync")}`
  - [ ] 2.4 替换状态摘要文本（含条件判断）
  - [ ] 2.5 替换 `"清除结果"` → `{t("sync.clearResults")}`
  - [ ] 2.6 替换结果统计（含插值）：`成功 ${n}` → `t("sync.successCount", { count: n })`
  - [ ] 2.7 替换状态标签：`"新建"` → `{t("sync.statusNew")}`，`"覆盖"` → `{t("sync.statusOverwritten")}`，`"失败"` → `{t("sync.statusFailed")}`
  - [ ] 2.8 替换 Toast 消息（含插值）
  - [ ] 2.9 单元测试：验证关键文本通过 `t()` 渲染

- [ ] Task 3: `SyncSkillSelector.tsx` i18n 化 (AC: 3)
  - [ ] 3.1 添加 `useTranslation`
  - [ ] 3.2 替换 `"选择 Skill"` → `{t("sync.selectSkills")}`
  - [ ] 3.3 替换已选数量（含插值）：`已选 ${n}` → `t("sync.selectedCount", { count: n })`
  - [ ] 3.4 替换 `"清除选择"` → `{t("sync.clearSelection")}`
  - [ ] 3.5 替换 `"按套件选择"` → `{t("sync.bundleSelect")}`
  - [ ] 3.6 单元测试更新

- [ ] Task 4: `SettingsPage.tsx` i18n 化 (AC: 4)
  - [ ] 4.1 添加 `useTranslation`
  - [ ] 4.2 替换页面标题 `"分类管理"` → `{t("settings.title")}`
  - [ ] 4.3 替换 Tab 标签：`"分类设置"` → `{t("settings.tabCategories")}`，`"套件管理"` → `{t("settings.tabBundles")}`
  - [ ] 4.4 单元测试更新

- [ ] Task 5: `WorkflowPage.tsx` i18n 化 + Toast 消息提升 (AC: 5, 9)
  - [ ] 5.1 添加 `useTranslation`
  - [ ] 5.2 替换 Tab 标签：`"已有工作流"` → `{t("workflow.tabList")}`，`"新建工作流"` → `{t("workflow.tabNew")}`
  - [ ] 5.3 替换空状态文本：`"还没有工作流"` → `{t("workflow.empty")}`，`"点击「新建工作流」开始创建"` → `{t("workflow.emptyHint")}`
  - [ ] 5.4 替换加载状态 `"加载中..."` → `{t("workflow.loading")}`
  - [ ] 5.5 替换 aria-label（含插值）：`编辑 ${wf.name}` → `t("workflow.editAriaLabel", { name: wf.name })`
  - [ ] 5.6 替换 Toast 消息（含插值）：
    - `已加载工作流「${name}」到编排器` → `t("toast.workflowLoaded", { name })`
    - `加载工作流失败` → `t("toast.workflowLoadFailed")`
    - `工作流「${name}」已删除` → `t("toast.workflowDeleted", { name })`
    - `删除工作流失败` → `t("toast.workflowDeleteFailed")`
    - `已撤销删除工作流「${name}」` → `t("toast.workflowUndoDelete", { name })`
  - [ ] 5.7 单元测试更新

- [ ] Task 6: `ImportPage` 及子组件 i18n 化 (AC: 6)
  - [ ] 6.1 `src/pages/import/index.tsx`：添加 `useTranslation`，替换页面标题、副标题、错误状态、空目录提示、空状态引导文本
  - [ ] 6.2 `src/pages/import/ScanPathInput.tsx`：替换扫描相关文本
  - [ ] 6.3 `src/pages/import/ImportFileList.tsx`：替换导入列表相关文本
  - [ ] 6.4 `src/pages/import/CleanupConfirmDialog.tsx`：替换确认弹窗文本
  - [ ] 6.5 单元测试更新

- [ ] Task 7: `PathsPage.tsx` i18n 化 (AC: 7)
  - [ ] 7.1 读取 `PathsPage.tsx` 当前内容
  - [ ] 7.2 添加 `useTranslation`，替换页面标题和副标题
  - [ ] 7.3 单元测试更新（如有）

- [ ] Task 8: `CommandPalette.tsx` i18n 化 (AC: 8)
  - [ ] 8.1 添加 `useTranslation`
  - [ ] 8.2 将模块级 `PAGE_ITEMS` 常量移入组件内（因为 `t()` 只能在组件/Hook 中调用）
  - [ ] 8.3 替换 `PAGE_ITEMS` 中的 label：`"Skill 库"` → `t("nav.skillLibrary")`，`"工作流"` → `t("nav.workflow")` 等
  - [ ] 8.4 替换搜索框 `placeholder="搜索 Skill、页面..."` → `placeholder={t("commandPalette.placeholder")}`
  - [ ] 8.5 替换空结果 `"未找到匹配结果"` → `{t("commandPalette.noResults")}`
  - [ ] 8.6 替换分组标题：`heading="工作流"` → `heading={t("commandPalette.groupWorkflows")}`，`heading="页面"` → `heading={t("commandPalette.groupPages")}`
  - [ ] 8.7 单元测试更新

- [ ] Task 9: 验证与类型检查 (AC: 10, 11)
  - [ ] 9.1 运行 `tsc --noEmit`，确认零错误
  - [ ] 9.2 运行 `npm run test:run`，确认所有测试通过

## Dev Notes

### 关键文件路径

| 文件 | 操作 |
|------|------|
| `src/pages/SkillBrowsePage.tsx` | 修改：全页面文本 i18n 化 |
| `src/pages/SyncPage.tsx` | 修改：标题/副标题 i18n 化 |
| `src/components/sync/SyncExecutor.tsx` | 修改：同步按钮/结果/Toast i18n 化 |
| `src/components/sync/SyncSkillSelector.tsx` | 修改：选择区域文本 i18n 化 |
| `src/pages/SettingsPage.tsx` | 修改：标题/Tab 标签 i18n 化 |
| `src/pages/WorkflowPage.tsx` | 修改：Tab/空状态/Toast i18n 化 |
| `src/pages/import/index.tsx` | 修改：页面文本 i18n 化 |
| `src/pages/import/ScanPathInput.tsx` | 修改：扫描文本 i18n 化 |
| `src/pages/import/ImportFileList.tsx` | 修改：导入列表文本 i18n 化 |
| `src/pages/import/CleanupConfirmDialog.tsx` | 修改：确认弹窗文本 i18n 化 |
| `src/pages/PathsPage.tsx` | 修改：标题/副标题 i18n 化 |
| `src/components/shared/CommandPalette.tsx` | 修改：全组件文本 i18n 化 |

### WorkflowPage.tsx Toast 消息提升模式

```typescript
// WorkflowPage.tsx — Toast 消息使用 t() 插值
const { t } = useTranslation();

// 工作流加载成功
toast.success(t("toast.workflowLoaded", { name: workflow.name }));

// 工作流删除（undoable）
toast.undoable(
  t("toast.workflowDeleted", { name: workflow.name }),
  async () => { /* onConfirm */ },
  () => {
    // onUndo
    toast.success(t("toast.workflowUndoDelete", { name: workflow.name }));
  },
  5000,
);
```

### CommandPalette.tsx PAGE_ITEMS 动态化

```typescript
// 原代码（模块级常量，不能使用 t()）：
const PAGE_ITEMS = [
  { path: "/", label: "Skill 库", icon: BookOpen },
  ...
];

// 修改后（移入组件内）：
export default function CommandPalette() {
  const { t } = useTranslation();

  const PAGE_ITEMS = [
    { path: "/", label: t("nav.skillLibrary"), icon: BookOpen },
    { path: "/workflow", label: t("nav.workflow"), icon: GitBranch },
    { path: "/sync", label: t("nav.sync"), icon: RefreshCw },
    { path: "/import", label: t("nav.import"), icon: Download },
    { path: "/settings", label: t("nav.settings"), icon: Settings },
  ];
  ...
}
```

### SkillBrowsePage.tsx 数量统计插值

```tsx
// 原代码：
{searchQuery
  ? `${filteredSkills.length} / ${skills.length} 个 Skill`
  : `${skills.length} 个 Skill`}

// 修改后：
{searchQuery
  ? t("skillBrowse.skillCountFiltered", {
      filtered: filteredSkills.length,
      total: skills.length,
    })
  : t("skillBrowse.skillCount", { count: skills.length })}
```

### 测试 Mock 模式

```typescript
// 在测试文件顶部 mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      // 简单返回 key，或实现插值
      if (opts) {
        return Object.entries(opts).reduce(
          (str, [k, v]) => str.replace(`{{${k}}}`, String(v)),
          key,
        );
      }
      return key;
    },
    i18n: { language: "zh", changeLanguage: vi.fn() },
  }),
}));
```

### 依赖前置条件

- **Story N18-1 必须已完成**：翻译资源文件已存在
- **Story N18-2 必须已完成**：Layout 层已 i18n 化

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#AD-29]
- [Source: _bmad-output/planning-artifacts/architecture.md#AD-30]
- [Source: src/pages/SkillBrowsePage.tsx]
- [Source: src/pages/WorkflowPage.tsx]
- [Source: src/components/shared/CommandPalette.tsx]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
