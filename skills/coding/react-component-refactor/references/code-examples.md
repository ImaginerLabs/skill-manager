# 代码生成规范示例

## 1. TypeScript 类型规范

```typescript
// ✅ Props 接口必须明确定义，必填/可选清晰区分
interface OrderHeaderProps {
  orderId: string; // 必填：订单 ID
  status: OrderStatus; // 必填：订单状态
  createdAt: string; // 必填：创建时间
  onCancel?: () => void; // 可选：取消回调
  className?: string; // 可选：自定义样式类
}

// ✅ 枚举/联合类型优先使用 TypeScript 原生类型
type OrderStatus = "pending" | "paid" | "shipped" | "completed" | "cancelled";
```

---

## 2. 注释规范

注释要求**简洁、精准**，只注释"为什么"而非"是什么"：

```typescript
// ✅ 好的注释：说明意图或非显而易见的逻辑
// 取消请求以防止组件卸载后的状态更新
const controller = new AbortController();

// 使用 useCallback 稳定引用，避免子组件不必要的重渲染
const handleSubmit = useCallback(() => { ... }, [orderId]);

// ❌ 无意义的注释：重复代码本身的含义
// 设置 loading 为 true
setLoading(true);
```

**注释位置规则：**

- 组件顶部：一行简短的组件职责说明
- 复杂逻辑前：说明该逻辑的意图
- 非显而易见的 Hook 依赖：说明为何包含该依赖
- 类型定义：关键字段加行内注释

---

## 3. 组件文件结构规范

每个组件文件按以下顺序组织：

```typescript
// 1. 外部依赖 import
import React, { useState, useCallback } from 'react';

// 2. 内部依赖 import（类型、工具函数、子组件）
import type { OrderItem } from '@/types/order';
import { formatPrice } from '@/utils/format';

// 3. 类型定义
interface OrderItemListProps {
  items: OrderItem[];
  onItemClick?: (id: string) => void;
}

// 4. 组件实现
// 订单商品列表：展示订单中的所有商品条目
const OrderItemList: React.FC<OrderItemListProps> = ({ items, onItemClick }) => {
  // state 声明
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 事件处理（useCallback 稳定引用）
  const handleClick = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id);
    onItemClick?.(id);
  }, [onItemClick]);

  // 渲染
  return (
    <ul className="order-item-list">
      {items.map(item => (
        <li key={item.id} onClick={() => handleClick(item.id)}>
          {/* 商品名称与价格 */}
          <span>{item.name}</span>
          <span>{formatPrice(item.price)}</span>
        </li>
      ))}
    </ul>
  );
};

// 5. 导出
export default OrderItemList;
export type { OrderItemListProps };
```

---

## 4. 自定义 Hook 文件结构规范

```typescript
import { useState, useEffect, useCallback } from "react";
import type { OrderDetail } from "@/types/order";
import { fetchOrderDetail } from "@/api/order";

interface UseOrderDetailReturn {
  data: OrderDetail | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void; // 手动刷新
}

// 封装订单详情的数据请求逻辑
function useOrderDetail(orderId: string): UseOrderDetailReturn {
  const [data, setData] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!orderId) return;

    // 使用 AbortController 防止组件卸载后的状态更新
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const result = await fetchOrderDetail(orderId, {
        signal: controller.signal,
      });
      setData(result);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(err as Error);
      }
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}

export default useOrderDetail;
```
