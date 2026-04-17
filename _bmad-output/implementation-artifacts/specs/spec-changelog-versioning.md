---
title: "Changelog 与版本号迭代机制（方案 A）"
type: "chore"
created: "2026-04-12"
status: "done"
baseline_commit: "48084f7"
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 项目缺少标准化的版本号管理和 Changelog 生成机制，无法追踪版本演进历史，也无法向使用者清晰传达每次发布的变更内容。

**Approach:** 引入 `commitlint` 强制规范 commit message 格式（Conventional Commits），并添加 `conventional-changelog-cli` 驱动的 `release` 脚本，实现一键 bump 版本号 + 生成 `CHANGELOG.md`。

## Boundaries & Constraints

**Always:**

- 使用 `@commitlint/cli` + `@commitlint/config-conventional` 校验 commit message
- Husky 新增 `commit-msg` hook，不修改现有 `pre-commit` hook
- `CHANGELOG.md` 放置于项目根目录
- 版本号仅管理 `package.json` 的 `version` 字段，不涉及 Skill 文件 Frontmatter
- 所有新增 npm scripts 遵循现有命名风格（kebab-case）
- `conventional-changelog-cli` 替代已停维护的 `standard-version`

**Ask First:**

- 如果 `CHANGELOG.md` 已存在且有内容，是否追加还是覆盖？（当前项目无此文件，跳过）

**Never:**

- 不引入 `standard-version`（已停止维护）
- 不引入 `release-please`（面向 GitHub Actions，本地工具链适配复杂）
- 不引入 `changesets`（单包项目过度设计）
- 不修改 Skill 文件 Frontmatter 的 `version` 字段
- 不修改现有 `pre-commit` hook 内容
- 不修改 `shared/types.ts`、`config/settings.yaml`

## I/O & Edge-Case Matrix

| Scenario              | Input / State                    | Expected Output / Behavior                                                   | Error Handling             |
| --------------------- | -------------------------------- | ---------------------------------------------------------------------------- | -------------------------- |
| 正常 patch 发布       | `npm run release:patch`          | `package.json` version +0.0.1，`CHANGELOG.md` 追加新版本节，git commit + tag | 脚本失败时不产生半更新状态 |
| 不规范 commit message | `git commit -m "随便写"`         | commitlint 拦截，提示规范格式，commit 被阻止                                 | 输出错误信息，退出码非 0   |
| 规范 commit message   | `git commit -m "feat: 新增功能"` | commitlint 通过，commit 正常执行                                             | N/A                        |
| 首次生成 changelog    | 无 `CHANGELOG.md`                | 自动创建并写入所有历史 conventional commits                                  | N/A                        |
| 追加 changelog        | 已有 `CHANGELOG.md`              | 仅追加新版本节，不覆盖历史内容                                               | N/A                        |

</frozen-after-approval>

## Code Map

- `package.json` -- 新增 devDependencies（commitlint 相关）、release scripts、lint-staged 规则
- `.husky/commit-msg` -- 新增 commit-msg hook，调用 commitlint
- `commitlint.config.js` -- commitlint 配置文件（项目根目录）
- `CHANGELOG.md` -- 自动生成的变更日志（项目根目录，首次由脚本创建）

## Tasks & Acceptance

**Execution:**

- [x] `package.json` -- 新增 devDependencies：`@commitlint/cli`、`@commitlint/config-conventional`、`conventional-changelog-cli`；新增 scripts：`release:patch`、`release:minor`、`release:major`、`changelog` -- 提供标准化版本发布入口
- [x] `commitlint.config.js` -- 创建 commitlint 配置文件，继承 `@commitlint/config-conventional` -- 定义 commit message 规范
- [x] `.husky/commit-msg` -- 创建 commit-msg hook，内容为 `npx --no -- commitlint --edit $1` -- 在每次 commit 时自动校验 message 格式
- [x] `CHANGELOG.md` -- 执行 `npm run changelog` 初始化，基于现有 git 历史生成首版 changelog -- 建立历史基线

**Tests (MANDATORY — do NOT delete this section):**

- [x] `tests/unit/scripts/commitlint.test.ts` -- 验证 commitlint 配置能正确接受规范 message、拒绝非规范 message -- 保证配置有效性

**Acceptance Criteria:**

- Given 执行 `git commit -m "随便写"`，when commitlint hook 触发，then commit 被阻止并输出格式提示
- Given 执行 `git commit -m "feat: 新增功能"`，when commitlint hook 触发，then commit 正常通过
- Given 执行 `npm run release:patch`，when 脚本完成，then `package.json` version 递增 patch 位，`CHANGELOG.md` 包含新版本节，git 有对应 commit 和 tag
- Given 执行 `npm run changelog`，when 项目有 conventional commits 历史，then `CHANGELOG.md` 被创建或追加，包含 feat/fix/breaking 分类条目

## Dev Agent Record

**实现日期：** 2026-04-12
**实现者：** Amelia（Developer Agent）

**已实现内容：**

- `package.json`：新增 `@commitlint/cli@^19.8.0`、`@commitlint/config-conventional@^19.8.0`、`conventional-changelog-cli@^5.0.0` 至 devDependencies；新增 `changelog`、`release:patch`、`release:minor`、`release:major` 四条 scripts
- `commitlint.config.js`：ESM 格式，继承 `@commitlint/config-conventional`
- `.husky/commit-msg`：新增 hook，调用 `npx --no -- commitlint --edit $1`，已 chmod +x
- `CHANGELOG.md`：基于 angular preset 生成，包含完整历史 conventional commits（feat/fix/chore/docs/refactor/test 分类）
- `tests/unit/scripts/commitlint.test.ts`：13 个测试用例（8 合规 + 5 不规范），全部通过

**测试结果：** 45 files, 481 tests — 全部通过 ✅

**变更文件列表：**

- `package.json`
- `package-lock.json`
- `commitlint.config.js`（新建）
- `.husky/commit-msg`（新建）
- `CHANGELOG.md`（新建）
- `tests/unit/scripts/commitlint.test.ts`（新建）

## Spec Change Log

## Design Notes

**release scripts 设计：**

```json
"changelog": "conventional-changelog -p angular -i CHANGELOG.md -s",
"release:patch": "npm version patch && npm run changelog && git add CHANGELOG.md && git commit --amend --no-edit",
"release:minor": "npm version minor && npm run changelog && git add CHANGELOG.md && git commit --amend --no-edit",
"release:major": "npm version major && npm run changelog && git add CHANGELOG.md && git commit --amend --no-edit"
```

`npm version` 会自动 bump `package.json`、创建 git commit 和 tag；`--amend --no-edit` 将 changelog 更新合并进同一个 commit，保持 git 历史整洁。

**commitlint.config.js：**

```js
export default { extends: ["@commitlint/config-conventional"] };
```

使用 ESM 格式（项目 `"type": "module"`）。

## Verification

**Commands:**

- `npm install` -- expected: 无报错，新依赖安装成功
- `echo "test: bad message" | npx commitlint` -- expected: 退出码 0（test 类型在 conventional 规范中合法）
- `echo "随便写" | npx commitlint` -- expected: 退出码非 0，输出格式错误提示
- `npm run changelog` -- expected: `CHANGELOG.md` 被创建，包含历史 conventional commits 条目
- `npm run test:run` -- expected: 全部测试通过
