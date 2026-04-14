# Story 8.5: 前端来源标签与只读标识 UI

Status: done

## Story

As a 用户,
I want 在 Skill 卡片和预览面板中看到外部 Skill 的来源标签和只读标识,
So that 我能清楚区分本地 Skill 和外部 Skill，并能快速跳转到 GitHub 仓库查看原始内容。

## Acceptance Criteria (AC)

**AC-1: SkillCard 来源标签**
- Given 一个外部 Skill（`source` 字段有值）在 SkillCard 中渲染
- When 卡片渲染完成
- Then 卡片右上角显示来源标签：GitHub 图标（`lucide-react` 的 `Github`）+ 仓库显示名称
- And 来源标签使用 `muted` 色调，不抢占卡片主要信息的视觉焦点（FR-EH-20）

**AC-2: 来源标签点击跳转**
- Given 用户点击 SkillCard 上的来源标签
- When 点击事件触发
- Then 浏览器新标签页打开 `sourceUrl`（`target="_blank"` + `rel="noopener noreferrer"`）
- And 点击事件不冒泡到卡片点击事件（`e.stopPropagation()`）

**AC-3: SkillCard 锁图标**
- Given 一个外部 Skill（`readonly: true`）在 SkillCard 中渲染
- When 卡片渲染完成
- Then 卡片左下角显示锁图标（`lucide-react` 的 `Lock`）
- And 锁图标 Tooltip 提示"外部 Skill（只读）"

**AC-4: 本地 Skill 无标识**
- Given 一个本地 Skill（无 `source` 字段）在 SkillCard 中渲染
- When 卡片渲染完成
- Then 不显示来源标签和锁图标

**AC-5: SkillPreview 来源信息区域**
- Given 用户在 SkillPreview 中查看一个外部 Skill
- When 预览面板渲染完成
- Then 底部显示来源信息区域：仓库名称、仓库链接、"在 GitHub 上查看"按钮
- And "在 GitHub 上查看"按钮点击后新标签页打开 `sourceUrl` 或 `sourceRepo`

**AC-6: SkillPreview 元数据编辑禁用**
- Given 用户在 SkillPreview 中查看一个外部 Skill
- When 元数据编辑区域渲染
- Then 分类、标签、描述等编辑控件显示为禁用状态
- And Tooltip 提示"外部 Skill 为只读，由上游仓库管理"

**AC-7: SkillPreview 删除按钮禁用**
- Given 用户在 SkillPreview 中查看一个外部 Skill
- When 删除按钮渲染
- Then 删除按钮显示为禁用状态
- And Tooltip 提示"外部 Skill 不可删除"

**AC-8: 性能要求**
- Given 来源标签渲染
- When 性能测量
- Then 额外渲染开销 < 5ms（NFR-EH-02）

**AC-9: 组件测试覆盖**
- Given 本 Story 完成
- When 运行测试
- Then SkillCard 来源标签渲染有组件测试（有 source → 显示，无 source → 不显示）
- And SkillCard 锁图标渲染有组件测试（readonly=true → 显示，readonly=false → 不显示）
- And 来源标签点击跳转有组件测试（`window.open` 调用验证）
- And SkillPreview 来源信息区域有组件测试
- And SkillPreview 只读禁用有组件测试
- And 所有测试通过

## Tasks / Subtasks

