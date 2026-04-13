# Story N18-1: i18n 基础设施 — 依赖安装、初始化与翻译资源文件

Status: ready-for-dev

## Story

As a Skill Manager 用户,
I want 应用能够根据我的浏览器语言自动显示中文或英文界面,
so that 我可以在熟悉的语言环境下使用工具，无需手动配置。

## Acceptance Criteria

1. **[依赖安装]** `package.json` 中新增 `i18next`、`react-i18next`、`i18next-browser-languagedetector` 三个依赖，版本分别为 `^24.x`、`^15.x`、`^8.x`。

2. **[i18n 初始化文件]** `src/i18n/index.ts` 存在，使用 `LanguageDetector` + `initReactI18next` 初始化，检测顺序为 `["localStorage", "navigator"]`，localStorage key 为 `skill-manager-lang`，`fallbackLng: "zh"`，`supportedLngs: ["zh", "en"]`，`escapeValue: false`。

3. **[TypeScript 类型声明]** `src/i18n/types.ts` 存在，从 `zh.ts` 推导 `TranslationKeys` 类型，并通过 `declare module "i18next"` 声明 `CustomTypeOptions`，确保 `t()` 调用的键名有编译时类型检查。

4. **[中文翻译资源]** `src/i18n/locales/zh.ts` 存在，包含以下所有功能域的完整翻译键：`nav`、`common`、`skillBrowse`、`sync`、`settings`、`bundle`、`category`、`metadata`、`header`、`toast`、`workflow`、`import`、`paths`、`commandPalette`、`errors`，使用 `as const` 导出。

5. **[英文翻译资源]** `src/i18n/locales/en.ts` 存在，结构与 `zh.ts` 完全镜像，所有键均有对应的英文翻译，使用 `as const` 导出。

6. **[main.tsx 接入]** `src/main.tsx` 中 `import "./i18n/index"` 是文件中第一个 import 语句（在 React、App 等所有其他 import 之前）。

7. **[语言检测正确性]** 浏览器语言为 `zh-CN` 时，`i18n.language` 解析为 `zh`；浏览器语言为 `en-US` 时，解析为 `en`；不支持的语言（如 `ja`）降级为 `zh`。

8. **[TypeScript 零错误]** `tsc --noEmit` 通过，无类型错误。

## Tasks / Subtasks

- [ ] Task 1: 安装 i18n 依赖 (AC: 1)
  - [ ] 1.1 执行 `npm install i18next react-i18next i18next-browser-languagedetector`
  - [ ] 1.2 确认 `package.json` dependencies 中三个包版本正确写入
  - [ ] 1.3 确认 `node_modules` 中包已安装（`npm ls i18next` 验证）

