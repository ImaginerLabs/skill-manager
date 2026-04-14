# Story 8.3: 预设分类扩展与默认套件

Status: done

## Story

As a 用户,
I want 系统的预设分类从 4 个扩展到 9 个，并自动创建包含所有出厂分类的默认套件,
So that 外部 Skill 有合适的分类归属，且我开箱即用就有完整的技能组合。

## Acceptance Criteria (AC)

**AC-1: 分类扩展至 9 个**
- Given `config/categories.yaml` 当前只有 4 个分类
- When 完成本 Story
- Then `categories.yaml` 包含 9 个分类：
  - 原有：`coding`、`writing`、`devops`、`workflows`
  - 新增：`document-processing`（文档处理）、`dev-tools`（开发工具）、`testing`（测试）、`design`（设计）、`meta-skills`（元技能）
- And 每个新增分类有准确的 `displayName` 和 `description`

**AC-2: 现有 Skill 归属不变**
- Given 现有 Skill 已归属到原有 4 个分类
- When 分类扩展完成
- Then 现有 Skill 的分类归属不变（FR-EH-29）

**AC-3: 自动创建默认套件**
- Given 系统启动时 `settings.yaml` 中不存在 `name: "default"` 的套件
- When `bundleService` 初始化
- Then 自动创建默认套件：`name: "default"`、`displayName: "默认套件"`、`description: "包含所有出厂预设分类的完整技能组合"`
- And 默认套件的 `categoryNames` 包含所有 9 个出厂分类
- And 默认套件的 `id` 固定为 `bundle-default`

**AC-4: 幂等创建**
- Given 系统启动时 `settings.yaml` 中已存在 `name: "default"` 的套件
- When `bundleService` 初始化
- Then 不重复创建（幂等操作）

**AC-5: 默认套件删除保护**
- Given 用户尝试删除默认套件
- When 调用 `removeBundle` API
- Then 返回 400 错误，提示"默认套件不可删除"

**AC-6: 默认套件可编辑**
- Given 用户编辑默认套件（修改包含的分类）
- When 调用 `updateBundle` API
- Then 正常更新（默认套件可编辑）

**AC-7: 单元测试覆盖**
- Given 本 Story 完成
- When 运行测试
- Then `ensureDefaultBundle()` 有单元测试（首次创建、幂等跳过）
- And `removeBundle` 默认套件删除保护有单元测试
- And 分类扩展后现有 Skill 归属不变有集成测试
- And 所有测试通过

## Tasks / Subtasks

- [x] Task 1: 扩展 `config/categories.yaml` (AC: #1, #2)
  - [x] 1.1 追加 5 个新分类：`document-processing`、`dev-tools`、`testing`、`design`、`meta-skills`
  - [x] 1.2 每个新分类包含 `name`、`displayName`、`description`
  - [x] 1.3 原有 4 个分类保持不变

- [x] Task 2: 实现 `ensureDefaultBundle()` (AC: #3, #4)
  - [x] 2.1 在 `server/services/bundleService.ts` 中新增 `ensureDefaultBundle()` 函数
  - [x] 2.2 定义 `DEFAULT_BUNDLE_ID = "bundle-default"` 常量
  - [x] 2.3 定义 `DEFAULT_BUNDLE_CATEGORIES` 常量（9 个分类名）
  - [x] 2.4 幂等检查：已存在 `name: "default"` 时直接返回

- [x] Task 3: 实现默认套件删除保护 (AC: #5)
  - [x] 3.1 在 `removeBundle` 函数中检查 `bundle.name === "default"`
  - [x] 3.2 为 `true` 时抛出 `AppError.badRequest("默认套件不可删除")`

- [x] Task 4: 在启动序列中调用 `ensureDefaultBundle()` (AC: #3)
  - [x] 4.1 修改 `server/index.ts`，在 `initializeSkillCache()` 之后调用 `ensureDefaultBundle()`

- [x] Task 5: 编写单元测试 (AC: #7)
  - [x] 5.1 `ensureDefaultBundle()` 首次创建测试
  - [x] 5.2 `ensureDefaultBundle()` 幂等跳过测试
  - [x] 5.3 `removeBundle` 默认套件删除保护测试
  - [x] 5.4 分类扩展后现有 Skill 归属不变集成测试

- [x] Task 6: 验证编译与测试
  - [x] 6.1 运行 `npx tsc --noEmit` 确认零错误
  - [x] 6.2 运行 `npm run test` 确认所有测试通过

## Dev Notes

### 关键约束

1. **幂等操作** — `ensureDefaultBundle()` 已存在时不重复创建
2. **固定 ID** — 默认套件 `id` 固定为 `bundle-default`，便于识别
3. **可编辑不可删除** — 用户可修改默认套件的分类组合，但不可删除
4. **9 个出厂分类** — `DEFAULT_BUNDLE_CATEGORIES` 包含全部 9 个分类名

### DEFAULT_BUNDLE_CATEGORIES 常量

```typescript
const DEFAULT_BUNDLE_CATEGORIES = [
  "coding",
  "writing",
  "devops",
  "workflows",
  "document-processing",
  "dev-tools",
  "testing",
  "design",
  "meta-skills",
];
```

### 文件修改清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `config/categories.yaml` | 修改 | 追加 5 个新分类 |
| `server/services/bundleService.ts` | 修改 | 新增 `ensureDefaultBundle()` + 删除保护 |
| `server/index.ts` | 修改 | 启动序列新增 `ensureDefaultBundle()` 调用 |
| `tests/unit/server/services/bundleService.test.ts` | 修改 | 新增相关测试 |

### 依赖关系

- **前置**: Story 8.1（类型定义）✅、Story 8.2（配置文件）✅
- **后续**: Story 8.6（同步脚本）将把外部 Skill 同步到新增分类目录

### References

- [Source: _bmad-output/planning-artifacts/epics/epics.md#Story-8.3]
- [Source: _bmad-output/planning-artifacts/architecture.md#AD-38~AD-39]
- [Source: server/services/bundleService.ts] — 现有 bundleService 实现

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-1m-context

### Completion Notes List

- ✅ Task 1: 修改 `config/categories.yaml` — 追加 5 个新分类（document-processing、dev-tools、testing、design、meta-skills），各含 displayName 和 description
- ✅ Task 2: 修改 `server/services/bundleService.ts` — 新增 `DEFAULT_BUNDLE_ID`、`DEFAULT_BUNDLE_CATEGORIES` 常量，实现 `ensureDefaultBundle()` 幂等函数
- ✅ Task 3: 修改 `removeBundle` — 新增默认套件删除保护，抛出 `AppError.badRequest("默认套件不可删除")`
- ✅ Task 4: 修改 `server/index.ts` — 启动序列新增 `ensureDefaultBundle()` 调用
- ✅ Task 5: 编写单元测试 — `ensureDefaultBundle` 首次创建、幂等跳过、删除保护测试全部通过
- ✅ Task 6: `tsc --noEmit` 零错误；所有测试通过

### File List

- `config/categories.yaml`（修改）
- `server/services/bundleService.ts`（修改）
- `server/index.ts`（修改）
- `tests/unit/server/services/bundleService.test.ts`（修改）