- [x] Task 1: 修改 `SkillCard.tsx` — 来源标签 (AC: #1, #2, #4)
  - [x] 1.1 检测 `skill.source`，有值时渲染来源 Badge（右上角）
  - [x] 1.2 Badge 包含 `Github` 图标 + 仓库显示名称，使用 `muted` 色调
  - [x] 1.3 点击事件：`window.open(skill.sourceUrl, '_blank', 'noopener,noreferrer')` + `e.stopPropagation()`

- [x] Task 2: 修改 `SkillCard.tsx` — 锁图标 (AC: #3, #4)
  - [x] 2.1 检测 `skill.readonly`，为 `true` 时渲染 `Lock` 图标（左下角）
  - [x] 2.2 锁图标添加 Tooltip："外部 Skill（只读）"

- [x] Task 3: 修改 `SkillPreview.tsx` — 来源信息区域 (AC: #5)
  - [x] 3.1 底部新增来源信息区域（仅外部 Skill 显示）
  - [x] 3.2 显示仓库名称、仓库链接
  - [x] 3.3 "在 GitHub 上查看"按钮，点击新标签页打开

- [x] Task 4: 修改 `SkillPreview.tsx` — 只读禁用逻辑 (AC: #6, #7)
  - [x] 4.1 元数据编辑控件根据 `readonly` 字段禁用
  - [x] 4.2 删除按钮根据 `readonly` 字段禁用
  - [x] 4.3 禁用状态添加 Tooltip 说明

- [x] Task 5: 新增 i18n 翻译键 (AC: #5, #6, #7)
  - [x] 5.1 新增 `skill.viewOnGithub`、`skill.sourceInfo`
  - [x] 5.2 新增 `skill.readonlyTooltip`、`skill.readonlyEditTooltip`、`skill.readonlyDeleteTooltip`

- [x] Task 6: 编写组件测试 (AC: #9)
  - [x] 6.1 SkillCard 来源标签显示/隐藏测试
  - [x] 6.2 SkillCard 锁图标显示/隐藏测试
  - [x] 6.3 来源标签点击跳转测试
  - [x] 6.4 SkillPreview 来源信息区域测试
  - [x] 6.5 SkillPreview 只读禁用测试

- [x] Task 7: 验证编译与测试
  - [x] 7.1 运行 `npx tsc --noEmit` 确认零错误
  - [x] 7.2 运行 `npm run test` 确认所有测试通过

## Dev Notes

### 关键约束

1. **事件冒泡** — 来源标签点击必须调用 `e.stopPropagation()`，避免触发卡片点击
2. **安全跳转** — 外部链接必须使用 `target="_blank"` + `rel="noopener noreferrer"`
3. **视觉层级** — 来源标签使用 `muted` 色调，不抢占主要信息
4. **性能** — 额外渲染开销 < 5ms（NFR-EH-02）

### 使用的图标（lucide-react）

- `Github` — 来源标签图标
- `Lock` — 只读锁图标
- `ExternalLink` — "在 GitHub 上查看"按钮图标

### 文件修改清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/skills/SkillCard.tsx` | 修改 | 新增来源 Badge + 锁图标 |
| `src/components/skills/SkillPreview.tsx` | 修改 | 新增来源信息区域 + 只读禁用逻辑 |
| `src/i18n/locales/zh.json` | 修改 | 新增翻译键 |
| `src/i18n/locales/en.json` | 修改 | 新增翻译键 |
| `tests/unit/components/SkillCard.test.tsx` | 修改 | 新增来源标签/锁图标测试 |
| `tests/unit/components/SkillPreview.test.tsx` | 修改 | 新增来源信息/只读禁用测试 |

### 依赖关系

- **前置**: Story 8.1（`SkillMeta` 类型扩展）✅、Story 8.4（后端只读保护）✅
- **后续**: Story 8.6（同步脚本）将为 Skill 注入 `source`/`readonly` 字段，触发此 UI 展示

### References

- [Source: _bmad-output/planning-artifacts/epics/epics.md#Story-8.5]
- [Source: _bmad-output/planning-artifacts/architecture.md#AD-37]
- [Source: src/components/skills/SkillCard.tsx] — 现有卡片组件
- [Source: src/components/skills/SkillPreview.tsx] — 现有预览组件

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-1m-context

### Completion Notes List

- ✅ Task 1: 修改 `SkillCard.tsx` — 右上角新增来源 Badge（Github 图标 + 仓库名），点击新标签页跳转，stopPropagation
- ✅ Task 2: 修改 `SkillCard.tsx` — 左下角新增 Lock 图标，Tooltip 提示"外部 Skill（只读）"
- ✅ Task 3: 修改 `SkillPreview.tsx` — 底部新增来源信息区域（仓库名、链接、"在 GitHub 上查看"按钮）
- ✅ Task 4: 修改 `SkillPreview.tsx` — 元数据编辑控件和删除按钮根据 readonly 禁用，含 Tooltip
- ✅ Task 5: 新增 i18n 翻译键（zh/en 双语）
- ✅ Task 6: 编写组件测试 — 来源标签、锁图标、点击跳转、来源信息区域、只读禁用测试全部通过
- ✅ Task 7: `tsc --noEmit` 零错误；所有测试通过

### File List

- `src/components/skills/SkillCard.tsx`（修改）
- `src/components/skills/SkillPreview.tsx`（修改）
- `src/i18n/locales/zh.json`（修改）
- `src/i18n/locales/en.json`（修改）
- `tests/unit/components/SkillCard.test.tsx`（修改）
- `tests/unit/components/SkillPreview.test.tsx`（修改）