- [ ] Task 2: 创建翻译资源文件 `zh.ts` (AC: 4)
  - [ ] 2.1 创建目录 `src/i18n/locales/`
  - [ ] 2.2 创建 `src/i18n/locales/zh.ts`，包含以下所有功能域：
    - `nav`: skillLibrary, workflow, sync, import, pathConfig, settings, categories, manageCategories
    - `common`: loading, save, cancel, delete, confirm, edit, create, search, noDescription, saving, creating, close, unknown, processing, selectAll, collapse, expand
    - `skillBrowse`: title, skillCount, skillCountFiltered, searchPlaceholder, cardView, listView, refresh, emptyTitle, emptyHint, emptyImportLink, coldStartDetected, coldStartFiles, coldStartLocation, coldStartImport, errorTitle, loadingText
    - `sync`: title, subtitle, selectSkills, selectedCount, clearSelection, startSync, syncing, clearResults, syncComplete, syncSuccess, syncPartialFail, syncFailed, noSkillSelected, noTargetEnabled, successCount, overwrittenCount, failedCount, statusNew, statusOverwritten, statusFailed, bundleSelect
    - `settings`: title, tabCategories, tabBundles
    - `bundle`: title, createNew, empty, emptyHint, namePlaceholder, displayNamePlaceholder, descriptionPlaceholder, selectCategories, searchCategories, noMatchCategories, selectedCount, confirmCreate, nameError, createSuccess, createFailed, updateSuccess, updateFailed, deleteSuccess, deleteFailed, activateSuccess_withSkipped, activateSuccess, activateFailed, loadFailed, activate, activated, edit, delete, displayNameLabel, descriptionLabel, brokenRef
    - `category`: title, createNew, empty, emptyHint, namePlaceholder, displayNamePlaceholder, descriptionPlaceholder, createButton, loadFailed, createFailed, updateFailed, deleteFailed, batchRemoveSuccess, batchRemoveFailed, batchRemoveButton, processing, selectAllLabel, selectedCount, noSkills, deleteConfirmTitle, deleteConfirmDesc, descriptionLabel, skillCount, collapse, expand
    - `metadata`: title, fieldName, fieldDescription, fieldTags, fieldMoveCategory, movePlaceholder, moveButton, deleteConfirmTitle, deleteConfirmDesc, saveFailed, deleteFailed, moveFailed, closePanel
    - `header`: searchPlaceholder, searchAriaLabel, toggleTheme, switchLanguage, langZh, langEn
    - `toast`: loadFailed, loadSkillsFailed, loadBundlesFailed, syncNoSkill, syncFailed, workflowLoaded, workflowLoadFailed, workflowDeleted, workflowDeleteFailed, workflowUndoDelete
    - `workflow`: tabList, tabNew, empty, emptyHint, createNew, loading, editAriaLabel, deleteAriaLabel
    - `import`: title, subtitle, scanFailed, emptyDir, emptyDirHint, idleTitle, idleHint, importManage
    - `paths`: title, subtitle
    - `commandPalette`: placeholder, noResults, groupSkills, groupWorkflows, groupPages
    - `errors`: SKILL_NOT_FOUND, VALIDATION_ERROR, BUNDLE_LIMIT_EXCEEDED, BUNDLE_NAME_DUPLICATE, PATH_TRAVERSAL, unknown
  - [ ] 2.3 单元测试：验证 `zh` 对象包含所有必需的顶层键

- [ ] Task 3: 创建翻译资源文件 `en.ts` (AC: 5)
  - [ ] 3.1 创建 `src/i18n/locales/en.ts`，结构与 `zh.ts` 完全镜像
  - [ ] 3.2 所有键提供完整英文翻译（插值变量保持一致，如 `{{count}}`）
  - [ ] 3.3 单元测试：验证 `en` 对象的键集合与 `zh` 完全一致（深度对比）

- [ ] Task 4: 创建 TypeScript 类型声明 `types.ts` (AC: 3)
  - [ ] 4.1 创建 `src/i18n/types.ts`
  - [ ] 4.2 从 `zh.ts` 推导 `TranslationKeys = typeof zh`
  - [ ] 4.3 声明 `declare module "i18next"` 的 `CustomTypeOptions`
  - [ ] 4.4 验证：在组件中使用不存在的键 `t("nonexistent.key")` 时 TypeScript 报错

- [ ] Task 5: 创建 i18next 初始化文件 `index.ts` (AC: 2, 7)
  - [ ] 5.1 创建 `src/i18n/index.ts`
  - [ ] 5.2 配置 `LanguageDetector`：`order: ["localStorage", "navigator"]`，`lookupLocalStorage: "skill-manager-lang"`，`caches: ["localStorage"]`
  - [ ] 5.3 配置 `resources`：`{ zh: { translation: zh }, en: { translation: en } }`
  - [ ] 5.4 配置 `supportedLngs: ["zh", "en"]`，`fallbackLng: "zh"`，`escapeValue: false`
  - [ ] 5.5 单元测试：mock `navigator.language = "zh-CN"`，验证 `i18n.language` 为 `"zh"`
  - [ ] 5.6 单元测试：mock `navigator.language = "en-US"`，验证 `i18n.language` 为 `"en"`
  - [ ] 5.7 单元测试：mock `navigator.language = "ja"`，验证降级为 `"zh"`

