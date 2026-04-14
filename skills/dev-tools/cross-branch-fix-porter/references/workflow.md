# 详细工作流程说明

## 完整决策树

```
用户触发 Skill
│
├─ 提供了 commit ID？
│  ├─ Yes → 调用 MCP get_commit_info + get_commit_diff
│  └─ No  → 调用 grep_history_context 搜索历史上下文
│
↓
分析修复意图（必须完成，不可跳过）
│
├─ 意图清晰？
│  ├─ Yes → 继续
│  └─ No  → 向用户确认
│
↓
在当前分支定位对应文件
│
├─ 找到对应文件？
│  ├─ Yes → 读取文件，理解当前逻辑
│  └─ No  → 告知用户，请求补充信息
│
↓
判断文件是否为完全新增（快捷路径）
│
├─ 是全新文件 且 无依赖冲突？
│  ├─ Yes → 直接 cp / git show 复制文件到当前项目 → 跳至第五阶段
│  └─ No  → 进入第四阶段，以当前分支逻辑重新实现
│
↓
重新实现修复（以当前分支逻辑为准）
│
↓
输出移植报告
```

---

## 第一阶段详解：获取修复信息

### 使用 MCP 工具读取 commit

```
# 步骤 1：获取 commit 基本信息
use_mcp_tool(
  serverName: "gongfeng_sys",
  toolName: "get_commit_info",
  arguments: {
    project_id: "<项目ID或路径>",
    commit_sha: "<commit ID>"
  }
)

# 步骤 2：获取 diff
use_mcp_tool(
  serverName: "gongfeng_sys",
  toolName: "get_commit_diff",
  arguments: {
    project_id: "<项目ID或路径>",
    sha: "<commit ID>"
  }
)
```

**注意**：如果用户没有提供 project_id，需要先询问，或根据上下文推断（如当前工作目录的 git remote）。

### 从历史上下文获取

```
# 搜索历史对话中的修复信息
grep_history_context(keyword: "fix")
grep_history_context(keyword: "修复")
grep_history_context(keyword: "commit")
grep_history_context(keyword: "bug")

# 如果找到相关历史，读取详情
read_history_context(contextIDs: ["<找到的context ID>"])
```

---

## 第二阶段详解：分析修复意图

### 阅读 diff 的方法

拿到 diff 后，按以下顺序分析：

1. **先看 commit message**：通常直接说明了修复的问题
2. **统计改动文件数量**：判断修复范围（单文件 vs 多文件）
3. **逐文件分析**：
   - 删除了什么（`-` 行）
   - 新增了什么（`+` 行）
   - 改动的上下文（周围未变化的代码）

### 意图提取示例

**原始 diff**：

```diff
- if (list.length > 0) {
+ if (list && list.length > 0) {
```

**意图分析**：

- 问题根因：`list` 可能为 `null` 或 `undefined`，直接访问 `.length` 会报错
- 修复方式：增加空值判断
- 核心逻辑变化：在访问数组属性前增加非空校验

**在当前分支的应用**：

- 找到当前分支中同样访问该数据的地方
- 检查当前分支是否已有类似的空值处理
- 如果没有，以当前分支的风格添加（可能是 `list?.length > 0` 或 `Array.isArray(list) && list.length > 0`）

---

## 第三阶段详解：定位对应文件

### 搜索策略（按优先级）

**策略 1：按功能模块搜索**

```
codebase_search(query: "原始文件的功能描述")
```

**策略 2：按关键函数/变量名搜索**

```
grep_search(query: "原始文件中的关键函数名")
grep_search(query: "原始文件中的关键变量名")
```

**策略 3：按文件名关键词搜索**

```
search_files(query: "原始文件名的关键词")
```

**策略 4：按业务逻辑搜索**

```
codebase_search(query: "原始修复涉及的业务逻辑描述")
```

### 常见的结构差异情况

