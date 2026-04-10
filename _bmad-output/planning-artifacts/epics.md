---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories", "step-04-final-validation"]
inputDocuments:
  - "prd.md"
  - "architecture.md"
  - "ux-design-specification.md"
---

# Skill Manager - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Skill Manager, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Skill 浏览与发现**
- FR1: 用户可以按分类目录树浏览所有 Skill
- FR2: 用户可以在卡片网格视图中查看 Skill 列表，每张卡片展示名称、描述和分类标签
- FR3: 用户可以点击 Skill 卡片查看完整的 Markdown 渲染预览
- FR4: 用户可以通过关键词搜索 Skill（模糊匹配名称、描述、标签字段，多关键词以空格分隔，取 AND 逻辑）
- FR5: 用户可以按分类筛选 Skill 列表
- FR6: 用户可以查看 Skill 的 YAML Frontmatter 元数据（名称、描述、分类、标签、类型）
- FR7: 系统在 Skill 列表为空时展示引导流程，提示用户从 IDE 导入

**工作流编排**
- FR8: 用户可以从已有 Skill 列表中选择多个 Skill 加入工作流
- FR9: 用户可以通过拖拽调整工作流中 Skill 的执行顺序
- FR10: 用户可以为工作流中的每个 Step 填写描述文字
- FR11: 用户可以为工作流设置名称和整体描述
- FR12: 系统根据编排结果自动生成标准格式的工作流 `.md` 文件（Frontmatter 含 `type: workflow`，正文含 `## Step N` + `**使用 Skill:** \`name\``）
- FR13: 用户可以预览生成的工作流文件内容
- FR14: 生成的工作流文件自动保存到 `skills/workflows/` 目录
- FR14b: 用户可以从工作流编排中移除已添加的 Step
- FR14c: 用户可以删除已创建的工作流 Skill
- FR14d: 用户可以编辑已创建的工作流（重新打开编排器，修改步骤顺序、添加/移除步骤、修改描述），编辑后覆盖保存原工作流文件

**IDE 同步**
- FR15: 用户可以查看已配置的 IDE 同步目标列表
- FR16: 用户可以选择需要同步的 Skill（支持按分类批量选择）
- FR17: 用户可以一键将选定的 Skill 文件扁平化复制到目标 IDE 的 Skill 目录（不保留分类子目录结构）
- FR17b: 同步目标路径为用户配置的绝对路径（指向具体项目的 IDE Skill 目录），用户可配置多个项目路径
- FR17c: 当目标目录中已存在同名 Skill 文件时，系统默认覆盖并在同步日志中标注
- FR18: 系统在同步完成后展示同步结果（成功数、覆盖数、失败数、详细日志）
- FR19: 系统在同步前检查目标路径是否存在，不存在时提示用户并提供自动创建选项

**IDE 导入**
- FR20: 用户可以触发扫描指定 IDE 的 Skill 目录
- FR21: 系统展示扫描发现的 Skill 文件列表（名称、描述、文件路径）
- FR22: 用户可以选择需要导入的 Skill 文件
- FR23: 用户在导入时为 Skill 选择分类归属（支持批量选择多个 Skill 统一设置分类）
- FR24: 系统将导入的 Skill 文件复制到对应分类目录，并补充缺失的 Frontmatter 字段
- FR25: 用户可以选择导入后清理 IDE 中的原始 Skill 文件

**Skill 管理**
- FR25b: 用户可以删除已导入的 Skill 文件
- FR25c: 用户可以将 Skill 移动到其他分类
- FR25d: 用户可以编辑 Skill 的 Frontmatter 元数据（分类、标签、描述），但不能编辑 Markdown 正文

**配置管理**
- FR26: 用户可以查看和修改 IDE 同步目标路径（支持配置多个项目路径）
- FR27: 用户可以查看、添加、修改和删除 Skill 分类
- FR28: 系统将配置变更持久化到 `config/settings.yaml` 和 `config/categories.yaml`
- FR29: 系统在启动时读取配置文件并应用设置

**系统能力**
- FR30: 系统解析 `.md` 文件的 YAML Frontmatter 和 Markdown 正文
- FR31: 系统在用户手动刷新或执行操作后重新扫描 `skills/` 目录更新数据（MVP 不使用文件监听）
- FR32: 系统区分普通 Skill 和工作流 Skill（通过 Frontmatter 中的 `type` 字段）

**错误处理**
- FR33: 系统在解析 Skill 文件时，如果 YAML Frontmatter 语法错误，将该文件标记为解析失败并在 UI 中提示
- FR34: 系统在同步操作失败时提供详细错误信息和恢复建议
- FR35: 系统在文件操作（读取、写入、删除）失败时提供清晰的错误提示
- FR36: 每个功能模块（浏览、编排、同步、导入、设置）提供独立的空状态引导

### Non-Functional Requirements

**Performance**
- NFR1: Skill 搜索响应时间 < 200ms（本地文件系统，500 个 Skill 文件规模）
- NFR2: 页面首次加载时间 < 2s（Lighthouse Performance Score > 80）
- NFR3: 同步操作耗时 < 2s（100 个 Skill 文件的批量复制）
- NFR4: Markdown 渲染时间 < 500ms（单个 Skill 文件，最大 50KB）

**Security**
- NFR5: 系统仅在 localhost 运行，不暴露外部网络端口
- NFR6: 文件操作限制在配置的目录范围内，防止路径遍历攻击
- NFR7: 同步操作前进行目标路径合法性校验

**Accessibility**
- NFR8: Web 界面支持键盘导航（Tab 切换、Enter 确认、Esc 取消）
- NFR9: 所有交互元素提供 ARIA 标签
- NFR10: 暗色主题满足 WCAG 2.1 AA 对比度标准（文本对比度 ≥ 4.5:1）

**Integration**
- NFR11: 支持 macOS、Windows、Linux 三大操作系统的文件路径格式
- NFR12: 支持 UTF-8 编码的 Markdown 文件，正确处理中英文混合内容

### Additional Requirements

**来自 Architecture 文档的技术需求：**

