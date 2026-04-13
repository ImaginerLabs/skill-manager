# Story N18-4: 组件层 i18n 化 — BundleManager + CategoryManager + MetadataEditor + SkillCard + Store 消息提升

Status: ready-for-dev

## Story

As a Skill Manager 用户,
I want 所有功能组件（套件管理、分类管理、元数据编辑、Skill 卡片等）的文本根据当前语言显示，Store 中的 Toast 消息也能正确翻译,
so that 整个应用没有任何遗漏的硬编码中文文本，语言切换后界面完全一致。

## Acceptance Criteria

1. **[BundleManager i18n 化]** `BundleManager.tsx` 中所有硬编码中文字符串替换为 `t()` 调用，包括：标题、按钮、表单标签/占位符、Toast 消息、空状态文本、错误提示、激活状态标签。

2. **[CategoryManager i18n 化]** `CategoryManager.tsx` 中所有硬编码中文字符串替换为 `t()` 调用，包括：标题、按钮、表单占位符、空状态文本、批量操作文本、确认弹窗文本、错误提示。

3. **[MetadataEditor i18n 化]** `MetadataEditor.tsx` 中所有硬编码中文字符串替换为 `t()` 调用，包括：面板标题、字段标签、按钮文本、确认弹窗文本、错误提示。

4. **[SkillCard + SkillList i18n 化]** `SkillCard.tsx` 和 `SkillList.tsx` 中 `"暂无描述"` → `t("common.noDescription")`，`"工作流"` 类型标签 → `t("nav.workflow")`，`"标签"` 计数 → 适当翻译。

5. **[EmptyState i18n 化]** `EmptyState.tsx` 中所有硬编码中文字符串替换为 `t()` 调用。

6. **[dialog.tsx sr-only 文本 i18n 化]** `src/components/ui/dialog.tsx` 中 `<span className="sr-only">关闭</span>` → `<span className="sr-only">{t("common.close")}</span>`。

7. **[SyncTargetManager i18n 化]** `SyncTargetManager.tsx` 中所有硬编码中文字符串替换为 `t()` 调用。

8. **[PathPresetManager i18n 化]** `PathPresetManager.tsx` 中所有硬编码中文字符串替换为 `t()` 调用。

9. **[Store Toast 消息提升]** `sync-store.ts`、`bundle-store.ts`、`skill-store.ts` 中的中文 Toast 消息和错误文本移除，改为抛出错误让组件层处理；对应组件层（`SyncExecutor.tsx`、`BundleManager.tsx`、`SkillBrowsePage.tsx`）捕获错误并调用 `t()` 显示翻译后的 Toast。

10. **[TypeScript 零错误]** `tsc --noEmit` 通过，无类型错误。

11. **[全量测试通过]** `npm run test:run` 全部通过，无回归。

## Tasks / Subtasks

- [ ] Task 1: `BundleManager.tsx` i18n 化 (AC: 1)
  - [ ] 1.1 添加 `import { useTranslation } from "react-i18next";`，获取 `const { t } = useTranslation();`
  - [ ] 1.2 替换标题 `"套件管理"` → `{t("bundle.title")}`
  - [ ] 1.3 替换按钮：`"新建套件"` → `{t("bundle.createNew")}`，`"确认创建"` → `{t("bundle.confirmCreate")}`，`"取消"` → `{t("common.cancel")}`
  - [ ] 1.4 替换表单占位符（含插值）
  - [ ] 1.5 替换空状态文本：`"暂无套件"` → `{t("bundle.empty")}`，提示文本 → `{t("bundle.emptyHint")}`
  - [ ] 1.6 替换 Toast 消息：`"套件创建成功"` → `t("bundle.createSuccess")` 等
  - [ ] 1.7 替换错误提示：`"名称只能包含小写字母、数字和连字符"` → `t("bundle.nameError")`
  - [ ] 1.8 替换激活结果消息（含插值）：`已激活 ${n} 个分类` → `t("bundle.activateSuccess", { applied: n })` 等
  - [ ] 1.9 替换 `"加载中..."` → `{t("common.loading")}`
  - [ ] 1.10 单元测试：验证关键文本通过 `t()` 渲染

