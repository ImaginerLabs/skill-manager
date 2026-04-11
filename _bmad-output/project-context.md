---
project_name: skill-package
user_name: Alex
date: "2026-04-11"
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
rule_count: 52
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
- **统一响应格式**：所有 API 响应遵循 `ApiResponse<T>` 类型 — 成功时 `{ success: true, data: T }`，失败时 `{ success: false, error: { code, message, details? } }`
- **错误码常量**：使用 `shared/constants.ts` 中的 `ErrorCode` 常量，**禁止**硬编码错误码字符串
- **全局错误中间件**：`errorHandler` 中间件在所有路由之后注册，自动将 `AppError` 转为标准 JSON 响应
- **路由中的 try/catch**：每个路由处理器**必须**用 try/catch 包裹，catch 中调用 `next(err)` 传递给全局错误中间件

### 请求校验规则

- **Zod safeParse**：路由入口使用 `Schema.safeParse(req.body)` 校验请求体，校验失败时返回 400 + `VALIDATION_ERROR`
- **Schema 定义位置**：请求体 Schema 定义在 `shared/schemas.ts`（如 `UpdateSkillMetaBodySchema`），**不在路由文件中定义**

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
  - `sync-store.ts` — IDE 同步目标、选中 Skill、同步状态
  - `ui-store.ts` — 侧边栏、预览面板、命令面板开关状态
  - `workflow-store.ts` — 工作流步骤编排
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

### 组件结构

- **页面组件**：`src/pages/` — PascalCase 命名（如 `SkillBrowsePage.tsx`）
- **功能组件**：`src/components/{feature}/` — 按功能域分组（`skills/`、`layout/`、`shared/`、`ui/`、`import/`、`sync/`、`workflow/`、`settings/`）
- **UI 基础组件**：`src/components/ui/` — shadcn/ui 风格，使用 `cva` + `cn()` 工具函数
  - variants 逻辑拆分到独立文件：`badge-variants.ts`、`button-variants.ts`
- **共享组件**：`src/components/shared/` — `CommandPalette`、`ErrorBoundary`、`Toast`、`toast-store.ts`
- **自定义 Hooks**：`src/hooks/` — 如 `useSkillSearch.ts`（基于 fuse.js 的模糊搜索）
- **路由配置**：`src/App.tsx` 使用 `createBrowserRouter`，`AppLayout` 作为根布局组件
- **路由列表**：`/`（SkillBrowsePage）、`/workflow`、`/sync`、`/import`、`/settings`

### Toast 通知

- **`toast-store.ts`**：位于 `src/components/shared/`，提供 `toast.success()`、`toast.error()` 等方法
- `toast.error()` 支持 `{ details: string }` 选项，用于展示多行错误详情

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

### 服务文件列表

- `skillService.ts` — Skill 内存缓存管理、CRUD（`initializeSkillCache`、`refreshSkillCache`、`getAllSkills`、`getSkillMeta`、`getSkillFull`、`deleteSkill`、`moveSkillToCategory`、`updateSkillMeta`）
- `scanService.ts` — IDE 目录扫描（`scanDirectory`、`detectCodeBuddy`、`getDefaultScanPath`）
- `importService.ts` — 文件导入（`importFiles`、`cleanupFiles`、`getSkillsRoot`）
- `categoryService.ts` — 分类 CRUD（基于 `config/categories.yaml`）
- `configService.ts` — 应用配置读写（基于 `config/settings.yaml`，使用 `js-yaml`）

### 工具函数列表

- `server/utils/pathUtils.ts` — `normalizePath`、`slugify`、`isSubPath`、`resolveSkillPath`、`getRelativePath`、`getSkillId`
- `server/utils/fileUtils.ts` — `atomicWrite`、`safeWrite`、`_clearMutexCache`（测试用）
- `server/utils/frontmatterParser.ts` — `parseFrontmatter`（读文件版）、`parseRawFrontmatter`（不读文件版，用于导入场景）
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
  │   └── skill-browsing.spec.ts
  ├── fixtures/          # 测试数据
  └── support/           # 测试辅助工具
      ├── fixtures/      # 工厂函数（factories.ts）
      ├── helpers/       # 通用辅助
      └── page-objects/  # Playwright Page Object（SkillBrowsePage、SkillCard）
  ```
- **文件命名**：`{module}.test.ts` 或 `{module}.test.tsx`
- **E2E 文件**：`e2e/` 根目录和 `tests/e2e/` 目录，使用 `.spec.ts` 后缀

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

- **YAML 配置**：`config/categories.yaml`（分类）、`config/settings.yaml`（设置）
- **环境变量**：`.env.example` 提供模板，端口配置 `PORT=3001`（开发）/ `3000`（生产）

---

## 开发工作流规则

### Git Hooks

- **pre-commit**：Husky + lint-staged 自动运行
  - `*.{ts,tsx,js,jsx,cjs,mjs}` → `eslint --max-warnings=0` + `prettier --check`
  - `*.{json,css,md,html,yaml,yml}` → `prettier --check`

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
- Skill ID 由文件名 slug 化生成（`slugify()` 函数：去 .md 后缀、特殊字符转连字符、保留中文、小写化）
- 启动时异步扫描 `skills/` 目录并缓存到内存 Map

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

最后更新：2026-04-11
