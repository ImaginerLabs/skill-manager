---
title: "路径预设管理 — 独立配置页 + 同步/导入快捷选择"
type: "feature"
created: "2026-04-12"
status: "ready-for-dev"
context:
  - "_bmad-output/project-context.md"
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 用户在同步和导入时需要反复手动输入相同的目录路径，既繁琐又容易出错，缺少一个统一的预设路径管理入口。

**Approach:** 新增独立的「路径配置」页面（`/paths`），用户可在此增删改预设路径（含可选备注），同步页和导入页的路径输入框旁增加「从预设选择」下拉，快速填入已配置路径。预设数据以独立字段 `pathPresets` 存储在 `config/settings.yaml`。

## Boundaries & Constraints

**Always:**

- `PathPreset` 类型定义在 `shared/types.ts`，Zod Schema 在 `shared/schemas.ts`，禁止在 `src/` 或 `server/` 中重复定义
- 后端所有写操作必须通过 `safeWrite()` 持久化，禁止直接 `fs.writeFile()`
- `path` 字段必须是绝对路径（`path.isAbsolute()` 校验），重复路径用 `path.normalize()` 对比检测
- 服务端 import 必须带 `.js` 扩展名
- 路由层只做请求解析 + Zod 校验 + 响应格式化，业务逻辑全部在 service 层
- 旧版 `settings.yaml` 无 `pathPresets` 字段时，读取结果默认为 `[]`（向后兼容）
- 前端所有 fetch 必须通过 `src/lib/api.ts` 封装

**Ask First:**

- 是否需要对预设路径做存在性校验（目录是否真实存在）？当前方案仅校验格式，不校验磁盘

**Never:**

- 不修改 `sync.targets` 的现有数据结构（`SyncTarget` 保持不变）
- 不在同步/导入页面内嵌路径管理 UI（管理入口只在 `/paths` 页面）
- 不引入新的 npm 依赖（ID 生成用 `crypto.randomUUID()`）

## I/O & Edge-Case Matrix

| Scenario                  | Input / State                                     | Expected Output / Behavior                | Error Handling   |
| ------------------------- | ------------------------------------------------- | ----------------------------------------- | ---------------- |
| 添加预设路径（正常）      | `{ path: "/Users/alex/proj", label: "项目目录" }` | 201 + 新 `PathPreset` 对象，写入 yaml     | —                |
| 添加非绝对路径            | `{ path: "relative/path" }`                       | 400 VALIDATION_ERROR "路径必须是绝对路径" | 前端 toast.error |
| 添加重复路径              | 已存在 `/Users/alex/proj`                         | 400 VALIDATION_ERROR "路径已存在"         | 前端 toast.error |
| 删除不存在的预设          | DELETE `/api/path-presets/bad-id`                 | 404 NOT_FOUND                             | 前端 toast.error |
| 旧配置无 pathPresets 字段 | settings.yaml 无此字段                            | 读取返回 `[]`，不报错                     | —                |
| 同步/导入页无预设         | `pathPresets` 为空                                | 「从预设选择」下拉不渲染                  | —                |

</frozen-after-approval>

## Code Map

- `shared/types.ts` — 新增 `PathPreset` 接口；`AppConfig` 追加 `pathPresets: PathPreset[]`
- `shared/schemas.ts` — 新增 `PathPresetSchema`、`PathPresetCreateSchema`、`PathPresetUpdateSchema`
- `shared/constants.ts` — 新增 `ErrorCode.PATH_PRESET_NOT_FOUND`
- `server/types/errors.ts` — 新增 `AppError.pathPresetNotFound(id)` 工厂方法
- `server/services/syncService.ts` — 参考：`readSettings`/`writeSettings` 模式，新 service 复用此模式
- `server/services/pathPresetService.ts` — **新建**：CRUD 函数（`getPathPresets`、`addPathPreset`、`updatePathPreset`、`removePathPreset`）
- `server/routes/pathPresetRoutes.ts` — **新建**：4 个端点路由
- `server/app.ts` — 注册 `pathPresetRoutes`
- `src/lib/api.ts` — 新增 4 个 API 函数
- `src/pages/PathsPage.tsx` — **新建**：路径配置页面
- `src/components/settings/PathPresetManager.tsx` — **新建**：增删改列表组件（参考 `CategoryManager.tsx` 模式）
- `src/App.tsx` — 注册 `/paths` 路由
- `src/components/layout/Sidebar.tsx` — `navItems` 追加「路径配置」入口（`FolderOpen` 图标）
- `src/components/sync/SyncTargetManager.tsx` — 路径输入框旁增加「从预设选择」下拉
- `src/pages/ImportPage.tsx` — 扫描路径输入框旁增加「从预设选择」下拉