| 差异类型         | 原始路径示例                      | 当前分支可能的路径                    |
| ---------------- | --------------------------------- | ------------------------------------- |
| 框架不同         | `src/pages/xxx/index.vue`         | `src/pages/xxx/index.tsx`             |
| 目录结构不同     | `src/views/xxx.js`                | `src/pages/xxx/index.ts`              |
| 组件拆分不同     | `src/components/BigComponent.tsx` | `src/components/xxx/SubComponent.tsx` |
| 工具函数位置不同 | `src/utils/helper.js`             | `src/hooks/useHelper.ts`              |

---

## 第三点五阶段详解：新增文件快捷复制

### 判断是否可直接复制

在定位到文件后，**先做这个判断，再决定是否进入第四阶段**：

| 判断项                               | 检查方式                       | 结论                  |
| ------------------------------------ | ------------------------------ | --------------------- |
| diff 中是否标记为 `new file mode`    | 查看 diff 头部                 | 是 → 满足条件 1       |
| 当前分支是否已存在同功能文件         | `search_files` / `grep_search` | 不存在 → 满足条件 2   |
| 文件 import 的模块在当前分支是否存在 | 读取文件 import 列表逐一核查   | 全部存在 → 满足条件 3 |

**三项全部满足 → 直接复制，跳过第四阶段。**

### 直接复制的操作命令

**方式一：从本地已 checkout 的原始分支复制**

```bash
cp /path/to/original-branch/src/new-file.ts /path/to/current-project/src/new-file.ts
```

**方式二：用 git show 从 commit 中提取文件（无需切换分支）**

```bash
# 将指定 commit 中的文件内容直接写入当前项目目标路径
git show <commit_id>:<原始文件相对路径> > /path/to/current-project/目标路径/new-file.ts
```

**方式三：复制整个新增目录**

```bash
cp -r /path/to/original-branch/src/new-module/ /path/to/current-project/src/new-module/
```

### 复制后的必要检查

```
□ 检查文件中的 import 路径是否与当前项目目录结构一致
□ 检查是否有硬编码的项目特定路径或别名（如 @/utils → 当前项目是否配置了相同别名）
□ 如果有路径不一致，手动修正 import 路径后再使用
```

> ⚡ **节省时间的关键**：完全新增的文件没有"当前分支已有逻辑"需要兼容，直接复用是最安全、最高效的方式。

---

## 第四阶段详解：重新实现修复

### 实现前的准备

在动手修改前，必须先回答：

1. 当前分支的这个文件，是否已经有类似的修复？（避免重复修复）
2. 当前分支使用的工具函数/类型，与原始分支有何不同？
3. 当前分支的代码风格（TypeScript/JavaScript、函数式/类式、Hooks/HOC）？

### 实现时的注意事项

**✅ 正确做法**：

```typescript
// 原始修复：增加了对 userInfo 的空值判断
// 当前分支使用 optional chaining，风格统一
const userName = userInfo?.name ?? "未知用户";
```

**❌ 错误做法**：

```typescript
// 直接复制原始代码，忽略当前分支的风格
if (userInfo !== null && userInfo !== undefined) {
  userName = userInfo.name;
} else {
  userName = "未知用户";
}
```

### 多文件修复的处理顺序

如果原始修复涉及多个文件，按以下顺序处理：

1. **类型定义文件**（如 `.d.ts`、`types.ts`）
2. **工具函数/Hook 文件**
3. **核心业务逻辑文件**
4. **UI 组件文件**
5. **测试文件**（如有）

---

## 第五阶段详解：移植报告格式

```markdown
## 修复移植报告

### 修复摘要

[一句话描述修复解决的问题]

### 文件映射

| 原始分支文件 | 当前分支对应文件 | 映射说明           |
| ------------ | ---------------- | ------------------ |
| xxx/yyy.ts   | aaa/bbb.tsx      | 功能相同，框架不同 |

### 主要差异

- **结构差异**：[说明两个分支的结构差异]
- **实现差异**：[说明实现方式的不同]

### 已应用的改动

1. `文件路径`：[改动说明]
2. `文件路径`：[改动说明]

### 需要确认的事项

- [ ] [需要用户确认的内容]
```
