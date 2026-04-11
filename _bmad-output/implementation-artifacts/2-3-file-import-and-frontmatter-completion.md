# Story 2.3: 文件导入与 Frontmatter 补充

Status: done

## Story

As a 用户,
I want 导入的 Skill 文件自动补充缺失的元数据,
So that 所有导入的 Skill 都有完整的 Frontmatter 信息。

## Acceptance Criteria

1. **AC-1: 后端导入 API**
   - Given 用户确认导入选择
   - When 后端接收 `POST /api/import/execute` 请求
   - Then 将选中的 Skill 文件复制到对应分类目录（FR24）
   - And 自动补充缺失的 Frontmatter 字段：`category` 为用户选择的分类，`name` 缺失时使用文件名（去除扩展名），`description` 缺失时留空（FR24）
   - And 文件写入使用 `safeWrite`（async-mutex 并发控制）（AR12）
   - And 导入完成后自动刷新 Skill 列表缓存

2. **AC-2: 导入结果与错误处理**
   - Given 导入操作执行
   - When 部分文件导入失败
   - Then 返回导入结果（成功数/失败数/详细列表）
   - And 文件复制失败时提供清晰的错误提示，包含失败文件名和原因（FR35）

3. **AC-3: 前端导入执行与 Toast**
   - Given 用户在导入向导中点击"导入选中"
   - When 导入执行
   - Then 显示导入进度/loading 状态（UX-DR8）
   - And 导入完成后 Toast 通知显示结果（成功数/失败数）

4. **AC-4: TypeScript 编译与测试通过**
   - Given 所有文件已创建/修改
   - When 运行 `tsc --noEmit` 和 `vitest run`
   - Then 编译通过，无错误，所有测试通过

## Tasks / Subtasks

- [x] Task 1: 添加导入相关共享类型 (AC: #1, #2)
  - [x] 1.1 在 `shared/types.ts` 添加 `ImportRequest`、`ImportResultItem`、`ImportResult` 类型
  - [x] 1.2 在 `shared/schemas.ts` 添加对应 Zod Schema

- [x] Task 2: 创建 `server/services/importService.ts` (AC: #1, #2)
  - [x] 2.1 实现 `importFiles(items, category, skillsRoot): Promise<ImportResult>`
  - [x] 2.2 编写单元测试

- [x] Task 3: 添加导入路由到 `importRoutes.ts` (AC: #1)
  - [x] 3.1 实现 `POST /api/import/execute`

- [x] Task 4: 前端导入执行 (AC: #3)
  - [x] 4.1 在 `api.ts` 添加 `importFiles()` API
  - [x] 4.2 在 ImportPage 中连接导入按钮到 API
  - [x] 4.3 导入完成后 Toast 通知

- [x] Task 5: 验证 (AC: #4)

### Review Findings

- [x] [Review][Patch] P1: 前端 importFiles() 未传递 scanRoot [src/lib/api.ts] — 已修复
- [x] [Review][Patch] P3: cleanupFiles 路径校验失败直接 throw 中断循环 [server/services/importService.ts] — 已修复

## Dev Notes

### 已有代码上下文

- `server/utils/fileUtils.ts` — `safeWrite()` 并发安全写入
- `server/utils/frontmatterParser.ts` — `parseFrontmatter()` 解析 Frontmatter
- `server/services/scanService.ts` — `scanDirectory()` 扫描服务
- `server/services/skillService.ts` — `refreshSkillCache()` 刷新缓存
- `src/pages/ImportPage.tsx` — 已有勾选、分类选择 UI

### 导入逻辑

1. 读取源文件内容
2. 解析 Frontmatter
3. 补充缺失字段（category, name, description）
4. 重新序列化为 Frontmatter + content
5. 使用 `safeWrite` 写入到 `skills/{category}/{filename}`
6. 刷新 Skill 缓存

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-2-Story-2.3]

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus-1m-context (Amelia)

### Debug Log References

- tsc --noEmit: 零错误
- vitest run: 233 tests passed (18 test files), 0 failures
- 新增 6 个测试用例（importService）

### Completion Notes List

- Task 1: 添加 ImportRequest/ImportResult 类型和 Zod Schema
- Task 2: 创建 importService，实现文件复制 + Frontmatter 补充 + safeWrite
- Task 3: POST /api/import/execute 端点
- Task 4: 前端导入执行 + Toast 通知
- Task 5: 全量测试通过，无回归

### File List

| 文件                                             | 操作 |
| ------------------------------------------------ | ---- |
| shared/types.ts                                  | 修改 |
| shared/schemas.ts                                | 修改 |
| server/services/importService.ts                 | 新建 |
| server/routes/importRoutes.ts                    | 修改 |
| src/lib/api.ts                                   | 修改 |
| src/pages/ImportPage.tsx                         | 修改 |
| tests/unit/server/services/importService.test.ts | 新建 |
