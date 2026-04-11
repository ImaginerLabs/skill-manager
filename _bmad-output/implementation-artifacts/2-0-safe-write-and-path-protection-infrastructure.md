# Story 2.0: 安全写入与路径防护基础设施

Status: done

## Story

As a 开发者,
I want 拥有安全的文件写入和路径防护工具函数,
So that 导入、移动等写操作能防止数据损坏和路径安全问题。

## Acceptance Criteria

1. **AC-1: 原子写入函数**
   - Given `server/utils/` 目录已包含 Story 0.3 的基础工具（pathUtils.ts, frontmatterParser.ts, yamlUtils.ts）
   - When 调用 `atomicWrite(filePath, content)` 函数
   - Then 先写入 `.tmp.{timestamp}` 临时文件，再通过 `fs.rename` 原子替换目标文件（AR11）
   - And 写入中途中断（如进程崩溃）不产生损坏的目标文件
   - And 写入前自动确保目标目录存在（`fs.ensureDir`）
   - And 写入失败时清理临时文件（如果存在）
   - And 错误信息包含文件路径和原始错误详情

2. **AC-2: 并发安全写入函数**
   - Given `async-mutex` 已安装
   - When 并发 10 次调用 `safeWrite(filePath, content)` 写入同一文件
   - Then 所有写入按顺序执行，无数据损坏（AR12）
   - And `safeWrite` 内部使用 `atomicWrite` 执行实际写入
   - And 每个文件路径使用独立的 Mutex（不同文件可并行写入）

3. **AC-3: 路径遍历防护中间件**
   - Given Express 路由接收包含路径参数的请求
   - When 路径包含 `../`、`..\\`、`%2e%2e` 等遍历攻击模式
   - Then `middleware/pathValidator.ts` 中间件拒绝请求，返回 400 + `PATH_TRAVERSAL` 错误码（NFR6）
   - And 中间件可配置白名单目录列表
   - And 中间件复用 `pathUtils.isSubPath()` 进行路径校验

4. **AC-4: 写入错误信息清晰**
   - Given 写入操作遇到错误（权限不足、磁盘空间不足等）
   - When 错误被捕获
   - Then 返回 `AppError.fileWriteError()` 并包含清晰的错误信息（FR35）
   - And 错误信息包含：操作类型（写入/重命名）、文件路径、原始错误消息

5. **AC-5: TypeScript 编译与测试通过**
   - Given 所有文件已创建
   - When 运行 `tsc --noEmit` 和 `vitest run`
   - Then 编译通过，无错误
   - And 所有单元测试通过

## Tasks / Subtasks

