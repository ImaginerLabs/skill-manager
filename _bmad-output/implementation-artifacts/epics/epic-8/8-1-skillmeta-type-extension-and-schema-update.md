# Story 8.1: SkillMeta 类型扩展与 Schema 更新

Status: done

## Story

As a 开发者,
I want SkillMeta 类型和 Schema 支持外部 Skill 的来源元数据和只读标识,
So that 后续的前后端功能（Story 8.2 ~ 8.7）可以基于稳定的类型定义构建。

## Acceptance Criteria (AC)

**AC-1: SkillMeta 接口扩展**
- Given `shared/types.ts` 中 `SkillMeta` 接口尚无外部 Skill 相关字段
- When 完成本 Story
- Then `SkillMeta` 新增 4 个可选字段：
  - `source?: string` — 来源仓库 ID（对应 `repositories.yaml` 中的 `id`）
  - `sourceUrl?: string` — Skill 在 GitHub 上的 URL
  - `sourceRepo?: string` — 仓库 GitHub URL
  - `readonly?: boolean` — 是否只读（外部 Skill 为 true）

**AC-2: 仓库配置相关类型新增**
- Given `shared/types.ts` 中尚无仓库配置相关类型
- When 完成本 Story
- Then 新增 `RepoSkillMapping` 接口：`{ name: string; targetCategory: string }`
- And 新增 `ExternalRepository` 接口：`{ id: string; name: string; url: string; branch: string; skillsPath: string; enabled: boolean; include: RepoSkillMapping[]; exclude: string[] }`
- And 新增 `RepositoriesConfig` 接口：`{ repositories: ExternalRepository[] }`

**AC-3: SkillMetaSchema 扩展**
- Given `shared/schemas.ts` 中 `SkillMetaSchema` 尚无外部 Skill 字段
- When 完成本 Story
- Then `SkillMetaSchema` 新增：
  - `source: z.string().optional()`
  - `sourceUrl: z.string().url().optional()`
  - `sourceRepo: z.string().url().optional()`
  - `readonly: z.boolean().optional()`

**AC-4: 仓库配置 Schema 新增**
- Given `shared/schemas.ts` 中尚无仓库配置 Schema
- When 完成本 Story
- Then 新增 `RepoSkillMappingSchema`、`ExternalRepositorySchema`、`RepositoriesConfigSchema`
- And `ExternalRepositorySchema` 的 `url` 字段校验为合法 GitHub HTTPS URL：`z.string().regex(/^https:\/\/github\.com\//)`

**AC-5: 错误码常量新增**
- Given `shared/constants.ts` 中尚无 `SKILL_READONLY` 错误码
- When 完成本 Story
- Then 在 `ErrorCode` 对象的「Skill 相关」分组中新增 `SKILL_READONLY: "SKILL_READONLY"`

**AC-6: frontmatterParser 解析扩展**
- Given `server/utils/frontmatterParser.ts` 尚未解析外部 Skill 字段
- When 完成本 Story
- Then `parseRawFrontmatterInternal` 函数的 `metaCandidate` 组装中新增 4 个字段提取：
  - `source: data.source || undefined`
  - `sourceUrl: data.sourceUrl || undefined`
  - `sourceRepo: data.sourceRepo || undefined`
  - `readonly: data.readonly === true ? true : undefined`
- And 缺失字段返回 `undefined`（不报错，向后兼容）

**AC-7: TypeScript 编译与测试**
- Given 本 Story 完成
- When 运行测试
- Then `tsc --noEmit` 编译零错误
- And `SkillMetaSchema` 新字段校验有单元测试（合法/非法 URL、可选字段缺失）
- And `frontmatterParser` 新字段解析有单元测试（含 source/sourceUrl/sourceRepo/readonly 的 Frontmatter 正确解析；缺失字段返回 undefined）
- And 所有测试通过（`npm run test`）

## Tasks / Subtasks