- AR1: 使用 Vite + React + Express 手动搭建项目（Starter Template），前后端分离架构
- AR2: 状态管理使用 Zustand（4 个独立 Store：skill-store、workflow-store、sync-store、ui-store）
- AR3: 数据层采用文件系统 + 内存缓存，启动时全量扫描 skills/ 目录
- AR4: API 通信采用 REST API + SSE（Server-Sent Events），REST 处理 CRUD，SSE 推送文件变更事件
- AR5: 搜索方案使用 Fuse.js 前端模糊搜索
- AR6: 运行时验证使用 Zod（Frontmatter 和 API 请求/响应的 schema 校验）
- AR7: Markdown 渲染使用 react-markdown + remark-gfm + rehype-highlight
- AR8: 拖拽排序使用 @dnd-kit/core + @dnd-kit/sortable，同时提供键盘排序（Alt+↑/↓）
- AR9: 键盘快捷键使用 react-hotkeys-hook
- AR10: 虚拟滚动使用 @tanstack/react-virtual（仅用于 Skill 卡片列表）
- AR11: 文件写入安全采用原子写入（tmp + rename）
- AR12: 并发控制使用 async-mutex 写入队列
- AR13: 自触发过滤：写操作标记 changeSource，chokidar 回调中跳过自触发事件
- AR14: 前端路由使用 React Router（/、/workflow、/sync、/import、/settings）
- AR15: 全局 CLI 命令支持（bin/cli.js），用户可通过 npx skill-manager 启动
- AR16: 共享类型定义放在 shared/ 目录（types.ts、constants.ts、schemas.ts）
- AR17: 后端使用 Express 绑定 127.0.0.1，路径遍历防护中间件
- AR18: 所有 API 响应使用统一的 ApiResponse<T> 包装格式
- AR19: 错误处理使用 AppError 类 + React ErrorBoundary + Express 全局错误中间件
- AR20: 开发环境使用 concurrently 一条命令启动前后端，生产环境单进程运行

### UX Design Requirements

- UX-DR1: 实现三栏布局（侧边栏 240px + 主内容区 flex-1 + 预览面板 400px），侧边栏可通过 ⌘B 折叠
- UX-DR2: 实现 ⌘K Command Palette 全局搜索，支持 Skill 搜索、页面跳转、快速操作，搜索结果按类型分组（Skills / 工作流 / 快速操作）
- UX-DR3: 实现暗色主题设计系统（Code Dark #0F172A + Run Green #22C55E），使用 CSS Variables 映射到 shadcn/ui
- UX-DR4: 实现 SkillCard 组件，展示名称、描述（截断 2 行）、分类标签、类型标识，支持 hover/selected/focused 状态
- UX-DR5: 实现 CategoryTree 分类目录树组件，展示分类名称、Skill 计数、展开/折叠，支持 active 状态高亮
- UX-DR6: 实现 WorkflowEditor 编排器组件，左选右排布局，左侧含搜索筛选 + 点击添加，右侧拖拽排序 + 键盘排序 + 移除按钮 + inline 编辑描述
- UX-DR7: 实现 SyncPanel 同步管理面板，包含 IDE 目标列表、Skill 勾选列表（支持按分类批量选择）、同步进度条、结果日志
- UX-DR8: 实现 ImportWizard 导入向导，包含扫描结果列表、分类选择器、导入进度
- UX-DR9: 实现 StatusIndicator 同步状态指示器（顶部栏右侧），显示同步状态（🟢 已同步 · 3 min ago），点击跳转同步管理
- UX-DR10: 实现字体系统：Fira Code（标题/代码）+ Fira Sans（正文），本地打包到 public/fonts/，使用 font-display: swap + preload
- UX-DR11: 实现响应式布局三个断点：Compact（< 1024px 单栏）、Standard（1024-1439px 双栏 + push 式预览）、Wide（≥ 1440px 三栏）
- UX-DR12: 实现键盘快捷键体系：⌘K 全局搜索、⌘B 侧边栏、J/K 列表导航、Space 预览、Escape 关闭面板，焦点上下文隔离（输入框内单键快捷键失效）
- UX-DR13: 实现无障碍支持：WCAG 2.1 AA 合规、焦点指示器（2px solid Run Green）、aria-label、aria-live 区域、语义化 HTML、prefers-reduced-motion 支持
- UX-DR14: 实现 Toast 通知系统：右下角、最大堆叠 3 个、批量操作合并为汇总 Toast、删除操作附带撤销按钮（5 秒内可撤销）、Error Toast 提供查看详情按钮
- UX-DR15: 实现空状态引导：每个功能模块独立空状态（无 Skill → 导入引导、无工作流 → 创建引导、无同步目标 → 设置引导、搜索无结果 → 提示、分类为空 → 导入引导）
- UX-DR16: 实现视图切换：卡片视图（默认，网格布局）和列表视图（紧凑单行），右上角图标切换，偏好保存到 localStorage
- UX-DR17: 实现按钮层级体系：Primary（绿色填充）、Secondary（暗色边框）、Ghost（透明）、Destructive（红色填充）
- UX-DR18: 实现表单模式：标签在输入框上方、失焦验证、红色错误提示、必填红色星号
- UX-DR19: 冷启动自动检测 IDE 目录（通过后端 API GET /api/scan/codebuddy），包含扫描中/超时/路径不存在/权限被拒/目录为空等状态处理

### FR Coverage Map