## Tasks & Acceptance

**Execution:**

- [ ] `shared/types.ts` -- 新增 `PathPreset` 接口，`AppConfig` 追加 `pathPresets` 字段 -- 类型单一来源
- [ ] `shared/schemas.ts` -- 新增 `PathPresetSchema`、`PathPresetCreateSchema`、`PathPresetUpdateSchema` -- 请求校验
- [ ] `shared/constants.ts` -- 新增 `PATH_PRESET_NOT_FOUND` 错误码 -- 禁止硬编码
- [ ] `server/types/errors.ts` -- 新增 `AppError.pathPresetNotFound(id)` 工厂方法 -- 统一错误类
- [ ] `server/services/pathPresetService.ts` -- 新建 CRUD 服务（函数式导出，复用 syncService 的 readSettings/writeSettings 模式） -- 业务逻辑层
- [ ] `server/routes/pathPresetRoutes.ts` -- 新建路由（GET/POST /api/path-presets，PUT/DELETE /api/path-presets/:id） -- 薄路由层
- [ ] `server/app.ts` -- 注册 pathPresetRoutes -- 路由挂载
- [ ] `src/lib/api.ts` -- 新增 fetchPathPresets、addPathPreset、updatePathPreset、deletePathPreset -- 前端 API 封装
- [ ] `src/components/settings/PathPresetManager.tsx` -- 新建增删改组件（参考 CategoryManager 模式，支持内联编辑） -- 管理 UI
- [ ] `src/pages/PathsPage.tsx` -- 新建页面，嵌入 PathPresetManager -- 路由页面
- [ ] `src/App.tsx` -- 注册 /paths 路由 -- 路由配置
- [ ] `src/components/layout/Sidebar.tsx` -- navItems 追加路径配置入口 -- 导航
- [ ] `src/components/sync/SyncTargetManager.tsx` -- 路径输入框旁增加预设选择下拉（仅有预设时渲染） -- 同步页集成
- [ ] `src/pages/ImportPage.tsx` -- 扫描路径输入框旁增加预设选择下拉（仅有预设时渲染） -- 导入页集成

**Acceptance Criteria:**

- Given 用户在路径配置页点击「添加路径」，When 输入绝对路径并提交，then 新路径出现在列表中，且 settings.yaml 已更新
- Given 用户输入非绝对路径，When 提交，then 显示 toast 错误"路径必须是绝对路径"
- Given 用户输入已存在的路径，When 提交，then 显示 toast 错误"路径已存在"
- Given 已有预设路径，When 用户在同步页路径输入框旁点击「从预设选择」，then 下拉展示所有预设（路径 + 备注），选中后自动填入输入框
- Given 已有预设路径，When 用户在导入页扫描路径旁点击「从预设选择」，then 同上
- Given `pathPresets` 为空，When 渲染同步/导入页，then「从预设选择」下拉不显示
- Given 旧版 settings.yaml 无 pathPresets 字段，When 服务启动，then 正常运行，预设列表为空

## Design Notes

**数据模型**（`settings.yaml` 新增字段，与 `sync` 并列）：

```yaml
pathPresets:
  - id: "preset-xxx-yyy" # crypto.randomUUID() 生成
    path: "/Users/alex/projects"
    label: "我的项目目录" # 可选，不填则不写入 yaml
```

**ID 生成**：复用 `syncService` 中的 `generateId()` 模式（`ts + rand`），前缀改为 `preset-`，无需引入新依赖。

**预设选择 UI**：仅在 `pathPresets.length > 0` 时渲染下拉按钮，选中后调用父组件的 setter 填入路径，不改变现有输入框的手动输入能力。

## Verification

**Commands:**

- `npm run typecheck` -- expected: 零 TypeScript 错误
- `npm run test:run` -- expected: 所有现有测试通过（新增 service 单元测试）
- `npm run build` -- expected: 构建成功无报错

**Manual checks:**

- 访问 `/paths`，添加一条预设路径（含备注），刷新页面后数据持久化
- 访问 `/sync`，路径输入框旁出现「从预设选择」，选中后路径自动填入
- 访问 `/import`，扫描路径旁出现「从预设选择」，选中后路径自动填入
- 删除预设路径后，同步/导入页下拉中该条目消失

## Spec Change Log