- [ ] Task 6: 修改 `main.tsx` 接入 i18n (AC: 6)
  - [ ] 6.1 在 `src/main.tsx` 第一行添加 `import "./i18n/index";`（在所有其他 import 之前）
  - [ ] 6.2 验证：`tsc --noEmit` 零错误
  - [ ] 6.3 验证：`npm run dev` 启动正常，控制台无 i18n 相关错误

## Dev Notes

### 关键文件路径

| 文件                     | 操作                          |
| ------------------------ | ----------------------------- |
| `package.json`           | 修改：新增三个 i18n 依赖      |
| `src/main.tsx`           | 修改：首行添加 i18n import    |
| `src/i18n/index.ts`      | **新建**：i18next 初始化      |
| `src/i18n/types.ts`      | **新建**：TypeScript 类型声明 |
| `src/i18n/locales/zh.ts` | **新建**：中文翻译资源        |
| `src/i18n/locales/en.ts` | **新建**：英文翻译资源        |

### `src/i18n/index.ts` 完整实现

```typescript
// ============================================================
// src/i18n/index.ts — i18next 国际化初始化
// ============================================================
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { en } from "./locales/en";
import { zh } from "./locales/zh";

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      zh: { translation: zh },
      en: { translation: en },
    },
    supportedLngs: ["zh", "en"],
    fallbackLng: "zh",
    interpolation: {
      escapeValue: false, // React 已处理 XSS
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "skill-manager-lang",
      caches: ["localStorage"],
    },
  });

export default i18next;
```

### `src/i18n/types.ts` 完整实现

```typescript
// ============================================================
// src/i18n/types.ts — i18n TypeScript 类型声明
// ============================================================
import "i18next";
import { zh } from "./locales/zh";

export type TranslationKeys = typeof zh;

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: TranslationKeys;
    };
  }
}
```

### `src/i18n/locales/zh.ts` 关键翻译键（完整版）