- [x] Task 1: 安装 `async-mutex` 依赖 (AC: #2)
  - [x] 1.1 运行 `npm install async-mutex`
  - [x] 1.2 确认 `package.json` 中已添加依赖

- [x] Task 2: 创建 `server/utils/fileUtils.ts` — 原子写入 (AC: #1)
  - [x] 2.1 实现 `atomicWrite(filePath: string, content: string): Promise<void>`
    - 生成临时文件路径：`${filePath}.tmp.${Date.now()}`
    - `await fs.ensureDir(path.dirname(filePath))` 确保目录存在
    - `await fs.writeFile(tmpPath, content, 'utf-8')` 写入临时文件
    - `await fs.rename(tmpPath, filePath)` 原子替换
    - `finally` 块中清理临时文件（`fs.remove(tmpPath).catch(() => {})`)
    - 错误时抛出 `AppError.fileWriteError()` 并包含路径和原始错误
  - [x] 2.2 编写 `atomicWrite` 单元测试
    - 测试正常写入成功
    - 测试目录不存在时自动创建
    - 测试写入失败时清理临时文件
    - 测试错误信息包含文件路径

- [x] Task 3: 实现 `safeWrite` 并发控制 (AC: #2)
  - [x] 3.1 实现文件级 Mutex 管理：`Map<string, Mutex>` + `getMutex(filePath)` 辅助函数
  - [x] 3.2 实现 `safeWrite(filePath: string, content: string): Promise<void>`
    - 获取文件路径对应的 Mutex
    - `const release = await mutex.acquire()`
    - `try { await atomicWrite(filePath, content) } finally { release() }`
  - [x] 3.3 编写 `safeWrite` 单元测试
    - 测试单次写入成功
    - 测试并发 10 次写入同一文件无损坏
    - 测试不同文件路径使用独立 Mutex（可并行）

- [x] Task 4: 创建 `server/middleware/pathValidator.ts` — 路径遍历防护中间件 (AC: #3)
  - [x] 4.1 实现 `createPathValidator(allowedRoots: string[]): RequestHandler` 中间件工厂
    - 从请求中提取路径参数（`req.params`、`req.body` 中的路径字段）
    - 对每个路径参数调用 `isSubPath()` 校验是否在白名单目录内
    - 检测 URL 编码的遍历模式（`%2e%2e`、`%2f`）
    - 校验失败时调用 `next(AppError.pathTraversal())`
  - [x] 4.2 实现 `validatePathParam(paramValue: string, allowedRoots: string[]): boolean` 独立校验函数
    - 先 URL 解码
    - 检查是否包含 `..` 路径段
    - 调用 `isSubPath()` 校验
  - [x] 4.3 编写 `pathValidator` 单元测试
    - 测试正常路径通过
    - 测试 `../` 路径被拒绝
    - 测试 `..\` 路径被拒绝
    - 测试 `%2e%2e%2f` URL 编码路径被拒绝
    - 测试白名单目录内的路径通过
    - 测试白名单目录外的路径被拒绝

- [x] Task 5: 验证与集成 (AC: #5)
  - [x] 5.1 运行 `tsc --noEmit` 确认编译通过
  - [x] 5.2 运行 `vitest run` 确认所有测试通过
  - [x] 5.3 确认现有测试不受影响（无回归）

### Review Findings

- [x] [Review][Patch] P1: 前端 importFiles() 未传递 scanRoot 参数，自定义扫描路径场景下导入完全不可用 [src/lib/api.ts, src/pages/ImportPage.tsx] — 已修复
- [x] [Review][Patch] P2: cleanup 路由未传递 allowedRoot，自定义路径场景下清理失败 [server/routes/importRoutes.ts] — 已修复
- [x] [Review][Patch] P3: cleanupFiles 路径校验失败直接 throw 中断整个循环 [server/services/importService.ts] — 已修复
- [x] [Review][Patch] P4: /api/import/cleanup 缺少 Zod Schema 校验 [server/routes/importRoutes.ts, shared/schemas.ts] — 已修复
- [x] [Review][Patch] P5: collectMdFiles 未检测 symlink 循环 [server/services/scanService.ts] — 已修复
- [x] [Review][Defer] ImportPage 组件过大（386行），缺少组件拆分 — deferred, pre-existing
- [x] [Review][Defer] SKILLS_ROOT 硬编码为相对路径 — deferred, pre-existing

## Dev Notes

### 架构约束（必须遵守）

1. **后端 ESM 模块系统** — 项目使用 `"type": "module"`，所有 import 需要 `.js` 扩展名
   ```typescript
   import { AppError } from "../types/errors.js";
   import { isSubPath, normalizePath } from "./pathUtils.js";
   ```
2. **TypeScript strict mode** — 所有文件必须通过 strict 模式编译
3. **错误处理** — 所有错误使用 `AppError` 类，包含 `code` 和 `statusCode`
4. **文件操作** — 使用 `fs-extra`（已安装 ^11.3.4），不要使用原生 `fs`

### 已有代码上下文

**已安装的相关依赖（package.json）：**

- `fs-extra` ^11.3.4 — 增强文件操作（ensureDir, remove 等）
- ⚠️ `async-mutex` **未安装** — Task 1 需要先安装

**已有的工具函数（`server/utils/pathUtils.ts`）：**

- `normalizePath(inputPath)` — POSIX 风格路径归一化
- `resolveSkillPath(relativePath, skillsRoot)` — 基于 skills/ 根目录解析绝对路径
- `isSubPath(childPath, parentPath)` — 校验子路径是否在父路径内（**pathValidator 必须复用此函数**）
- `slugify(filename)` — 文件名转 slug

**已有的错误类型（`server/types/errors.ts`）：**

- `AppError.fileWriteError(message)` — 文件写入错误（ErrorCode.FILE_WRITE_ERROR, 500）
- `AppError.pathTraversal(message)` — 路径遍历攻击（ErrorCode.PATH_TRAVERSAL, 400）

**已有的常量（`shared/constants.ts`）：**

- `ErrorCode.FILE_WRITE_ERROR` — 文件写入错误码
- `ErrorCode.PATH_TRAVERSAL` — 路径遍历错误码

**已有的中间件模式（`server/middleware/errorHandler.ts`）：**

```typescript
// Express 中间件签名参考
import type { Request, Response, NextFunction } from "express";
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void { ... }
```

### 关键实现细节

**atomicWrite 实现参考（来自 architecture.md）：**

```typescript
async function atomicWrite(filePath: string, content: string): Promise<void> {
  const tmpPath = `${filePath}.tmp.${Date.now()}`;
  await fs.ensureDir(path.dirname(filePath));
  try {
    await fs.writeFile(tmpPath, content, "utf-8");
    await fs.rename(tmpPath, filePath);
  } catch (err) {
    // 清理临时文件
    await fs.remove(tmpPath).catch(() => {});
    throw AppError.fileWriteError(
      `写入文件失败 [${filePath}]: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
```

**safeWrite 并发控制参考（来自 architecture.md）：**

```typescript
import { Mutex } from "async-mutex";

// 每个文件路径一个独立 Mutex，不同文件可并行写入
const mutexMap = new Map<string, Mutex>();

function getMutex(filePath: string): Mutex {
  const normalized = normalizePath(path.resolve(filePath));
  if (!mutexMap.has(normalized)) {
    mutexMap.set(normalized, new Mutex());
  }
  return mutexMap.get(normalized)!;
}

async function safeWrite(filePath: string, content: string): Promise<void> {
  const mutex = getMutex(filePath);
  const release = await mutex.acquire();
  try {
    await atomicWrite(filePath, content);
  } finally {
    release();
  }
}
```

**pathValidator 中间件设计：**

```typescript
import type { RequestHandler } from "express";

// 中间件工厂 — 传入白名单目录列表
export function createPathValidator(allowedRoots: string[]): RequestHandler {
  return (req, res, next) => {
    // 校验 req.params 和 req.body 中的路径字段
    // 失败时 next(AppError.pathTraversal())
    // 成功时 next()
  };
}

// 独立校验函数 — 可在非中间件场景使用
export function validatePathParam(
  paramValue: string,
  allowedRoots: string[],
): boolean {
  // URL 解码 → 检查 .. → isSubPath 校验
}
```

### 不要做的事情（防止过度实现）

- ❌ 不要实现 chokidar 文件监听（Post-MVP）
- ❌ 不要实现自触发过滤模式（Post-MVP，需要 chokidar）
- ❌ 不要创建 Express 路由或 API 端点（本 Story 只创建工具函数和中间件）
- ❌ 不要修改现有的 `pathUtils.ts`、`yamlUtils.ts`、`frontmatterParser.ts`
- ❌ 不要修改 `shared/constants.ts` 或 `server/types/errors.ts`（错误码已存在）
- ❌ 不要实现 SSE 推送（Post-MVP）

### 文件创建清单

| 文件                                                 | 操作 | 说明                    |
| ---------------------------------------------------- | ---- | ----------------------- |
| `server/utils/fileUtils.ts`                          | 新建 | atomicWrite + safeWrite |
| `server/middleware/pathValidator.ts`                 | 新建 | 路径遍历防护中间件      |
| `tests/unit/server/utils/fileUtils.test.ts`          | 新建 | fileUtils 单元测试      |
| `tests/unit/server/middleware/pathValidator.test.ts` | 新建 | pathValidator 单元测试  |

### Project Structure Notes

本 Story 创建的文件严格遵循架构文档定义的目录结构：

```
server/
├── middleware/
│   ├── errorHandler.ts          # 已有 — 全局错误处理
│   └── pathValidator.ts         # 本 Story 新建 — 路径遍历防护
└── utils/
    ├── pathUtils.ts             # 已有 — 跨平台路径工具（isSubPath 被复用）
    ├── frontmatterParser.ts     # 已有 — Frontmatter 解析
    ├── yamlUtils.ts             # 已有 — YAML 读写
    └── fileUtils.ts             # 本 Story 新建 — 原子写入 + 并发控制

tests/unit/server/
├── middleware/
│   └── pathValidator.test.ts    # 本 Story 新建
└── utils/
    └── fileUtils.test.ts        # 本 Story 新建
```

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns] — 文件写入安全模式、并发控制模式
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication-Security] — 路径遍历防护
- [Source: _bmad-output/planning-artifacts/architecture.md#Enforcement-Guidelines] — 所有文件写入使用 atomicWrite
- [Source: _bmad-output/planning-artifacts/epics.md#Epic-2-Story-2.0] — Story 定义和 AC
- [Source: _bmad-output/implementation-artifacts/0-3-file-parsing-and-path-utils-infrastructure.md] — 前置 Story 上下文

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus-1m-context (Amelia)

### Debug Log References

- tsc --noEmit: 零错误
- vitest run: 218 tests passed (16 test files), 0 failures
- 新增 30 个测试用例（11 fileUtils + 19 pathValidator）

### Completion Notes List

- Task 1: 安装 async-mutex 依赖成功
- Task 2: 创建 fileUtils.ts，实现 atomicWrite（tmp+rename 原子写入）
- Task 3: 实现 safeWrite（基于 async-mutex 的文件级并发控制），每个文件路径独立 Mutex
- Task 4: 创建 pathValidator.ts 中间件，支持 URL 编码攻击检测、白名单目录校验，复用 isSubPath
- Task 5: 全量测试通过，无回归
- 导出 \_clearMutexCache() 仅用于测试清理

### File List

| 文件                                               | 操作                          |
| -------------------------------------------------- | ----------------------------- |
| server/utils/fileUtils.ts                          | 新建                          |
| server/middleware/pathValidator.ts                 | 新建                          |
| tests/unit/server/utils/fileUtils.test.ts          | 新建                          |
| tests/unit/server/middleware/pathValidator.test.ts | 新建                          |
| package.json                                       | 修改（添加 async-mutex 依赖） |
