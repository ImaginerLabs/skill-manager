# Story 0.5: 配置文件读取与应用启动

Status: done

## Story

As a 用户,
I want 应用启动时自动读取我的配置,
So that 我的分类和 IDE 路径设置在每次启动时都能正确加载。

## Acceptance Criteria (AC)

1. **AC-1: 配置文件读取**
   - Given `config/settings.yaml` 和 `config/categories.yaml` 存在
   - When 应用启动
   - Then `configService.ts` 读取并解析配置文件

2. **AC-2: 默认配置**
   - Given 配置文件不存在
   - When 应用启动
   - Then 使用内置默认值并自动创建配置文件

3. **AC-3: API 端点**
   - Given 应用已启动
   - When 请求 `GET /api/config` 和 `GET /api/categories`
   - Then 返回完整配置数据和分类列表

4. **AC-4: 错误处理**
   - Given 配置文件 YAML 语法错误
   - When 应用启动
   - Then 记录错误日志并使用默认值启动

5. **AC-5: TypeScript 编译通过**
   - Given 所有文件已创建
   - When 运行 `tsc --noEmit`
   - Then 编译通过

## Tasks / Subtasks

- [x] Task 1: 创建默认配置文件模板 (AC: #2)
  - [x] 1.1 创建 config/settings.yaml 默认模板
  - [x] 1.2 创建 config/categories.yaml 默认模板

- [x] Task 2: 创建 configService (AC: #1, #2, #4)
  - [x] 2.1 创建 server/services/configService.ts
  - [x] 2.2 实现 loadConfig() 和 loadCategories()
  - [x] 2.3 实现默认值回退和自动创建

- [x] Task 3: 创建 API 路由 (AC: #3)
  - [x] 3.1 创建 server/routes/configRoutes.ts
  - [x] 3.2 注册路由到 app.ts

- [x] Task 4: 集成验证 (AC: #5)
  - [x] 4.1 运行 `tsc --noEmit` 确认编译通过
  - [x] 4.2 运行 `npm run build` 确认构建成功

## Dev Notes

### 已有工具
- `readYaml<T>()` 和 `writeYaml()` 来自 server/utils/yamlUtils.ts
- `AppError` 来自 server/types/errors.ts
- `AppConfig`、`Category` 类型来自 shared/types.ts

### 默认分类
coding, writing, devops, workflows

## Dev Agent Record

### Agent Model Used
Claude claude-4.6-opus (Amelia)

### Completion Notes List

- ✅ Task 1: 创建 config/settings.yaml + config/categories.yaml 默认配置模板
- ✅ Task 2: 创建 configService — loadSettings()、loadCategories()、loadConfig()，支持默认值回退和自动创建
- ✅ Task 3: 创建 configRoutes — GET /api/config + GET /api/categories，注册到 app.ts
- ✅ Task 4: tsc --noEmit ✅ + vite build ✅

### Verification Results

- `tsc --noEmit` ✅ 编译通过
- `vite build` ✅ 构建成功
- `GET /api/config` ✅ 返回完整配置
- `GET /api/categories` ✅ 返回 4 个默认分类

### File List

- config/settings.yaml (新建)
- config/categories.yaml (新建)
- server/services/configService.ts (新建)
- server/routes/configRoutes.ts (新建)
- server/app.ts (修改 — 注册 configRoutes)
- config/.gitkeep (删除)
- server/services/.gitkeep (删除)