```typescript
export const zh = {
  nav: {
    skillLibrary: "Skill 库",
    workflow: "工作流",
    sync: "同步",
    import: "导入",
    pathConfig: "路径配置",
    settings: "设置",
    categories: "分类",
    manageCategories: "管理分类",
  },
  common: {
    loading: "加载中...",
    save: "保存",
    cancel: "取消",
    delete: "删除",
    confirm: "确认",
    edit: "编辑",
    create: "新建",
    search: "搜索",
    noDescription: "暂无描述",
    saving: "保存中...",
    creating: "创建中...",
    close: "关闭",
    unknown: "未知错误",
    processing: "处理中...",
    selectAll: "全选",
    collapse: "折叠",
    expand: "展开",
  },
  skillBrowse: {
    title: "Skill 库",
    skillCount: "{{count}} 个 Skill",
    skillCountFiltered: "{{filtered}} / {{total}} 个 Skill",
    searchPlaceholder: "筛选 Skill...",
    cardView: "卡片视图",
    listView: "列表视图",
    refresh: "刷新 Skill 列表",
    emptyTitle: "暂无 Skill",
    emptyHint: "从 IDE 导入 Skill 文件",
    emptyImportLink: "导入页面",
    coldStartDetected: "检测到 CodeBuddy IDE Skill 文件",
    coldStartFiles: "{{count}} 个文件",
    coldStartLocation: "中发现 Skill 文件，点击下方按钮开始导入。",
    coldStartImport: "开始导入 →",
    errorTitle: "加载失败",
    loadingText: "加载中...",
  },
  sync: {
    title: "IDE 同步",
    subtitle: "选择 Skill 并配置同步目标路径，将 Skill 一键同步到 IDE 项目目录",
    selectSkills: "选择 Skill",
    selectedCount: "已选 {{count}}",
    clearSelection: "清除选择",
    startSync: "开始同步",
    syncing: "同步中...",
    clearResults: "清除结果",
    syncComplete: "同步完成",
    syncSuccess: "同步完成！{{count}} 个文件已同步",
    syncPartialFail: "同步完成，{{failed}} 个文件失败",
    syncFailed: "同步失败",
    noSkillSelected: "请先选择要同步的 Skill",
    noTargetEnabled: "请先添加并启用同步目标",
    successCount: "成功 {{count}}",
    overwrittenCount: "覆盖 {{count}}",
    failedCount: "失败 {{count}}",
    statusNew: "新建",
    statusOverwritten: "覆盖",
    statusFailed: "失败",
    bundleSelect: "按套件选择",
  },
  settings: {
    title: "分类管理",
    tabCategories: "分类设置",
    tabBundles: "套件管理",
  },
  bundle: {
    title: "套件管理",
    createNew: "新建套件",
    empty: "暂无套件",
    emptyHint: "套件是分类的组合，点击「新建套件」开始创建",
    namePlaceholder: "套件标识（英文，如 frontend-dev）",
    displayNamePlaceholder: "显示名称（如 前端日常开发）",
    descriptionPlaceholder: "描述（可选）",
    selectCategories: "选择分类（至少 1 个）",
    searchCategories: "搜索分类...",
    noMatchCategories: "无匹配分类",
    selectedCount: "已选 {{count}} 个分类",
    confirmCreate: "确认创建",
    nameError: "名称只能包含小写字母、数字和连字符",
    createSuccess: "套件创建成功",
    createFailed: "创建套件失败",
    updateSuccess: "套件更新成功",
    updateFailed: "更新套件失败",
    deleteSuccess: "套件已删除",
    deleteFailed: "删除套件失败",
    activateSuccess_withSkipped: "已激活 {{applied}} 个分类，跳过 {{skipped}} 个已删除分类",
    activateSuccess: "已激活 {{applied}} 个分类",
    activateFailed: "激活失败",
    loadFailed: "加载套件失败",
    activate: "激活",
    activated: "已激活",
    edit: "编辑",
    delete: "删除",
    displayNameLabel: "显示名称",
    descriptionLabel: "描述",
    brokenRef: "{{count}} 个分类引用已失效",
  },
  category: {
    title: "分类管理",
    createNew: "新建分类",
    empty: "暂无分类",
    emptyHint: "点击"新建分类"开始创建",
    namePlaceholder: "分类标识（英文，如 coding）",
    displayNamePlaceholder: "显示名称（如 编程开发）",
    descriptionPlaceholder: "描述（可选）",
    createButton: "创建",
    loadFailed: "加载数据失败",
    createFailed: "创建分类失败",
    updateFailed: "更新分类失败",
    deleteFailed: "删除分类失败",
    batchRemoveSuccess: "已将 {{count}} 个 Skill 移出分类",
    batchRemoveFailed: "批量操作失败",
    batchRemoveButton: "移出此分类 ({{count}})",
    processing: "处理中...",
    selectAllLabel: "全选",
    selectedCount: "已选 {{count}} 个",
    noSkills: "该分类下暂无 Skill",
    deleteConfirmTitle: "确认删除",
    deleteConfirmDesc: "确定要删除分类 \"{{name}}\" 吗？",
    descriptionLabel: "描述",
    skillCount: "{{count}} Skill",
    collapse: "折叠",
    expand: "展开",
  },
  metadata: {
    title: "编辑元数据",
    fieldName: "名称",
    fieldDescription: "描述",
    fieldTags: "标签（逗号分隔）",
    fieldMoveCategory: "移动到分类",
    movePlaceholder: "目标分类名称",
    moveButton: "移动",
    deleteConfirmTitle: "确认删除",
    deleteConfirmDesc: "确定要删除这个 Skill 吗？此操作不可撤销。",
    saveFailed: "保存失败",
    deleteFailed: "删除失败",
    moveFailed: "移动失败",
    closePanel: "关闭编辑面板",
  },
  header: {
    searchPlaceholder: "⌘K 搜索 Skill...",
    searchAriaLabel: "全局搜索",
    toggleTheme: "切换主题",
    switchLanguage: "切换语言",
    langZh: "中",
    langEn: "EN",
  },
  toast: {
    loadFailed: "加载数据失败",
    loadSkillsFailed: "加载 Skill 列表失败",
    loadBundlesFailed: "加载套件失败",
    syncNoSkill: "请先选择要同步的 Skill",
    syncFailed: "同步失败",
    workflowLoaded: "已加载工作流「{{name}}」到编排器",
    workflowLoadFailed: "加载工作流失败",
    workflowDeleted: "工作流「{{name}}」已删除",
    workflowDeleteFailed: "删除工作流失败",
    workflowUndoDelete: "已撤销删除工作流「{{name}}」",
  },
  workflow: {
    tabList: "已有工作流",
    tabNew: "新建工作流",
    empty: "还没有工作流",
    emptyHint: "点击「新建工作流」开始创建",
    createNew: "新建工作流",
    loading: "加载中...",
    editAriaLabel: "编辑 {{name}}",
    deleteAriaLabel: "删除 {{name}}",
  },
  import: {
    title: "导入管理",
    subtitle: "从 CodeBuddy IDE 目录扫描并导入 Skill 文件",
    scanFailed: "扫描失败",
    emptyDir: "目录为空",
    emptyDirHint: "中未发现 .md 文件",
    idleTitle: "开始扫描",
    idleHint: "输入 CodeBuddy IDE 的 Skill 目录路径，点击\"扫描\"按钮发现可导入的文件",
    importManage: "导入管理",
  },
  paths: {
    title: "路径配置",
    subtitle: "管理常用路径预设，在同步和导入时快速选择",
  },
  commandPalette: {
    placeholder: "搜索 Skill、页面...",
    noResults: "未找到匹配结果",
    groupSkills: "Skills",
    groupWorkflows: "工作流",
    groupPages: "页面",
  },
  errors: {
    SKILL_NOT_FOUND: "Skill 不存在",
    VALIDATION_ERROR: "输入数据格式有误",
    BUNDLE_LIMIT_EXCEEDED: "套件数量已达上限（50 个）",
    BUNDLE_NAME_DUPLICATE: "套件名称已存在",
    PATH_TRAVERSAL: "路径包含非法字符",
    unknown: "操作失败，请重试",
  },
} as const;
```