| FR | Epic | 说明 |
|----|------|------|
| FR1 | Epic 1 | 分类目录树浏览 |
| FR2 | Epic 1 | 卡片网格视图 |
| FR3 | Epic 1 | Markdown 渲染预览 |
| FR4 | Epic 1 | 关键词搜索 |
| FR5 | Epic 1 | 分类筛选 |
| FR6 | Epic 1 | Frontmatter 元数据查看 |
| FR7 | Epic 1 | 空状态引导（浏览模块） |
| FR8 | Epic 3 | 选择 Skill 加入工作流 |
| FR9 | Epic 3 | 拖拽排序 |
| FR10 | Epic 3 | Step 描述编辑 |
| FR11 | Epic 3 | 工作流名称和描述 |
| FR12 | Epic 3 | 自动生成工作流 .md 文件 |
| FR13 | Epic 3 | 预览工作流文件 |
| FR14 | Epic 3 | 工作流文件自动保存 |
| FR14b | Epic 3 | 移除工作流 Step |
| FR14c | Epic 3 | 删除工作流 Skill |
| FR14d | Epic 3 | 编辑已创建的工作流 |
| FR15 | Epic 4 | IDE 同步目标列表 |
| FR16 | Epic 4 | 选择同步 Skill |
| FR17 | Epic 4 | 扁平化复制同步 |
| FR17b | Epic 4 | 绝对路径多项目配置 |
| FR17c | Epic 4 | 同名文件覆盖策略 |
| FR18 | Epic 4 | 同步结果展示 |
| FR19 | Epic 4 | 同步前路径检查 |
| FR20 | Epic 2 | 触发 IDE 目录扫描 |
| FR21 | Epic 2 | 扫描结果列表展示 |
| FR22 | Epic 2 | 选择导入文件 |
| FR23 | Epic 2 | 导入时分类选择 |
| FR24 | Epic 2 | 文件复制与 Frontmatter 补充 |
| FR25 | Epic 2 | 导入后清理原始文件 |
| FR25b | Epic 1 | 删除 Skill |
| FR25c | Epic 1 | 移动 Skill 分类 |
| FR25d | Epic 1 | 编辑 Frontmatter 元数据 |
| FR26 | Epic 4 | IDE 同步路径配置 |
| FR27 | Epic 1 | 分类 CRUD 管理 |
| FR28 | Epic 1 | 配置持久化到 YAML |
| FR29 | Epic 0 | 启动时读取配置 |
| FR30 | Epic 0 | Frontmatter + Markdown 解析 |
| FR31 | Epic 1 | 手动刷新更新数据 |
| FR32 | Epic 1 | 区分普通 Skill 和工作流 Skill |
| FR33 | Epic 1 | Frontmatter 解析错误处理 |
| FR34 | Epic 4 | 同步失败错误处理 |
| FR35 | Epic 1/2/4 | 文件操作失败错误提示（横切关注点：所有涉及文件读写删除的 Epic） |
| FR36 | Epic 1/2/3/4 | 各模块独立空状态引导（拆分到各 Epic） |

### NFR Coverage Map

| NFR | Epic | 说明 |
|-----|------|------|
| NFR1 | Epic 1 | 搜索性能基准 < 200ms |
| NFR2 | Epic 0 | 首次加载性能基线 < 2s |
| NFR3 | Epic 4 | 同步性能 < 2s |
| NFR4 | Epic 1 | Markdown 渲染性能 < 500ms |
| NFR5 | Epic 0 | localhost 绑定验证 |
| NFR6 | Epic 0 + Epic 1 | 路径遍历防护 |
| NFR7 | Epic 4 | 同步路径合法性校验 |
| NFR8 | Epic 1 | 键盘导航 |
| NFR9 | Epic 0 + 各 Epic | ARIA 标签（横切关注点） |
| NFR10 | Epic 0 | WCAG AA 对比度 |
| NFR11 | Epic 0 + 各 Epic | 跨平台路径兼容（横切关注点） |
| NFR12 | Epic 1 + Epic 2 | UTF-8 编码与中英文支持 |

### AR Coverage Map

| AR | Epic | 说明 |
|----|------|------|
| AR1 | Epic 0 | Vite + React + Express 项目搭建 |
| AR2 | Epic 0 | Zustand Store 骨架 |
| AR3 | Epic 1 | 文件系统扫描 + 内存缓存 |
| AR4 | Epic 0（REST 骨架）| REST API 基础；SSE 推迟到需要时引入 |
| AR5 | Epic 1 | Fuse.js 前端搜索 |
| AR6 | Epic 0 | Zod schema 校验 |
| AR7 | Epic 1 | react-markdown 渲染 |
| AR8 | Epic 3 | @dnd-kit 拖拽排序 |
| AR9 | Epic 1 | react-hotkeys-hook 快捷键 |
| AR10 | Epic 1 | @tanstack/react-virtual 虚拟滚动 |
| AR11 | Epic 0（代码就位）+ Epic 4（首次使用）| 原子写入 |
| AR12 | Epic 0（代码就位）+ Epic 2（首次使用）| async-mutex 并发控制 |
| AR13 | Post-MVP | MVP 不使用文件监听（FR31），AR13 不适用 |
| AR14 | Epic 0 | React Router 5 个路由 |
| AR15 | Epic 0 | CLI 命令（bin/cli.js） |
| AR16 | Epic 0 | shared/ 目录类型定义（渐进扩展） |
| AR17 | Epic 0 | Express 绑定 127.0.0.1 + 路径遍历防护 |
| AR18 | Epic 0 | ApiResponse<T> 统一响应格式 |
| AR19 | Epic 0 | AppError + ErrorBoundary + 全局错误中间件 |
| AR20 | Epic 0 | concurrently 启动脚本 |

## Epic List

### Epic 0: 技术脚手架与设计系统
用户运行 `npm start`，看到暗色主题的空壳应用界面，5 个路由页面可切换。技术基础设施（项目骨架、共享类型、错误处理框架、设计系统 Token）全部就位，为后续所有 Epic 提供统一的技术地基。
**FRs:** FR29, FR30
**ARs:** AR1, AR2, AR4(REST 骨架), AR6, AR11(代码就位), AR12(代码就位), AR14, AR15, AR16, AR17, AR18, AR19, AR20
**UX-DRs:** UX-DR3, UX-DR10, UX-DR17, UX-DR18
**NFRs:** NFR2(基线), NFR5, NFR9(基线), NFR10, NFR11(基线)
**限制：** 不超过 5 个 Story / 3 天工时

### Epic 1: Skill 浏览与分类管理
用户可以浏览分类目录中的 Skill 卡片，查看 Markdown 渲染预览，通过搜索和筛选快速找到 Skill。用户可以管理分类（增删改），编辑 Skill 的 Frontmatter 元数据，删除和移动 Skill。Command Palette、键盘快捷键、空状态引导、Toast 通知、无障碍支持全部就位。
**FRs:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR25b, FR25c, FR25d, FR27, FR28, FR31, FR32, FR33, FR35(删除/移动场景), FR36(浏览+设置部分)
**ARs:** AR3, AR5, AR7, AR9, AR10
**UX-DRs:** UX-DR1, UX-DR2, UX-DR4, UX-DR5, UX-DR11, UX-DR12, UX-DR13, UX-DR14, UX-DR15(浏览+设置部分), UX-DR16
**NFRs:** NFR1, NFR4, NFR6, NFR8, NFR12

