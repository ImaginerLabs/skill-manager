# Story V2-3.3: Diff 端点与差异报告

Status: done

## Story

作为一个使用 Skill Manager 的开发者，
我希望在同步前查看源 Skill 与目标目录的差异报告（新增/修改/删除/相同），
以便在执行同步前了解将要发生的变更。

## Acceptance Criteria（验收标准）

1. **Given** `POST /api/sync/diff` 请求，**When** 传入 skillIds 和 targetId，**Then** 返回 DiffReport（包含 added/modified/deleted/unchanged 四个分组）
2. **Given** Diff 对比，**When** 比较文件变化，**Then** 使用 md5 哈希精确比较代表性文件（SKILL.md 优先）
3. **Given** 目标目录中存在源中没有的 Skill 文件夹，**When** 反向遍历，**Then** 标记为 deleted 候选
4. **Given** 目标目录不存在，**When** 执行 Diff，**Then** 所有 Skill 标记为 added
5. **Given** DiffReport 数据，**When** 前端展示，**Then** 按状态分组显示（新增绿色、修改黄色、删除红色、相同灰色可折叠）
6. 全量测试通过，无回归

## Tasks / Subtasks

- [x] Task 1: 扩展 `shared/types.ts` — 新增 `DiffItem`、`DiffReport` 接口
- [x] Task 2: 扩展 `shared/schemas.ts` — 新增 `DiffRequestSchema`、`DiffReportSchema`
- [x] Task 3: 实现 `syncService.ts` 的 `diffSync` 函数 — 正向遍历 + 反向遍历
- [x] Task 4: 添加 `syncRoutes.ts` 的 `POST /api/sync/diff` 路由
- [x] Task 5: 创建 `DiffReportView.tsx` 前端差异报告展示组件
- [x] Task 6: 在 `SyncExecutor.tsx` 中集成 Diff 功能
- [x] Task 7: 添加 i18n 翻译键（diffReport/diffSummary/diffAdded/diffModified/diffDeleted/diffUnchanged 等）
- [x] Task 8: 编写单元测试
- [x] Task 9: 验证无回归

## Dev Notes

### diffSync 函数设计

```
正向遍历：源 Skill → 目标目录
  - 目标不存在 → added
  - 目标存在但代表性文件哈希不同 → modified
  - 目标存在且哈希相同 → unchanged

反向遍历：目标目录 → 源 Skill
  - 目标中有但源中没有的 Skill 文件夹 → deleted
```

### 代表性文件选择策略

优先 `SKILL.md`，其次第一个 `.md` 文件，兜底目录本身。

### DiffReportView 组件特性

- 按状态分组展示（新增/修改/删除/相同）
- 相同项默认折叠，点击展开
- 底部提供「增量同步」和「替换同步」操作按钮
- 摘要统计使用彩色 Badge

## Dev Agent Record

### Agent Model Used
claude-4.6-opus-1m-context

### Completion Notes List
- ✅ Task 1-2: DiffItem/DiffReport 类型和 Schema
- ✅ Task 3-4: diffSync 函数 + API 路由
- ✅ Task 5-6: DiffReportView 组件 + SyncExecutor 集成
- ✅ Task 7: i18n 翻译键
- ✅ Task 8-9: 测试通过

### Change Log
- 2026-04-14: 实现 Diff 端点和差异报告前端展示

### File List
- shared/types.ts（修改）
- shared/schemas.ts（修改）
- server/services/syncService.ts（修改）
- server/routes/syncRoutes.ts（修改）
- src/components/sync/DiffReportView.tsx（新建）
- src/components/sync/SyncExecutor.tsx（修改）
- src/i18n/locales/zh.ts（修改）
- src/i18n/locales/en.ts（修改）