- [ ] Task 2: `CategoryManager.tsx` i18n 化 (AC: 2)
  - [ ] 2.1 添加 `useTranslation`
  - [ ] 2.2 替换标题 `"分类管理"` → `{t("category.title")}`
  - [ ] 2.3 替换按钮：`"新建分类"` → `{t("category.createNew")}`，`"创建"` → `{t("category.createButton")}`，`"取消"` → `{t("common.cancel")}`
  - [ ] 2.4 替换表单占位符
  - [ ] 2.5 替换空状态文本：`"暂无分类"` → `{t("category.empty")}`
  - [ ] 2.6 替换批量操作文本（含插值）：`已选 ${n} 个` → `t("category.selectedCount", { count: n })`，`移出此分类 (${n})` → `t("category.batchRemoveButton", { count: n })`
  - [ ] 2.7 替换确认弹窗文本（含插值）：`确认删除分类 "${name}"` → `t("category.deleteConfirmDesc", { name })`
  - [ ] 2.8 替换 Toast 消息（含插值）：`已将 ${n} 个 Skill 移出分类` → `t("category.batchRemoveSuccess", { count: n })`
  - [ ] 2.9 替换错误提示
  - [ ] 2.10 替换 `"加载中..."` → `{t("common.loading")}`
  - [ ] 2.11 替换 `aria-label`：`"折叠"` → `t("common.collapse")`，`"展开"` → `t("common.expand")`
  - [ ] 2.12 单元测试更新

- [ ] Task 3: `MetadataEditor.tsx` i18n 化 (AC: 3)
  - [ ] 3.1 添加 `useTranslation`
  - [ ] 3.2 替换面板标题 `"编辑元数据"` → `{t("metadata.title")}`
  - [ ] 3.3 替换 `aria-label="关闭编辑面板"` → `aria-label={t("metadata.closePanel")}`
  - [ ] 3.4 替换字段标签：`"名称"` → `{t("metadata.fieldName")}`，`"描述"` → `{t("metadata.fieldDescription")}`，`"标签（逗号分隔）"` → `{t("metadata.fieldTags")}`，`"移动到分类"` → `{t("metadata.fieldMoveCategory")}`
  - [ ] 3.5 替换按钮：`"移动"` → `{t("metadata.moveButton")}`，`"保存"` → `{t("common.save")}`，`"保存中..."` → `{t("common.saving")}`，`"删除"` → `{t("common.delete")}`
  - [ ] 3.6 替换确认弹窗：`"确认删除"` → `{t("metadata.deleteConfirmTitle")}`
  - [ ] 3.7 替换错误提示
  - [ ] 3.8 单元测试更新

- [ ] Task 4: `SkillCard.tsx` + `SkillList.tsx` + `EmptyState.tsx` i18n 化 (AC: 4, 5)
  - [ ] 4.1 `SkillCard.tsx`：添加 `useTranslation`，替换 `"暂无描述"` → `{t("common.noDescription")}`，`"工作流"` → `{t("nav.workflow")}`
  - [ ] 4.2 `SkillList.tsx`：添加 `useTranslation`，替换 `"暂无描述"` → `{t("common.noDescription")}`，`"标签"` 计数文本
  - [ ] 4.3 `EmptyState.tsx`：读取当前内容，添加 `useTranslation`，替换所有中文文本
  - [ ] 4.4 单元测试更新

- [ ] Task 5: `dialog.tsx` sr-only 文本 i18n 化 (AC: 6)
  - [ ] 5.1 `src/components/ui/dialog.tsx`：添加 `useTranslation`，替换 `"关闭"` → `{t("common.close")}`
  - [ ] 5.2 单元测试更新

