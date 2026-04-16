# Story 9.4: 同步流程渐进引导

Status: done

## Story

As a 用户,
I want 同步前看到操作范围摘要、同步过程中看到实时进度、失败项可以单独重试,
So that 同步操作不再是"盲操作"，我能清楚知道将要发生什么、正在发生什么、以及如何处理失败。

## Acceptance Criteria

1. **同步前摘要面板**：点击同步按钮后，先展开轻量摘要面板（不立即执行同步），列出"将要同步的 Skill 数量 + 目标路径列表"，用户点击「确认同步」后才执行
2. **摘要面板内容**：显示 Skill 数量、目标路径列表（名称 + 路径）、同步模式（增量/替换）
3. **摘要面板交互**：「确认同步」按钮执行同步；「取消」按钮关闭摘要面板回到 idle 状态
4. **同步进度条**：同步过程中展示进度条 + 文字（如 `12/35 Skill 已同步`），进度条使用 `hsl(var(--primary))` 颜色
5. **进度实时更新**：进度条更新频率不低于每 500ms 一次（基于后端返回的 details 数组长度模拟进度）
6. **失败项重试**：同步结果列表中 failed 项旁显示「重试」按钮，点击后仅重新同步该 Skill 到对应目标
7. **重试限制**：每个失败项最多允许 3 次重试，超过后「重试」按钮禁用并显示提示
8. **Diff 预览独立按钮**：「预览变更」按钮与同步按钮平级展示（当前已实现，确认无需修改）
9. **测试覆盖**：摘要面板渲染有单元测试；进度条更新有单元测试；失败重试逻辑有单元测试；所有测试通过

## Tasks / Subtasks

