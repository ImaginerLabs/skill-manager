---
project_name: skill-package
user_name: Alex
date: "2026-04-14"
sections_completed:
  [
    "technology_stack",
    "language_rules",
    "framework_rules",
    "testing_rules",
    "quality_rules",
    "workflow_rules",
    "anti_patterns",
  ]
status: "complete"
rule_count: 72
optimized_for_llm: true
---

# Skill Manager — AI 代理项目上下文

_本文件包含 AI 代理在本项目中编写代码时必须遵循的关键规则和模式。聚焦于 LLM 容易遗漏的非显而易见的细节。_

---

## 技术栈与版本

| 技术         | 版本    | 备注                                     |
| ------------ | ------- | ---------------------------------------- |
| Node.js      | ≥18     | `.nvmrc` 锁定 18                         |
| TypeScript   | ^6.0.2  | strict mode，分离 client/server tsconfig |
| React        | ^19.2.5 | 函数组件 + Hooks only                    |
| React Router | ^7.14.0 | `createBrowserRouter` API                |
| Vite         | ^8.0.8  | 开发服务器 + 构建工具                    |
| Express      | ^5.2.1  | 后端 API 服务器                          |
| Tailwind CSS | ^4.2.2  | Vite 插件模式 `@tailwindcss/vite`        |
| Zustand      | ^5.0.12 | 前端状态管理                             |
| Zod          | ^4.3.6  | 运行时 Schema 校验                       |
| Vitest       | ^4.1.4  | 单元/集成测试 (jsdom + v8 coverage)      |
| Playwright   | ^1.59.1 | E2E 测试                                 |
| ESLint       | ^9.39.4 | flat config 格式                         |
| Prettier     | ^3.8.2  | 含 `prettier-plugin-organize-imports`    |

**关键依赖：**

- `gray-matter` — Frontmatter 解析
- `fuse.js` — 模糊搜索
- `fs-extra` — 文件系统操作（替代原生 fs）
- `async-mutex` — 异步互斥锁（并发安全写入）
- `cmdk` — 命令面板
- `lucide-react` — 图标库
- `react-markdown` + `remark-gfm` + `rehype-highlight` — Markdown 渲染
- `@tailwindcss/typography` — Markdown 排版样式
- `react-hotkeys-hook` — 快捷键绑定
- `js-yaml` — YAML 序列化/反序列化（配置文件读写）

---

## 关键实现规则

### 语言规则（TypeScript）

- **ESM 模块系统**：`package.json` 设置 `"type": "module"`。服务端导入**必须**带 `.js` 扩展名（如 `import { foo } from "./bar.js"`），即使源文件是 `.ts`
- **严格模式**：`strict: true` 全局启用。禁止 `any`（服务端/客户端均为 `warn`，测试文件除外）
- **未使用变量**：以 `_` 前缀命名的变量/参数不会触发 lint 错误（`argsIgnorePattern: "^_"`）
- **分离 tsconfig**：
  - `tsconfig.client.json` — target ES2020, jsx: react-jsx, moduleResolution: bundler
  - `tsconfig.server.json` — target ES2022, module: NodeNext, moduleResolution: NodeNext
  - 两者均 include `shared/` 目录
- **`noUnusedLocals` + `noUnusedParameters`**：client 和 server 均启用
- **路径别名**（仅测试/Vitest 中生效）：`@` → `./src`，`@shared` → `./shared`，`@server` → `./server`

### 架构规则

- **四层目录结构**：
  - `src/` — React 前端（Vite 构建）
  - `server/` — Express 后端（tsx 运行）
  - `shared/` — 前后端共享类型、Schema、常量
  - `src/lib/` — 前端 API 客户端层（`api.ts`），封装所有 fetch 调用
- **共享层是唯一的类型来源**：所有接口定义在 `shared/types.ts`，所有 Zod Schema 定义在 `shared/schemas.ts`，所有常量定义在 `shared/constants.ts`。**禁止**在 `src/` 或 `server/` 中重复定义共享类型
- **服务端采用函数式导出**：服务层（`server/services/`）使用独立导出函数，**不使用 class**
- **路由层薄封装**：路由文件（`server/routes/`）只做请求解析、Zod 校验和响应格式化，业务逻辑全部委托给 service 层
- **API 前缀**：所有后端路由挂载在 `/api` 下
- **前端 API 层**：所有前端 fetch 调用必须通过 `src/lib/api.ts` 封装，不在组件/store 中直接调用 `fetch`
- **路由注册顺序**：`POST /api/workflows/preview` 必须在 `GET /api/workflows/:id` 之前注册；`GET /api/skills/errors` 必须在 `GET /api/skills/:id` 之前注册

### 错误处理规则

