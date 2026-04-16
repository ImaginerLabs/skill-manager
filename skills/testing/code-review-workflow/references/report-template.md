# 代码审查报告

> 审查模式：{Commit abc1234 / 暂存区 / src/components/} | 技术栈：{React + TypeScript} | 变更：{5 文件, +120/-30}

## 结论：{🟢 可以合并 / 🟡 建议优化后合并 / 🔴 需修复后再合并}

综合评分 **{85}/100** — {一句话定性，如"逻辑正确，但存在内存泄漏风险和几处类型问题"}

---

## 必须处理

> 阻断性问题，不修复不建议合并。

1. **`src/hooks/useData.ts:23`** — `useEffect` 未清理订阅，组件卸载后仍会 setState，导致内存泄漏

   ```diff
   - useEffect(() => {
   -   subscription.subscribe(handler);
   - }, []);
   + useEffect(() => {
   +   subscription.subscribe(handler);
   +   return () => subscription.unsubscribe();
   + }, []);
   ```

2. **`src/config.ts:5`** — 硬编码 API Key `sk-xxx...`，应移至环境变量

---

## 建议优化

> 非阻断，但处理后会提升代码质量。

| #   | 位置                         | 问题                    | 建议                    |
| --- | ---------------------------- | ----------------------- | ----------------------- |
| 1   | `src/utils/format.ts:12`     | `console.log` 遗留      | 移除或替换为 logger     |
| 2   | `src/components/List.tsx:45` | `map` 使用 index 作 key | 使用唯一 ID             |
| 3   | `src/api/request.ts:30`      | catch 块吞掉了错误      | 添加 `reportError(err)` |

---

## 审查详情

### 基础审查

**文件清单**：`src/hooks/useData.ts`(修改)、`src/config.ts`(修改)、`src/components/List.tsx`(修改)、`src/utils/format.ts`(新增)、`src/api/request.ts`(修改)

**检查结果**：

- 调试代码：发现 1 处 `console.log` 遗留（format.ts:12）
- 敏感信息：发现 1 处硬编码 API Key（config.ts:5）— 🔴 阻断
- 错误处理：request.ts catch 块空实现，错误被静默吞掉
- 边界条件：List.tsx 未处理 `items` 为 undefined 的场景
- 注释质量：无问题

**技术栈专项（React）**：useData.ts useEffect 缺少清理函数；List.tsx 使用 index 作 key

### 质量检查

**Lint**：`read_lints` 检出 2 个 warning — `@typescript-eslint/no-explicit-any`(useData.ts:8)、`react-hooks/exhaustive-deps`(useData.ts:23)

**健壮性**：

- 空值保护：List.tsx 缺少 `items?.map` 可选链
- 异步安全：useData.ts 的 fetch 未使用 AbortController，存在竞态风险

**副作用**：useData.ts 订阅未清理（已在阻断项中列出）；无定时器/事件监听问题

**性能**：无明显性能问题，List 组件数据量小无需虚拟化

### 体积分析

**变更类型**：新功能 — 添加数据格式化工具

**新增依赖**：无新增第三方依赖，仅使用了项目已有工具函数

**评估**：本次变更对 Bundle Size 无影响，无需优化

### 测试覆盖

**修改意图**：新增 format 工具函数 + 优化 useData hook 订阅逻辑

**建议测试用例**：

| ID    | 类型   | 用例                                             | 优先级 |
| ----- | ------ | ------------------------------------------------ | ------ |
| TC-01 | 主流程 | `format()` 接收合法输入返回格式化字符串          | P0     |
| TC-02 | 主流程 | `useData` mount 时触发订阅，收到数据后更新 state | P0     |
| TC-03 | 边缘   | `format()` 传入 null/undefined 返回兜底值        | P1     |
| TC-04 | 边缘   | `useData` 卸载后订阅回调不再 setState            | P1     |
| TC-05 | 边缘   | `List` 传入空数组渲染空状态                      | P2     |

**Mock 策略**：`useData` 的 subscription 用 `jest.mock` 模拟；format 为纯函数无需 mock

---

## 评分

| 维度     | 得分       | 要点                                                         |
| -------- | ---------- | ------------------------------------------------------------ |
| 基础审查 | 70/100     | 敏感信息泄露 -10，console 遗留 -3，边界缺失 -7，错误处理 -10 |
| 代码质量 | 75/100     | Hook 清理缺失 -15，any 类型 -5，竞态风险 -5                  |
| 体积分析 | 100/100    | 无新增依赖                                                   |
| 测试覆盖 | 90/100     | 当前无测试，建议用例覆盖主流程和关键边缘                     |
| **综合** | **78/100** | 🟡 建议优化后合并                                            |

---

_审查时间: {2026-04-16 15:30} | 技能: `code-review-workflow`_