- [ ] Task 6: `SyncTargetManager.tsx` i18n 化 (AC: 7)
  - [ ] 6.1 读取 `SyncTargetManager.tsx` 当前内容，识别所有中文字符串
  - [ ] 6.2 添加 `useTranslation`，逐一替换为 `t()` 调用
  - [ ] 6.3 如有翻译键缺失，在 `zh.ts` 和 `en.ts` 中补充（需同步更新 Story N18-1 的翻译文件）
  - [ ] 6.4 单元测试更新

- [ ] Task 7: `PathPresetManager.tsx` i18n 化 (AC: 8)
  - [ ] 7.1 读取 `PathPresetManager.tsx` 当前内容，识别所有中文字符串
  - [ ] 7.2 添加 `useTranslation`，逐一替换为 `t()` 调用
  - [ ] 7.3 如有翻译键缺失，在 `zh.ts` 和 `en.ts` 中补充
  - [ ] 7.4 单元测试更新

- [ ] Task 8: Store Toast 消息提升 (AC: 9)
  - [ ] 8.1 `src/stores/bundle-store.ts`：
    - 移除 `"加载套件失败"` 硬编码，改为 `throw err`（让组件层处理）
    - `BundleManager.tsx` 中 catch 块调用 `toast.error(t("bundle.loadFailed"))`
  - [ ] 8.2 `src/stores/skill-store.ts`：
    - 移除 `"加载 Skill 列表失败"` 硬编码，改为 `throw err`
    - `SkillBrowsePage.tsx` 中 catch 块调用 `toast.error(t("toast.loadSkillsFailed"))`
  - [ ] 8.3 `src/stores/sync-store.ts`：
    - 移除 `"请先选择要同步的 Skill"` 和 `"同步失败"` 硬编码
    - `SyncExecutor.tsx` 中 catch 块调用 `toast.error(t("sync.syncFailed"))`
  - [ ] 8.4 单元测试：验证 store 不再包含中文字符串，组件层正确处理错误

- [ ] Task 9: 验证与全量测试 (AC: 10, 11)
  - [ ] 9.1 运行 `tsc --noEmit`，确认零错误
  - [ ] 9.2 运行 `npm run test:run`，确认全部通过
  - [ ] 9.3 手动验证：切换语言后，BundleManager、CategoryManager、MetadataEditor 文本正确切换

## Dev Notes

### 关键文件路径

| 文件 | 操作 |
|------|------|
| `src/components/settings/BundleManager.tsx` | 修改：全组件文本 i18n 化 |
| `src/components/settings/CategoryManager.tsx` | 修改：全组件文本 i18n 化 |
| `src/components/settings/PathPresetManager.tsx` | 修改：全组件文本 i18n 化 |
| `src/components/skills/MetadataEditor.tsx` | 修改：全组件文本 i18n 化 |
| `src/components/skills/SkillCard.tsx` | 修改：noDescription + 工作流标签 |
| `src/components/skills/SkillList.tsx` | 修改：noDescription + 标签计数 |
| `src/components/skills/EmptyState.tsx` | 修改：全组件文本 i18n 化 |
| `src/components/sync/SyncTargetManager.tsx` | 修改：全组件文本 i18n 化 |
| `src/components/ui/dialog.tsx` | 修改：sr-only 关闭文本 |
| `src/stores/bundle-store.ts` | 修改：移除中文 Toast，改为 throw |
| `src/stores/skill-store.ts` | 修改：移除中文错误消息，改为 throw |
| `src/stores/sync-store.ts` | 修改：移除中文 Toast，改为 throw |

### Store 消息提升模式（AD-29 规范）

```typescript
// ❌ 修改前：store 直接写中文 Toast
// bundle-store.ts
bundlesError: err instanceof Error ? err.message : "加载套件失败",

// ✅ 修改后：store 只存储错误对象，组件层处理 Toast
// bundle-store.ts
bundlesError: err instanceof Error ? err.message : "LOAD_FAILED",
// 注意：fetchBundles action 中 throw err，让组件层捕获

// BundleManager.tsx — 组件层捕获并翻译
const { t } = useTranslation();
try {
  await fetchBundles();
} catch {
  toast.error(t("bundle.loadFailed"));
}
```