- **统一错误类**：所有后端业务错误**必须**使用 `AppError` 类（`server/types/errors.ts`），通过静态工厂方法创建
- **AppError 工厂方法完整列表**：
  - `AppError.notFound()` — 404
  - `AppError.badRequest()` — 400，code: `VALIDATION_ERROR`
  - `AppError.validationError()` — 400，code: `VALIDATION_ERROR`（语义更明确）
  - `AppError.parseError()` — 400，code: `PARSE_ERROR`
  - `AppError.internal()` — 500
  - `AppError.skillNotFound(skillId)` — 404，code: `SKILL_NOT_FOUND`
  - `AppError.configError()` — 500，code: `CONFIG_ERROR`
  - `AppError.fileWriteError()` — 500，code: `FILE_WRITE_ERROR`
  - `AppError.pathTraversal()` — **400**，code: `PATH_TRAVERSAL`
  - `AppError.scanPathNotFound(scanPath)` — 404，code: `SCAN_PATH_NOT_FOUND`
  - `AppError.scanPermissionDenied(scanPath)` — 403，code: `SCAN_PERMISSION_DENIED`
  - `AppError.pathPresetNotFound(id)` — 404，code: `PATH_PRESET_NOT_FOUND`
  - `AppError.bundleNotFound(id)` — 404，code: `BUNDLE_NOT_FOUND`
  - `AppError.bundleLimitExceeded()` — 400，code: `BUNDLE_LIMIT_EXCEEDED`
  - `AppError.bundleNameDuplicate(name)` — 400，code: `BUNDLE_NAME_DUPLICATE`
  - `AppError.skillReadonly(skillId)` — 403，code: `SKILL_READONLY`（外部 Skill 只读保护）
- **统一响应格式**- **统一响应格式**：所有 API 响应遵循 `ApiResponse<T>` 类型 — 成功时 `{ success: true, data: T }`，失败时 `{ success: false, error: { code, message, details? } }`
- **错误码常量**：使用 `shared/constants.ts` 中的 `ErrorCode` 常量，**禁止**硬编码错误码字符串
- **全局错误中间件**：`errorHandler` 中间件在所有路由之后注册，自动将 `AppError` 转为标准 JSON 响应
- **路由中的 try/catch**：每个路由处理器**必须**用 try/catch 包裹，catch 中调用 `next(err)` 传递给全局错误中间件

### 请求校验规则

- **Zod safeParse**：路由入口使用 `Schema.safeParse(req.body)` 校验请求体，校验失败时返回 400 + `VALIDATION_ERROR`
- **Schema 定义位置**：请求体 Schema 定义在 `shared/schemas.ts`（如 `UpdateSkillMetaBodySchema`），**不在路由文件中定义**
- **同步相关 Schema**：`SyncTargetCreateSchema`（POST /api/sync/targets）、`SyncTargetUpdateSchema`（PUT /api/sync/targets/:id）、`SyncPushRequestSchema`（POST /api/sync/push）
- **路径预设 Schema**：`PathPresetCreateSchema`（POST /api/path-presets）、`PathPresetUpdateSchema`（PUT /api/path-presets/:id）
- **`AppConfigSchema`**：包含 `pathPresets: z.array(PathPresetSchema).default([])`，旧版 settings.yaml 无此字段时自动默认 `[]`（向后兼容）
- **套件 Schema**：`SkillBundleCreateSchema`（POST /api/skill-bundles）、`SkillBundleUpdateSchema`（PUT /api/skill-bundles/:id）；`SkillBundleSchema` 含 `categoryNames.max(20)` 约束；`AppConfigSchema` 追加 `skillBundles: z.array(SkillBundleSchema).max(50).default([])` 和 `activeCategories: z.array(z.string()).default([])`，旧版 settings.yaml 无此字段时自动默认 `[]`（向后兼容）
- **外部仓库配置 Schema**：`RepoSkillMappingSchema`（`{ name, targetCategory }`）、`ExternalRepositorySchema`（`{ id, name, url, branch, skillsPath, enabled, include, exclude }`，`url` 校验 `z.string().regex(/^https:\/\/github\.com\//)`）、`RepositoriesConfigSchema`（`{ repositories: ExternalRepository[] }`）
- **SkillMeta 外部字段**：`SkillMetaSchema` 追加 `source: z.string().optional()`、`sourceUrl: z.string().url().optional()`、`sourceRepo: z.string().url().optional()`、`readonly: z.boolean().optional()`

### 安全规则

- **路径遍历防护**：`pathValidator` 中间件检测 `../`、URL 编码攻击（`%2e%2e`）等模式
- **`isSubPath()` 校验**：所有文件操作前**必须**验证目标路径在白名单目录内
- **分类名校验**：`importService` 使用 `VALID_CATEGORY_RE = /^[a-z0-9-]+$/` 校验分类名，防止路径注入
- **仅绑定 localhost**：服务器监听 `127.0.0.1`，不暴露到外网
- **`cleanupFiles` 路径安全**：`AppError.pathTraversal` 直接重新抛出（不吞掉），普通 IO 错误才计入 failed

### 文件写入规则

- **原子写入**：`atomicWrite()` 先写 `.tmp.{timestamp}` 临时文件，再通过 `fs.rename` 原子替换，防止中途中断产生损坏文件
- **并发安全写入**：`safeWrite()` 基于 `async-mutex`，同一文件路径使用独立 Mutex 串行写入，不同文件可并行
- **所有文件写入必须使用 `safeWrite()`**，不直接调用 `fs.writeFile()`（除非在 `skillService` 的 `moveSkillToCategory`/`updateSkillMeta` 中，这些已有缓存更新保护）

---

## 前端规则（React）

### 状态管理

- **Zustand store**：使用 `create<StoreType>((set) => ({...}))` 模式
- **Store 文件位置**：`src/stores/` 目录，kebab-case 命名
- **完整 Store 列表**：
  - `skill-store.ts` — Skill 列表、分类、搜索、视图模式
  - `sync-store.ts` — IDE 同步目标（`targets`）、选中 Skill（`selectedSkillIds`）、同步状态（`syncStatus`：idle/syncing/done/error/diffing）、最后同步时间（`lastSyncAt`）、差异报告（`diffReport`）；actions：`executeDiff`、`setDiffReport`
  - `ui-store.ts` — 侧边栏、预览面板、命令面板开关状态
  - `workflow-store.ts` — 工作流步骤编排
  - `bundle-store.ts` — 套件列表（`bundles`）、加载状态（`bundlesLoading`）、错误状态（`bundlesError`）、当前激活套件 ID（`activeBundleId`）；actions：`fetchBundles`、`createBundle`、`updateBundle`、`deleteBundle`、`applyBundle`
  - `source-store.ts` — 来源列表（`sources`）、加载状态（`sourcesLoading`）；来源数据从 `skills` 计算得出（按 `source` 字段分组）