### Epic 2: IDE 导入与冷启动
用户可以从 CodeBuddy IDE 扫描并导入 Skill 文件到仓库中，选择分类归属，完成冷启动流程。支持批量选择、Frontmatter 自动补充、导入后清理原始文件。
**FRs:** FR20, FR21, FR22, FR23, FR24, FR25, FR35(导入场景), FR36(导入部分)
**ARs:** AR12(首次真正使用)
**UX-DRs:** UX-DR8, UX-DR15(导入部分), UX-DR19
**NFRs:** NFR12

### Epic 3: 工作流编排
用户可以从已有 Skill 列表中选择多个 Skill 编排成工作流，通过拖拽调整执行顺序，为每个 Step 填写描述，自动生成标准格式的工作流 .md 文件。支持预览、移除 Step、删除工作流。
**FRs:** FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR14b, FR14c, FR14d, FR36(编排部分)
**ARs:** AR8
**UX-DRs:** UX-DR6, UX-DR15(编排部分)

### Epic 4: IDE 同步与路径配置
用户可以配置 IDE 同步目标路径（支持多项目），选择需要同步的 Skill（支持按分类批量选择），一键扁平化同步到 IDE 项目目录，查看同步结果日志（成功数、覆盖数、失败数）。
**FRs:** FR15, FR16, FR17, FR17b, FR17c, FR18, FR19, FR26, FR34, FR35, FR36(同步+设置部分)
**ARs:** AR11(首次真正使用)
**UX-DRs:** UX-DR7, UX-DR9, UX-DR15(同步部分)
**NFRs:** NFR3, NFR7

### 依赖关系

```
        Epic 0 (脚手架)
            │
        Epic 1 (浏览+分类)
       ╱    │    ╲
    Epic 2  Epic 3  Epic 4
   (导入)  (编排)  (同步)
```

- Epic 0 → Epic 1：线性依赖
- Epic 1 → Epic 2/3/4：钻石依赖（2/3/4 之间无相互依赖，但都依赖 Epic 1 的 Skill CRUD API 和分类 API）
- 单人开发时按 Epic 2 → 3 → 4 串行；多人可并行

### Story 生命周期（强制质量门禁）

每个 Story 必须严格遵循以下完整生命周期，**不允许跳过 QA 和 CR 阶段**：

```
backlog → ready-for-dev → in-progress → qa → review → done
```

| 阶段 | 动作 | 工具 | 门禁条件 |
|------|------|------|----------|
| ready-for-dev | 创建 Story 文件 | `bmad-create-story` | Story 文件包含完整 AC 和上下文 |
| in-progress | 实现 + 单元测试 | `bmad-dev-story` | 每个 task 有单元测试，`tsc --noEmit` 通过 |
| **qa** | **测试覆盖验证** | **`bmad-qa-generate-e2e-tests`** | **集成/E2E 测试覆盖所有 AC，全量测试 100% 通过** |
| **review** | **对抗式代码审查** | **`bmad-code-review`** | **审查通过，无阻塞性问题** |
| done | 签收完成 | — | 实现 + 测试 + 审查全部通过 |

**回退规则：**
- qa 阶段测试失败 → 回退到 in-progress 修复
- review 阶段发现问题 → 回退到 in-progress 修复 → 重新走 qa → review

**Story 文件 Dev Agent Record 必须记录：**
- ✅ 每个 task 的实现和单元测试结果
- ✅ QA 阶段：生成的测试文件列表、测试通过/失败数
- ✅ CR 阶段：审查发现、解决方案、最终审查结论

### 对抗式审查决议

本 Epic 方案经过以下团队成员的对抗式审查：

| 审查者 | 角色 | 关键贡献 |
|--------|------|----------|
| 📋 John | Product Manager | 发现 Epic 1 过载问题；将分类管理前置；合并过薄的 Skill 管理 Epic |
| 🏗️ Winston | Architect | 确认 AR13 在 MVP 不适用；SSE 简化为 REST-only；shared/ 渐进扩展原则 |
| 🧪 Murat | Test Architect | 要求 12 个 NFR 显式映射到 Epic；识别跨 Epic 集成测试风险点 |

**已解决的问题：**
1. ✅ Epic 1 从 46 个需求项拆分为合理规模
2. ✅ 分类管理（FR27/28）从 Epic 6 前移到 Epic 1
3. ✅ Skill 管理（FR25b/25c/25d）合并到 Epic 1
4. ✅ IDE 路径配置（FR26）合并到 Epic 4
5. ✅ FR36（空状态引导）拆分到各 Epic
6. ✅ AR13 标注为 Post-MVP
7. ✅ 12 个 NFR 全部映射到对应 Epic
8. ✅ AR11/AR12 明确"代码就位"与"首次使用"的 Epic 归属

---

## Epic 0: 技术脚手架与设计系统

用户运行 `npm start`，看到暗色主题的空壳应用界面，5 个路由页面可切换。

### Story 0.1: 项目初始化与前后端骨架

As a 开发者,
I want 通过一条命令启动前后端开发环境,
So that 我可以在统一的开发环境中开始构建功能。

**Acceptance Criteria:**

**Given** 用户 clone 项目并运行 `npm install`
**When** 用户执行 `npm run dev`
**Then** 前端（Vite，端口 5173）和后端（Express，端口 3001）同时启动
**And** 前端 Vite proxy 将 `/api` 请求转发到后端
**And** 后端 `GET /api/health` 返回 `{ success: true, data: { status: "ok" } }`
**And** Express 绑定 `127.0.0.1`，外部 IP 无法访问（NFR5）
**And** `npm run build` 生成生产构建，`npm start` 单进程运行（AR20）
**And** `bin/cli.js` 全局命令可通过 `npx skill-manager` 启动（AR15）

**Technical Notes:**
- AR1: Vite + React + Express 手动搭建
- AR14: React Router 配置 5 个路由（/, /workflow, /sync, /import, /settings）
- AR17: Express 绑定 127.0.0.1
- AR20: concurrently 协调前后端启动