- [x] Task 1: 创建 `useSyncFlow` Hook — 同步流程状态机 (AC: #1, #3, #4, #5)
  - [x] 1.1 新建 `src/hooks/useSyncFlow.ts`
  - [x] 1.2 使用 `useReducer` 实现状态机：`idle → summary → syncing → completed`
  - [x] 1.3 `SyncFlowState` 类型定义
  - [x] 1.4 `START_SUMMARY` action
  - [x] 1.5 `CONFIRM_SYNC` action
  - [x] 1.6 `PROGRESS` action
  - [x] 1.7 `COMPLETE` action
  - [x] 1.8 `CANCEL` / `RESET` action

- [x] Task 2: 创建 `SyncSummaryPanel` 组件 (AC: #1, #2, #3)
  - [x] 2.1 新建 `src/components/sync/SyncSummaryPanel.tsx`
  - [x] 2.2 Props：`{ skillCount; targets; mode; onConfirm; onCancel }`
  - [x] 2.3 展示内容：Skill 数量 Badge、目标路径列表、同步模式标签
  - [x] 2.4 底部按钮：「确认同步」+ 「取消」
  - [x] 2.5 样式：圆角边框卡片

- [x] Task 3: 创建 `SyncProgressBar` 组件 (AC: #4, #5)
  - [x] 3.1 新建 `src/components/sync/SyncProgressBar.tsx`
  - [x] 3.2 Props：`{ completed; total }`
  - [x] 3.3 进度条：宽度百分比、primary 颜色、圆角
  - [x] 3.4 文字：`{completed}/{total} Skill 已同步`
  - [x] 3.5 当前同步项（可选）
  - [x] 3.6 动画：`transition: width 300ms ease-in-out`

- [x] Task 4: 实现失败项重试功能 (AC: #6, #7)
  - [x] 4.1 修改 `SyncExecutor.tsx`：在 failed 项旁添加「重试」按钮
  - [x] 4.2 重试逻辑：调用 `pushSync([skillId], [targetId], mode)`
  - [x] 4.3 重试成功：Toast 提示成功
  - [x] 4.4 重试失败：重试计数 +1，Toast 提示失败
  - [x] 4.5 重试限制：使用 `Map<string, number>` 记录重试次数，≥3 次后禁用
  - [x] 4.6 禁用状态提示：`title` 属性显示
- [x] Task 5: 集成 useSyncFlow 到 SyncExecutor (AC: #1, #3, #4)
  - [x] 5.1 修改 `SyncExecutor.tsx`：引入 `useSyncFlow` Hook
  - [x] 5.2 同步按钮点击 → 触发 `START_SUMMARY`
  - [x] 5.3 摘要面板「确认同步」→ 触发 `CONFIRM_SYNC` → 执行 `executePush`
  - [x] 5.4 同步过程中渲染 `SyncProgressBar`
  - [x] 5.5 同步完成后渲染结果列表
  - [x] 5.6 替换同步仍走确认对话框

- [x] Task 6: 进度模拟逻辑 (AC: #5)
  - [x] 6.1 同步开始时启动定时器：每 500ms 递增 completed
  - [x] 6.2 步长 = `Math.ceil(total / 10)`，上限 `total * 0.9`
  - [x] 6.3 同步完成时立即设置 `completed = total`
  - [x] 6.4 定时器在组件卸载或同步完成时清除

- [x] Task 7: 添加 i18n 翻译 (AC: #1, #4, #6)
  - [x] 7.1 在 `zh.ts` 添加翻译 key
  - [x] 7.2 在 `en.ts` 添加对应英文翻译

- [x] Task 8: 单元测试 (AC: #9)
  - [x] 8.1 新建 `tests/unit/hooks/useSyncFlow.test.ts`：状态机转换测试
  - [x] 8.2 新建 `tests/unit/components/sync/SyncSummaryPanel.test.tsx`：摘要面板渲染、确认/取消回调
  - [x] 8.3 新建 `tests/unit/components/sync/SyncProgressBar.test.tsx`：进度条渲染、百分比计算
  - [x] 8.4 SyncExecutor 测试更新：适配新的摘要确认流程
  - [x] 8.5 全量 1037 个测试通过，零回归

## Dev Notes

### 当前代码分析

**`SyncExecutor.tsx`** 当前同步流程：
1. 用户点击同步按钮 → 直接调用 `executePush(undefined, mode)` → 等待结果 → 展示结果
2. 无摘要确认步骤、无进度指示、无失败重试

**`SyncSplitButton.tsx`** 当前已平铺展示三个按钮（增量同步、替换同步、查看差异），「预览变更」已独立（AC #8 已满足）。

**`sync-store.ts`** 的 `executePush` 是一次性调用 `apiPushSync`，返回完整 `SyncResult`。后端不支持流式进度，因此前端需要模拟进度。

### 关键实现约束

1. **使用 `useReducer`**（AD-45）：同步流程状态是临时 UI 状态，不引入新的 Zustand store
2. **不修改后端 API**：后端 `pushSync` 仍然是一次性返回结果，进度条采用前端模拟
3. **保持现有同步逻辑不变**：摘要面板是在现有流程前插入的一个确认步骤
4. **替换同步双重确认**：替换同步先展示摘要面板，确认后再弹出 `ReplaceSyncConfirmDialog`
5. **i18n 兼容**：所有新增文本使用 `t()` 函数

### useSyncFlow 状态机设计（AD-45）

```typescript
type SyncFlowPhase = 'idle' | 'summary' | 'syncing' | 'completed' | 'error';

interface SyncFlowState {
  phase: SyncFlowPhase;
  skillCount: number;
  targets: SyncTarget[];
  mode: SyncMode;
  completed: number;
  total: number;
  result: SyncResult | null;
  failedRetries: Map<string, number>; // skillId → retry count
}
```

### 进度模拟策略

由于后端 `POST /api/sync/push` 是同步返回完整结果（非 SSE/WebSocket），前端进度条采用模拟方式：

1. 同步开始：`completed = 0, total = selectedSkillIds.length`
2. 每 500ms：`completed += Math.ceil(total / 10)`，上限 `total * 0.9`（留 10% 给最终完成）
3. 后端返回：立即 `completed = total`
4. 视觉效果：进度条平滑推进，最后 10% 在结果返回时瞬间完成

### 失败重试 API 调用

重试单个 Skill 时调用：
```typescript
pushSync([skillId], [targetId], mode)
```
其中 `targetId` 从 `SyncDetail.targetPath` 反查 `targets` 数组获取。

### 现有文件清单（需修改）

| 文件 | 修改内容 |
|------|---------|
| `src/components/sync/SyncExecutor.tsx` | 集成 useSyncFlow、摘要面板、进度条、重试按钮 |
| `src/i18n/locales/zh.ts` | 新增同步流程翻译 key |
| `src/i18n/locales/en.ts` | 新增同步流程翻译 key |

### 新建文件清单

| 文件 | 说明 |
|------|------|
| `src/hooks/useSyncFlow.ts` | 同步流程状态机 Hook |
| `src/components/sync/SyncSummaryPanel.tsx` | 同步前摘要面板 |
| `src/components/sync/SyncProgressBar.tsx` | 同步进度条 |
| `tests/unit/hooks/useSyncFlow.test.ts` | 状态机单元测试 |
| `tests/unit/components/sync/SyncSummaryPanel.test.tsx` | 摘要面板单元测试 |
| `tests/unit/components/sync/SyncProgressBar.test.tsx` | 进度条单元测试 |

### 防护栏：避免常见错误

1. **不要修改 `sync-store.ts` 的 `executePush` 方法**：状态机在组件层管理，store 层保持不变
2. **不要修改后端 API**：进度条是前端模拟，不需要后端支持
3. **不要删除 `ReplaceSyncConfirmDialog`**：替换同步仍需要二次确认
4. **不要修改 `SyncSplitButton`**：按钮组件保持不变，只修改 `onSync` 回调的行为
5. **进度定时器必须清除**：在 `useEffect` cleanup 或同步完成时 `clearInterval`
6. **重试时的 targetId 查找**：`SyncDetail` 中有 `targetPath` 但没有 `targetId`，需要从 `targets` 数组中通过 `path` 匹配
7. **保持现有测试通过**：SyncExecutor 现有测试可能直接调用 `executePush`，需要适配新的摘要确认流程

### Project Structure Notes

- 同步组件在 `src/components/sync/` 目录
- 现有同步组件：`SyncExecutor`、`SyncSplitButton`、`SyncSkillSelector`、`SyncTargetManager`、`DiffReportView`、`ReplaceSyncConfirmDialog`、`SyncStatusIndicator`
- 状态管理使用 Zustand（`sync-store.ts`），本 Story 新增的状态机使用 `useReducer`（组件级状态）

### References

- [Source: architecture-interaction-optimization.md#AD-45] 同步流程渐进引导状态管理
- [Source: prd-ux-interaction-optimization.md#FR-UX-13~16] 同步流程渐进引导功能需求
- [Source: SyncExecutor.tsx] 当前同步执行组件
- [Source: SyncSplitButton.tsx] 当前同步按钮组件
- [Source: sync-store.ts] 当前同步状态管理

## Dev Agent Record

### Agent Model Used

claude-4.6-opus-1m-context

### Completion Notes List

- ✅ Task 1: 新建 `src/hooks/useSyncFlow.ts`，使用 useReducer 实现同步流程状态机
- ✅ Task 2: 新建 `SyncSummaryPanel.tsx`，展示同步前摘要信息
- ✅ Task 3: 新建 `SyncProgressBar.tsx`，展示同步进度条和文字
- ✅ Task 4: 在 SyncExecutor 中实现失败项重试功能（最多 3 次）
- ✅ Task 5: 集成 useSyncFlow 到 SyncExecutor，同步按钮点击先展示摘要面板
- ✅ Task 6: 实现进度模拟逻辑（每 500ms 递增，上限 90%）
- ✅ Task 7: 在 zh.ts 和 en.ts 中添加同步流程翻译 key
- ✅ Task 8: 28 个新增单元测试全部通过，全量 1037 个测试零回归

### File List

- `src/hooks/useSyncFlow.ts` — 新建，同步流程状态机 Hook
- `src/components/sync/SyncSummaryPanel.tsx` — 新建，同步前摘要面板
- `src/components/sync/SyncProgressBar.tsx` — 新建，同步进度条
- `src/components/sync/SyncExecutor.tsx` — 集成 useSyncFlow、摘要面板、进度条、重试按钮
- `src/i18n/locales/zh.ts` — 新增同步流程翻译 key
- `src/i18n/locales/en.ts` — 新增同步流程翻译 key
- `tests/unit/hooks/useSyncFlow.test.ts` — 新建，15 个单元测试
- `tests/unit/components/sync/SyncSummaryPanel.test.tsx` — 新建，7 个单元测试
- `tests/unit/components/sync/SyncProgressBar.test.tsx` — 新建，6 个单元测试
- `tests/unit/components/sync/SyncExecutor.test.tsx` — 更新，适配新的摘要确认流程