- **异步操作**：在 store action 中处理，使用 `set({ loading: true })` / `set({ loading: false })` 模式
- **并行请求**：使用 `Promise.all()` 并行获取多个数据源

### API 客户端层

- **位置**：`src/lib/api.ts`
- **错误类**：`ApiError`（含 `code`、`message`、`details`），所有 API 错误通过此类抛出
- **运行时校验**：`apiCall()` 支持可选 Zod schema 参数，校验失败仅打印警告（不阻塞，避免后端字段微调导致前端崩溃）
- **完整 API 函数列表**：
  - Skill: `fetchSkills`、`fetchSkillById`、`fetchParseErrors`、`refreshSkills`
  - Category: `fetchCategories`、`createCategory`、`updateCategory`、`deleteCategory`
  - Skill 管理: `updateSkillMeta`、`moveSkillCategory`、`deleteSkill`
  - Import: `scanDirectory`、`importFiles`、`detectCodeBuddy`、`cleanupSourceFiles`
  - Workflow: `fetchWorkflows`、`fetchWorkflowDetail`、`createWorkflow`、`previewWorkflow`、`updateWorkflow`、`deleteWorkflow`
  - Sync Target: `fetchSyncTargets`、`addSyncTarget`、`updateSyncTarget`、`deleteSyncTarget`、`validateSyncPath`
  - Sync Push: `pushSync(skillIds, targetIds?, mode?: SyncMode)` — `SyncMode = 'full' | 'incremental' | 'replace'`；默认 `full`（向后兼容）
  - Sync Diff: `fetchSyncDiff(skillIds, targetId)` — 调用 `POST /api/sync/diff`，返回 `DiffReport`
  - Path Preset: `fetchPathPresets`、`addPathPreset`、`updatePathPreset`、`deletePathPreset`
  - Skill Bundle: `fetchSkillBundles`、`createSkillBundle`、`updateSkillBundle`、`deleteSkillBundle`、`applySkillBundle`
  - Stats: `fetchActivityStats(weeks?: number): Promise<ActivityDay[]>` — 调用 `GET /api/stats/activity?weeks={n}`；`ActivityDay = { date: string; count: number; files: string[] }`（YYYY-MM-DD 格式，files 为当日修改的文件名列表，不含路径和 .md 后缀）

### 组件结构

- **页面组件**：`src/pages/` — PascalCase 命名（如 `SkillBrowsePage.tsx`）
- **功能组件**：`src/components/{feature}/` — 按功能域分组（`skills/`、`layout/`、`shared/`、`ui/`、`import/`、`sync/`、`workflow/`、`settings/`、`stats/`）
  - `stats/` — 统计组件：`StatsPanel.tsx`（Skill/工作流/分类数量统计）、`ActivityHeatmap.tsx`（近 12 周活跃度热力图）
  - `skills/ViewTab.tsx` — 二级 Sidebar 视图切换组件（按分类/按来源）
  - `skills/SourceTree.tsx` — 按来源浏览组件（展示外部仓库列表及其 Skill）
  - `sync/SyncSplitButton.tsx` — 同步分裂按钮（增量同步/替换同步/查看差异）
  - `workflow/CustomStepCard.tsx` — 工作流自定义步骤卡片（虚线边框 + 自动扩展 Textarea）
- **UI 基础组件**：`src/components/ui/` — shadcn/ui 风格，使用 `cva` + `cn()` 工具函数
  - variants 逻辑拆分到独立文件：`badge-variants.ts`、`button-variants.ts`
- **共享组件**：`src/components/shared/` — `CommandPalette`、`ErrorBoundary`、`Toast`、`toast-store.ts`
- **自定义 Hooks**：`src/hooks/` — 如 `useSkillSearch.ts`（基于 fuse.js 的模糊搜索）
- **路由配置**：`src/App.tsx` 使用 `createBrowserRouter`，`AppLayout` 作为根布局组件
- **路由列表**：`/`（SkillBrowsePage）、`/workflow`（WorkflowPage）、`/sync`（SyncPage）、`/import`（ImportPage）、`/settings`（SettingsPage，Tab 化：「分类设置」+ 「套件管理」）、`/paths`（PathsPage，路径预设管理）
- **二级 Sidebar 视图切换**：`SecondarySidebar` 顶部有 `ViewTab` 组件，支持「按分类」和「按来源」两种浏览维度；按分类时显示 `CategoryTree`，按来源时显示 `SourceTree`（展示外部仓库列表）；`selectedSource` 和 `selectedCategory` 互斥管理
- **侧边栏布局（Epic 7 重设计）**：
  - 主 `Sidebar`（`src/components/layout/Sidebar.tsx`）：导航菜单 + 底部 `StatsPanel` + `ActivityHeatmap`；**不再**包含「分类」导航项和 `CategoryTree`
  - `SecondarySidebar`（`src/components/layout/SecondarySidebar.tsx`）：仅在路由 `/` 时由 `AppLayout` 条件渲染（`isSkillBrowsePage && <SecondarySidebar />`），内含 `ViewTab`（按分类/按来源切换）+ `CategoryTree`（按分类时）或 `SourceTree`（按来源时）+ 底部「管理分类」 NavLink（跳转 `/settings`）；宽度固定 `180px`
  - `AppLayout` 中布局顺序：`<Sidebar />` → `{isSkillBrowsePage && <SecondarySidebar />}` → `<main>`