### Story 0.2: 共享类型、Schema 与错误处理框架

As a 开发者,
I want 拥有统一的类型定义、运行时校验和错误处理机制,
So that 后续所有功能开发都有一致的基础设施。

**Acceptance Criteria:**

**Given** shared/ 目录已创建
**When** 前端或后端导入共享类型
**Then** `shared/types.ts` 导出 SkillMeta、Category、AppConfig、ApiResponse 等核心类型
**And** `shared/schemas.ts` 导出 Zod schema（SkillMetaSchema、ApiResponseSchema），校验正确数据通过、错误数据返回清晰错误消息（AR6）
**And** `shared/constants.ts` 导出错误码常量（SKILL_NOT_FOUND、PARSE_ERROR 等）
**And** `server/types/errors.ts` 导出 AppError 类（含 code 和 statusCode）
**And** Express 全局错误中间件捕获 AppError 并返回统一 ApiResponse 格式（AR19）
**And** React ErrorBoundary 捕获组件错误并显示 ErrorFallback UI（AR19）
**And** `tsc --noEmit` 编译通过

**Technical Notes:**
- AR6: Zod runtime schema 校验
- AR16: shared/ 目录结构
- AR18: ApiResponse<T> 统一响应格式
- AR19: AppError + ErrorBoundary + 全局错误中间件

### Story 0.3: 文件解析与路径工具基础设施

As a 开发者,
I want 拥有文件解析和路径处理工具函数,
So that 后续所有 Skill 文件读取和配置操作都有可靠的基础。

**Acceptance Criteria:**

**Given** server/utils/ 目录已创建
**When** 调用文件操作工具函数
**Then** `pathUtils.ts` 提供跨平台路径归一化函数，macOS/Windows/Linux 路径格式统一处理（NFR11）
**And** `frontmatterParser.ts` 使用 gray-matter 解析 YAML Frontmatter + Zod 校验，正确解析标准 Skill 文件（FR30）
**And** `frontmatterParser.ts` 对 YAML 语法错误返回清晰的解析失败信息
**And** `yamlUtils.ts` 提供 YAML 配置文件读写函数

**Technical Notes:**
- FR30: Frontmatter + Markdown 解析
- NFR11: 跨平台路径兼容
- 原子写入（AR11）、并发控制（AR12）、路径遍历防护（NFR6）推迟到 Epic 2 Story 2.0 实现，因为 Epic 0 阶段没有调用者

### Story 0.4: 暗色主题设计系统与空壳布局

As a 用户,
I want 看到一个暗色主题的开发者工具风格界面,
So that 我知道应用已正常运行并感受到专业的视觉体验。

**Acceptance Criteria:**

**Given** 用户在浏览器中打开应用
**When** 页面加载完成
**Then** 页面背景色为 Code Dark（#0F172A），主色调为 Run Green（#22C55E）（UX-DR3）
**And** CSS Variables 主题系统就位，映射到 shadcn/ui 组件（UX-DR3）
**And** Fira Code（标题/代码）和 Fira Sans（正文）字体正确加载，使用 font-display: swap + preload（UX-DR10）
**And** shadcn/ui 基础组件可用（Button、Card、Toast、Dialog 等）
**And** 按钮层级体系就位：Primary（绿色填充）、Secondary（暗色边框）、Ghost（透明）、Destructive（红色填充）（UX-DR17）
**And** 表单模式就位：标签在输入框上方、失焦验证、红色错误提示（UX-DR18）
**And** 三栏布局骨架渲染（侧边栏 + 主内容区 + 预览面板占位），5 个路由页面显示对应空壳内容
**And** Zustand 4 个空 Store 骨架就位（skill-store、workflow-store、sync-store、ui-store）（AR2）
**And** axe-core 扫描空壳页面 0 个 WCAG AA 违规（NFR10）
**And** Lighthouse Performance Score > 90（空壳基线）（NFR2）

**Technical Notes:**
- UX-DR3: 暗色主题设计系统
- UX-DR10: 字体系统
- UX-DR17: 按钮层级
- UX-DR18: 表单模式
- AR2: Zustand Store 骨架
- NFR2: 首次加载性能基线
- NFR10: WCAG AA 对比度

### Story 0.5: 配置文件读取与应用启动

As a 用户,
I want 应用启动时自动读取我的配置,
So that 我的分类和 IDE 路径设置在每次启动时都能正确加载。

**Acceptance Criteria:**

**Given** `config/settings.yaml` 和 `config/categories.yaml` 存在默认模板
**When** 应用启动
**Then** `configService.ts` 读取 `settings.yaml` 并解析为 AppConfig 对象（FR29）
**And** `configService.ts` 读取 `categories.yaml` 并解析为 Category[] 数组（FR29）
**And** `GET /api/config` 返回完整配置数据
**And** `GET /api/categories` 返回分类列表
**And** 配置文件不存在时使用内置默认值并自动创建配置文件
**And** 配置文件 YAML 语法错误时记录错误日志并使用默认值启动

**Technical Notes:**
- FR29: 启动时读取配置
- 默认分类：coding, writing, devops, workflows

---

## Epic 1: Skill 浏览与分类管理

用户可以浏览分类目录中的 Skill 卡片，查看 Markdown 渲染预览，搜索筛选，管理分类和 Skill 元数据。

### Story 1.1: 后端 Skill 扫描与缓存服务

As a 系统,
I want 启动时扫描 skills/ 目录并缓存所有 Skill 元数据,
So that 前端可以快速获取 Skill 列表而无需每次读取文件系统。

**Acceptance Criteria:**

**Given** skills/ 目录下存在 .md 文件（可能分布在子目录中）
**When** 应用启动
**Then** `skillService.ts` 递归扫描 skills/ 目录所有 .md 文件
**And** 使用 `frontmatterParser` 解析每个文件的 Frontmatter 为 SkillMeta 对象
**And** 缓存到内存 Map<id, SkillMeta>（AR3）
**And** `GET /api/skills` 返回所有 SkillMeta 列表
**And** `GET /api/skills/:id` 返回单个 Skill 的完整内容（meta + Markdown content）
**And** 解析失败的文件标记为 parseError 状态，不阻塞其他文件（FR33）
**And** 区分普通 Skill（无 type 字段）和工作流 Skill（type: workflow）（FR32）
**And** `POST /api/refresh` 触发重新扫描并更新缓存（FR31）

