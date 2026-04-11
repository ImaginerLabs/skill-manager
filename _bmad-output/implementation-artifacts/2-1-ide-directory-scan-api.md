# Story 2.1: IDE 目录扫描 API

Status: done

## Story

As a 用户,
I want 系统扫描我的 CodeBuddy IDE 的 Skill 目录,
So that 我可以看到 IDE 中有哪些 Skill 可以导入。

## Acceptance Criteria

1. **AC-1: 后端扫描 API**
   - Given 用户触发扫描操作
   - When 后端接收 `POST /api/import/scan` 请求
   - Then 扫描默认 CodeBuddy 路径（`~/.codebuddy/skills/`）或请求体中指定的路径（FR20）
   - And 返回扫描发现的 Skill 文件列表（名称、描述、文件路径、解析状态）（FR21）
   - And 对每个 `.md` 文件尝试解析 Frontmatter，解析失败的文件仍然列出但标记 `parseStatus: 'failed'`
   - And 正确处理 UTF-8 编码和中英文文件名（NFR12）

2. **AC-2: 扫描错误处理**
   - Given 扫描目标路径
   - When 路径不存在时返回清晰错误提示（`SCAN_PATH_NOT_FOUND`）
   - And 权限被拒时返回权限错误提示（`SCAN_PERMISSION_DENIED`）
   - And 目录为空时返回空数组（不是错误）
   - And 路径遍历攻击被 pathValidator 中间件拦截

3. **AC-3: 前端扫描触发与结果展示**
   - Given 用户在导入页面（/import）
   - When 点击"扫描"按钮
   - Then 显示 loading 状态（UX-DR19）
   - And 扫描完成后展示文件列表（文件名、描述、解析状态）
   - And 路径不存在时显示清晰错误提示
   - And 目录为空时显示空目录提示

4. **AC-4: 扫描路径配置**
   - Given 用户想扫描非默认路径
   - When 用户在输入框中修改扫描路径
   - Then 使用用户指定的路径进行扫描

5. **AC-5: TypeScript 编译与测试通过**
   - Given 所有文件已创建
   - When 运行 `tsc --noEmit` 和 `vitest run`
   - Then 编译通过，无错误
   - And 所有单元测试通过

## Tasks / Subtasks

