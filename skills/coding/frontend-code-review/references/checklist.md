# Frontend Code Review — Detailed Checklist

> This file contains the full checklist with code examples. The SKILL.md provides the overview; this is the reference for implementation details.

---

## 1. Static Analysis (Lint & Fix)

### Common Lint Error Priorities

| Priority  | Rule                                 | Why it matters                        |
| --------- | ------------------------------------ | ------------------------------------- |
| 🔴 High   | `no-undef`                           | Undefined variable — guaranteed error |
| 🔴 High   | `no-unused-vars`                     | Unused variable — dead code           |
| 🔴 High   | `exhaustive-deps`                    | Missing Hook dependency — logic error |
| 🟡 Medium | `@typescript-eslint/no-explicit-any` | Using `any` type                      |
| 🟡 Medium | `react-hooks/rules-of-hooks`         | Hook usage conventions                |
| 🟢 Low    | `prefer-const`                       | Code style issue                      |

---

## 2. Robustness & Defensive Programming

### 2.1 TypeScript Interfaces

- [ ] Props interface is complete, required/optional clearly distinguished.
- [ ] Optional parameters have default values or null guards.
- [ ] Complex types use generics for type safety.

### 2.2 Logic Robustness

- [ ] **Null safety**: Use optional chaining `?.` and nullish coalescing `??` for deep object access.
- [ ] **Boundary handling**: Check for empty arrays, division by zero, negative indices.
- [ ] **Async safety**: Wrap `await` calls in `try-catch`; handle loading/error states.
- [ ] **Type guards**: Use type predicates for runtime type checking.

```typescript
// ✅ Robust code example
const handleSearch = async (keyword: string) => {
  if (!keyword?.trim()) return; // Boundary guard

  try {
    setLoading(true);
    const res = await api.search(keyword);
    setList(res?.items ?? []); // Null safety
  } catch (err) {
    reportError(err); // Error handling
  } finally {
    setLoading(false); // State reset
  }
};

// ✅ Type guard example
const isUser = (obj: unknown): obj is User => {
  return typeof obj === "object" && obj !== null && "id" in obj;
};
```

### 2.3 Interaction & Race Conditions

- [ ] **Race condition handling**: Ignore stale request results on unmount or new request (AbortController or flag).
- [ ] **Prevent double-submit**: Disable submit button during loading.
- [ ] **Request cancellation**: Use AbortController for in-flight requests.

```typescript
// ✅ Race condition handling example
useEffect(() => {
  const controller = new AbortController();

  const fetchData = async () => {
    try {
      const res = await api.fetch({ signal: controller.signal });
      setData(res);
    } catch (err) {
      if (err.name !== "AbortError") {
        reportError(err);
      }
    }
  };

  fetchData();
  return () => controller.abort();
}, []);
```

---

## 3. Side Effects & Context

### Effect Cleanup Checklist

| Side effect type             | Cleanup method                   |
| ---------------------------- | -------------------------------- |
| `setTimeout` / `setInterval` | `clearTimeout` / `clearInterval` |
| `addEventListener`           | `removeEventListener`            |
| `IntersectionObserver`       | `observer.disconnect()`          |
| Custom subscription          | `subscription.unsubscribe()`     |
| WebSocket                    | `socket.close()`                 |

---

## 4. Performance

### Performance Decision Tree

```
Frequent re-renders?
├─ Yes → New props being passed?
│       ├─ Yes → Use useMemo/useCallback to stabilize references
│       └─ No → Check parent component state update logic
└─ No → Need optimization?
        ├─ List items → Ensure key is unique and stable
        └─ Large components → Consider React.lazy
```

---

## 5. Vue-Specific Checks

- [ ] **Reactive traps**: Don't modify props directly; use emit for updates.
- [ ] **Lifecycle**: Side effects in `onMounted` must be cleaned up in `onUnmounted`.
- [ ] **Computed**: Avoid side effects in computed properties.
- [ ] **Watch depth**: Deep object watching needs `deep: true`.
- [ ] **v-for with v-if**: Don't use both on the same element; use computed property to filter instead.

---

## 6. Taro / Mini-Program Specific Checks

- [ ] **API compatibility**: Use Taro APIs instead of Web APIs.
- [ ] **Subpackage config**: New pages placed in the correct subpackage.
- [ ] **setData optimization**: Avoid frequent calls; batch updates.
- [ ] **Image assets**: Use CDN or compressed images.
- [ ] **Lifecycle**: Correct usage of `useDidShow` / `useDidHide`.