### BundleManager.tsx 激活结果消息（含条件插值）

```typescript
// 原代码：
const msg = result.skipped.length > 0
  ? `已激活 ${result.applied.length} 个分类，跳过 ${result.skipped.length} 个已删除分类`
  : `已激活 ${result.applied.length} 个分类`;

// 修改后：
const msg = result.skipped.length > 0
  ? t("bundle.activateSuccess_withSkipped", {
      applied: result.applied.length,
      skipped: result.skipped.length,
    })
  : t("bundle.activateSuccess", { applied: result.applied.length });
```

### CategoryManager.tsx 批量操作文本（含插值）

```typescript
// 原代码：
toast.success(`已将 ${ids.length} 个 Skill 移出分类`);

// 修改后：
toast.success(t("category.batchRemoveSuccess", { count: ids.length }));

// 原代码（批量操作按钮）：
{batchLoading === cat.name ? "处理中..." : `移出此分类 (${selectedCount})`}

// 修改后：
{batchLoading === cat.name
  ? t("common.processing")
  : t("category.batchRemoveButton", { count: selectedCount })}
```

### SkillList.tsx 标签计数文本

```tsx
// 原代码：
{skill.tags.length} 标签

// 修改后（需在 zh.ts/en.ts 中添加 skillList.tagCount 键）：
// zh: tagCount: "{{count}} 标签"
// en: tagCount: "{{count}} tags"
{t("skillList.tagCount", { count: skill.tags.length })}
```

> **注意**：如果 `skillList` 域在 N18-1 的翻译文件中未包含，需要在本 story 中补充到 `zh.ts` 和 `en.ts`。

### SyncTargetManager.tsx 翻译键域

SyncTargetManager 包含大量文本，建议在 `zh.ts`/`en.ts` 中新增 `syncTarget` 域：

```typescript
// zh.ts 补充
syncTarget: {
  title: "同步目标",
  addTarget: "添加目标",
  noTargets: "暂无同步目标",
  noTargetsHint: "添加 IDE 项目目录作为同步目标",
  pathLabel: "路径",
  nameLabel: "名称",
  enabledLabel: "启用",
  deleteConfirmTitle: "确认删除",
  deleteConfirmDesc: "确定要删除同步目标 \"{{name}}\" 吗？",
  // ... 其他键
},
```

### PathPresetManager.tsx 翻译键域

建议在 `zh.ts`/`en.ts` 中新增 `pathPreset` 域：

```typescript
// zh.ts 补充
pathPreset: {
  title: "路径预设",
  addPreset: "添加预设",
  noPresets: "暂无路径预设",
  // ... 其他键
},
```

### 测试文件位置

- `tests/unit/components/settings/BundleManager.test.tsx` — 更新
- `tests/unit/components/settings/CategoryManager.test.tsx` — 更新（如有）
- `tests/unit/components/skills/MetadataEditor.test.tsx` — 更新（如有）
- `tests/unit/components/skills/SkillCard.test.tsx` — 更新
- `tests/unit/stores/bundle-store.test.ts` — 更新：验证 store 不再包含中文

### 依赖前置条件

- **Story N18-1 必须已完成**：翻译资源文件已存在（本 story 可能需要补充新键）
- **Story N18-2 必须已完成**：Layout 层已 i18n 化
- **Story N18-3 必须已完成**：核心页面已 i18n 化

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#AD-29]
- [Source: _bmad-output/planning-artifacts/architecture.md#AD-30]
- [Source: src/components/settings/BundleManager.tsx]
- [Source: src/components/settings/CategoryManager.tsx]
- [Source: src/components/skills/MetadataEditor.tsx]
- [Source: src/stores/bundle-store.ts]
- [Source: src/stores/sync-store.ts]
- [Source: src/stores/skill-store.ts]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
