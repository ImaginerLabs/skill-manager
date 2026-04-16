---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  [
    "prd/prd-sync-workflow-ux-enhancement.md",
    "brief/product-brief-sync-workflow-ux-enhancement.md",
    "ux/ux-design-specification-sync-workflow-ux-enhancement.md",
    "architecture.md",
    "architecture-v2.md",
  ]
workflowType: "architecture"
project_name: "skill-package"
user_name: "Alex"
date: "2026-04-16"
lastStep: 8
status: "completed"
completedAt: "2026-04-16"
---

# Architecture Decision Document — 同步链路优化 + 分类编辑增强 + 工作流预览修复

**Author:** Alex
**Date:** 2026-04-16

---

## Context Overview

本次架构决策覆盖 3 项功能的增强修复，均基于现有技术栈，零新依赖：

1. **同步目标选择器** — 前端暴露 `targetIds` 参数到执行逻辑
2. **分类 Combobox 选择器** — 前端组件 + 后端 API
3. **工作流预览 Markdown 渲染** — 前端组件复用

---

## AD-SWU-1: 同步目标选择器模式

**决策：** 引入 `SyncTargetSelector` 组件，封装目标选择逻辑，支持多选（同步）和单选（Diff）两种模式。

**理由：**

- 后端 `pushSync(skillIds, targetIds?, mode)` 已支持 `targetIds` 参数，前端从未暴露这个能力
- Diff 预览当前硬编码 `enabledTargets[0]`，用户无法选择目标
- 选择器组件化可复用，减少 SyncExecutor 中的内联逻辑

**组件接口：**

```typescript
interface SyncTargetSelectorProps {
  mode: "multi" | "single";  // 多选同步 | 单选 Diff
  targets: SyncTarget[];     // 所有目标
  defaultSelected?: string[]; // 默认选中（默认全选）
  onConfirm: (selectedIds: string[]) => void;
  onCancel: () => void;
}
```

**状态管理：**

- 使用 `useState<string[]>` 管理选中状态
- 选中 ID 数组通过 `onConfirm` 回调传递
- `SyncExecutor` 接收选中 ID 并传给 `executePush(selectedIds, mode)`

**关键约束：**

- 仅显示 `enabled: true` 的目标
- 禁用目标不显示在选择器中
- 空选择状态禁止确认（提示用户至少选择一个目标）

---

## AD-SWU-2: 分类 Combobox 组件设计

**决策：** 创建 `CategoryCombobox` 组件，基于 Radix UI Popover + Combobox 模式，封装分类选择和创建逻辑。

**理由：**

- 当前 `MetadataEditor` 使用 `<Input>` 文本输入，用户体验差
- 需要支持搜索过滤和创建新分类
- 组件化便于在 Skill 详情页、分类管理页等场景复用

**组件接口：**

```typescript
interface CategoryComboboxProps {
  value: string;           // 当前分类 name
  onChange: (newCategory: string) => void;  // 选中分类回调
  onCreateCategory?: (name: string, displayName: string) => Promise<void>;  // 创建分类回调
}
```

**数据源：**

- 分类列表从 `categories.yaml` 读取（通过 skill-store 或独立 API）
- 展示 `displayName`，选中后返回 `name`
- 当前分类默认选中状态

**创建新分类流程：**

1. 用户点击下拉底部「+ 创建新分类」
2. 展开表单：name 输入框 + displayName 输入框
3. name 实时校验 kebab-case（正则 `/^[a-z0-9]+(-[a-z0-9]+)*$/`）
4. 创建成功后：调用 API 持久化 → 关闭下拉 → 执行分类移动 → 刷新列表

**关键约束：**

- name 唯一性校验（不能与现有分类重复）
- displayName 必填
- 创建失败显示错误提示，不关闭表单

---

## AD-SWU-3: 创建分类 API 设计

**决策：** 新增 `POST /api/categories` 端点，用于创建新分类。

**请求：**

```typescript
interface CreateCategoryRequest {
  name: string;        // kebab-case 格式
  displayName: string; // 显示名称
  description?: string;
}
```

**响应：**

```typescript
interface Category {
  name: string;
  displayName: string;
  description?: string;
}
```

**服务层实现：**

```typescript
// server/services/categoryService.ts
export async function createCategory(data: CreateCategoryRequest): Promise<Category> {
  // 1. 校验 name 格式
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(data.name)) {
    throw AppError.validationError('分类 name 必须为 kebab-case 格式');
  }

  // 2. 读取现有分类
  const categories = await readCategories();

  // 3. 校验 name 唯一性
  if (categories.some(c => c.name === data.name)) {
    throw AppError.validationError('分类 name 已存在');
  }

  // 4. 追加新分类
  categories.push({
    name: data.name,
    displayName: data.displayName,
    description: data.description || '',
  });

  // 5. 写入 categories.yaml
  await writeCategories(categories);

  return categories.find(c => c.name === data.name)!;
}
```

**关键约束：**

- 仅写入 `config/categories.yaml`，不创建目录
- 目录创建由同步脚本在运行时按需处理
- 返回完整分类对象供前端更新本地状态

---

## AD-SWU-4: 工作流预览 Markdown 渲染