**Technical Notes:**
- AR3: 文件系统 + 内存缓存
- FR30/FR32/FR33: 解析、类型区分、错误处理

### Story 1.2: 分类目录树与卡片网格视图

As a 用户,
I want 在左侧看到分类目录树，在主区域看到 Skill 卡片网格,
So that 我可以按分类浏览所有 Skill。

**Acceptance Criteria:**

**Given** 用户打开应用首页（/）
**When** Skill 数据加载完成
**Then** 左侧边栏显示 CategoryTree 组件，展示分类名称和 Skill 计数，支持展开/折叠（FR1, UX-DR5）
**And** 点击分类时高亮 active 状态，主区域筛选显示该分类的 Skill（FR5）
**And** 主区域默认显示卡片网格视图，每张卡片展示名称、描述（截断 2 行）、分类标签、类型标识（FR2, UX-DR4）
**And** 卡片支持 hover/selected/focused 三种交互状态（UX-DR4）
**And** 三栏布局：侧边栏 240px + 主内容区 flex-1 + 预览面板 400px（UX-DR1）
**And** 侧边栏可通过 ⌘B 快捷键折叠/展开（UX-DR1, UX-DR12）
**And** 响应式布局：Compact（< 1024px 单栏）、Standard（1024-1439px 双栏）、Wide（≥ 1440px 三栏）（UX-DR11）
**And** Skill 列表使用虚拟滚动（AR10）

**Technical Notes:**
- UX-DR1: 三栏布局
- UX-DR4: SkillCard 组件
- UX-DR5: CategoryTree 组件
- AR10: @tanstack/react-virtual

### Story 1.3: Markdown 渲染预览

As a 用户,
I want 点击 Skill 卡片后在预览面板中查看完整的 Markdown 渲染内容,
So that 我可以快速了解 Skill 的详细内容。

**Acceptance Criteria:**

**Given** 用户在 Skill 列表中点击一张卡片
**When** 卡片被选中
**Then** 右侧预览面板展示该 Skill 的完整 Markdown 渲染内容（FR3）
**And** 渲染支持 GFM（表格、任务列表、删除线）和代码高亮（AR7）
**And** 预览面板顶部展示 Skill 的 Frontmatter 元数据（名称、描述、分类、标签、类型）（FR6）
**And** Markdown 渲染时间 < 500ms（50KB 文件）（NFR4）
**And** 正确处理 UTF-8 编码和中英文混合内容（NFR12）
**And** 可通过 Space 快捷键切换预览面板显示/隐藏（UX-DR12）

**Technical Notes:**
- AR7: react-markdown + remark-gfm + rehype-highlight
- NFR4: 渲染性能
- NFR12: UTF-8 编码

### Story 1.4: 搜索与 Command Palette

As a 用户,
I want 通过关键词搜索快速找到目标 Skill,
So that 我不需要在大量 Skill 中手动翻找。

**Acceptance Criteria:**

**Given** 用户在搜索框输入关键词或按 ⌘K 打开 Command Palette
**When** 输入搜索词
**Then** 搜索框实时模糊匹配 Skill 的名称、描述、标签字段（FR4）
**And** 多关键词以空格分隔，取 AND 逻辑（FR4）
**And** 搜索响应时间 < 200ms（500 个 Skill 规模）（NFR1）
**And** ⌘K Command Palette 支持 Skill 搜索、页面跳转、快速操作，搜索结果按类型分组（UX-DR2）
**And** 搜索无结果时显示空状态提示（UX-DR15）
**And** 支持 J/K 键盘导航搜索结果列表（UX-DR12）
**And** Escape 关闭 Command Palette（UX-DR12）

**Technical Notes:**
- AR5: Fuse.js 前端模糊搜索
- AR9: react-hotkeys-hook 快捷键
- NFR1: 搜索性能

### Story 1.5: 视图切换与列表视图

As a 用户,
I want 在卡片视图和列表视图之间切换,
So that 我可以根据偏好选择最舒适的浏览方式。

**Acceptance Criteria:**

**Given** 用户在 Skill 浏览页面
**When** 点击右上角视图切换图标
**Then** 在卡片视图（网格布局）和列表视图（紧凑单行）之间切换（UX-DR16）
**And** 视图偏好保存到 localStorage，下次打开自动恢复（UX-DR16）
**And** 两种视图都支持虚拟滚动（AR10）

### Story 1.6: 分类管理（CRUD）

As a 用户,
I want 添加、修改和删除 Skill 分类,
So that 我可以按自己的习惯组织 Skill。

**Acceptance Criteria:**

**Given** 用户在设置页面的分类管理区域
**When** 执行分类操作
**Then** 用户可以添加新分类（名称、显示名称、描述）（FR27）
**And** 用户可以修改已有分类的显示名称和描述（FR27）
**And** 用户可以删除空分类（无 Skill 的分类）（FR27）
**And** 删除非空分类时提示用户先移走 Skill
**And** 分类变更持久化到 `config/categories.yaml`（FR28）
**And** 分类变更后侧边栏目录树实时更新
**And** 设置页面无分类时显示空状态引导（FR36）

### Story 1.7: Skill 管理（删除、移动、编辑元数据）

As a 用户,
I want 删除、移动和编辑 Skill 的元数据,
So that 我可以整理和维护我的 Skill 资产。

**Acceptance Criteria:**

**Given** 用户在 Skill 浏览页面选中一个 Skill
**When** 执行管理操作
**Then** 用户可以删除 Skill 文件（FR25b），删除前弹出确认对话框
**And** 删除操作附带撤销按钮（5 秒内可撤销）（UX-DR14）
**And** 用户可以将 Skill 移动到其他分类（FR25c），文件物理移动到目标分类目录
**And** 用户可以编辑 Skill 的 Frontmatter 元数据（分类、标签、描述），但不能编辑 Markdown 正文（FR25d）
**And** 文件操作失败时提供清晰的错误提示（FR35）
**And** 所有操作通过 Toast 通知反馈结果（UX-DR14）

