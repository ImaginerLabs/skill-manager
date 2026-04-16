# 代码审查检查清单

> 本文件供模型在审查过程中参考，按需查阅相关章节，无需全部加载。

---

## 1. 基础检查项

### 调试代码

- `console.log`/`console.warn`/`console.error`（非错误处理用途的遗留）
- `debugger` 语句
- `print`、未处理的 `TODO`/`FIXME`
- 测试专用 mock data 未清理

### 敏感信息

- 硬编码的密码、Token、密钥
- 内网地址、IP 地址
- 手机号、身份证号、银行卡号
- 云服务 Access Key / Secret Key

### 注释质量

- 复杂逻辑缺少说明性注释
- 无意义注释未清理
- 注释与代码逻辑不一致

### 错误处理

- 异步/IO 操作缺少 try-catch / .catch()
- 接口调用未处理失败场景
- 错误提示对用户不友好

### 边界条件

- 空值、空数组缺少保护
- 极端输入未校验
- 除零、越界等未防护

### 代码规范

- 命名不规范（变量、函数、类）
- 缩进格式、换行风格不一致
- 文件组织不合理

---

## 2. 技术栈专项检查

### React / TypeScript

| 检查项         | 要点                                                       |
| -------------- | ---------------------------------------------------------- |
| Hook 依赖      | `useEffect`/`useCallback`/`useMemo` 依赖数组是否完整       |
| 闭包陷阱       | 事件回调中引用的 state 是否为最新值                        |
| 传递稳定性     | 传递给子组件的对象/函数是否用 `useMemo`/`useCallback` 包裹 |
| useEffect 清理 | 是否注册清理函数（订阅、定时器、事件监听等）               |
| 列表 key       | `map` 渲染时是否使用稳定唯一 ID                            |
| Props 定义     | 新增 Props 是否有 TypeScript 类型定义                      |

### Vue

| 检查项       | 要点                                              |
| ------------ | ------------------------------------------------- |
| 响应式陷阱   | 避免直接修改 props，使用 emit 触发更新            |
| watch 使用   | `immediate`/`deep` 是否不当使用                   |
| v-if/v-for   | 是否混用在同一元素                                |
| 生命周期清理 | `onMounted` 中的副作用是否在 `onUnmounted` 中清理 |

### 其他技术栈

- **Go**: 错误处理、goroutine 泄漏
- **Python**: 异常处理、类型注解
- **Java/Kotlin**: 空指针、资源释放

---

## 3. 代码质量深度检查

### 健壮性与防御性编程

- **空值保护**：使用可选链 `?.` 和空值合并 `??`
- **边界处理**：数组空判断、除零错误、负数索引
- **异步安全**：`try-catch` 包裹 await；处理 loading/error 状态
- **类型守卫**：使用类型谓词进行运行时类型检查
- **竞态处理**：使用 AbortController 或标志位
- **防重复**：loading 期间禁用提交按钮

### 副作用与上下文

| 检查类型   | 内容                                   |
| ---------- | -------------------------------------- |
| 上游依赖   | 修改公用组件时，检查对其他调用方的影响 |
| 下游影响   | 分析对被调用模块的影响                 |
| 副作用清理 | useEffect 清理函数、定时器、事件监听   |
| 状态污染   | 避免直接修改 props 或全局状态          |
| 闭包陷阱   | 事件回调中引用的 state 是否为最新值    |

### 副作用清理对照表

| 副作用类型                   | 清理方式                         |
| ---------------------------- | -------------------------------- |
| `setTimeout` / `setInterval` | `clearTimeout` / `clearInterval` |
| `addEventListener`           | `removeEventListener`            |
| `IntersectionObserver`       | `observer.disconnect()`          |
| 自定义订阅                   | `subscription.unsubscribe()`     |
| WebSocket                    | `socket.close()`                 |

### 性能优化

- **渲染控制**：合理使用 `React.memo`、`useMemo`、`useCallback`
- **频率控制**：搜索、滚动使用 `debounce` 或 `throttle`
- **列表渲染**：确保列表项拥有稳定且唯一的 `key`
- **懒加载**：大型组件使用 `React.lazy` 或动态 `import()`

---

## 4. 体积优化检查

### 依赖引入

- 新增 import 是否引入体积较大的第三方库？
- 是否使用了按需引入（Tree-shaking 友好）？
- 是否可以用项目已有的工具函数/组件替代？
- 是否引入了功能重复的库？

### 代码冗余

- 是否存在重复逻辑，可抽取为公共函数？
- 是否有已废弃但未删除的代码（dead code）？
- 是否有调试代码未清理？

### 动态加载机会

- 新增页面/模块是否适合路由懒加载？
- 低频使用的重型组件是否可以延迟加载？
- 大型第三方库是否可以动态导入？

### 平台专项

- **Taro 小程序**：分包策略是否合理？主包是否接近 2MB 限制？
- **Next.js**：是否使用了 `dynamic import`？图片是否优化？

### 分级标准

| 等级  | 标准                             | 典型场景                                 |
| ----- | -------------------------------- | ---------------------------------------- |
| 🔴 高 | 体积影响显著（预估 > 10KB gzip） | 全量引入 lodash、moment.js；内联大图     |
| 🟡 中 | 体积影响中等（预估 2~10KB gzip） | 未按需引入 UI 组件库；可懒加载未分包     |
| 🟢 低 | 体积影响较小（预估 < 2KB gzip）  | 小函数可用原生替代；可提取的重复工具函数 |

---

## 5. 测试覆盖检查

### 主流程链路（Happy Path）

- 输入合法数据时，函数/组件的预期输出或行为
- 关键业务流程的端到端验证
- 状态变更的正确性

### 边缘情况

| 边缘类型     | 典型场景                                         |
| ------------ | ------------------------------------------------ |
| 空值/缺省    | `null`、`undefined`、空字符串、空数组、空对象    |
| 边界值       | 最大值、最小值、零值、负数、超长字符串           |
| 异常输入     | 类型错误、格式非法、超出范围的枚举值             |
| 并发/竞态    | 重复调用、快速连续触发、异步操作未完成时再次触发 |
| 网络/IO 异常 | 接口超时、返回错误码、网络中断、部分数据缺失     |
| 权限/状态    | 未登录、无权限、资源不存在、状态机非法跳转       |

### Mock 策略

| 依赖类型   | Mock 方案                |
| ---------- | ------------------------ |
| HTTP 接口  | `jest.mock` / `msw`      |
| 浏览器 API | `window.xxx = jest.fn()` |
| 第三方库   | 部分模拟返回值           |
| 全局状态   | 注入测试状态             |

### 技术栈与测试框架对应

| 文件特征                  | 推荐测试框架                 |
| ------------------------- | ---------------------------- |
| `*.tsx` / `*.jsx` + React | Jest + React Testing Library |
| `*.ts` / `*.js`（纯逻辑） | Jest / Vitest                |
| `*.vue`                   | Vitest + Vue Test Utils      |
| `*.go`                    | `testing` + testify          |
| `*.py`                    | pytest                       |

---

## 常见优化参考

### 依赖引入优化

```typescript
// ❌ 全量引入
import _ from "lodash";
import moment from "moment";

// ✅ 按需引入
import debounce from "lodash/debounce";
import dayjs from "dayjs"; // 替代 moment
```

### 竞态处理优化

```typescript
useEffect(() => {
  const controller = new AbortController();
  const fetchData = async () => {
    try {
      const res = await api.fetch({ signal: controller.signal });
      setData(res);
    } catch (err) {
      if (err.name !== "AbortError") reportError(err);
    }
  };
  fetchData();
  return () => controller.abort();
}, []);
```