### `src/i18n/locales/en.ts` 关键翻译键（完整版）

```typescript
export const en = {
  nav: {
    skillLibrary: "Skill Library",
    workflow: "Workflow",
    sync: "Sync",
    import: "Import",
    pathConfig: "Path Config",
    settings: "Settings",
    categories: "Categories",
    manageCategories: "Manage Categories",
  },
  common: {
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    confirm: "Confirm",
    edit: "Edit",
    create: "New",
    search: "Search",
    noDescription: "No description",
    saving: "Saving...",
    creating: "Creating...",
    close: "Close",
    unknown: "Unknown error",
    processing: "Processing...",
    selectAll: "Select All",
    collapse: "Collapse",
    expand: "Expand",
  },
  skillBrowse: {
    title: "Skill Library",
    skillCount: "{{count}} Skills",
    skillCountFiltered: "{{filtered}} / {{total}} Skills",
    searchPlaceholder: "Filter Skills...",
    cardView: "Card View",
    listView: "List View",
    refresh: "Refresh Skill List",
    emptyTitle: "No Skills Yet",
    emptyHint: "Import Skill files from IDE",
    emptyImportLink: "Import Page",
    coldStartDetected: "CodeBuddy IDE Skill files detected",
    coldStartFiles: "{{count}} files",
    coldStartLocation: "found in directory. Click the button below to import.",
    coldStartImport: "Start Import →",
    errorTitle: "Load Failed",
    loadingText: "Loading...",
  },
  sync: {
    title: "IDE Sync",
    subtitle:
      "Select Skills and configure sync targets to sync Skills to your IDE project directory",
    selectSkills: "Select Skills",
    selectedCount: "{{count}} selected",
    clearSelection: "Clear Selection",
    startSync: "Start Sync",
    syncing: "Syncing...",
    clearResults: "Clear Results",
    syncComplete: "Sync Complete",
    syncSuccess: "Sync complete! {{count}} files synced",
    syncPartialFail: "Sync complete, {{failed}} files failed",
    syncFailed: "Sync Failed",
    noSkillSelected: "Please select Skills to sync first",
    noTargetEnabled: "Please add and enable a sync target first",
    successCount: "Success {{count}}",
    overwrittenCount: "Overwritten {{count}}",
    failedCount: "Failed {{count}}",
    statusNew: "New",
    statusOverwritten: "Overwritten",
    statusFailed: "Failed",
    bundleSelect: "Select by Bundle",
  },
  settings: {
    title: "Category Management",
    tabCategories: "Categories",
    tabBundles: "Bundles",
  },
  bundle: {
    title: "Bundle Management",
    createNew: "New Bundle",
    empty: "No Bundles",
    emptyHint:
      'Bundles are combinations of categories. Click "New Bundle" to create one.',
    namePlaceholder: "Bundle ID (e.g. frontend-dev)",
    displayNamePlaceholder: "Display Name (e.g. Frontend Dev)",
    descriptionPlaceholder: "Description (optional)",
    selectCategories: "Select Categories (at least 1)",
    searchCategories: "Search categories...",
    noMatchCategories: "No matching categories",
    selectedCount: "{{count}} categories selected",
    confirmCreate: "Confirm Create",
    nameError: "Name can only contain lowercase letters, numbers and hyphens",
    createSuccess: "Bundle created",
    createFailed: "Failed to create bundle",
    updateSuccess: "Bundle updated",
    updateFailed: "Failed to update bundle",
    deleteSuccess: "Bundle deleted",
    deleteFailed: "Failed to delete bundle",
    activateSuccess_withSkipped:
      "Activated {{applied}} categories, skipped {{skipped}} deleted",
    activateSuccess: "Activated {{applied}} categories",
    activateFailed: "Activation failed",
    loadFailed: "Failed to load bundles",
    activate: "Activate",
    activated: "Activated",
    edit: "Edit",
    delete: "Delete",
    displayNameLabel: "Display Name",
    descriptionLabel: "Description",
    brokenRef: "{{count}} category references broken",
  },
  category: {
    title: "Category Management",
    createNew: "New Category",
    empty: "No Categories",
    emptyHint: 'Click "New Category" to create one',
    namePlaceholder: "Category ID (e.g. coding)",
    displayNamePlaceholder: "Display Name (e.g. Programming)",
    descriptionPlaceholder: "Description (optional)",
    createButton: "Create",
    loadFailed: "Failed to load data",
    createFailed: "Failed to create category",
    updateFailed: "Failed to update category",
    deleteFailed: "Failed to delete category",
    batchRemoveSuccess: "Moved {{count}} Skills out of category",
    batchRemoveFailed: "Batch operation failed",
    batchRemoveButton: "Remove from category ({{count}})",
    processing: "Processing...",
    selectAllLabel: "Select All",
    selectedCount: "{{count}} selected",
    noSkills: "No Skills in this category",
    deleteConfirmTitle: "Confirm Delete",
    deleteConfirmDesc: 'Are you sure you want to delete category "{{name}}"?',
    descriptionLabel: "Description",
    skillCount: "{{count}} Skills",
    collapse: "Collapse",
    expand: "Expand",
  },
  metadata: {
    title: "Edit Metadata",
    fieldName: "Name",
    fieldDescription: "Description",
    fieldTags: "Tags (comma separated)",
    fieldMoveCategory: "Move to Category",
    movePlaceholder: "Target category name",
    moveButton: "Move",
    deleteConfirmTitle: "Confirm Delete",
    deleteConfirmDesc:
      "Are you sure you want to delete this Skill? This action cannot be undone.",
    saveFailed: "Save failed",
    deleteFailed: "Delete failed",
    moveFailed: "Move failed",
    closePanel: "Close edit panel",
  },
  header: {
    searchPlaceholder: "⌘K Search Skills...",
    searchAriaLabel: "Global search",
    toggleTheme: "Toggle theme",
    switchLanguage: "Switch language",
    langZh: "中",
    langEn: "EN",
  },
  toast: {
    loadFailed: "Failed to load data",
    loadSkillsFailed: "Failed to load Skills",
    loadBundlesFailed: "Failed to load bundles",
    syncNoSkill: "Please select Skills to sync first",
    syncFailed: "Sync failed",
    workflowLoaded: 'Workflow "{{name}}" loaded to editor',
    workflowLoadFailed: "Failed to load workflow",
    workflowDeleted: 'Workflow "{{name}}" deleted',
    workflowDeleteFailed: "Failed to delete workflow",
    workflowUndoDelete: 'Undo delete workflow "{{name}}"',
  },
  workflow: {
    tabList: "Workflows",
    tabNew: "New Workflow",
    empty: "No Workflows Yet",
    emptyHint: 'Click "New Workflow" to create one',
    createNew: "New Workflow",
    loading: "Loading...",
    editAriaLabel: "Edit {{name}}",
    deleteAriaLabel: "Delete {{name}}",
  },
  import: {
    title: "Import Manager",
    subtitle: "Scan and import Skill files from CodeBuddy IDE directory",
    scanFailed: "Scan Failed",
    emptyDir: "Directory Empty",
    emptyDirHint: "No .md files found in",
    idleTitle: "Start Scanning",
    idleHint:
      'Enter the Skill directory path of CodeBuddy IDE and click "Scan" to discover importable files',
    importManage: "Import Manager",
  },
  paths: {
    title: "Path Configuration",
    subtitle: "Manage path presets for quick selection during sync and import",
  },
  commandPalette: {
    placeholder: "Search Skills, pages...",
    noResults: "No results found",
    groupSkills: "Skills",
    groupWorkflows: "Workflows",
    groupPages: "Pages",
  },
  errors: {
    SKILL_NOT_FOUND: "Skill not found",
    VALIDATION_ERROR: "Invalid input data",
    BUNDLE_LIMIT_EXCEEDED: "Bundle limit reached (50)",
    BUNDLE_NAME_DUPLICATE: "Bundle name already exists",
    PATH_TRAVERSAL: "Path contains illegal characters",
    unknown: "Operation failed, please try again",
  },
} as const;
```