### Story 1.8: Toast 通知系统与无障碍完善

As a 用户,
I want 操作后收到清晰的反馈通知，并能通过键盘完成所有操作,
So that 我始终了解操作结果，且无障碍体验良好。

**Acceptance Criteria:**

**Given** 用户执行任何操作（增删改查）
**When** 操作完成
**Then** Toast 通知在右下角显示，最大堆叠 3 个（UX-DR14）
**And** 批量操作合并为汇总 Toast（UX-DR14）
**And** Error Toast 提供查看详情按钮（UX-DR14）
**And** 所有交互元素提供 ARIA 标签（NFR9）
**And** 焦点指示器为 2px solid Run Green（UX-DR13）
**And** 支持 prefers-reduced-motion（UX-DR13）
**And** 键盘导航：Tab 切换、Enter 确认、Esc 取消（NFR8）
**And** 焦点上下文隔离：输入框内单键快捷键失效（UX-DR12）
**And** 空状态引导：无 Skill 时提示从 IDE 导入（FR7, UX-DR15）

---

## Epic 2: IDE 导入与冷启动

用户可以从 CodeBuddy IDE 扫描并导入 Skill 文件到仓库中。

### Story 2.0: 安全写入与路径防护基础设施

As a 开发者,
I want 拥有安全的文件写入和路径防护工具函数,
So that 导入、移动等写操作能防止数据损坏和路径安全问题。

**Acceptance Criteria:**

**Given** server/utils/ 目录已包含 Story 0.3 的基础工具
**When** 调用安全写入工具函数
**Then** `fileUtils.ts` 提供 `atomicWrite` 函数（先写 .tmp 再 rename），中途中断不产生损坏文件（AR11）
**And** `fileUtils.ts` 提供 `safeWrite` 函数（基于 async-mutex 的并发控制），并发 10 次写入同一文件无损坏（AR12）
**And** `middleware/pathValidator.ts` 提供路径遍历防护中间件，拒绝 `../` 等路径注入（NFR6）
**And** 所有写入操作的错误（权限不足、磁盘空间不足等）返回清晰的错误信息（FR35）

**Technical Notes:**
- AR11: 原子写入（tmp + rename）
- AR12: async-mutex 并发控制
- NFR6: 路径遍历防护
- FR35: 文件操作失败错误提示（横切关注点）
- 从 Story 0.3 拆分而来，因为 Epic 0 阶段没有写操作调用者

### Story 2.1: IDE 目录扫描 API

As a 用户,
I want 系统扫描我的 CodeBuddy IDE 的 Skill 目录,
So that 我可以看到 IDE 中有哪些 Skill 可以导入。

**Acceptance Criteria:**

**Given** 用户点击导入页面的"扫描"按钮
**When** 系统执行扫描
**Then** 后端 `POST /api/sync/scan` 扫描默认 CodeBuddy 路径（`~/.codebuddy/skills/` 或用户配置路径）（FR20）
**And** 返回扫描发现的 Skill 文件列表（名称、描述、文件路径）（FR21）
**And** 对每个文件尝试解析 Frontmatter，解析失败的文件仍然列出但标记状态
**And** 扫描中显示 loading 状态（UX-DR19）
**And** 路径不存在时显示清晰错误提示（UX-DR19）
**And** 权限被拒时显示权限错误提示（UX-DR19）
**And** 目录为空时显示空目录提示（UX-DR19）
**And** 正确处理 UTF-8 编码和中英文文件名（NFR12）

### Story 2.2: 导入向导与分类选择

As a 用户,
I want 选择需要导入的 Skill 并为它们分配分类,
So that 导入的 Skill 能被正确归类管理。

**Acceptance Criteria:**

**Given** 扫描结果列表已展示
**When** 用户选择文件并执行导入
**Then** 用户可以逐个勾选或全选需要导入的 Skill 文件（FR22）
**And** 用户可以为选中的 Skill 选择分类归属（FR23）
**And** 支持批量选择多个 Skill 统一设置分类（FR23）
**And** ImportWizard 组件展示扫描结果列表、分类选择器、导入进度（UX-DR8）
**And** 导入页面无扫描结果时显示空状态引导（FR36）

### Story 2.3: 文件导入与 Frontmatter 补充

As a 用户,
I want 导入的 Skill 文件自动补充缺失的元数据,
So that 所有导入的 Skill 都有完整的 Frontmatter 信息。

**Acceptance Criteria:**

**Given** 用户确认导入选择
**When** 系统执行导入操作
**Then** 后端 `POST /api/sync/import` 将选中的 Skill 文件复制到对应分类目录（FR24）
**And** 自动补充缺失的 Frontmatter 字段：`category` 为用户选择的分类，`name` 缺失时使用文件名（去除扩展名），`description` 缺失时留空（FR24）
**And** 文件写入使用 async-mutex 并发控制（AR12）
**And** 导入完成后自动刷新 Skill 列表缓存
**And** 导入进度实时展示（UX-DR8）
**And** 文件复制失败时提供清晰的错误提示，包含失败文件名和原因（FR35）
**And** 导入完成后 Toast 通知显示结果（成功数/失败数）

### Story 2.4: 冷启动引导与导入后清理

As a 新用户,
I want 首次打开应用时被引导完成 Skill 导入,
So that 我能快速上手而不感到迷茫。

**Acceptance Criteria:**

**Given** 用户首次打开应用（skills/ 目录为空）
**When** 页面加载完成
**Then** 冷启动自动检测 CodeBuddy IDE 目录（通过 `GET /api/scan/codebuddy`）（UX-DR19）
**And** 检测到 Skill 时引导用户进入导入流程
**And** 检测不到时提示用户手动配置路径或跳过
**And** 用户可以选择导入后清理 IDE 中的原始 Skill 文件（FR25）
**And** 清理操作前弹出确认对话框，明确告知将删除原始文件
**And** 清理文件删除失败时提供清晰的错误提示（FR35）

---

## Epic 3: 工作流编排

用户可以编排多 Skill 工作流，生成标准工作流 .md 文件。

### Story 3.1: 工作流编排器布局与 Skill 选择

