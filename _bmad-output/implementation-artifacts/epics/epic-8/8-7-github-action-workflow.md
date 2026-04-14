# Story 8.7: GitHub Action 工作流

Status: done

## Story

As a 开发者,
I want 一个 GitHub Action 工作流能定时触发同步脚本并自动创建 PR,
So that 外部 Skill 能自动保持与上游仓库的同步，且变更经过人工审核后才合并。

## Acceptance Criteria (AC)

**AC-1: 创建工作流文件**
- Given `.github/workflows/sync-external-skills.yml` 不存在
- When 完成本 Story
- Then 创建 `.github/workflows/sync-external-skills.yml`

**AC-2: 触发条件**
- Given GitHub Action 工作流配置
- When 查看触发条件
- Then 支持 cron 定时触发（`0 0 * * *`，每日 UTC 00:00）
- And 支持 `workflow_dispatch` 手动触发

**AC-3: 工作流步骤**
- Given GitHub Action 执行
- When 工作流运行
- Then 执行以下步骤：
  1. `actions/checkout@v4` — 检出代码
  2. `actions/setup-node@v4` — 安装 Node.js 18
  3. `npm ci` — 安装依赖
  4. `node scripts/sync-external-skills.mjs` — 执行同步脚本
  5. `peter-evans/create-pull-request@v6` — 如有变更则创建 PR

**AC-4: PR 配置**
- Given 同步脚本执行后有文件变更
- When 创建 PR
- Then PR 标题格式：`chore: sync external skills`
- And PR 分支名：`chore/sync-external-skills`
- And PR 描述包含变更摘要
- And commit message：`chore: sync external skills`

**AC-5: 无变更时不创建 PR**
- Given 同步脚本执行后无文件变更
- When PR 创建步骤执行
- Then 不创建 PR（`peter-evans/create-pull-request` 默认行为）

**AC-6: 权限配置**
- Given GitHub Action 工作流权限
- When 查看权限配置
- Then 包含 `contents: write`（提交变更）和 `pull-requests: write`（创建 PR）

**AC-7: YAML 语法正确**
- Given 本 Story 完成
- When 查看工作流文件
- Then YAML 语法正确，可被 GitHub Actions 正确解析
- And 所有 Action 版本使用主版本号锁定（`@v4`、`@v6`）

## Tasks / Subtasks

- [x] Task 1: 创建 `.github/workflows/sync-external-skills.yml` (AC: #1)
  - [x] 1.1 创建 `.github/workflows/` 目录（如不存在）
  - [x] 1.2 创建工作流 YAML 文件

- [x] Task 2: 配置触发条件 (AC: #2)
  - [x] 2.1 配置 `schedule.cron: "0 0 * * *"`
  - [x] 2.2 配置 `workflow_dispatch`，支持 `dry_run` 输入参数

- [x] Task 3: 配置权限 (AC: #6)
  - [x] 3.1 设置 `permissions.contents: write`
  - [x] 3.2 设置 `permissions.pull-requests: write`

- [x] Task 4: 配置工作流步骤 (AC: #3)
  - [x] 4.1 `actions/checkout@v4`（`fetch-depth: 0`）
  - [x] 4.2 `actions/setup-node@v4`（node-version: 18，cache: npm）
  - [x] 4.3 `npm ci`
  - [x] 4.4 执行同步脚本（支持 dry_run 参数）
  - [x] 4.5 `peter-evans/create-pull-request@v6`

- [x] Task 5: 配置 PR 创建参数 (AC: #4, #5)
  - [x] 5.1 commit-message: `chore: sync external skills`
  - [x] 5.2 branch: `chore/sync-external-skills`
  - [x] 5.3 title: `chore: sync external skills`
  - [x] 5.4 body: 包含变更说明和注意事项
  - [x] 5.5 labels: `automated`、`external-skills`

- [x] Task 6: 配置并发控制
  - [x] 6.1 设置 `concurrency.group: sync-external-skills`
  - [x] 6.2 设置 `cancel-in-progress: true`

- [x] Task 7: 验证 YAML 语法 (AC: #7)
  - [x] 7.1 人工验证 YAML 语法正确性
  - [x] 7.2 确认所有 Action 版本使用主版本号锁定

## Dev Notes

### 关键约束

1. **版本锁定** — 所有 Action 使用主版本号（`@v4`、`@v6`），不使用 `@latest`
2. **权限最小化** — 只申请必要权限（contents: write + pull-requests: write）
3. **并发控制** — 同一时间只运行一个同步任务，新触发取消旧任务
4. **dry-run 支持** — `workflow_dispatch` 支持手动触发时选择 dry-run 模式

### 工作流文件结构

```yaml
name: Sync External Skills

on:
  schedule:
    - cron: "0 0 * * *"
  workflow_dispatch:
    inputs:
      dry_run:
        description: "Dry run mode"
        required: false
        default: "false"
        type: boolean

permissions:
  contents: write
  pull-requests: write

concurrency:
  group: sync-external-skills
  cancel-in-progress: true

jobs:
  sync:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: node scripts/sync-external-skills.mjs
      - uses: peter-evans/create-pull-request@v6
```

### 文件修改清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `.github/workflows/sync-external-skills.yml` | 新建 | GitHub Action 工作流配置 |

### 依赖关系

- **前置**: Story 8.6（同步脚本已创建）✅
- **无后续**: 本 Story 是 Epic-8 的最后一个 Story

### References

- [Source: _bmad-output/planning-artifacts/epics/epics.md#Story-8.7]
- [Source: _bmad-output/planning-artifacts/architecture.md#AD-33]
- [Source: https://github.com/peter-evans/create-pull-request] — create-pull-request Action 文档

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-1m-context

### Completion Notes List

- ✅ Task 1: 创建 `.github/workflows/sync-external-skills.yml`
- ✅ Task 2: 配置触发条件 — cron `0 0 * * *` + workflow_dispatch（含 dry_run 参数）
- ✅ Task 3: 配置权限 — contents: write + pull-requests: write
- ✅ Task 4: 配置工作流步骤 — checkout@v4、setup-node@v4（Node 18）、npm ci、同步脚本、create-pull-request@v6
- ✅ Task 5: 配置 PR 参数 — 标题/分支/commit message/body/labels
- ✅ Task 6: 配置并发控制 — group: sync-external-skills，cancel-in-progress: true
- ✅ Task 7: YAML 语法验证通过，所有 Action 版本使用主版本号锁定

### File List

- `.github/workflows/sync-external-skills.yml`（新建，80 行）
