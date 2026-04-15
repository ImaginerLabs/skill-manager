# 接口设计规范参考

## 1. 组件 Props 设计

```typescript
// ✅ 良好的 Props 设计原则

// 1. 必填与可选明确区分
interface UserCardProps {
  userId: string;           // 必填：核心数据
  onSuccess?: () => void;   // 可选：回调
  className?: string;       // 可选：样式扩展
}

// 2. 提供合理默认值
const UserCard = ({
  userId,
  onSuccess,
  className = '',
}: UserCardProps) => { ... };

// 3. 透传原生属性（适用于封装原生元素的组件）
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}
```

---

## 2. 自定义 Hook 设计

```typescript
// ✅ Hook 返回值设计：对象解构，便于按需取用
function useUserData(userId: string) {
  // ...
  return {
    user, // 数据
    loading, // 加载状态
    error, // 错误状态
    refetch, // 手动刷新方法
  };
}

// 调用方按需解构，不强制使用全部返回值
const { user, loading } = useUserData(userId);
```

---

## 3. 兼容性检查示例

抽取后确保原调用方接口不破坏。

```typescript
// 抽取前：原调用方
<UserProfile userId={id} onBack={() => navigate(-1)} />

// 抽取后：确保接口兼容，不改变调用方代码
// ✅ 新组件保持相同的 Props 签名
interface UserProfileProps {
  userId: string;
  onBack?: () => void;  // 保持可选，不破坏现有调用
}
```