**决策：** 修改 `WorkflowPreview` 组件，将 `<pre>` 纯文本替换为 `ReactMarkdown` 渲染，修复 ScrollArea 高度策略。

**理由：**

- 当前使用 `<pre className="whitespace-pre-wrap">` 纯文本展示，无法渲染 Markdown 格式
- 项目已有 `react-markdown` + `rehype-highlight` + `remark-gfm` 依赖（在 SkillPreview 中使用）
- 复用现有方案确保一致性

**实现：**

```typescript
// 修改前
<pre className="p-3 text-xs font-[var(--font-code)] text-[hsl(var(--foreground))] whitespace-pre-wrap">
  {preview}
</pre>

// 修改后
<div className="prose prose-sm dark:prose-invert max-w-none">
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeHighlight]}
  >
    {preview}
  </ReactMarkdown>
</div>
```

**样式定制：**

| 元素 | 样式 |
|------|------|
| 标题 | text-lg font-bold, text-base font-semibold |
| 段落 | text-sm leading-relaxed |
| 列表 | pl-4, list-disc / list-decimal |
| 代码块 | bg-[hsl(var(--muted))] rounded p-3 overflow-x-auto |
| 行内代码 | bg-[hsl(var(--muted))] rounded px-1 py-0.5 text-xs |

**ScrollArea 修复：**

```typescript
// 修改前
<ScrollArea className="max-h-[300px]">
  ...
</ScrollArea>

// 修改后
<ScrollArea className="max-h-[400px] h-[400px]">
  <div className="p-3">
    <ReactMarkdown ... />
  </div>
</ScrollArea>
```

**关键约束：**

- 使用 `github-dark` 语法高亮主题（适配暗色主题）
- 亮色主题自动回退到 `github-light`
- 代码块语言标识（如 `\`\`\`javascript`）正确识别并高亮

---

## AD-SWU-5: 组件文件结构

**决策：** 新增组件按功能域组织，复用现有目录结构。

```
src/components/sync/
├── SyncTargetSelector.tsx    # 新增：目标选择器（多选/单选）
├── TargetCheckboxList.tsx    # 新增：目标复选框列表
├── SyncExecutor.tsx         # 修改：集成目标选择器
├── DiffReportView.tsx       # 修改：集成目标选择器（单选）
└── SyncSummaryPanel.tsx     # 修改：展示已选目标

src/components/skills/
├── CategoryCombobox.tsx     # 新增：分类下拉选择器
├── MetadataEditor.tsx        # 修改：使用 CategoryCombobox
└── SkillPreview.tsx         # 参考：Markdown 渲染示例

src/components/workflow/
├── WorkflowPreview.tsx      # 修改：Markdown 渲染 + 滚动修复
└── WorkflowEditor.tsx       # 无需修改
```

**关键约束：**

- 新增组件放置在对应功能域目录
- 使用现有组件库（Button, Input, Checkbox, ScrollArea 等）
- 单元测试文件放在 `tests/unit/components/` 对应目录

---

## AD-SWU-6: 后端 API 路由设计

**决策：** 新增分类相关 API，复用现有路由结构。

```
server/
├── routes/
│   ├── skillRoutes.ts       # 现有：GET /api/skills
│   ├── syncRoutes.ts        # 现有：POST /api/sync/push
│   └── categoryRoutes.ts   # 新增：分类管理路由
└── services/
    ├── categoryService.ts   # 新增：分类服务
    └── ...
```

**新增路由：**

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | /api/categories | 获取分类列表（现有，复用） |
| POST | /api/categories | 创建新分类 |
| PUT | /api/categories/:name | 更新分类（可选） |
| DELETE | /api/categories/:name | 删除分类（可选） |

**关键约束：**

- 删除分类需检查是否有 Skill 归属该分类
- 删除分类不同步删除 Skill（Skill 需手动重新分类）

---

## 技术约束总结

| 约束 | 说明 |
|------|------|
| 零新依赖 | 全部复用现有依赖 |
| 纯本地运行 | 不依赖云服务 |
| 跨平台路径 | 使用 path.posix 归一化 |
| 暗色主题优先 | 所有新组件遵循现有主题 |

---

## 依赖清单（无新增）

**前端依赖（已有）：**

- `react` — React 19
- `react-markdown` — Markdown 渲染
- `rehype-highlight` — 代码高亮
- `remark-gfm` — GitHub 风格 Markdown
- `@radix-ui/react-popover` — 弹窗组件
- `@radix-ui/react-dialog` — 对话框组件

**后端依赖（已有）：**

- `gray-matter` — Frontmatter 解析
- `yaml` — YAML 读写
- `fs-extra` — 文件操作
- `zod` — 请求校验

---

## 架构审查清单

- [x] 同步目标选择器支持多选和单选模式
- [x] 分类 Combobox 支持搜索和创建新分类
- [x] 创建分类 API 校验 name 唯一性和格式
- [x] 工作流预览 Markdown 渲染正确
- [x] 语法高亮适配暗色/亮色主题
- [x] 预览区域可滚动，无内容截断
- [x] 组件文件结构合理，复用现有目录
- [x] 零新依赖，全部基于现有技术栈