### `src/main.tsx` 修改参考

```typescript
// src/main.tsx — i18n 必须是第一个 import
import "./i18n/index"; // ← 必须在所有其他 import 之前

// 同步初始化主题，防止首屏闪烁（FOUC）
// 必须在 React 渲染前执行，直接操作 DOM
const savedTheme = (() => {
  try {
    return localStorage.getItem("skill-manager-theme");
  } catch {
    return null;
  }
})();
// ... 其余现有代码不变
```

### 测试文件位置

- `tests/unit/i18n/zh.test.ts` — 验证 zh.ts 包含所有必需键
- `tests/unit/i18n/en.test.ts` — 验证 en.ts 与 zh.ts 结构完全一致
- `tests/unit/i18n/init.test.ts` — 验证语言检测逻辑

### 架构约束（来自 AD-26~AD-28）

- `i18next` 版本 `^24.x`，`react-i18next` 版本 `^15.x`
- 单命名空间 `translation`，不使用多命名空间
- `zh.ts` 是 source of truth，`en.ts` 结构必须完全镜像
- `as const` 确保键名不被意外修改
- `escapeValue: false`（React 已处理 XSS）

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#AD-26]
- [Source: _bmad-output/planning-artifacts/architecture.md#AD-27]
- [Source: _bmad-output/planning-artifacts/architecture.md#AD-28]
- [Source: src/main.tsx] — 当前 main.tsx 实现

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
