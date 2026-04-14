# Story 8.2: 仓库配置文件与解析

Status: done

## Story

As a 开发者,
I want 系统能读取和校验 `config/repositories.yaml` 仓库注册配置文件,
So that 同步脚本和后端服务可以获取外部仓库的注册信息。

## Acceptance Criteria (AC)

**AC-1: 创建 config/repositories.yaml**
- Given `config/repositories.yaml` 不存在
- When 完成本 Story
- Then 创建 `config/repositories.yaml`，包含 `anthropic-official` 仓库配置
- And `include` 白名单包含 9 个通用 Skill（pdf、docx、xlsx、pptx、mcp-builder、webapp-testing、skill-creator、frontend-design、claude-api）
- And `exclude` 黑名单包含 8 个非通用 Skill（slack-gif-creator、algorithmic-art、brand-guidelines、canvas-design、theme-factory、internal-comms、web-artifacts-builder、doc-coauthoring）
- And 每个 `include` 项包含 `name` 和 `targetCategory`

**AC-2: .gitignore 新增 skill-repos/ 规则**
- Given `.gitignore` 中尚无 `skill-repos/` 规则
- When 完成本 Story
- Then `.gitignore` 新增 `skill-repos/` 忽略规则

**AC-3: 正常解析配置文件**
- Given 系统启动时
- When `config/repositories.yaml` 存在且格式正确
- Then 系统正确解析并返回 `RepositoriesConfig` 对象

**AC-4: 文件不存在时优雅降级**
- Given 系统启动时
- When `config/repositories.yaml` 不存在
- Then 系统正常启动，返回空数组（`{ repositories: [] }`）（FR-EH-05）

**AC-5: 格式错误时优雅降级**
- Given 系统启动时
- When `config/repositories.yaml` 格式错误（YAML 语法错误或 Schema 校验失败）
- Then 记录错误日志，返回空数组，不阻塞系统启动（FR-EH-06）

**AC-6: 单元测试覆盖**
- Given 本 Story 完成
- When 运行测试
- Then 配置文件解析有单元测试（正常解析、文件不存在、格式错误）
- And Zod Schema 校验有单元测试（合法配置、非法 URL、缺失必填字段）
- And 所有测试通过

## Tasks / Subtasks

- [x] Task 1: 创建 `config/repositories.yaml` (AC: #1)
  - [x] 1.1 创建文件，包含 `anthropic-official` 仓库配置
  - [x] 1.2 配置 `include` 白名单（9 个 Skill，含 `targetCategory`）
  - [x] 1.3 配置 `exclude` 黑名单（8 个非通用 Skill）

- [x] Task 2: 更新 `.gitignore` (AC: #2)
  - [x] 2.1 在 `.gitignore` 中新增 `skill-repos/` 规则

- [x] Task 3: 实现配置读取工具函数 (AC: #3, #4, #5)
  - [x] 3.1 在 `server/utils/` 中新增或复用 YAML 读取逻辑
  - [x] 3.2 使用 `RepositoriesConfigSchema` 进行 Zod 校验
  - [x] 3.3 文件不存在时返回 `{ repositories: [] }`
  - [x] 3.4 格式错误时记录日志并返回 `{ repositories: [] }`

- [x] Task 4: 编写单元测试 (AC: #6)
  - [x] 4.1 正常解析测试（合法 YAML → 正确 RepositoriesConfig 对象）
  - [x] 4.2 文件不存在测试（返回空数组）
  - [x] 4.3 格式错误测试（YAML 语法错误 → 返回空数组）
  - [x] 4.4 Schema 校验测试（非法 URL、缺失必填字段）

- [x] Task 5: 验证编译与测试 (AC: #6)
  - [x] 5.1 运行 `npx tsc --noEmit` 确认零错误
  - [x] 5.2 运行 `npm run test` 确认所有测试通过

## Dev Notes

### 关键约束

1. **优雅降级** — 文件不存在或格式错误时不阻塞系统启动，返回空数组
2. **复用现有模式** — 参考 `server/utils/` 中已有的 YAML 读取工具
3. **使用 Story 8.1 定义的 Schema** — `RepositoriesConfigSchema` 已在 `shared/schemas.ts` 中定义

### 文件修改清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `config/repositories.yaml` | 新建 | 仓库注册配置文件 |
| `.gitignore` | 修改 | 新增 `skill-repos/` 规则 |
| `server/utils/repositoriesConfig.ts` | 新建 | 配置读取与解析工具函数 |
| `tests/unit/server/utils/repositoriesConfig.test.ts` | 新建 | 单元测试 |

### config/repositories.yaml 内容

```yaml
# External Skills Hub — 外部仓库注册配置
repositories:
  - id: anthropic-official
    name: Anthropic Official Skills
    url: https://github.com/anthropics/skills
    branch: main
    skillsPath: .
    enabled: true
    include:
      - name: pdf
        targetCategory: document-processing
      - name: docx
        targetCategory: document-processing
      - name: xlsx
        targetCategory: document-processing
      - name: pptx
        targetCategory: document-processing
      - name: mcp-builder
        targetCategory: dev-tools
      - name: webapp-testing
        targetCategory: testing
      - name: skill-creator
        targetCategory: meta-skills
      - name: frontend-design
        targetCategory: design
      - name: claude-api
        targetCategory: dev-tools
    exclude:
      - slack-gif-creator
      - algorithmic-art
      - brand-guidelines
      - canvas-design
      - theme-factory
      - internal-comms
      - web-artifacts-builder
      - doc-coauthoring
```

### 依赖关系

- **前置**: Story 8.1（`RepositoriesConfigSchema` 已定义）✅
- **后续**: Story 8.6（同步脚本）将使用本 Story 创建的配置文件和读取函数

### References

- [Source: _bmad-output/planning-artifacts/epics/epics.md#Story-8.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#AD-31~AD-32]
- [Source: shared/schemas.ts] — `RepositoriesConfigSchema`

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-1m-context

### Completion Notes List

- ✅ Task 1: 创建 `config/repositories.yaml` — 包含 anthropic-official 仓库配置，9 个白名单 Skill，8 个黑名单 Skill
- ✅ Task 2: 更新 `.gitignore` — 新增 `skill-repos/` 规则
- ✅ Task 3: 实现配置读取工具函数 — `server/utils/repositoriesConfig.ts`，支持优雅降级
- ✅ Task 4: 编写单元测试 — 正常解析、文件不存在、格式错误、Schema 校验
- ✅ Task 5: `tsc --noEmit` 零错误；所有测试通过

### File List

- `config/repositories.yaml`（新建）
- `.gitignore`（修改）
- `server/utils/repositoriesConfig.ts`（新建）
- `tests/unit/server/utils/repositoriesConfig.test.ts`（新建）
