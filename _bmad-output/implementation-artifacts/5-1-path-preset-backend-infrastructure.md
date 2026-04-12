---
story: "5-1"
title: "路径预设后端基础设施"
epic: 5
status: done
created: "2026-04-12"
completed: "2026-04-12"
type: backfill
note: "代码已在 Epic 5 实现阶段完成，此文件为补建的 Story 记录"
---

# Story 5-1：路径预设后端基础设施

## Story

**As a** 用户，
**I want** 系统提供路径预设的后端 CRUD API，
**So that** 前端可以管理和持久化预设路径数据。

## Acceptance Criteria

- [x] `shared/types.ts` 新增 `PathPreset` 接口，`AppConfig` 追加 `pathPresets: PathPreset[]`
- [x] `shared/schemas.ts` 新增 `PathPresetSchema`、`PathPresetCreateSchema`、`PathPresetUpdateSchema`
- [x] `shared/constants.ts` 新增 `PATH_PRESET_NOT_FOUND` 错误码
- [x] `server/types/errors.ts` 新增 `AppError.pathPresetNotFound(id)` 工厂方法
- [x] `server/services/pathPresetService.ts` 新建 CRUD 服务（`getPathPresets`、`addPathPreset`、`updatePathPreset`、`removePathPreset`）
- [x] `server/routes/pathPresetRoutes.ts` 新建路由（GET/POST `/api/path-presets`，PUT/DELETE `/api/path-presets/:id`）
- [x] `server/app.ts` 注册 `pathPresetRoutes`
- [x] `src/lib/api.ts` 新增 `fetchPathPresets`、`addPathPreset`、`updatePathPreset`、`deletePathPreset`
- [x] 路径校验：非绝对路径返回 400 VALIDATION_ERROR
- [x] 重复路径检测：`path.normalize()` 对比，重复返回 400 VALIDATION_ERROR
- [x] 旧版 `settings.yaml` 无 `pathPresets` 字段时默认 `[]`（向后兼容）

## Tasks

- [x] **Task 1：共享类型与 Schema**
  - `shared/types.ts` — 新增 `PathPreset` 接口 `{ id: string; path: string; label?: string }`
  - `AppConfig` 追加 `pathPresets: PathPreset[]`
  - `shared/schemas.ts` — 新增三个 Zod Schema
  - `shared/constants.ts` — 新增 `PATH_PRESET_NOT_FOUND` 错误码

- [x] **Task 2：服务端错误类型**
  - `server/types/errors.ts` — 新增 `AppError.pathPresetNotFound(id)` 工厂方法

- [x] **Task 3：pathPresetService.ts**
  - 新建 `server/services/pathPresetService.ts`
  - 复用 `syncService` 的 `readSettings`/`writeSettings` 模式
  - 实现 `getPathPresets`、`addPathPreset`、`updatePathPreset`、`removePathPreset`
  - ID 生成：`preset-${ts}-${rand}` 格式（无需新依赖）

- [x] **Task 4：路由层**
  - 新建 `server/routes/pathPresetRoutes.ts`
  - 4 个端点：GET/POST `/api/path-presets`，PUT/DELETE `/api/path-presets/:id`
  - 薄路由层：Zod 校验 + 调用 service + 格式化响应

- [x] **Task 5：注册路由**
  - `server/app.ts` 注册 `pathPresetRoutes`

- [x] **Task 6：前端 API 封装**
  - `src/lib/api.ts` 新增 4 个 API 函数

## Dev Agent Record

### Implementation Notes

**pathPresetService.ts 设计决策：**
- 复用 `syncService` 的 `readSettings`/`writeSettings` 模式，保持服务层一致性
- `generateId()` 使用 `preset-${ts}-${rand}` 格式，与 `syncService` 的 `ts-rand` 模式对齐
- 路径校验：`path.isAbsolute()` 校验格式，`path.normalize()` 检测重复
- `label` 字段为可选，空字符串不写入 yaml（`trim()` 后为空则不包含该字段）
- 向后兼容：`settings.pathPresets ?? []` 处理旧版配置文件

**pathConfigService.ts 职责边界：**
- 经确认，`pathConfigService.ts` 已在 Epic 4 Story 4-8 中被删除（孤立文件清理）
- `pathPresetService.ts` 是路径预设的唯一服务，职责清晰

**路由设计：**
- 遵循项目薄路由层规范：Zod 校验 + service 调用 + 标准响应格式
- POST 返回 201 状态码，其余返回 200

### QA Results

- `npm run typecheck` — ✅ 零 TypeScript 错误
- `npm run test:run` — ✅ 所有现有测试通过
- `npm run build` — ✅ 构建成功

### Code Review

- 代码遵循项目架构规范（薄路由层、service 层业务逻辑、共享类型单一来源）
- 路径安全校验完整（绝对路径校验 + 重复检测）
- 向后兼容处理正确
- 无阻塞性问题，Story 通过 Code Review

---

_补建日期：2026-04-12_
_原始实现：Epic 5 开发阶段_
