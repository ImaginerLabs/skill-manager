# 代码示例参考

## 1. 闭包陷阱（Stale Closure）

```typescript
// ❌ 错误：count 永远是初始值 0（闭包捕获了旧值）
const [count, setCount] = useState(0);

useEffect(() => {
  const timer = setInterval(() => {
    console.log(count); // 始终打印 0
    setCount(count + 1); // 累加错误
  }, 1000);
  return () => clearInterval(timer);
}, []); // 缺少 count 依赖
```

```typescript
// ✅ 正确方案一：使用函数式更新，不依赖外部 state
useEffect(() => {
  const timer = setInterval(() => {
    setCount((prev) => prev + 1); // 使用 prev 获取最新值
  }, 1000);
  return () => clearInterval(timer);
}, []);

// ✅ 正确方案二：使用 useRef 保存最新值
const countRef = useRef(count);
useEffect(() => {
  countRef.current = count;
}, [count]);
```

---

## 2. 渲染性能优化

### 2.1 避免不必要的重渲染

```typescript
// ❌ 错误：每次父组件渲染，子组件都会重渲染（引用每次都是新对象）
function Parent() {
  const [count, setCount] = useState(0);
  const config = { theme: 'dark' }; // 每次渲染都是新引用
  const handleClick = () => console.log('click'); // 每次渲染都是新函数

  return <Child config={config} onClick={handleClick} />;
}

// ✅ 正确：稳定引用，配合 React.memo 使用
function Parent() {
  const [count, setCount] = useState(0);
  const config = useMemo(() => ({ theme: 'dark' }), []); // 稳定引用
  const handleClick = useCallback(() => console.log('click'), []); // 稳定引用

  return <Child config={config} onClick={handleClick} />;
}

const Child = React.memo(({ config, onClick }) => {
  // 只有 config 或 onClick 变化时才重渲染
  return <div onClick={onClick}>{config.theme}</div>;
});
```

### 2.2 列表渲染

```typescript
// ❌ 错误：使用 index 作为 key，列表重排时会导致状态错乱
{list.map((item, index) => <Item key={index} data={item} />)}

// ✅ 正确：使用稳定唯一的业务 ID
{list.map(item => <Item key={item.id} data={item} />)}
```

---

## 3. useEffect 规范

### 3.1 副作用清理 & 异步请求

```typescript
// ❌ 错误：组件卸载后仍尝试更新状态，导致内存泄漏警告
useEffect(() => {
  fetchData().then((data) => setData(data)); // 组件卸载后仍执行
}, []);

// ✅ 正确：使用 AbortController 取消请求
useEffect(() => {
  const controller = new AbortController();

  fetchData({ signal: controller.signal })
    .then((data) => setData(data))
    .catch((err) => {
      if (err.name !== "AbortError") reportError(err);
    });

  return () => controller.abort(); // 清理：取消请求
}, []);
```

### 3.2 async useEffect 写法

```typescript
// ❌ 错误：useEffect 回调不能直接是 async 函数
useEffect(async () => { ... }, []);

// ✅ 正确：内部定义 async 函数
useEffect(() => {
  const load = async () => {
    try {
      const data = await fetchData();
      setData(data);
    } catch (err) {
      reportError(err);
    }
  };
  load();
}, []);
```

---

## 4. 状态管理规范

### 4.1 派生数据不入 state

```typescript
// ❌ 错误：派生数据存入 state，导致数据不一致
const [list, setList] = useState([]);
const [count, setCount] = useState(0); // count 可由 list 派生，不应单独存储

// ✅ 正确：派生数据用 useMemo 计算
const [list, setList] = useState([]);
const count = useMemo(() => list.length, [list]); // 派生，始终与 list 同步
```

### 4.2 避免直接修改 state

```typescript
// ❌ 错误：直接修改 state 对象（引用未变，React 不会触发重渲染）
const [user, setUser] = useState({ name: "Alex", age: 18 });
user.age = 19; // 直接修改，不会触发重渲染
setUser(user);

// ✅ 正确：返回新对象
setUser((prev) => ({ ...prev, age: 19 }));
```

---

## 5. 高频事件处理

```typescript
// ❌ 错误：搜索框每次输入都触发 API 请求
<input onChange={e => fetchSearch(e.target.value)} />

// ✅ 正确：使用 debounce 防抖
const debouncedSearch = useMemo(
  () => debounce((keyword: string) => fetchSearch(keyword), 300),
  []
);

// 注意：组件卸载时取消防抖
useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

<input onChange={e => debouncedSearch(e.target.value)} />
```

---

## 6. 竞态条件（Race Condition）

```typescript
// ❌ 错误：快速切换 tab 时，旧请求的结果可能覆盖新请求的结果
useEffect(() => {
  fetchData(activeTab).then((data) => setData(data));
}, [activeTab]);

// ✅ 正确：使用标志位忽略过期请求的结果
useEffect(() => {
  let cancelled = false;

  fetchData(activeTab).then((data) => {
    if (!cancelled) setData(data); // 只处理最新请求的结果
  });

  return () => {
    cancelled = true;
  };
}, [activeTab]);
```