### Toast 通知

- **`toast-store.ts`**：位于 `src/components/shared/`，提供 `toast.success()`、`toast.error()` 等方法
- `toast.error()` 支持 `{ details: string }` 选项，用于展示多行错误详情
- `toast.undoable(message, onUndo, onConfirm)` — 乐观 UI 撤销模式：立即执行 UI 更新，5 秒后调用 `onConfirm`（后端操作），撤销时调用 `onUndo` 恢复 UI；`pendingDeleteIds` Set 防止重复触发；`timerMap` 统一管理定时器，`dismissToast` 时正确清除

### 样式规则

- **暗色主题 only**：Code Dark (#0F172A) + Run Green (#22C55E) 配色方案
- **CSS 变量**：使用 HSL 格式的 CSS 变量（如 `--primary: 142.1 76.2% 36.3%`），通过 `hsl(var(--xxx))` 引用
- **字体**：标题/代码用 `Fira Code`，正文用 `Fira Sans`
- **Tailwind CSS v4**：通过 `@import "tailwindcss"` 导入，**不使用** `@tailwind` 指令
- **`@tailwindcss/typography`**：用于 Markdown 内容渲染区域的排版样式
- **无障碍**：`:focus-visible` 使用 primary 色 outline，支持 `prefers-reduced-motion`

---

## 服务端规则（Express）

### 路由文件列表

- `healthRoutes.ts` — `GET /api/health`（健康检查）
- `configRoutes.ts` — `GET /api/config`（应用配置读取）
- `skillRoutes.ts` — Skill CRUD（`/api/skills`、`/api/skills/:id`、`/api/skills/:id/meta`、`/api/skills/:id/category`、`/api/skills/errors`、`POST /api/refresh`）
- `categoryRoutes.ts` — 分类管理（`/api/categories`、`/api/categories/:name`）
- `importRoutes.ts` — 导入功能（`/api/import/scan`、`/api/import/execute`、`/api/import/detect-codebuddy`、`/api/import/cleanup`）
- `syncRoutes.ts` — 同步目标管理（`/api/sync/targets`、`/api/sync/targets/:id`、`POST /api/sync/validate-path`、`POST /api/sync/push`、`POST /api/sync/diff`）
- `workflowRoutes.ts` — 工作流 CRUD（`/api/workflows`、`/api/workflows/:id`、`POST /api/workflows/preview`）
- `pathPresetRoutes.ts` — 路径预设 CRUD（`/api/path-presets`、`/api/path-presets/:id`）
- `bundleRoutes.ts` — 套件 CRUD + 激活（`GET/POST /api/skill-bundles`、`PUT/DELETE /api/skill-bundles/:id`、`PUT /api/skill-bundles/:id/apply`、`GET /api/skill-bundles/export`（501 占位）、`POST /api/skill-bundles/import`（501 占位））
- `statsRoutes.ts` — 统计数据（`GET /api/stats/activity?weeks=12`）；扫描 `SKILLS_ROOT` 下所有 `.md` 文件的 `fs.stat().mtime`，按日期聚合，返回完整日期序列（含 0 次的日期）

### 服务文件列表

- `skillService.ts` — Skill 内存缓存管理、CRUD（`initializeSkillCache`、`refreshSkillCache`、`getAllSkills`、`getSkillMeta`、`getSkillFull`、`deleteSkill`、`moveSkillToCategory`、`updateSkillMeta`）
- `scanService.ts` — IDE 目录扫描（`scanDirectory`、`detectCodeBuddy`、`getDefaultScanPath`）
- `importService.ts` — 文件导入（`importFiles`、`cleanupFiles`、`getSkillsRoot`）
- `categoryService.ts` — 分类 CRUD（基于 `config/categories.yaml`）
- `configService.ts` — 应用配置读写（基于 `config/settings.yaml`，使用 `js-yaml`）
- `syncService.ts` — 同步目标 CRUD + 路径校验 + 推送（`getSyncTargets`、`addSyncTarget`、`updateSyncTarget`、`removeSyncTarget`、`validateSyncPath`、`pushSync`、`getSyncDiff`）；`pushSync` 支持 `mode` 参数（`full`/`incremental`/`replace`）；增量模式采用 mtime + md5 分层比较；`getSyncDiff` 返回 `DiffReport`（新增/修改/删除/未变化文件列表）；`pushSync` 扁平化复制，只取 `path.basename`，不保留分类子目录
- `workflowService.ts` — 工作流 CRUD + Markdown 解析（`getWorkflows`、`getWorkflowById`、`createWorkflow`、`updateWorkflow`、`deleteWorkflow`、`previewWorkflow`）；`getWorkflowById` 返回结构化 `steps`，前端无需自行解析 Markdown
- `pathPresetService.ts` — 路径预设 CRUD（`getPathPresets`、`addPathPreset`、`updatePathPreset`、`removePathPreset`）；复用 `syncService` 的 `readSettings`/`writeSettings` 模式
- `pathConfigService.ts` — 路径配置辅助服务（职责与 `pathPresetService` 有重叠，待后续 Epic 明确边界）
- `bundleService.ts` — 套件 CRUD + 激活（`getBundles`、`addBundle`、`updateBundle`、`removeBundle`、`applyBundle`、`ensureDefaultBundle`）；`getBundles()` 注入 `brokenCategoryNames` 字段（与 `categoryService.getCategories()` 做 diff）；`applyBundle` 以覆盖模式写入 `activeCategories`，跳过已删除分类引用，返回 `{ applied: string[], skipped: string[] }`；`ensureDefaultBundle()` 在服务启动时自动创建/更新默认套件（`bundle-default`），包含全部 9 个出厂分类

### 工具函数列表

- `server/utils/pathUtils.ts` — `normalizePath`、`slugify`、`isSubPath`、`resolveSkillPath`、`getRelativePath`、`getSkillId`
- `server/utils/fileUtils.ts` — `atomicWrite`、`safeWrite`、`_clearMutexCache`（测试用）
- `server/utils/frontmatterParser.ts` — `parseFrontmatter`（读文件版）、`parseRawFrontmatter`（不读文件版，用于导入场景）；解析外部 Skill 字段：`source`、`sourceUrl`、`sourceRepo`、`readonly`（`readonly` 严格 `=== true` 检查）
- `server/utils/yamlUtils.ts` — YAML 配置文件读写工具（基于 `js-yaml`）

---

## 测试规则

### 测试组织

- **目录结构**：
  ```
  tests/
  ├── unit/              # 单元测试（镜像 src/ 和 server/ 结构）
  │   ├── components/    # React 组件测试
  │   │   ├── ui/        # UI 基础组件测试（badge、button、checkbox、dialog、input、scroll-area、select、separator、tooltip、alert-dialog）
  │   │   └── ...        # CategoryTree、Header、SkillCard、StatusBar、Toast
  │   ├── hooks/         # 自定义 Hook 测试（useSkillSearch）
  │   ├── stores/        # Zustand store 测试（skill-store、ui-store）
  │   └── server/        # 后端服务/工具测试
  │       ├── services/  # categoryService、configService、importService、scanService、skillService
  │       ├── middleware/ # pathValidator
  │       └── utils/     # fileUtils、frontmatterParser、pathUtils、yamlUtils
  ├── integration/       # 集成测试
  │   └── api/           # API 端到端集成测试（import.test.ts、skills.test.ts）
  ├── e2e/               # Playwright E2E 测试
  │   ├── app.spec.ts
  │   ├── import.spec.ts
  │   └── skill-browsing.spec.ts
  ├── fixtures/          # 测试数据
  └── support/           # 测试辅助工具
      ├── fixtures/      # 工厂函数（factories.ts）
      ├── helpers/       # 通用辅助
      └── page-objects/  # Playwright Page Object（SkillBrowsePage、SkillCard）
  ```
- **文件命名**：`{module}.test.ts` 或 `{module}.test.tsx`
- **E2E 文件**：统一存放在 `tests/e2e/` 目录，使用 `.spec.ts` 后缀

### 测试配置

- **Vitest 环境**：`jsdom`，`globals: true`（无需显式 import `describe`/`it`/`expect`）
- **Setup 文件**：`tests/setup.ts` — 自动 cleanup DOM、mock localStorage/matchMedia/ResizeObserver/IntersectionObserver
- **Coverage**：v8 provider，排除 `node_modules/`、`tests/`、`*.d.ts`、`*.config.*`、`types/`、`dist/`
- **React 测试**：使用 `@testing-library/react` + `@testing-library/user-event` + `@testing-library/jest-dom`
- **API 测试**：使用 `supertest` 测试 Express 路由
- **测试数据**：使用 `@faker-js/faker` 生成，工厂函数在 `tests/support/fixtures/factories.ts`

### 测试规范

- **每个 task 必须有单元测试**：story 实现中每个 task 完成后必须编写对应的单元测试
- **QA 阶段**：story 完成后必须经过 QA 阶段（生成集成/E2E 测试），全部测试 100% 通过后才能进入 code review
- **`tsc --noEmit` 零错误**：进入 QA 阶段前必须通过类型检查

---

## 代码质量与风格规则

### Prettier 配置

- 分号：**是**（`semi: true`）
- 引号：**双引号**（`singleQuote: false`）
- 缩进：2 空格
- 尾逗号：**全部**（`trailingComma: "all"`）
- 行宽：80 字符
- 箭头函数参数：**始终加括号**（`arrowParens: "always"`）
- 换行符：LF
- 自动整理 import 顺序（`prettier-plugin-organize-imports`）

### ESLint 配置

- **flat config 格式**（`eslint.config.js`），**不使用** `.eslintrc`
- React Hooks 规则：`react-hooks/recommended`
- React Refresh：`only-export-components` (warn)
- 测试文件放宽：`no-explicit-any: off`

### 命名约定

- **文件命名**：kebab-case（如 `skill-store.ts`、`pathUtils.ts`、`errorHandler.ts`）
- **React 组件文件**：PascalCase（如 `SkillCard.tsx`、`AppLayout.tsx`）
- **常量**：UPPER_SNAKE_CASE（如 `ErrorCode.SKILL_NOT_FOUND`）
- **类型/接口**：PascalCase（如 `SkillMeta`、`ApiResponse<T>`）
- **Zod Schema**：PascalCase + `Schema` 后缀（如 `SkillMetaSchema`）
- **路由文件**：camelCase + `Routes` 后缀（如 `skillRoutes.ts`）
- **服务文件**：camelCase + `Service` 后缀（如 `skillService.ts`）

### 文件头注释

- 服务端文件使用标准注释头格式：
  ```typescript
  // ============================================================
  // {path} — {简短描述}
  // ============================================================
  ```

### 配置文件格式

- **YAML 配置**：`config/categories.yaml`（分类）、`config/settings.yaml`（设置）、`config/repositories.yaml`（外部仓库注册）
- **`config/repositories.yaml`**：配置文件驱动的多仓库注册机制，定义外部 Skill 仓库列表（首批：`anthropics/skills`）；每个仓库含 `id`、`name`、`url`、`branch`、`skillsPath`、`enabled`、`include`（白名单映射）、`exclude`（黑名单 glob）
- **环境变量**：`.env.example` 提供模板，端口配置 `PORT=3001`（开发）/ `3000`（生产）

### 外部 Skill 同步脚本与 CI

- **同步脚本**：`scripts/sync-external-skills.mjs` — 从 GitHub 仓库拉取外部 Skill，经白名单/黑名单筛选后同步到 `skills/` 目录；自动注入 Frontmatter 字段（`source`、`sourceUrl`、`sourceRepo`、`readonly: true`）
- **GitHub Action**：`.github/workflows/sync-external-skills.yml` — 定时触发（cron）+ 手动触发（`workflow_dispatch`），执行同步脚本并自动创建 PR
- **Git 隔离**：克隆的仓库缓存在 `skill-repos/` 目录（已加入 `.gitignore`），不提交到版本库

---

## 开发工作流规则

### Git Hooks

- **pre-commit**：Husky + lint-staged 自动运行
  - `*.{ts,tsx,js,jsx,cjs,mjs}` → `eslint --max-warnings=0` + `prettier --check`
  - `*.{json,css,md,html,yaml,yml}` → `prettier --check`
- **pre-push**：仅在 `main` / `master` 分支触发，基于 Conventional Commits 语义自动发版
  - 分析上一个 tag 到 HEAD 之间的 commit message
  - **SemVer 映射规则**：
    | commit 类型 | 触发动作 |
    |---|---|
    | `feat!:` / `fix!:` / `BREAKING CHANGE` | `npm run release:minor`（+0.1.0） |
    | `feat:` / `fix:` / `perf:` | `npm run release:patch`（+0.0.1） |
    | `docs:` / `chore:` / `refactor:` 等 | 跳过，不发版 |
  - ⚠️ **`feat:` 只触发 patch**，不触发 minor；只有带 `!` 的破坏性变更才触发 minor
  - ⚠️ 非主分支 push 直接跳过，不执行任何发版操作
  - ⚠️ 无新 commit（相对上一 tag）时跳过

### 开发命令

- `npm run dev` — 并行启动前端 (Vite:5173) + 后端 (tsx watch:3001)
- `npm run build` — `tsc --noEmit` + `vite build`
- `npm run test` — Vitest watch 模式
- `npm run test:run` — Vitest 单次运行
- `npm run test:coverage` — Vitest 覆盖率报告
- `npm run test:e2e` — Playwright E2E 测试
- `npm run typecheck` — TypeScript 类型检查

### Vite 代理

- 开发模式下 `/api` 请求代理到 `http://localhost:3001`
- 生产模式下 Express 直接 serve 静态文件 + SPA fallback

### Skill 文件约定

- Skill 文件存放在 `skills/` 目录，按分类子目录组织
- 每个 Skill 是一个 `.md` 文件，包含 YAML Frontmatter（name、description、category、tags 等）
- **外部 Skill 额外 Frontmatter 字段**：`source`（仓库 ID）、`sourceUrl`（GitHub 文件 URL）、`sourceRepo`（仓库 URL）、`readonly: true`
- Skill ID 由文件名 slug 化生成（`slugify()` 函数：去 .md 后缀、特殊字符转连字符、保留中文、小写化）
- 启动时异步扫描 `skills/` 目录并缓存到内存 Map
- **预设分类（9 个）**：`coding`、`writing`、`devops`、`workflows`、`document-processing`、`dev-tools`、`testing`、`design`、`meta-skills`
- **默认套件**：`bundle-default`（固定 ID，不可删除），包含全部 9 个出厂分类；服务启动时由 `ensureDefaultBundle()` 自动创建/更新

---

## 关键反模式（禁止事项）

### 绝对禁止

- ❌ **不要在 `src/` 或 `server/` 中定义共享类型** — 必须放在 `shared/`
- ❌ **不要在路由中编写业务逻辑** — 委托给 service 层
- ❌ **不要使用 class 定义服务** — 使用函数式导出
- ❌ **不要硬编码错误码字符串** — 使用 `ErrorCode` 常量
- ❌ **不要跳过 Zod 校验** — 所有外部输入必须经过 Schema 校验
- ❌ **不要在文件操作前跳过路径安全校验** — 必须使用 `isSubPath()` 或 `pathValidator`
- ❌ **不要使用原生 `fs` 模块** — 使用 `fs-extra`
- ❌ **不要使用 `require()`** — 项目是 ESM，使用 `import`
- ❌ **不要使用 `.eslintrc` 格式** — 使用 flat config（`eslint.config.js`）
- ❌ **不要使用 `@tailwind` 指令** — Tailwind v4 使用 `@import "tailwindcss"`
- ❌ **不要使用亮色主题样式** — 本项目仅暗色主题
- ❌ **不要在组件/store 中直接调用 `fetch`** — 必须通过 `src/lib/api.ts` 封装
- ❌ **不要直接调用 `fs.writeFile()`** — 使用 `safeWrite()` 保证原子性和并发安全
- ❌ **不要对外部 Skill（`readonly: true`）执行编辑/删除/移动操作** — 后端 `skillService` 的 `deleteSkill`、`moveSkillToCategory`、`updateSkillMeta` 均有 `readonly` 拦截，前端 SkillPreview 禁用编辑/删除按钮

### 容易遗漏的细节

- ⚠️ 服务端 import **必须**带 `.js` 扩展名（ESM + NodeNext 要求）
- ⚠️ `skills/errors` 路由必须在 `skills/:id` 之前注册（否则 "errors" 被当作 `:id`）
- ⚠️ Skill ID 冲突时自动添加数字后缀（`id-2`、`id-3`...）
- ⚠️ `errorHandler` 中间件**必须**在所有路由之后注册
- ⚠️ 服务器绑定 `127.0.0.1` 而非 `0.0.0.0`
- ⚠️ `initializeSkillCache()` 在服务启动后异步执行，不阻塞 HTTP 服务
- ⚠️ `gray-matter` 用于 Frontmatter 解析和序列化（`matter()` 解析，`matter.stringify()` 序列化）
- ⚠️ 路径归一化使用 POSIX 风格正斜杠（`normalizePath()` 函数）
- ⚠️ CSS 变量使用 HSL 值（不含 `hsl()` 包裹），在使用时才加 `hsl(var(--xxx))`
- ⚠️ `importService` 分类名必须通过 `VALID_CATEGORY_RE = /^[a-z0-9-]+$/` 校验，防止路径注入
- ⚠️ `AppError.pathTraversal()` 返回 **400**（不是 403），`scanPermissionDenied` 才是 403
- ⚠️ `parseRawFrontmatter()` 是不读文件的解析变体，用于导入场景（调用方已持有文件内容）
- ⚠️ `lint-staged` 使用 `eslint --max-warnings=0`，提交时零警告容忍
- ⚠️ `cleanupFiles` 中 `AppError`（路径安全拒绝）直接重新抛出，不计入 failed 统计
- ⚠️ `pushSync` 同步推送是**扁平化**复制：只取文件名（`path.basename`），不保留分类子目录结构
- ⚠️ `pushSync` 同名文件默认覆盖，在结果中标注 `overwritten` 状态
- ⚠️ 工作流文件存储在 `skills/workflows/` 目录，Frontmatter 包含 `type: "workflow"` 和 `category: "workflows"`
- ⚠️ **工作流自定义步骤**：`WorkflowStep` 新增 `type: 'skill' | 'custom'` 字段；`skillId` 和 `skillName` 改为 `string | null`；自定义步骤无关联 Skill，只有自然语言描述；向后兼容旧工作流文件（缺失 `type` 字段时默认为 `'skill'`）
- ⚠️ 工作流创建/更新/删除后自动调用 `refreshSkillCache()` 刷新缓存
- ⚠️ 同步目标数据存储在 `config/settings.yaml` 的 `sync.targets` 字段中
- ⚠️ **同步多模式**：`pushSync` 支持 `mode` 参数：`full`（全量覆盖，默认，向后兼容）、`incremental`（增量，mtime + md5 分层比较，跳过未变化文件）、`replace`（替换，先备份目标目录再清空全量写入）；`POST /api/sync/diff` 端点返回 `DiffReport`（`{ added, modified, deleted, unchanged }`）
- ⚠️ `addSyncTarget` / `updateSyncTarget` 会校验路径必须是绝对路径，且路径不能与已有目标重复（`path.normalize` 对比）
- ⚠️ `addPathPreset` / `updatePathPreset` 同样校验绝对路径 + 重复检测（`path.normalize` 对比）
- ⚠️ 路径预设数据存储在 `config/settings.yaml` 的 `pathPresets` 字段中（与 `sync` 并列）
- ⚠️ 旧版 `settings.yaml` 无 `pathPresets` 字段时，读取结果默认为 `[]`（向后兼容，`AppConfigSchema` 中 `.default([])`）
- ⚠️ 路径预设 ID 生成格式：`preset-{ts36}-{rand4}`（`generateId()` 函数，无需引入新依赖）
- ⚠️ 套件 ID 生成格式：`bundle-{ts36}-{rand4}`（同 `generateId()` 模式）
- ⚠️ 套件名称正则校验：`/^[a-z0-9-]+$/`（与 `importService` 的 `VALID_CATEGORY_RE` 一致，防路径注入）
- ⚠️ 套件数量上限 50 个（`BUNDLE_LIMIT = 50`）；每个套件 `categoryNames` 最多 20 个
- ⚠️ `GET /api/skill-bundles/export` 必须在 `GET /api/skill-bundles/:id` 之前注册（防止 "export" 被当作 `:id`）
- ⚠️ `bundleService` 不感知 `categoryService` 的删除操作（职责分离）；损坏引用在 `getBundles()` 读取时动态计算，不阻断分类删除
- ⚠️ `applyBundle` 激活套件时以**覆盖模式**写入 `activeCategories`（不叠加），自动跳过已删除分类
- ⚠️ 套件数据存储在 `config/settings.yaml` 的 `skillBundles` 字段；`activeCategories` 字段记录当前激活的分类列表
- ⚠️ `SettingsPage.tsx` 使用 shadcn/ui `Tabs` 组件实现 Tab 化，「分类设置」Tab 渲染 `CategoryManager`（零改动），「套件管理」Tab 渲染 `BundleManager`
- ⚠️ **Tabs 滑块动画（Epic 7）**：`TabsList` 组件内部有绝对定位的滑块 `div`（`data-testid="tab-slider"`），使用 `transform: translateX(activeIndex * 100%)` + `transition: transform 200ms ease-in-out` 实现平移动画；`TabsTrigger` 已移除激活背景样式（`bg-[hsl(var(--background))] shadow`），改为仅文字颜色区分（激活：`text-[hsl(var(--foreground))]`，非激活：`text-[hsl(var(--muted-foreground))]`）；`TabsTrigger` 必须有 `relative z-10` 确保文字在滑块层之上；`prefers-reduced-motion` 时 `transition: none`
- ⚠️ `ActivityHeatmap` 颜色映射：0 次 → `hsl(var(--muted))`；1-2 次 → `hsl(var(--primary) / 0.3)`；3-5 次 → `hsl(var(--primary) / 0.6)`；6+ 次 → `hsl(var(--primary))`；hover 豆点时显示 Radix Tooltip 浮窗（日期粗体 + 修改次数 + 文件名列表，最多 10 个，超出显示 `+N more`；count=0 时显示「无修改」）；`TooltipProvider` 包裹整个 grid，`delayDuration={200}`
- ⚠️ `StatsPanel` 统计逻辑：`skillCount = skills.filter(sk => sk.type !== 'workflow').length`；`workflowCount = skills.filter(sk => sk.type === 'workflow').length`；数据来源 `useSkillStore`，无需额外 API
- ⚠️ `statsRoutes` 中 `weeks` 参数范围限制：`Math.max(1, Math.min(52, parseInt(...) || 12))`，防止异常值
- ⚠️ `SecondarySidebar` 中 `CategoryTree` **零改动**原则：分类筛选交互行为与之前完全一致，`CategoryTree.tsx` 不做任何修改
- ⚠️ `bundle-store.ts` 的 `activeBundleId` 为前端本地状态，激活后通过 `set({ activeBundleId: id })` 更新，用于控制套件卡片的「已激活」视觉标识
- ⚠️ `POST /api/workflows/preview` 必须在 `GET /api/workflows/:id` 之前注册（否则 "preview" 被当作 `:id`）
- ⚠️ `workflowService.findWorkflowFile` 通过 `slugify(file) === id` 匹配文件，区分大小写
- ⚠️ `toast.undoable()` 乐观删除模式：立即更新 UI → 5 秒后调用后端 → 失败时恢复；`pendingDeleteIds` Set 防重复触发；`timerMap` 统一管理定时器
- ⚠️ `SyncStatusIndicator` 相对时间每 30 秒刷新（`setInterval`），组件卸载时必须 `clearInterval`
- ⚠️ `pathConfigService.ts` 与 `pathPresetService.ts` 职责有重叠，后续 Epic 需明确边界
- ⚠️ **外部 Skill 类型扩展**：`SkillMeta` 新增 4 个可选字段 `source?`、`sourceUrl?`、`sourceRepo?`、`readonly?`，所有字段均为 `optional`，现有 Skill 无这些字段时解析不报错（向后兼容）
- ⚠️ `readonly` 字段严格检查 `data.readonly === true`（不是 truthy），避免 `"true"` 字符串误判
- ⚠️ `AppError.skillReadonly(skillId)` 返回 **403**，code: `SKILL_READONLY`；在 `skillService` 的 `deleteSkill`、`moveSkillToCategory`、`updateSkillMeta` 三处拦截
- ⚠️ `SkillCard` 外部 Skill 显示来源 Badge（`GitBranch` 图标 + `source` 文本，可点击跳转 `sourceUrl`）+ 右下角锁图标（`Lock`）
- ⚠️ `SkillPreview` 外部 Skill 显示来源信息区域（仓库名 + GitHub 链接），元数据编辑和删除按钮 `disabled`
- ⚠️ `config/repositories.yaml` 是外部仓库注册的唯一配置来源；`ExternalRepositorySchema.url` 使用 GitHub regex 校验（`/^https:\/\/github\.com\//`），`SkillMeta.sourceUrl`/`sourceRepo` 使用通用 `z.string().url()` 校验
- ⚠️ `scripts/sync-external-skills.mjs` 同步脚本：克隆/拉取仓库到 `skill-repos/`，按 `include` 白名单映射分类，按 `exclude` 黑名单过滤，自动注入 Frontmatter（`source`、`sourceUrl`、`sourceRepo`、`readonly: true`）
- ⚠️ `skill-repos/` 目录已加入 `.gitignore`，不提交到版本库
- ⚠️ `.github/workflows/sync-external-skills.yml` 支持 cron 定时触发 + `workflow_dispatch` 手动触发，执行同步脚本后自动创建 PR
- ⚠️ 默认套件 `bundle-default`（固定 ID）不可删除（`removeBundle` 中拦截）；`ensureDefaultBundle()` 在服务启动时自动创建或更新，`categoryNames` 始终同步为全部 9 个出厂分类
- ⚠️ 预设分类从 4 个扩展到 9 个：新增 `document-processing`、`dev-tools`、`testing`、`design`、`meta-skills`

---

## 使用指南

**AI 代理须知：**

- 实现任何代码前先阅读本文件
- **严格**遵循所有规则
- 有疑问时选择更严格的选项
- 发现新模式时更新本文件

**维护须知：**

- 技术栈变更时及时更新
- 定期审查移除过时规则
- 保持精简，聚焦于 LLM 容易遗漏的细节

最后更新：2026-04-15（V2 功能全量完成后更新：V2 Epic 1~4 全部 done，包含同步多模式、来源视图浏览、工作流自定义步骤、默认套件全选修复）
