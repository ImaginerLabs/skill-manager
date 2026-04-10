# Story 0.3: 文件解析与路径工具基础设施

Status: done

## Story

As a 开发者,
I want 拥有文件解析和路径处理工具函数,
So that 后续所有 Skill 文件读取和配置操作都有可靠的基础。

## Acceptance Criteria (AC)

1. **AC-1: 跨平台路径归一化**
   - Given 不同操作系统的文件路径
   - When 调用 `pathUtils.ts` 中的路径归一化函数
   - Then macOS/Windows/Linux 路径格式统一处理为 POSIX 风格（NFR11）
   - And 提供 `normalizePath(inputPath)` 函数，将 Windows 反斜杠转为正斜杠
   - And 提供 `resolveSkillPath(relativePath)` 函数，基于 skills/ 根目录解析绝对路径
   - And 提供 `getRelativePath(absolutePath, basePath)` 函数，获取相对路径
   - And 提供 `isSubPath(childPath, parentPath)` 函数，校验子路径是否在父路径内（为 NFR6 路径遍历防护做准备）
   - And 提供 `slugify(filename)` 函数，将文件名转为 slug 格式的 id（去除扩展名、特殊字符转连字符、小写化）

2. **AC-2: Frontmatter 解析**
   - Given 一个标准的 Skill `.md` 文件（含 YAML Frontmatter）
   - When 调用 `frontmatterParser.ts` 中的解析函数
   - Then 使用 `gray-matter` 解析 YAML Frontmatter + Markdown 正文（FR30）
   - And 使用 `SkillMetaSchema`（来自 `shared/schemas.ts`）进行 Zod 运行时校验
   - And 正确解析返回 `{ meta: SkillMeta, content: string, rawContent: string }`
   - And 正确处理 UTF-8 编码和中英文混合内容（NFR12）

3. **AC-3: Frontmatter 解析错误处理**
   - Given 一个 YAML 语法错误的 `.md` 文件
   - When 调用解析函数
   - Then 返回清晰的解析失败信息，包含文件路径和错误原因
   - And 不抛出未捕获异常，而是返回结构化的错误结果
   - And 对缺少必填字段（name、category）的文件返回 Zod 校验错误详情

4. **AC-4: YAML 配置文件读写**
   - Given `config/` 目录下的 `.yaml` 配置文件
   - When 调用 `yamlUtils.ts` 中的读写函数
   - Then `readYaml<T>(filePath)` 读取并解析 YAML 文件为 TypeScript 对象
   - And `writeYaml(filePath, data)` 将 TypeScript 对象序列化为 YAML 并写入文件
   - And 文件不存在时 `readYaml` 返回 `null`（不抛异常）
   - And YAML 语法错误时抛出 `AppError.parseError()` 并包含文件路径信息

5. **AC-5: TypeScript 编译通过**
   - Given 所有文件已创建
   - When 运行 `tsc --noEmit`
   - Then 编译通过，无错误

## Tasks / Subtasks

