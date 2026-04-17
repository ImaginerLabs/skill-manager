---
title: "活跃度热力图 Hover 浮窗 — 展示当日修改文件列表"
type: "feature"
created: "2026-04-13"
status: "done"
context:
  - "{project-root}/_bmad-output/project-context.md"
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 当前活跃度热力图的豆点 hover 仅显示原生 `title` 属性（`YYYY-MM-DD · N 次修改`），无法看到具体修改了哪些 Skill 文件。用户希望像 GitHub Contribution Graph 一样，hover 时弹出浮窗展示当日修改详情。

**Approach:** 扩展后端 `GET /api/stats/activity` API，在每个 `ActivityDay` 中增加 `files` 字段（当日修改的文件名列表）；前端将原生 `title` 替换为 Radix Tooltip 组件，hover 时展示日期、修改次数和具体文件列表。

## Boundaries & Constraints

**Always:**

- 复用项目已有的 `@radix-ui/react-tooltip` 组件（`src/components/ui/tooltip.tsx`）
- 后端 `files` 字段只返回文件名（不含路径），防止泄露服务器目录结构
- 文件列表按字母排序，最多展示 10 个，超出显示 `+N more`
- Tooltip 浮窗样式遵循项目暗色主题，使用 CSS 变量
- `ActivityDay` 类型变更需同步更新 `server/routes/statsRoutes.ts` 和 `src/lib/api.ts` 两处定义

**Ask First:**

- 如果文件列表为空（count=0），是否仍显示 Tooltip 还是保持无交互

**Never:**

- 不引入新的 UI 库或 Tooltip 实现
- 不在 Tooltip 中展示文件完整路径
- 不为 Tooltip 添加点击交互（仅 hover 展示）

## I/O & Edge-Case Matrix

| Scenario         | Input / State                         | Expected Output / Behavior                | Error Handling |
| ---------------- | ------------------------------------- | ----------------------------------------- | -------------- |
| 正常日期 hover   | count=3, files=["a.md","b.md","c.md"] | Tooltip 显示日期 + 3 次修改 + 3 个文件名  | N/A            |
| 零修改日期 hover | count=0, files=[]                     | Tooltip 显示日期 + 0 次修改（无文件列表） | N/A            |
| 超过 10 个文件   | count=15, files=[15个文件名]          | Tooltip 显示前 10 个 + `+5 more`          | N/A            |
| API 加载失败     | fetchActivityStats 失败               | 降级为空数据，无 Tooltip                  | 静默处理       |

</frozen-after-approval>

## Code Map

- `server/routes/statsRoutes.ts` -- 后端 API，需扩展 ActivityDay 增加 files 字段
- `src/lib/api.ts` -- 前端 API 客户端，需同步更新 ActivityDay 类型
- `src/components/stats/ActivityHeatmap.tsx` -- 热力图组件，需替换 title 为 Tooltip
- `src/components/ui/tooltip.tsx` -- 已有 Radix Tooltip 组件，直接复用

## Tasks & Acceptance

**Execution:**

- [ ] `server/routes/statsRoutes.ts` -- 扩展 `ActivityDay` 接口增加 `files: string[]` 字段；修改聚合逻辑，在 `countMap` 之外维护 `filesMap: Map<string, string[]>` 记录每日修改的文件名（`path.basename` 去 `.md` 后缀）；生成结果时填充 `files` 字段
- [ ] `src/lib/api.ts` -- 同步更新 `ActivityDay` 接口，增加 `files: string[]` 字段
- [ ] `src/components/stats/ActivityHeatmap.tsx` -- 引入 `Tooltip`/`TooltipTrigger`/`TooltipContent`/`TooltipProvider`；将每个豆点的 `<div title=...>` 替换为 `<Tooltip>` 包裹；Tooltip 内容包含：日期（粗体）、修改次数、文件列表（最多 10 个，超出显示 `+N more`）；count=0 时 Tooltip 仅显示日期和「无修改」

**Tests (MANDATORY):**

- [ ] `tests/unit/server/routes/statsRoutes.test.ts` -- 扩展现有测试，验证返回数据包含 `files` 字段且为文件名数组（不含路径）
- [ ] `tests/unit/components/stats/ActivityHeatmap.test.tsx` -- 扩展现有测试，验证 Tooltip 渲染、文件列表展示、超过 10 个文件时的截断逻辑
- [ ] `tests/e2e/app.spec.ts` -- 添加 E2E 测试：hover 热力图豆点后验证 Tooltip 浮窗出现

**Acceptance Criteria:**

- Given 热力图已加载，when 鼠标 hover 到有修改的豆点上，then 显示 Tooltip 浮窗，包含日期、修改次数和具体文件名列表
- Given 热力图已加载，when 鼠标 hover 到无修改的豆点上，then 显示 Tooltip 浮窗，仅包含日期和「无修改」文字
- Given 某日修改文件超过 10 个，when hover 该豆点，then 文件列表只显示前 10 个，末尾显示 `+N more`
- Given API 返回的 files 字段，then 文件名不包含服务器路径信息，仅为文件名（不含 .md 后缀）

## Design Notes

### Tooltip 浮窗视觉设计

```
┌─────────────────────────┐
│  2026-04-13              │  ← 日期，粗体，text-xs
│  3 次修改                │  ← 修改次数，text-xs，muted-foreground
│  ─────────────────────── │  ← 分隔线
│  • skill-name-1          │  ← 文件名列表，text-xs
│  • skill-name-2          │
│  • skill-name-3          │
└─────────────────────────┘
```

- 浮窗背景：`hsl(var(--popover))`，边框：`hsl(var(--border))`
- 文件名前缀用 `•` 圆点，颜色 `hsl(var(--muted-foreground))`
- 最大宽度 `200px`，文件名过长时 `truncate`

### 后端数据结构变更

```typescript
// Before
interface ActivityDay {
  date: string; // YYYY-MM-DD
  count: number;
}

// After
interface ActivityDay {
  date: string; // YYYY-MM-DD
  count: number;
  files: string[]; // 当日修改的文件名（不含路径和 .md 后缀）
}
```

### TooltipProvider 放置位置

`TooltipProvider` 包裹整个热力图 grid 容器（而非每个豆点单独包裹），减少 Provider 嵌套层级。设置 `delayDuration={200}` 实现快速响应。

## Verification

**Commands:**

- `npm run typecheck` -- expected: 零错误
- `npm run test:run -- tests/unit/server/routes/statsRoutes.test.ts` -- expected: 全部通过
- `npm run test:run -- tests/unit/components/stats/ActivityHeatmap.test.tsx` -- expected: 全部通过
- `npm run test:e2e -- tests/e2e/app.spec.ts` -- expected: 全部通过
