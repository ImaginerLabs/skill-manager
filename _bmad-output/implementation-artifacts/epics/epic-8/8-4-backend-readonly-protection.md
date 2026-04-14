# Story 8.4: 后端只读保护

Status: done

## Story

As a 用户,
I want 外部 Skill 在后端被保护为只读，任何编辑/删除/移动操作都被拦截,
So that 外部 Skill 不会被误操作修改，下次同步时能正常覆盖更新。

## Acceptance Criteria (AC)

**AC-1: AppError.skillReadonly() 工厂方法**
- Given `server/types/errors.ts` 中尚无 `skillReadonly` 工厂方法
- When 完成本 Story
- Then `AppError` 新增 `skillReadonly(skillId: string)` 静态工厂方法
- And 返回 `new AppError(403, "SKILL_READONLY", \`Skill "${skillId}" is readonly (external skill)\`)`

**AC-2: updateSkillMeta 只读拦截**
- Given 用户调用 `PUT /api/skills/:id/meta` 更新一个 `readonly: true` 的 Skill
- When 后端 `updateSkillMeta` 执行
- Then 在 `skillNotFound` 检查之后、实际更新之前，检测 `meta.readonly`
- And 为 `true` 时抛出 `AppError.skillReadonly(id)`，返回 403 + `SKILL_READONLY`

**AC-3: deleteSkill 只读拦截**
- Given 用户调用 `DELETE /api/skills/:id` 删除一个 `readonly: true` 的 Skill
- When 后端 `deleteSkill` 执行
- Then 检测 `meta.readonly`，为 `true` 时返回 403 + `SKILL_READONLY`

**AC-4: moveSkillToCategory 只读拦截**
- Given 用户调用 `PATCH /api/skills/:id/move` 移动一个 `readonly: true` 的 Skill
- When 后端 `moveSkillToCategory` 执行
- Then 检测 `meta.readonly`，为 `true` 时返回 403 + `SKILL_READONLY`

**AC-5: 非只读 Skill 不受影响**
- Given 用户对非只读 Skill 执行编辑/删除/移动操作
- When 后端执行
- Then 正常处理，不受影响

**AC-6: 单元测试覆盖**
- Given 本 Story 完成
- When 运行测试
- Then `AppError.skillReadonly()` 工厂方法有单元测试
- And `updateSkillMeta` 只读拦截有单元测试（readonly=true → 403，readonly=false → 正常）
- And `deleteSkill` 只读拦截有单元测试
- And `moveSkillToCategory` 只读拦截有单元测试
- And 所有测试通过

## Tasks / Subtasks

- [x] Task 1: 新增 `AppError.skillReadonly()` 工厂方法 (AC: #1)
  - [x] 1.1 在 `server/types/errors.ts` 中新增静态方法 `skillReadonly(skillId: string)`
  - [x] 1.2 返回 403 状态码 + `SKILL_READONLY` 错误码

- [x] Task 2: `updateSkillMeta` 只读拦截 (AC: #2, #5)
  - [x] 2.1 在 `skillNotFound` 检查之后追加 `if (meta.readonly) throw AppError.skillReadonly(id)`
  - [x] 2.2 确保非只读 Skill 正常处理

- [x] Task 3: `deleteSkill` 只读拦截 (AC: #3, #5)
  - [x] 3.1 在 `skillNotFound` 检查之后追加只读检查

- [x] Task 4: `moveSkillToCategory` 只读拦截 (AC: #4, #5)
  - [x] 4.1 在 `skillNotFound` 检查之后追加只读检查

- [x] Task 5: 编写单元测试 (AC: #6)
  - [x] 5.1 `AppError.skillReadonly()` 工厂方法测试
  - [x] 5.2 `updateSkillMeta` readonly=true → 403 测试
  - [x] 5.3 `updateSkillMeta` readonly=false → 正常处理测试
  - [x] 5.4 `deleteSkill` 只读拦截测试
  - [x] 5.5 `moveSkillToCategory` 只读拦截测试

- [x] Task 6: 验证编译与测试
  - [x] 6.1 运行 `npx tsc --noEmit` 确认零错误
  - [x] 6.2 运行 `npm run test` 确认所有测试通过

## Dev Notes

### 关键约束

1. **检查顺序** — `readonly` 检查必须在 `skillNotFound` 检查之后（先确认资源存在，再检查权限）
2. **403 语义** — 资源存在但不允许操作，使用 403 Forbidden
3. **复用 AppError 模式** — 与 `bundleNotFound`、`skillNotFound` 等工厂方法保持一致

### 代码模式

```typescript
// server/services/skillService.ts — 三个写操作统一模式
export async function updateSkillMeta(id: string, updates: {...}): Promise<SkillMeta> {
  ensureInitialized();
  const meta = skillCache.get(id);
  if (!meta) throw AppError.skillNotFound(id);
  if (meta.readonly) throw AppError.skillReadonly(id);  // ← 新增
  // ...原有逻辑...
}
```

### 文件修改清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `server/types/errors.ts` | 修改 | 新增 `AppError.skillReadonly()` 静态方法 |
| `server/services/skillService.ts` | 修改 | 三个写操作新增 readonly 检查 |
| `tests/unit/server/services/skillService.test.ts` | 修改 | 新增只读保护测试 |

### 依赖关系

- **前置**: Story 8.1（`SKILL_READONLY` 错误码已定义）✅
- **后续**: Story 8.5（前端 UI）将依赖此保护，禁用编辑/删除按钮

### References

- [Source: _bmad-output/planning-artifacts/epics/epics.md#Story-8.4]
- [Source: _bmad-output/planning-artifacts/architecture.md#AD-36]
- [Source: server/types/errors.ts] — 现有 AppError 工厂方法模式
- [Source: server/services/skillService.ts] — 现有写操作实现

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-1m-context

### Completion Notes List

- ✅ Task 1: 修改 `server/types/errors.ts` — 新增 `AppError.skillReadonly(skillId)` 静态工厂方法，返回 403 + SKILL_READONLY
- ✅ Task 2: 修改 `updateSkillMeta` — 在 skillNotFound 检查之后追加 readonly 拦截
- ✅ Task 3: 修改 `deleteSkill` — 追加 readonly 拦截
- ✅ Task 4: 修改 `moveSkillToCategory` — 追加 readonly 拦截
- ✅ Task 5: 编写单元测试 — AppError.skillReadonly 工厂方法测试 + 三个写操作只读拦截测试全部通过
- ✅ Task 6: `tsc --noEmit` 零错误；所有测试通过

### File List

- `server/types/errors.ts`（修改）
- `server/services/skillService.ts`（修改）
- `tests/unit/server/services/skillService.test.ts`（修改）