As a 用户,
I want 在编排器中浏览和选择 Skill 加入工作流,
So that 我可以开始组合多个 Skill 为一个工作流。

**Acceptance Criteria:**

**Given** 用户进入工作流编排页面（/workflow）
**When** 页面加载完成
**Then** 左侧展示所有可用 Skill 列表，支持搜索筛选（UX-DR6）
**And** 用户可以点击 Skill 将其添加到右侧工作流步骤列表（FR8）
**And** 用户可以为工作流设置名称和整体描述（FR11）
**And** 无工作流时显示空状态创建引导（FR36, UX-DR15）

### Story 3.2: 拖拽排序与步骤编辑

As a 用户,
I want 通过拖拽调整工作流步骤顺序并编辑每个步骤的描述,
So that 我可以精确控制工作流的执行顺序和每步的说明。

**Acceptance Criteria:**

**Given** 工作流中已添加多个步骤
**When** 用户调整步骤
**Then** 用户可以通过拖拽调整步骤执行顺序（FR9, AR8）
**And** 同时支持键盘排序 Alt+↑/↓（AR8, UX-DR6）
**And** 用户可以为每个 Step 填写描述文字（FR10, UX-DR6）
**And** 用户可以从工作流中移除已添加的 Step（FR14b）
**And** 步骤列表实时更新序号

**Technical Notes:**
- AR8: @dnd-kit/core + @dnd-kit/sortable

### Story 3.3: 工作流文件生成与预览

As a 用户,
I want 系统自动生成标准格式的工作流 .md 文件并预览,
So that 我可以确认生成结果后保存。

**Acceptance Criteria:**

**Given** 用户完成工作流编排（至少 1 个步骤）
**When** 用户点击"生成工作流"
**Then** 系统生成标准格式的工作流 .md 文件（FR12）
**And** Frontmatter 包含 `type: workflow`、`name`、`description`
**And** 正文包含 `## Step N` + `**使用 Skill:** \`name\`` 格式（FR12）
**And** 用户可以预览生成的工作流文件内容（FR13）
**And** 确认后文件自动保存到 `skills/workflows/` 目录（FR14）
**And** 保存成功后 Toast 通知并刷新 Skill 列表

### Story 3.4: 工作流管理（编辑与删除）

As a 用户,
I want 编辑已创建的工作流或删除不再需要的工作流,
So that 我可以持续优化工作流并保持列表整洁。

**Acceptance Criteria:**

**Given** 用户在工作流列表中选中一个已有工作流
**When** 用户点击编辑
**Then** 编排器加载该工作流的现有步骤、名称和描述（FR14d）
**And** 用户可以添加/移除步骤、调整顺序、修改步骤描述（FR14d, FR9, FR10, FR14b）
**And** 用户可以修改工作流名称和整体描述（FR11）
**And** 保存后覆盖原工作流 .md 文件（FR14d）
**And** 保存成功后 Toast 通知并刷新 Skill 列表

**Given** 用户在工作流列表中选中一个工作流
**When** 用户点击删除
**Then** 弹出确认对话框（FR14c）
**And** 确认后删除工作流 .md 文件
**And** 删除操作附带 5 秒撤销按钮（UX-DR14）
**And** 删除成功后刷新列表并 Toast 通知

---

## Epic 4: IDE 同步与路径配置

用户可以配置同步目标，一键同步 Skill 到 IDE 项目目录。

### Story 4.1: 同步目标路径配置

As a 用户,
I want 配置 IDE 同步目标路径,
So that 系统知道将 Skill 文件同步到哪里。

**Acceptance Criteria:**

**Given** 用户在同步管理页面或设置页面
**When** 配置同步目标
**Then** 用户可以查看已配置的 IDE 同步目标列表（FR15）
**And** 用户可以添加、修改和删除同步目标路径（FR26）
**And** 同步目标路径为绝对路径，支持配置多个项目路径（FR17b）
**And** 配置变更持久化到 `config/settings.yaml`（FR28）
**And** 路径合法性校验（NFR7），非法路径给出清晰提示
**And** 无同步目标时显示空状态设置引导（FR36, UX-DR15）

### Story 4.2: Skill 选择与批量操作

As a 用户,
I want 选择需要同步的 Skill 并支持按分类批量选择,
So that 我可以高效地选择要同步的内容。

**Acceptance Criteria:**

**Given** 用户在同步管理页面
**When** 选择 Skill
**Then** SyncPanel 展示 Skill 勾选列表（UX-DR7）
**And** 用户可以逐个勾选或按分类批量选择（FR16）
**And** 选择列表显示 Skill 名称、分类、类型标识
**And** 顶部显示已选数量统计

### Story 4.3: 一键同步执行与结果日志

As a 用户,
I want 一键将选定的 Skill 同步到 IDE 目录并查看结果,
So that 我的 IDE 中立刻可以使用最新的 Skill。

**Acceptance Criteria:**

**Given** 用户已选择同步目标和 Skill 列表
**When** 用户点击"同步"按钮
**Then** 系统检查目标路径是否存在，不存在时提示并提供自动创建选项（FR19）
**And** 将选定的 Skill 文件扁平化复制到目标 IDE 目录（不保留分类子目录结构）（FR17）
**And** 同名文件默认覆盖并在日志中标注（FR17c）
**And** 文件写入使用原子写入（AR11）
**And** 同步进度条实时展示（UX-DR7）
**And** 同步完成后展示结果日志（成功数、覆盖数、失败数、详细列表）（FR18）
**And** 同步操作耗时 < 2s（100 个文件）（NFR3）
**And** 同步失败时提供详细错误信息和恢复建议（FR34）
**And** 文件操作失败时提供清晰错误提示（FR35）

### Story 4.4: 同步状态指示器

As a 用户,
I want 在任何页面都能看到最近的同步状态,
So that 我随时了解 Skill 是否已同步到 IDE。

**Acceptance Criteria:**

**Given** 用户在应用的任何页面
**When** 查看顶部栏右侧
**Then** StatusIndicator 显示同步状态（🟢 已同步 · 3 min ago）（UX-DR9）
**And** 点击 StatusIndicator 跳转到同步管理页面（UX-DR9）
**And** 同步进行中时显示 loading 动画
**And** 同步失败时显示红色警告状态