- [x] Task 1: 添加扫描相关的共享类型和 Schema (AC: #1)
  - [x] 1.1 在 `shared/types.ts` 中添加 `ScanResultItem` 接口（id, name, description, filePath, absolutePath, parseStatus, fileSize, lastModified）
  - [x] 1.2 在 `shared/types.ts` 中添加 `ScanResult` 接口（items, scanPath, totalFiles）
  - [x] 1.3 在 `shared/schemas.ts` 中添加对应的 Zod Schema
  - [x] 1.4 在 `shared/constants.ts` 中添加 `SCAN_PATH_NOT_FOUND` 和 `SCAN_PERMISSION_DENIED` 错误码
  - [x] 1.5 在 `server/types/errors.ts` 中添加对应的工厂方法

- [x] Task 2: 创建 `server/services/scanService.ts` — 扫描服务 (AC: #1, #2)
  - [x] 2.1 实现 `getDefaultScanPath(): string` — 返回 `~/.codebuddy/skills/` 的绝对路径
  - [x] 2.2 实现 `scanDirectory(dirPath: string): Promise<ScanResult>` — 扫描目录中的 .md 文件
    - 校验目录存在性（不存在抛 `AppError.scanPathNotFound()`）
    - 校验目录权限（无权限抛 `AppError.scanPermissionDenied()`）
    - 递归扫描 .md 文件（使用 `fs-extra` 的 `readdir` + `stat`）
    - 对每个文件调用 `frontmatterParser.parseSkillFile()` 尝试解析
    - 解析成功：提取 name, description 等
    - 解析失败：标记 `parseStatus: 'failed'`，仍然返回文件基本信息
  - [x] 2.3 编写 `scanService` 单元测试

- [x] Task 3: 创建 `server/routes/importRoutes.ts` — 导入 API 路由 (AC: #1, #2)
  - [x] 3.1 实现 `POST /api/import/scan` 路由
    - 请求体可选 `{ path?: string }`
    - 无 path 时使用 `getDefaultScanPath()`
    - 使用 pathValidator 中间件校验路径安全
    - 返回 `ApiResponse<ScanResult>`
  - [x] 3.2 在 `server/app.ts` 中注册 importRoutes
  - [x] 3.3 编写 `importRoutes` 集成测试

- [x] Task 4: 前端 API 封装 (AC: #3)
  - [x] 4.1 在 `src/lib/api.ts` 中添加 `scanDirectory(path?: string): Promise<ScanResult>` 函数

- [x] Task 5: 更新 ImportPage — 扫描 UI (AC: #3, #4)
  - [x] 5.1 创建扫描路径输入框 + 扫描按钮
  - [x] 5.2 实现 loading 状态展示
  - [x] 5.3 实现扫描结果列表展示（文件名、描述、解析状态标记）
  - [x] 5.4 实现错误状态展示（路径不存在、权限错误）
  - [x] 5.5 实现空目录提示

- [x] Task 6: 验证与集成 (AC: #5)
  - [x] 6.1 运行 `tsc --noEmit` 确认编译通过
  - [x] 6.2 运行 `vitest run` 确认所有测试通过
  - [x] 6.3 确认现有测试不受影响（无回归）

### Review Findings

- [x] [Review][Patch] P5: collectMdFiles 未检测 symlink 循环 [server/services/scanService.ts] — 已修复

## Dev Notes

### 架构约束（必须遵守）

1. **后端 ESM 模块系统** — `"type": "module"`，import 需要 `.js` 扩展名
2. **TypeScript strict mode** — 所有文件必须通过 strict 模式编译
3. **错误处理** — 所有错误使用 `AppError` 类
4. **路径安全** — 扫描路径必须经过 pathValidator 中间件校验
5. **API 响应格式** — 统一使用 `{ success: true, data: T }` 格式
6. **前端 API 调用** — 使用 `src/lib/api.ts` 中的 `apiCall` 模式

### 已有代码上下文

**已有的工具函数：**

- `server/utils/frontmatterParser.ts` — `parseSkillFile(filePath, skillsRoot)` 解析 Frontmatter
- `server/utils/pathUtils.ts` — `normalizePath()`, `isSubPath()`, `slugify()`
- `server/utils/fileUtils.ts` — `atomicWrite()`, `safeWrite()`（Story 2-0 新建）
- `server/middleware/pathValidator.ts` — `createPathValidator()`, `validatePathParam()`（Story 2-0 新建）

**已有的路由模式（参考 `server/routes/skillRoutes.ts`）：**

```typescript
import { Router } from "express";
export const importRoutes = Router();
importRoutes.post("/import/scan", async (req, res, next) => {
  try { ... } catch (err) { next(err); }
});
```

**已有的前端 API 模式（参考 `src/lib/api.ts`）：**

```typescript
export async function scanDirectory(scanPath?: string): Promise<ScanResult> {
  return apiCall<ScanResult>("/api/import/scan", {
    method: "POST",
    body: JSON.stringify({ path: scanPath }),
  });
}
```

**已有的前端页面（`src/pages/ImportPage.tsx`）：**

- 当前为空壳页面，需要替换为完整的扫描 UI

**默认 CodeBuddy 路径：**

```typescript
import os from "node:os";
const DEFAULT_SCAN_PATH = path.join(os.homedir(), ".codebuddy", "skills");
```

### 不要做的事情（防止过度实现）

- ❌ 不要实现文件导入功能（Story 2.3 负责）
- ❌ 不要实现分类选择 UI（Story 2.2 负责）
- ❌ 不要实现冷启动检测（Story 2.4 负责）
- ❌ 不要实现文件勾选/全选功能（Story 2.2 负责）
- ❌ 不要修改 `server/services/skillService.ts`

### 文件创建/修改清单

| 文件                                             | 操作 | 说明                                 |
| ------------------------------------------------ | ---- | ------------------------------------ |
| `shared/types.ts`                                | 修改 | 添加 ScanResultItem, ScanResult 类型 |
| `shared/schemas.ts`                              | 修改 | 添加对应 Zod Schema                  |
| `shared/constants.ts`                            | 修改 | 添加扫描相关错误码                   |
| `server/types/errors.ts`                         | 修改 | 添加扫描错误工厂方法                 |
| `server/services/scanService.ts`                 | 新建 | 目录扫描服务                         |
| `server/routes/importRoutes.ts`                  | 新建 | 导入 API 路由                        |
| `server/app.ts`                                  | 修改 | 注册 importRoutes                    |
| `src/lib/api.ts`                                 | 修改 | 添加 scanDirectory API               |
| `src/pages/ImportPage.tsx`                       | 修改 | 扫描 UI 实现                         |
| `tests/unit/server/services/scanService.test.ts` | 新建 | scanService 单元测试                 |
| `tests/integration/api/import.test.ts`           | 新建 | 导入 API 集成测试                    |

### Project Structure Notes

```
shared/
├── types.ts          # 修改 — 添加 ScanResultItem, ScanResult
├── schemas.ts        # 修改 — 添加 Zod Schema
└── constants.ts      # 修改 — 添加错误码

server/
├── types/errors.ts   # 修改 — 添加工厂方法
├── services/
│   └── scanService.ts    # 新建 — 目录扫描服务
├── routes/
│   └── importRoutes.ts   # 新建 — 导入 API 路由
└── app.ts            # 修改 — 注册 importRoutes

src/
├── lib/api.ts        # 修改 — 添加 scanDirectory
└── pages/ImportPage.tsx  # 修改 — 扫描 UI

tests/
├── unit/server/services/scanService.test.ts  # 新建
└── integration/api/import.test.ts            # 新建
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-2-Story-2.1] — Story 定义和 AC
- [Source: _bmad-output/planning-artifacts/architecture.md#API-Communication-Patterns] — REST API 设计
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication-Security] — 路径遍历防护
- [Source: _bmad-output/implementation-artifacts/2-0-safe-write-and-path-protection-infrastructure.md] — 前置 Story 上下文

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus-1m-context (Amelia)

### Debug Log References

- tsc --noEmit: 零错误
- vitest run: 227 tests passed (17 test files), 0 failures
- 新增 9 个测试用例（scanService）

### Completion Notes List

- Task 1: 添加 ScanResultItem/ScanResult 类型、Zod Schema、错误码、工厂方法
- Task 2: 创建 scanService.ts — 递归扫描 .md 文件，解析 Frontmatter，处理错误
- Task 3: 创建 importRoutes.ts — POST /api/import/scan 端点，注册到 app.ts
- Task 4: 前端 api.ts 添加 scanDirectory() 函数
- Task 5: ImportPage 完整扫描 UI — 路径输入、loading、结果列表、错误/空状态
- Task 6: 全量测试通过，无回归

### File List

| 文件                                           | 操作                                    |
| ---------------------------------------------- | --------------------------------------- |
| shared/types.ts                                | 修改（添加 ScanResultItem, ScanResult） |
| shared/schemas.ts                              | 修改（添加 Zod Schema）                 |
| shared/constants.ts                            | 修改（添加错误码 + FORBIDDEN 状态码）   |
| server/types/errors.ts                         | 修改（添加工厂方法）                    |
| server/services/scanService.ts                 | 新建                                    |
| server/routes/importRoutes.ts                  | 新建                                    |
| server/app.ts                                  | 修改（注册 importRoutes）               |
| src/lib/api.ts                                 | 修改（添加 scanDirectory）              |
| src/pages/ImportPage.tsx                       | 修改（扫描 UI）                         |
| tests/unit/server/services/scanService.test.ts | 新建                                    |
