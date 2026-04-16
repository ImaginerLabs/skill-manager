# 测试代码示例参考

> 按需加载此文件，在 Step 5 Mock 策略和断言要点分析时参考。

---

## 一、纯函数测试示例

```typescript
// 被测函数：计算折扣价格
function calcDiscountPrice(price: number, discount: number): number {
  return Math.floor(price * discount);
}

describe("calcDiscountPrice", () => {
  // 主流程
  it("正常折扣计算", () => {
    expect(calcDiscountPrice(100, 0.8)).toBe(80);
  });

  // 边缘情况
  it("价格为 0 时返回 0", () => {
    expect(calcDiscountPrice(0, 0.8)).toBe(0);
  });

  it("折扣为 1 时返回原价", () => {
    expect(calcDiscountPrice(100, 1)).toBe(100);
  });

  it("结果向下取整（避免精度问题）", () => {
    expect(calcDiscountPrice(99, 0.9)).toBe(89); // 89.1 → 89
  });

  it("折扣为 0 时返回 0", () => {
    expect(calcDiscountPrice(100, 0)).toBe(0);
  });
});
```

---

## 二、异步函数 + Mock 测试示例

```typescript
// 被测函数：获取用户信息
async function getUserInfo(userId: string) {
  if (!userId) throw new Error("userId 不能为空");
  return await api.fetchUser(userId);
}

jest.mock("@/api", () => ({
  fetchUser: jest.fn(),
}));

describe("getUserInfo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 主流程
  it("正常获取用户信息", async () => {
    (api.fetchUser as jest.Mock).mockResolvedValue({ id: "1", name: "Alice" });
    const result = await getUserInfo("1");
    expect(result).toEqual({ id: "1", name: "Alice" });
    expect(api.fetchUser).toHaveBeenCalledWith("1");
    expect(api.fetchUser).toHaveBeenCalledTimes(1);
  });

  // 边缘情况
  it("userId 为空字符串时抛出错误", async () => {
    await expect(getUserInfo("")).rejects.toThrow("userId 不能为空");
    expect(api.fetchUser).not.toHaveBeenCalled();
  });

  it("userId 为 undefined 时抛出错误", async () => {
    await expect(getUserInfo(undefined as any)).rejects.toThrow();
  });

  it("接口异常时向上抛出错误", async () => {
    (api.fetchUser as jest.Mock).mockRejectedValue(new Error("网络错误"));
    await expect(getUserInfo("1")).rejects.toThrow("网络错误");
  });

  it("接口返回 null 时的处理", async () => {
    (api.fetchUser as jest.Mock).mockResolvedValue(null);
    const result = await getUserInfo("1");
    expect(result).toBeNull();
  });
});
```

---

## 三、React 组件测试示例

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// 被测组件：提交按钮（loading 状态）
describe("SubmitButton", () => {
  // 主流程
  it("点击后触发 onSubmit 回调", () => {
    const onSubmit = jest.fn();
    render(<SubmitButton onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("正确渲染按钮文本", () => {
    render(<SubmitButton onSubmit={jest.fn()} label="确认提交" />);
    expect(screen.getByRole("button")).toHaveTextContent("确认提交");
  });

  // 边缘情况
  it("loading 状态下按钮禁用，不触发回调", () => {
    const onSubmit = jest.fn();
    render(<SubmitButton onSubmit={onSubmit} loading />);
    fireEvent.click(screen.getByRole("button"));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("disabled 状态下不触发回调", () => {
    const onSubmit = jest.fn();
    render(<SubmitButton onSubmit={onSubmit} disabled />);
    fireEvent.click(screen.getByRole("button"));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("onSubmit 未传入时不报错", () => {
    expect(() => render(<SubmitButton />)).not.toThrow();
  });
});
```

---

## 四、Hook 测试示例

```typescript
import { renderHook, act } from "@testing-library/react";

// 被测 Hook：useCounter
describe("useCounter", () => {
  it("初始值为 0", () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it("increment 后 count 加 1", () => {
    const { result } = renderHook(() => useCounter());
    act(() => {
      result.current.increment();
    });
    expect(result.current.count).toBe(1);
  });

  it("reset 后恢复初始值", () => {
    const { result } = renderHook(() => useCounter(10));
    act(() => {
      result.current.increment();
      result.current.reset();
    });
    expect(result.current.count).toBe(10);
  });
});
```

---

## 五、常用 Mock 策略速查

### Mock API 调用

```typescript
jest.mock("@/api/user", () => ({
  fetchUser: jest.fn().mockResolvedValue({ id: 1, name: "Alice" }),
  updateUser: jest.fn().mockResolvedValue({ success: true }),
}));
```

### Mock 定时器

```typescript
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it("防抖函数延迟执行", () => {
  const fn = jest.fn();
  const debounced = debounce(fn, 300);
  debounced();
  debounced();
  expect(fn).not.toHaveBeenCalled();
  jest.advanceTimersByTime(300);
  expect(fn).toHaveBeenCalledTimes(1);
});
```

### Mock localStorage

```typescript
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });
```

### Mock 环境变量

```typescript
const originalEnv = process.env;
beforeEach(() => {
  process.env = {
    ...originalEnv,
    NODE_ENV: "test",
    API_URL: "http://test.api",
  };
});
afterEach(() => {
  process.env = originalEnv;
});
```

### Spy 监听函数调用

```typescript
it("调用了正确的工具函数", () => {
  const spy = jest.spyOn(utils, "formatPrice");
  renderComponent();
  expect(spy).toHaveBeenCalledWith(100, "CNY");
  spy.mockRestore();
});
```
