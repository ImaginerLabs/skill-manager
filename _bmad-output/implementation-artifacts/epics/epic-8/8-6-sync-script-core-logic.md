# Story 8.6: 同步脚本核心逻辑

Status: done

## Story

As a 开发者,
I want 一个 Node.js 同步脚本能自动从外部仓库拉取、筛选、复制 Skill 并注入来源元数据,
So that GitHub Action 可以调用此脚本完成自动化同步。

## Acceptance Criteria (AC)

**AC-1: 创建同步脚本文件**
- Given `scripts/sync-external-skills.mjs` 不存在
- When 完成本 Story
- Then 创建 `scripts/sync-external-skills.mjs`，ESM 格式

**AC-2: 读取仓库配置**
- Given 同步脚本执行
- When 读取 `config/repositories.yaml`
- Then 正确解析配置，遍历所有 `enabled: true` 的仓库

**AC-3: 首次 clone**
- Given 同步脚本处理一个仓库（首次）
- When `skill-repos/{id}/` 目录不存在
- Then 执行 `git clone {url} --branch {branch} --single-branch skill-repos/{id}/`
- And clone 超时设置为 60 秒

**AC-4: 增量 pull**
- Given 同步脚本处理一个仓库（增量）
- When `skill-repos/{id}/` 目录已存在
- Then 执行 `git -C skill-repos/{id}/ pull`

**AC-5: include/exclude 筛选**
- Given 同步脚本完成仓库拉取
- When 根据 `include`/`exclude` 规则筛选
- Then 黑名单优先级高于白名单
- And `exclude` 中的 Skill 即使在 `include` 中也被排除

**AC-6: 复制 Skill 目录**
- Given 筛选后的 Skill 列表
- When 复制到 `skills/{targetCategory}/{skillName}/`
- Then 完整复制 Skill 目录（包含所有文件）
- And 目标分类目录不存在时自动创建（`fs.mkdirSync({ recursive: true })`）

**AC-7: 注入 Frontmatter 来源元数据**
- Given 复制完成的 Skill
- When 注入 Frontmatter 来源元数据
- Then 在 Skill 的主 `.md` 文件（`SKILL.md` 或目录下第一个 `.md` 文件）的 Frontmatter 中注入：
  - `source: "{repoId}"`
  - `sourceUrl: "{url}/tree/{branch}/{skillsPath}/{skillName}"`
  - `sourceRepo: "{url}"`
  - `readonly: true`
- And 已有 Frontmatter 时追加字段，无 Frontmatter 时创建

**AC-8: 本地 Skill 冲突检测**
- Given 本地 `skills/` 目录中已存在同名 Skill（非外部来源）
- When 同步脚本检测到 ID 冲突
- Then 跳过该外部 Skill，本地 Skill 优先
- And 记录 `[sync] WARN: Skill "{name}" already exists locally, skipping external version`

**AC-9: git 操作失败处理**
- Given 仓库 clone/pull 失败（网络错误或超时）
- When 同步脚本处理该仓库
- Then 记录错误日志，跳过该仓库，继续处理其他仓库
- And 保留上次同步的 Skill 不删除

**AC-10: Skill 不存在警告**
- Given `include` 中的 Skill 在仓库中不存在
- When 同步脚本筛选
- Then 记录警告日志，跳过该 Skill

**AC-11: Frontmatter 异常降级**
- Given Skill 文件格式异常（无 Frontmatter）
- When 同步脚本注入元数据
- Then 记录警告，仍复制文件（降级为无来源元数据）

**AC-12: dry-run 模式**
- Given 同步脚本使用 `--dry-run` 参数执行
- When 脚本运行
- Then 仅输出将要执行的操作（clone/pull/copy/inject），不实际执行文件操作

**AC-13: 变更摘要输出**
- Given 同步脚本执行完成
- When 输出变更摘要
- Then 列出新增/更新/跳过的 Skill 列表
- And 全部成功或部分失败 → exit 0
- And 脚本自身未捕获异常 → exit 1

**AC-14: 单元测试覆盖**
- Given 本 Story 完成
- When 运行测试
- Then 配置读取有单元测试
- And `include`/`exclude` 筛选逻辑有单元测试（白名单、黑名单优先、空列表）
- And Frontmatter 注入逻辑有单元测试（有 Frontmatter、无 Frontmatter、注入失败降级）
- And ID 冲突检测有单元测试
- And `--dry-run` 模式有单元测试
- And 所有测试通过

## Tasks / Subtasks