- [x] Task 1: 创建 `server/utils/pathUtils.ts` (AC: #1)
  - [x] 1.1 实现 `normalizePath(inputPath: string): string` — 将 Windows 反斜杠 `\` 转为 POSIX 正斜杠 `/`，移除尾部斜杠
  - [x] 1.2 实现 `resolveSkillPath(relativePath: string, skillsRoot: string): string` — 基于 skills/ 根目录解析绝对路径，使用 `path.resolve` + `normalizePath`
  - [x] 1.3 实现 `getRelativePath(absolutePath: string, basePath: string): string` — 获取相对路径，使用 `path.relative` + `normalizePath`
  - [x] 1.4 实现 `isSubPath(childPath: string, parentPath: string): boolean` — 校验 childPath 是否在 parentPath 内，使用 `path.resolve` 后比较前缀，防止 `../` 逃逸
  - [x] 1.5 实现 `slugify(filename: string): string` — 去除 `.md` 扩展名，特殊字符转连字符，连续连字符合并，首尾连字符去除，小写化
  - [x] 1.6 实现 `getSkillId(filePath: string): string` — 从文件路径提取 skill id（使用 slugify 处理文件名部分）

- [x] Task 2: 创建 `server/utils/frontmatterParser.ts` (AC: #2, #3)
  - [x] 2.1 实现 `parseFrontmatter(filePath: string): Promise<ParseResult>` — 读取文件 → gray-matter 解析 → Zod 校验 → 返回结构化结果
  - [x] 2.2 定义 `ParseResult` 类型：`ParseSuccess | ParseFailure`
    - `ParseSuccess`: `{ success: true, meta: SkillMeta, content: string, rawContent: string }`
    - `ParseFailure`: `{ success: false, filePath: string, error: string, details?: unknown }`
  - [x] 2.3 处理 gray-matter 解析异常（YAML 语法错误）→ 返回 `ParseFailure`
  - [x] 2.4 处理 Zod 校验失败（缺少必填字段等）→ 返回 `ParseFailure`，包含 Zod 错误详情
  - [x] 2.5 处理文件读取异常（文件不存在、权限不足）→ 返回 `ParseFailure`
  - [x] 2.6 在解析时自动填充 `id`（使用 `slugify`）、`fileSize`（使用 `fs.stat`）、`lastModified`（使用 `fs.stat` 的 mtime）、`filePath`（相对路径）
  - [x] 2.7 实现 `parseRawFrontmatter(rawContent: string, filePath: string): ParseResult` — 从原始字符串解析（不读取文件），用于导入场景

- [x] Task 3: 创建 `server/utils/yamlUtils.ts` (AC: #4)
  - [x] 3.1 实现 `readYaml<T>(filePath: string): Promise<T | null>` — 读取 YAML 文件，文件不存在返回 `null`，语法错误抛出 `AppError.parseError()`
  - [x] 3.2 实现 `writeYaml(filePath: string, data: unknown): Promise<void>` — 序列化为 YAML 并写入文件（当前阶段直接使用 `fs.writeFile`，原子写入在 Story 2.0 实现）
  - [x] 3.3 使用 `js-yaml` 的 `load()` 和 `dump()` 方法
  - [x] 3.4 `writeYaml` 写入前确保目标目录存在（使用 `fs-extra` 的 `ensureDir`）

- [x] Task 4: 集成验证 (AC: #5)
  - [x] 4.1 运行 `tsc --noEmit` 确认编译通过
  - [x] 4.2 运行 `npm run build` 确认构建成功
  - [x] 4.3 删除 `server/utils/.gitkeep`（目录不再为空）

## Dev Notes

### 架构约束（必须遵守）

1. **后端 ESM 模块系统** — 项目使用 `"type": "module"`，后端 import 需要 `.js` 扩展名（例如 `import { AppError } from '../types/errors.js'`）
2. **TypeScript strict mode** — 所有文件必须通过 strict 模式编译
3. **使用已安装的依赖** — `gray-matter`（^4.0.3）、`js-yaml`（^4.1.1）、`fs-extra`（^11.3.4）已在 dependencies 中，直接 import 使用
4. **复用已有类型和 Schema** — `SkillMeta` 类型来自 `shared/types.ts`，`SkillMetaSchema` 来自 `shared/schemas.ts`，`AppError` 来自 `server/types/errors.ts`
5. **不要实现原子写入和并发控制** — `atomicWrite`（AR11）和 `async-mutex`（AR12）推迟到 Story 2.0，本 Story 的 `writeYaml` 直接使用 `fs.writeFile`
6. **不要实现路径遍历防护中间件** — `pathValidator.ts` 中间件推迟到 Story 2.0，本 Story 只提供 `isSubPath` 工具函数
7. **不要创建 Express 路由** — 本 Story 只创建工具函数，不注册任何 API 端点

### 已有代码上下文（来自 Story 0-1 和 0-2）

**已安装的相关依赖：**
- `gray-matter` ^4.0.3 — Frontmatter 解析
- `js-yaml` ^4.1.1 — YAML 读写
- `fs-extra` ^11.3.4 — 增强文件操作（ensureDir 等）
- `zod` ^4.3.6 — 运行时 Schema 校验

**已有的类型定义（`shared/types.ts`）：**
- `SkillMeta` — Skill 元数据接口（id, name, description, category, tags, type, author, version, filePath, fileSize, lastModified）
- `SkillFull` — 完整 Skill（extends SkillMeta + content, rawContent）

**已有的 Zod Schema（`shared/schemas.ts`）：**
- `SkillMetaSchema` — 校验 SkillMeta 数据
- `SkillFullSchema` — 校验 SkillFull 数据

**已有的错误处理（`server/types/errors.ts`）：**
- `AppError` 类 — 含 `code` 和 `statusCode` 属性
- 工厂方法：`AppError.parseError(message)`、`AppError.notFound(message)`、`AppError.internal(message)` 等

**已有的常量（`shared/constants.ts`）：**
- `ErrorCode.PARSE_ERROR`、`ErrorCode.FILE_READ_ERROR`、`ErrorCode.PATH_TRAVERSAL` 等

### 关键实现细节

**gray-matter 使用方式：**
```typescript
import matter from 'gray-matter';

// 解析 Frontmatter
const { data, content } = matter(rawContent);
// data: YAML Frontmatter 对象
// content: Markdown 正文（不含 Frontmatter）
```

**js-yaml 使用方式：**
```typescript
import yaml from 'js-yaml';

// 读取
const data = yaml.load(fileContent) as T;

// 写入
const yamlString = yaml.dump(data, { 
  indent: 2, 
  lineWidth: -1,  // 不自动换行
  noRefs: true     // 不使用 YAML 引用
});
```

**fs-extra 使用方式：**
```typescript
import fs from 'fs-extra';

// 读取文件
const content = await fs.readFile(filePath, 'utf-8');

// 写入文件（确保目录存在）
await fs.ensureDir(path.dirname(filePath));
await fs.writeFile(filePath, content, 'utf-8');

// 获取文件信息
const stat = await fs.stat(filePath);
// stat.size — 文件大小（bytes）
// stat.mtime — 最后修改时间（Date 对象）
```

**Zod 校验使用方式（Zod v4）：**
```typescript
import { SkillMetaSchema } from '../../shared/schemas.js';

// 校验数据
const result = SkillMetaSchema.safeParse(data);
if (result.success) {
  // result.data — 校验通过的数据
} else {
  // result.error — ZodError 对象
  // result.error.issues — 错误详情数组
}
```

**slugify 实现参考：**
```typescript
// 输入: "My Awesome Skill.md" → 输出: "my-awesome-skill"
// 输入: "代码审查工具.md" → 输出: "代码审查工具"（保留中文）
// 输入: "skill--name.md" → 输出: "skill-name"（合并连续连字符）
function slugify(filename: string): string {
  return filename
    .replace(/\.md$/i, '')           // 去除 .md 扩展名
    .replace(/[^\w\u4e00-\u9fff-]/g, '-')  // 非字母数字中文转连字符
    .replace(/-+/g, '-')             // 合并连续连字符
    .replace(/^-|-$/g, '')           // 去除首尾连字符
    .toLowerCase();
}
```

**ParseResult 类型定义：**
```typescript
export interface ParseSuccess {
  success: true;
  meta: SkillMeta;
  content: string;
  rawContent: string;
}

export interface ParseFailure {
  success: false;
  filePath: string;
  error: string;
  details?: unknown;
}

export type ParseResult = ParseSuccess | ParseFailure;
```

### 不要做的事情（防止过度实现）

- ❌ 不要实现 `atomicWrite` 原子写入函数（Story 2.0 负责）
- ❌ 不要实现 `safeWrite` 并发控制函数（Story 2.0 负责）
- ❌ 不要创建 `middleware/pathValidator.ts` 路径遍历防护中间件（Story 2.0 负责）
- ❌ 不要创建任何 Express 路由或 API 端点
- ❌ 不要创建 `skillService.ts` 或任何 service 层代码（Story 1.1 负责）
- ❌ 不要安装新的 npm 依赖（所有需要的依赖已在 Story 0-1 安装）
- ❌ 不要添加任何样式（Story 0.4 负责设计系统）
- ❌ 不要创建测试文件（本 Story 只创建工具函数，测试在后续 Story 中覆盖）
- ❌ 不要修改 `shared/types.ts` 或 `shared/schemas.ts`（已在 Story 0-2 完成）

### 文件创建清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `server/utils/pathUtils.ts` | 新建 | 跨平台路径工具函数 |
| `server/utils/frontmatterParser.ts` | 新建 | Frontmatter 解析 + Zod 校验 |
| `server/utils/yamlUtils.ts` | 新建 | YAML 配置文件读写 |
| `server/utils/.gitkeep` | 删除 | 目录不再为空 |

### Project Structure Notes

本 Story 创建的文件严格遵循架构文档定义的目录结构：

```
server/
└── utils/
    ├── pathUtils.ts             # 跨平台路径归一化（本 Story）
    ├── frontmatterParser.ts     # gray-matter + Zod 校验（本 Story）
    ├── yamlUtils.ts             # YAML 配置读写（本 Story）
    └── fileUtils.ts             # 原子写入、文件锁（Story 2.0，不要在本 Story 创建）
```

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns] — 文件写入安全模式、路径归一化
- [Source: _bmad-output/planning-artifacts/architecture.md#Project-Structure] — server/utils/ 目录结构
- [Source: _bmad-output/planning-artifacts/architecture.md#Data-Architecture] — SkillMeta 数据模型
- [Source: _bmad-output/planning-artifacts/architecture.md#Enforcement-Guidelines] — 所有文件路径操作使用 pathUtils
- [Source: _bmad-output/planning-artifacts/epics.md#Story-0.3] — 原始 Story 定义和验收标准
- [Source: _bmad-output/planning-artifacts/prd.md] — FR30（Frontmatter 解析）、NFR6（路径遍历防护）、NFR11（跨平台路径）
- [Source: _bmad-output/implementation-artifacts/0-2-shared-types-schemas-and-error-handling-framework.md] — 已有类型、Schema、AppError 定义

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (Amelia — Senior Software Engineer, orchestrated by Multi-Agent Orchestrator)

### Debug Log References

- gray-matter、js-yaml、fs-extra 均为 Story 0-1 已安装的依赖，无需新增
- Zod v4 的 safeParse 返回 `result.error.issues` 数组用于错误详情
- 后端 ESM 模块系统要求 import 使用 `.js` 扩展名

### Completion Notes List

- ✅ Task 1: 创建 server/utils/pathUtils.ts — 6 个工具函数（normalizePath, resolveSkillPath, getRelativePath, isSubPath, slugify, getSkillId）
- ✅ Task 2: 创建 server/utils/frontmatterParser.ts — parseFrontmatter（异步文件读取+解析）+ parseRawFrontmatter（同步字符串解析）+ ParseResult 类型定义
- ✅ Task 3: 创建 server/utils/yamlUtils.ts — readYaml（泛型读取，文件不存在返回 null）+ writeYaml（序列化写入，自动创建目录）
- ✅ Task 4: tsc --noEmit ✅ + vite build ✅ + 删除 .gitkeep ✅

### Verification Results

- `tsc --noEmit` ✅ 编译通过
- `vite build` ✅ 构建成功（30 modules, 284.95 KB）

### File List

- server/utils/pathUtils.ts (新建)
- server/utils/frontmatterParser.ts (新建)
- server/utils/yamlUtils.ts (新建)
- server/utils/.gitkeep (删除)