- [x] Task 1: 扩展 `shared/types.ts` (AC: #1, #2)
  - [x] 1.1 在 `SkillMeta` 接口末尾追加 4 个可选字段（`source`、`sourceUrl`、`sourceRepo`、`readonly`），附中文 JSDoc 注释
  - [x] 1.2 在文件末尾「分类与配置类型」区块之前，新增「外部仓库配置类型」区块，包含 `RepoSkillMapping`、`ExternalRepository`、`RepositoriesConfig` 三个接口

- [x] Task 2: 扩展 `shared/schemas.ts` (AC: #3, #4)
  - [x] 2.1 在 `SkillMetaSchema` 的 `z.object({...})` 末尾追加 4 个可选字段（`source`、`sourceUrl`、`sourceRepo`、`readonly`）
  - [x] 2.2 在「套件 Schema」区块之前，新增「外部仓库配置 Schema」区块，包含 `RepoSkillMappingSchema`、`ExternalRepositorySchema`、`RepositoriesConfigSchema`
  - [x] 2.3 在文件末尾「类型推断导出」区块新增 3 个类型推断：`RepoSkillMappingInferred`、`ExternalRepositoryInferred`、`RepositoriesConfigInferred`

- [x] Task 3: 新增错误码 `SKILL_READONLY` (AC: #5)
  - [x] 3.1 在 `shared/constants.ts` 的 `ErrorCode` 对象「Skill 相关」分组中追加 `SKILL_READONLY: "SKILL_READONLY"`

- [x] Task 4: 扩展 `frontmatterParser.ts` 解析逻辑 (AC: #6)
  - [x] 4.1 在 `parseRawFrontmatterInternal` 函数的 `metaCandidate` 对象中，追加 4 个字段提取（`source`、`sourceUrl`、`sourceRepo`、`readonly`）

- [x] Task 5: 编写单元测试 (AC: #7)
  - [x] 5.1 在 `tests/unit/shared/schemas.test.ts`（如不存在则新建）中新增 `SkillMetaSchema` 外部字段测试：
    - 合法 `sourceUrl`（`https://github.com/...`）通过校验
    - 非法 `sourceUrl`（非 URL 字符串）校验失败
    - 合法 `sourceRepo`（`https://github.com/...`）通过校验
    - 非法 `sourceRepo` 校验失败
    - 所有新字段缺失时，现有 Skill 数据仍通过校验（向后兼容）
    - `readonly: true` 通过校验，`readonly: false` 通过校验，`readonly` 缺失通过校验
  - [x] 5.2 在 `tests/unit/server/utils/frontmatterParser.test.ts` 中新增外部字段解析测试：
    - Frontmatter 含 `source: anthropic-official` 时，`meta.source === "anthropic-official"`
    - Frontmatter 含 `sourceUrl: https://github.com/anthropics/skills/...` 时，`meta.sourceUrl` 正确
    - Frontmatter 含 `sourceRepo: https://github.com/anthropics/skills` 时，`meta.sourceRepo` 正确
    - Frontmatter 含 `readonly: true` 时，`meta.readonly === true`
    - Frontmatter 含 `readonly: false` 时，`meta.readonly === undefined`（严格 `=== true` 检查）
    - Frontmatter 不含这些字段时，所有新字段均为 `undefined`，解析不报错

- [x] Task 6: 验证编译与测试 (AC: #7)
  - [x] 6.1 运行 `npx tsc --noEmit` 确认零错误
  - [x] 6.2 运行 `npm run test` 确认所有测试通过

## Dev Notes

### 关键约束（必须遵守）

1. **向后兼容** — 所有新字段均为 `optional`，现有 Skill 无这些字段时解析不报错（FR-EH-34）
2. **`readonly` 严格检查** — `data.readonly === true`（不是 truthy），避免 `"true"` 字符串误判
3. **`sourceUrl`/`sourceRepo` 使用 `z.string().url()`** — 确保是合法 URL（不是 GitHub 专属 regex，那是 `ExternalRepositorySchema.url` 的要求）
4. **`ExternalRepositorySchema.url` 使用 GitHub regex** — `z.string().regex(/^https:\/\/github\.com\//)`，这是仓库配置的 URL，不是 SkillMeta 的 sourceUrl
5. **本 Story 只修改 shared/ 和 frontmatterParser** — 不涉及 skillService、路由、前端组件（这些在 Story 8.4、8.5 中处理）

### 文件修改清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `shared/types.ts` | 修改 | `SkillMeta` 追加 4 字段；新增 3 个仓库配置接口 |
| `shared/schemas.ts` | 修改 | `SkillMetaSchema` 追加 4 字段；新增 3 个仓库配置 Schema；新增 3 个类型推断 |
| `shared/constants.ts` | 修改 | `ErrorCode` 追加 `SKILL_READONLY` |
| `server/utils/frontmatterParser.ts` | 修改 | `metaCandidate` 追加 4 字段提取 |
| `tests/unit/shared/schemas.test.ts` | 新建或修改 | 新增外部字段 Schema 校验测试 |
| `tests/unit/server/utils/frontmatterParser.test.ts` | 修改 | 新增外部字段解析测试 |

### 现有代码结构参考

**`shared/types.ts` 当前 `SkillMeta` 接口（第 8-31 行）：**
```typescript
export interface SkillMeta {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  type?: "workflow";
  author?: string;
  version?: string;
  filePath: string;
  fileSize: number;
  lastModified: string;
  // ← 在此处追加 4 个新字段
}
```

**`shared/schemas.ts` 当前 `SkillMetaSchema`（第 10-23 行）：**
```typescript
export const SkillMetaSchema = z.object({
  id: z.string().min(1, "id 不能为空"),
  name: z.string().min(1, "name 不能为空"),
  description: z.string(),
  category: z.string().min(1, "category 不能为空"),
  tags: z.array(z.string()).default([]),
  type: z.literal("workflow").optional(),
  author: z.string().optional(),
  version: z.string().optional(),
  filePath: z.string().min(1, "filePath 不能为空"),
  fileSize: z.number().nonnegative("fileSize 不能为负数"),
  lastModified: z.string().datetime({ message: "lastModified 必须是有效的 ISO 8601 时间戳" }),
  // ← 在此处追加 4 个新字段
});
```

**`shared/constants.ts` 当前 `ErrorCode`（第 10-37 行）：**
```typescript
export const ErrorCode = {
  // 通用错误
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  // Skill 相关
  SKILL_NOT_FOUND: "SKILL_NOT_FOUND",
  PARSE_ERROR: "PARSE_ERROR",
  // ← 在此处追加 SKILL_READONLY
  // ...其他错误码
} as const;
```

**`server/utils/frontmatterParser.ts` 当前 `metaCandidate`（第 118-131 行）：**
```typescript
const metaCandidate = {
  id: skillId,
  name: data.name ?? "",
  description: data.description ?? "",
  category: data.category ?? "",
  tags: Array.isArray(data.tags) ? data.tags : [],
  type: data.type,
  author: data.author,
  version: data.version,
  filePath,
  fileSize,
  lastModified,
  // ← 在此处追加 4 个新字段
};
```

### 架构决策参考

**AD-35（SkillMeta 类型扩展）核心要点：**
- 可选字段确保向后兼容——现有 Skill 无这些字段时正常工作（FR-EH-34）
- 字段命名遵循现有 camelCase 规范
- 复用现有 `frontmatterParser` 解析流程，零额外解析开销
- `readonly` 字段严格检查 `=== true`，避免 truthy 值误判

**AD-36（只读保护）中的 `SKILL_READONLY` 错误码：**
- 本 Story 只需在 `shared/constants.ts` 中新增常量
- `AppError.skillReadonly()` 工厂方法在 Story 8.4 中实现

### 测试文件位置

- 现有 frontmatterParser 测试：`tests/unit/server/utils/frontmatterParser.test.ts`（7.92 KB，已有完整测试套件）
- Schema 测试：检查 `tests/unit/shared/` 目录是否存在，如不存在则新建

### 不要做的事情（防止过度实现）

- ❌ 不要在本 Story 中实现 `AppError.skillReadonly()` 工厂方法（Story 8.4 负责）
- ❌ 不要修改 `skillService.ts` 的只读保护逻辑（Story 8.4 负责）
- ❌ 不要创建 `config/repositories.yaml`（Story 8.2 负责）
- ❌ 不要修改前端组件（Story 8.5 负责）
- ❌ 不要修改 `config/categories.yaml`（Story 8.3 负责）
- ❌ 不要实现同步脚本（Story 8.6 负责）

### 依赖关系

- **前置**: Epic-0 ~ Epic-HEATMAP-TOOLTIP（全部 done）✅
- **后续**: Story 8.2（仓库配置文件与解析）将使用本 Story 定义的 `RepositoriesConfigSchema`
- **后续**: Story 8.4（后端只读保护）将使用本 Story 定义的 `SKILL_READONLY` 错误码
- **后续**: Story 8.5（前端来源标签）将使用本 Story 扩展的 `SkillMeta` 类型

### 模块系统注意事项

- 项目使用 ESM（`"type": "module"`）
- 后端 import 需要 `.js` 扩展名（`import { SkillMetaSchema } from '../../shared/schemas.js'`）
- `shared/` 目录同时被 `tsconfig.client.json` 和 `tsconfig.server.json` 的 `include` 覆盖
- `frontmatterParser.ts` 已导入 `SkillMetaSchema`（第 8 行），无需修改 import

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#AD-35] — SkillMeta 类型扩展与 Frontmatter 解析
- [Source: _bmad-output/planning-artifacts/architecture.md#AD-36] — 只读 Skill 后端保护策略（SKILL_READONLY 错误码来源）
- [Source: _bmad-output/planning-artifacts/epics/epics.md#Story-8.1] — 原始 Story 定义和验收标准
- [Source: _bmad-output/planning-artifacts/prd/prd-external-skills-hub.md#FR-EH-34~36] — 类型扩展功能需求
- [Source: shared/types.ts] — 当前 SkillMeta 接口（第 8-31 行）
- [Source: shared/schemas.ts] — 当前 SkillMetaSchema（第 10-23 行）
- [Source: shared/constants.ts] — 当前 ErrorCode（第 10-37 行）
- [Source: server/utils/frontmatterParser.ts] — 当前 metaCandidate 组装（第 118-131 行）
- [Source: tests/unit/server/utils/frontmatterParser.test.ts] — 现有测试套件（参考测试风格）

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-1m-context

### Debug Log References

### Completion Notes List

- ✅ Task 1: 修改 `shared/types.ts` — `SkillMeta` 追加 4 个可选字段（source/sourceUrl/sourceRepo/readonly），新增 `RepoSkillMapping`、`ExternalRepository`、`RepositoriesConfig` 三个接口
- ✅ Task 2: 修改 `shared/schemas.ts` — `SkillMetaSchema` 追加 4 个可选字段，新增 `RepoSkillMappingSchema`、`ExternalRepositorySchema`（含 GitHub URL regex 校验）、`RepositoriesConfigSchema`，新增 3 个类型推断导出
- ✅ Task 3: 修改 `shared/constants.ts` — `ErrorCode` 追加 `SKILL_READONLY: "SKILL_READONLY"`
- ✅ Task 4: 修改 `server/utils/frontmatterParser.ts` — `metaCandidate` 追加 4 个字段提取，`readonly` 严格 `=== true` 检查
- ✅ Task 5: 新建 `tests/unit/shared/schemas.test.ts`（31 个测试），扩展 `frontmatterParser.test.ts`（新增 7 个外部字段测试）
- ✅ Task 6: `tsc --noEmit` 零错误；52 个测试全部通过（2 个测试文件）

### File List

- `shared/types.ts`（修改）
- `shared/schemas.ts`（修改）
- `shared/constants.ts`（修改）
- `server/utils/frontmatterParser.ts`（修改）
- `tests/unit/shared/schemas.test.ts`（新建）
- `tests/unit/server/utils/frontmatterParser.test.ts`（修改）