- [x] Task 1: 创建 `scripts/sync-external-skills.mjs` 基础结构 (AC: #1)
  - [x] 1.1 ESM 格式，添加 shebang `#!/usr/bin/env node`
  - [x] 1.2 定义路径常量（PROJECT_ROOT、CONFIG_PATH、SKILLS_ROOT、SKILL_REPOS_ROOT）
  - [x] 1.3 定义变更统计对象（added/updated/skipped/errors）
  - [x] 1.4 定义 `isDryRun` 标志（`process.argv.includes("--dry-run")`）

- [x] Task 2: 实现配置读取 `loadRepositoriesConfig()` (AC: #2)
  - [x] 2.1 读取并解析 `config/repositories.yaml`
  - [x] 2.2 文件不存在时返回 `{ repositories: [] }`
  - [x] 2.3 格式错误时记录日志并返回 `{ repositories: [] }`

- [x] Task 3: 实现 git 操作 `syncGitRepo()` (AC: #3, #4, #9)
  - [x] 3.1 目录不存在时执行 `git clone`，超时 60 秒
  - [x] 3.2 目录已存在时执行 `git pull`
  - [x] 3.3 失败时记录错误日志，返回 `false`

- [x] Task 4: 实现筛选逻辑 `filterSkills()` (AC: #5)
  - [x] 4.1 黑名单优先：`exclude` 中的 Skill 被过滤
  - [x] 4.2 返回筛选后的 `include` 列表

- [x] Task 5: 实现 Skill 复制 `copySkillDirectory()` (AC: #6)
  - [x] 5.1 目标目录不存在时自动创建
  - [x] 5.2 使用 `fs.cpSync` 递归复制

- [x] Task 6: 实现 Frontmatter 注入 `injectSourceMetadata()` (AC: #7, #11)
  - [x] 6.1 使用 `gray-matter` 解析和序列化 Frontmatter
  - [x] 6.2 注入 `source`、`sourceUrl`、`sourceRepo`、`readonly: true`
  - [x] 6.3 注入失败时记录警告，不阻塞流程

- [x] Task 7: 实现冲突检测 `hasLocalConflict()` (AC: #8)
  - [x] 7.1 检查目标路径是否已存在
  - [x] 7.2 读取主 .md 文件 Frontmatter，无 `source` 字段视为本地 Skill

- [x] Task 8: 实现主流程 `main()` (AC: #2, #9, #10, #12, #13)
  - [x] 8.1 读取配置，过滤 `enabled: true` 的仓库
  - [x] 8.2 遍历仓库，调用 `processRepository()`
  - [x] 8.3 输出变更摘要 `printSummary()`
  - [x] 8.4 未捕获异常 → exit 1

- [x] Task 9: 编写单元测试 (AC: #14)
  - [x] 9.1 `filterSkills()` 测试（白名单、黑名单优先、空列表）
  - [x] 9.2 `loadRepositoriesConfig()` 测试（正常、不存在、格式错误）
  - [x] 9.3 `injectSourceMetadata()` 测试（有/无 Frontmatter、注入失败降级）
  - [x] 9.4 `hasLocalConflict()` 测试（冲突、无冲突）
  - [x] 9.5 `--dry-run` 模式测试

- [x] Task 10: 验证编译与测试
  - [x] 10.1 运行 `npm run test` 确认所有测试通过

## Dev Notes

### 关键约束

1. **永不删除** — 同步脚本永远不删除 `skills/` 目录下的现有文件，只新增或覆盖
2. **本地优先** — 本地 Skill（无 `source` 字段）优先于外部 Skill
3. **黑名单优先** — `exclude` 优先级高于 `include`
4. **日志前缀** — 所有日志使用 `[sync]` 前缀
5. **超时设置** — git 操作超时 60 秒（`timeout: 60000`）

### skillsPath 处理

```javascript
// skillsPath 为 "." 时，Skill 直接在仓库根目录
const skillsPathSegment =
  repo.skillsPath && repo.skillsPath !== "."
    ? `${repo.skillsPath}/${skillName}`
    : skillName;
```

### 文件修改清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `scripts/sync-external-skills.mjs` | 新建 | 同步脚本主文件（ESM 格式） |
| `tests/unit/scripts/sync-external-skills.test.mjs` | 新建 | 单元测试 |

### 依赖关系

- **前置**: Story 8.2（`config/repositories.yaml` 已创建）✅
- **前置**: Story 8.3（新增分类目录已就绪）✅
- **后续**: Story 8.7（GitHub Action）将调用此脚本

### References

- [Source: _bmad-output/planning-artifacts/epics/epics.md#Story-8.6]
- [Source: _bmad-output/planning-artifacts/architecture.md#AD-34]
- [Source: config/repositories.yaml] — 仓库注册配置

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-1m-context

### Completion Notes List

- ✅ Task 1: 创建 `scripts/sync-external-skills.mjs` — ESM 格式，定义路径常量、变更统计、isDryRun 标志
- ✅ Task 2: 实现 `loadRepositoriesConfig()` — 读取 YAML，文件不存在/格式错误时优雅降级
- ✅ Task 3: 实现 `syncGitRepo()` — clone（首次）/pull（增量），超时 60 秒，失败返回 false
- ✅ Task 4: 实现 `filterSkills()` — 黑名单优先过滤
- ✅ Task 5: 实现 `copySkillDirectory()` — 递归复制，自动创建目标目录
- ✅ Task 6: 实现 `injectSourceMetadata()` — gray-matter 注入 source/sourceUrl/sourceRepo/readonly，失败降级
- ✅ Task 7: 实现 `hasLocalConflict()` — 检查目标路径 + Frontmatter source 字段
- ✅ Task 8: 实现主流程 `main()` — 读取配置、遍历仓库、输出摘要、exit 0/1
- ✅ Task 9: 编写单元测试 — filterSkills、loadRepositoriesConfig、injectSourceMetadata、hasLocalConflict、dry-run 测试全部通过
- ✅ Task 10: 所有测试通过

### File List

- `scripts/sync-external-skills.mjs`（新建，366 行）
- `tests/unit/scripts/sync-external-skills.test.mjs`（新建）
