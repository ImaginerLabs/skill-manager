# 常见代码问题模式指南

## 前端常见问题

### React 组件问题

#### 1. 状态管理问题

**模式识别**:

```javascript
// 反模式: 直接修改状态
this.state.items.push(newItem);

// 反模式: 状态更新依赖当前状态
this.setState({ count: this.state.count + 1 });
```

**修复建议**:

```javascript
// 正确: 使用函数式更新
this.setState((prevState) => ({
  count: prevState.count + 1,
}));

// 正确: 使用不可变更新
this.setState({
  items: [...this.state.items, newItem],
});
```

#### 2. 生命周期问题

**模式识别**:

```javascript
// 反模式: 在componentWillMount中执行副作用
componentWillMount() {
  this.fetchData(); // 应该放在componentDidMount
}

// 反模式: 缺少清理操作
componentDidMount() {
  this.interval = setInterval(() => {}, 1000);
}
// 缺少componentWillUnmount清理
```

**修复建议**:

```javascript
// 正确: 副作用在componentDidMount中执行
componentDidMount() {
  this.fetchData();
}

// 正确: 添加清理操作
componentWillUnmount() {
  clearInterval(this.interval);
}
```

### Vue 组件问题

#### 1. 响应式问题

**模式识别**:

```javascript
// 反模式: 直接给对象添加新属性
this.userData.newProperty = "value"; // 不会触发响应式更新

// 反模式: 数组索引赋值
this.items[0] = newItem; // 不会触发响应式更新
```

**修复建议**:

```javascript
// 正确: 使用Vue.set或$set
this.$set(this.userData, "newProperty", "value");

// 正确: 使用数组方法
this.items.splice(0, 1, newItem);
```

#### 2. 计算属性问题

**模式识别**:

```javascript
// 反模式: 在计算属性中执行副作用
computed: {
  processedData() {
    this.sideEffect(); // 不应该在计算属性中执行副作用
    return this.data.map(...);
  }
}
```

**修复建议**:

```javascript
// 正确: 使用watch处理副作用
watch: {
  data: {
    handler() {
      this.sideEffect();
    },
    immediate: true
  }
}
```

## 后端常见问题

### Node.js 问题

#### 1. 异步处理问题

**模式识别**:

```javascript
// 反模式: 回调地狱
fs.readFile('file1', (err, data1) => {
  fs.readFile('file2', (err, data2) => {
    fs.readFile('file3', (err, data3) => {
      // 更多嵌套...
    });
  });
});

// 反模式: 未处理的Promise拒绝
asyncFunction().then(...); // 缺少.catch()
```

**修复建议**:

```javascript
// 正确: 使用async/await
try {
  const data1 = await fs.promises.readFile('file1');
  const data2 = await fs.promises.readFile('file2');
  const data3 = await fs.promises.readFile('file3');
} catch (error) {
  console.error('Error reading files:', error);
}

// 正确: 处理Promise拒绝
asyncFunction()
  .then(...)
  .catch(error => console.error('Error:', error));
```

#### 2. 内存泄漏问题

**模式识别**:

```javascript
// 反模式: 未清理的定时器
setInterval(() => {
  // 长期运行的定时器
}, 1000);

// 反模式: 全局变量积累
global.cache = global.cache || {};
global.cache[Date.now()] = largeData; // 不断积累
```

**修复建议**:

```javascript
// 正确: 清理定时器
const intervalId = setInterval(() => {}, 1000);
// 在适当的时候清理
clearInterval(intervalId);

// 正确: 使用WeakMap或限制缓存大小
const cache = new WeakMap(); // 或者使用LRU缓存
```

### API 设计问题

#### 1. 错误处理问题

**模式识别**:

```javascript
// 反模式: 吞掉错误
try {
  riskyOperation();
} catch (error) {
  // 没有处理错误
}

// 反模式: 不一致的错误响应
res.status(500).json({ error: "Server error" });
res.status(400).send("Bad request"); // 格式不一致
```

**修复建议**:

```javascript
// 正确: 正确处理错误
try {
  riskyOperation();
} catch (error) {
  console.error("Operation failed:", error);
  throw new Error("Operation failed"); // 或者返回错误响应
}

// 正确: 一致的错误响应格式
function sendError(res, status, message) {
  res.status(status).json({
    error: true,
    message: message,
    timestamp: new Date().toISOString(),
  });
}
```

#### 2. 安全性问题

**模式识别**:

