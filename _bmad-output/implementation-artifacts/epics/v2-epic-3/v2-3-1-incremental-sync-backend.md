# Story V2-3.1: 增量同步后端

Status: done

## Story

作为一个使用 Skill Manager 的开发者，
我希望同步推送支持增量模式（只同步新增或修改的文件），
以便跳过未变化的 Skill 文件，提升同步效率。

## Acceptance Criteria（验收标准）

1. **Given** `POST /api/sync/push` 的 `mode` 参数为 `incremental`，**When** 执行同步，**Then** 只同步新增或修改的 Skill 文件，跳过未变化文件
2. **Given** 增量同步，**When** 比较文件变化，**Then** 采用 mtime + md5 分层比较策略（AD-46）
3. **Given** 增量同步完成，**When** 返回结果，**Then** 包含新增/更新/跳过的数量统计
4. **Given** md5 哈希计算失败，**When** 回退处理，**Then** 自动回退到全量覆盖该文件（FR-V2-29）
5. **Given** `mode` 参数未传，**When** 执行同步，**Then** 行为等同于 `full`（向后兼容，NFR-V2-12）
6. 全量测试通过，无回归

## Tasks / Subtasks

- [x] Task 1: 扩展 `shared/types.ts` — 新增 `SyncMode` 类型
- [x] Task 2: 扩展 `shared/schemas.ts` — 新增 `SyncModeSchema`，修改 `SyncPushRequestSchema` 添加 `mode` 字段
- [x] Task 3: 实现 `syncService.ts` 增量同步逻辑 — `compareSkillFile` 函数（mtime + md5 分层比较）
- [x] Task 4: 修改 `pushSync` 函数支持 `mode` 参数路由
- [x] Task 5: 编写单元测试
- [x] Task 6: 验证无回归

## Dev Agent Record

### Agent Model Used
claude-4.6-opus-1m-context

### Completion Notes List
- ✅ Task 1-2: SyncMode 类型和 Schema 扩展
- ✅ Task 3-4: 增量同步 mtime + md5 分层比较实现
- ✅ Task 5-6: 测试通过

### Change Log
- 2026-04-14: 实现增量同步后端逻辑

### File List
- shared/types.ts（修改）
- shared/schemas.ts（修改）
- server/services/syncService.ts（修改）
- server/routes/syncRoutes.ts（修改）