```javascript
// 反模式: SQL注入风险
const query = `SELECT * FROM users WHERE name = '${userInput}'`;

// 反模式: 未验证用户输入
app.post("/api/users", (req, res) => {
  const userData = req.body; // 直接使用，未验证
  createUser(userData);
});
```

**修复建议**:

```javascript
// 正确: 使用参数化查询
const query = "SELECT * FROM users WHERE name = ?";
db.execute(query, [userInput]);

// 正确: 输入验证
const { error, value } = userSchema.validate(req.body);
if (error) {
  return res.status(400).json({ error: error.details });
}
createUser(value);
```

## 通用编程问题

### 代码质量问题

#### 1. 可读性问题

**模式识别**:

```javascript
// 反模式: 魔法数字
if (status === 1) { // 1代表什么？
  // ...
}

// 反模式: 过长的函数
function processUserDataAndSendEmailAndUpdateDatabaseAnd...() {
  // 超过50行的函数
}
```

**修复建议**:

```javascript
// 正确: 使用常量
const STATUS_ACTIVE = 1;
if (status === STATUS_ACTIVE) {
  // ...
}

// 正确: 函数拆分
function processUserData() {
  /* ... */
}
function sendEmail() {
  /* ... */
}
function updateDatabase() {
  /* ... */
}
```

#### 2. 维护性问题

**模式识别**:

```javascript
// 反模式: 重复代码
function calculateTotalA(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}

function calculateTotalB(products) {
  let total = 0;
  for (let i = 0; i < products.length; i++) {
    total += products[i].price * products[i].quantity;
  }
  return total;
}
```

**修复建议**:

```javascript
// 正确: 提取通用函数
function calculateTotal(items) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

// 复用同一个函数
const totalA = calculateTotal(items);
const totalB = calculateTotal(products);
```

## 性能问题模式

### 前端性能问题

#### 1. 渲染性能

**模式识别**:

```javascript
// 反模式: 不必要的重新渲染
function MyComponent({ data }) {
  // 每次渲染都创建新对象
  const config = { theme: "dark", items: data };
  return <ChildComponent config={config} />;
}
```

**修复建议**:

```javascript
// 正确: 使用useMemo缓存
function MyComponent({ data }) {
  const config = useMemo(
    () => ({
      theme: "dark",
      items: data,
    }),
    [data],
  );
  return <ChildComponent config={config} />;
}
```

#### 2. 内存使用

**模式识别**:

```javascript
// 反模式: 未清理的事件监听器
useEffect(() => {
  window.addEventListener("resize", handleResize);
  // 缺少清理函数
}, []);
```

**修复建议**:

```javascript
// 正确: 添加清理函数
useEffect(() => {
  window.addEventListener("resize", handleResize);
  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);
```

### 后端性能问题

#### 1. 数据库查询

**模式识别**:

```javascript
// 反模式: N+1查询问题
users.forEach((user) => {
  const posts = db.query("SELECT * FROM posts WHERE user_id = ?", [user.id]);
  // 为每个用户执行一次查询
});
```

**修复建议**:

```javascript
// 正确: 批量查询
const userIds = users.map((user) => user.id);
const postsByUser = db.query("SELECT * FROM posts WHERE user_id IN (?)", [
  userIds,
]);
// 然后在前端进行分组
```

#### 2. 缓存问题

**模式识别**:

```javascript
// 反模式: 缓存穿透
function getData(id) {
  let data = cache.get(id);
  if (!data) {
    data = db.query("SELECT * FROM data WHERE id = ?", [id]);
    if (data) {
      cache.set(id, data);
    }
  }
  return data; // 如果id不存在，每次都会查数据库
}
```

**修复建议**:

```javascript
// 正确: 缓存空值
function getData(id) {
  let data = cache.get(id);
  if (data === undefined) {
    data = db.query("SELECT * FROM data WHERE id = ?", [id]);
    cache.set(id, data || null); // 缓存null表示不存在
  }
  return data === null ? undefined : data;
}
```

## 问题诊断流程

### 1. 问题识别

- 确认问题现象和复现步骤
- 收集错误信息和日志
- 确定问题影响范围

### 2. 根本原因分析

- 使用调试工具定位问题代码
- 分析数据流和状态变化
- 验证假设和复现问题

### 3. 解决方案设计

- 评估多种修复方案
- 选择最合适的解决方案
- 考虑向后兼容性

### 4. 修复验证

- 编写测试用例验证修复
- 进行回归测试
- 监控修复效果

---

_本指南将持续更新，欢迎贡献新的问题模式和修复方案_
