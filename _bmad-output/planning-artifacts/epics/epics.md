---
stepsCompleted:
  [
    "step-01-validate-prerequisites",
    "step-02-design-epics",
    "step-03-create-stories",
    "step-04-final-validation",
  ]
inputDocuments:
  - "prd.md"
  - "architecture.md"
  - "ux-design-specification.md"
  - "prd-category-settings-and-bundles.md"
  - "prd-epic6-ux-polish.md"
  - "prd-sidebar-redesign.md"
  - "prd-external-skills-hub.md"
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

| FR      | Epic         | 说明                                                            |
| ------- | ------------ | --------------------------------------------------------------- |
| FR1     | Epic 1       | 分类目录树浏览                                                  |
| FR2     | Epic 1       | 卡片网格视图                                                    |
| FR3     | Epic 1       | Markdown 渲染预览                                               |
| FR4     | Epic 1       | 关键词搜索                                                      |
| FR5     | Epic 1       | 分类筛选                                                        |
| FR6     | Epic 1       | Frontmatter 元数据查看                                          |
| FR7     | Epic 1       | 空状态引导（浏览模块）                                          |
| FR8     | Epic 3       | 选择 Skill 加入工作流                                           |
| FR9     | Epic 3       | 拖拽排序                                                        |
| FR10    | Epic 3       | Step 描述编辑                                                   |
| FR11    | Epic 3       | 工作流名称和描述                                                |
| FR12    | Epic 3       | 自动生成工作流 .md 文件                                         |
| FR13    | Epic 3       | 预览工作流文件                                                  |
| FR14    | Epic 3       | 工作流文件自动保存                                              |
| FR14b   | Epic 3       | 移除工作流 Step                                                 |
| FR14c   | Epic 3       | 删除工作流 Skill                                                |
| FR14d   | Epic 3       | 编辑已创建的工作流                                              |
| FR15    | Epic 4       | IDE 同步目标列表                                                |
| FR16    | Epic 4       | 选择同步 Skill                                                  |
| FR17    | Epic 4       | 扁平化复制同步                                                  |
| FR17b   | Epic 4       | 绝对路径多项目配置                                              |
| FR17c   | Epic 4       | 同名文件覆盖策略                                                |
| FR18    | Epic 4       | 同步结果展示                                                    |
| FR19    | Epic 4       | 同步前路径检查                                                  |
| FR20    | Epic 2       | 触发 IDE 目录扫描                                               |
| FR21    | Epic 2       | 扫描结果列表展示                                                |
| FR22    | Epic 2       | 选择导入文件                                                    |
| FR23    | Epic 2       | 导入时分类选择                                                  |
| FR24    | Epic 2       | 文件复制与 Frontmatter 补充                                     |
| FR25    | Epic 2       | 导入后清理原始文件                                              |
| FR25b   | Epic 1       | 删除 Skill                                                      |
| FR25c   | Epic 1       | 移动 Skill 分类                                                 |
| FR25d   | Epic 1       | 编辑 Frontmatter 元数据                                         |
| FR26    | Epic 4       | IDE 同步路径配置                                                |
| FR27    | Epic 1       | 分类 CRUD 管理                                                  |
| FR28    | Epic 1       | 配置持久化到 YAML                                               |
| FR29    | Epic 0       | 启动时读取配置                                                  |
| FR30    | Epic 0       | Frontmatter + Markdown 解析                                     |
| FR31    | Epic 1       | 手动刷新更新数据                                                |
| FR32    | Epic 1       | 区分普通 Skill 和工作流 Skill                                   |
| FR33    | Epic 1       | Frontmatter 解析错误处理                                        |
| FR34    | Epic 4       | 同步失败错误处理                                                |
| FR35    | Epic 1/2/4   | 文件操作失败错误提示（横切关注点：所有涉及文件读写删除的 Epic） |
| FR36    | Epic 1/2/3/4 | 各模块独立空状态引导（拆分到各 Epic）                           |
| FR-S1-1 | Epic 7       | 移除主 Sidebar「分类」导航项                                    |
| FR-S1-2 | Epic 7       | Skill 库页面展示二级 Sidebar（CategoryTree）                    |
| FR-S1-3 | Epic 7       | 二级 Sidebar 仅在路由 `/` 时可见                                |
| FR-S1-4 | Epic 7       | 二级 Sidebar 固定宽度 + 视觉分隔线                              |
| FR-S1-5 | Epic 7       | 二级 Sidebar 只读筛选，分类管理入口保留在设置页                 |
| FR-S2-1 | Epic 7       | Sidebar 展示系统统计信息（Skill / 工作流 / 分类总数）           |
| FR-S2-2 | Epic 7       | 统计数字实时反映数据状态                                        |
| FR-S2-3 | Epic 7       | 统计区块紧凑布局（图标 + 数字 + 标签）                          |
| FR-S2-4 | Epic 7       | 活跃度热力图（类 GitHub Contribution Graph）                    |
| FR-S2-5 | Epic 7       | 热力图数据来源：文件 mtime，统计近 12 周                        |
| FR-S2-6 | Epic 7       | 热力图颜色深浅表示当日修改文件数量                              |
| FR-S2-7 | Epic 7       | 热力图豆点 Tooltip（YYYY-MM-DD · N 次修改）                     |
| FR-S2-8 | Epic 7       | 热力图宽度自适应 Sidebar 宽度                                   |
| FR-S2-9 | Epic 7       | 热力图数据在文件操作后触发重新计算                              |
| FR-S3-1 | Epic 7       | 分类管理 Tab 切换使用滑块平移动画                               |
| FR-S3-2 | Epic 7       | 动画时长 200ms，缓动 ease-in-out                                |
| FR-S3-3 | Epic 7       | 滑块动画使用 CSS transform: translateX()                        |
| FR-S3-4 | Epic 7       | Tab 内容区域切换可直接切换或淡入淡出                            |
| FR-S3-5 | Epic 7       | 遵循 prefers-reduced-motion 优雅降级                            |

### NFR Coverage Map

| NFR    | Epic             | 说明                                           |
| ------ | ---------------- | ---------------------------------------------- |
| NFR1   | Epic 1           | 搜索性能基准 < 200ms                           |
| NFR2   | Epic 0           | 首次加载性能基线 < 2s                          |
| NFR3   | Epic 4           | 同步性能 < 2s                                  |
| NFR4   | Epic 1           | Markdown 渲染性能 < 500ms                      |
| NFR5   | Epic 0           | localhost 绑定验证                             |
| NFR6   | Epic 0 + Epic 1  | 路径遍历防护                                   |
| NFR7   | Epic 4           | 同步路径合法性校验                             |
| NFR8   | Epic 1           | 键盘导航                                       |
| NFR9   | Epic 0 + 各 Epic | ARIA 标签（横切关注点）                        |
| NFR10  | Epic 0           | WCAG AA 对比度                                 |
| NFR11  | Epic 0 + 各 Epic | 跨平台路径兼容（横切关注点）                   |
| NFR12  | Epic 1 + Epic 2  | UTF-8 编码与中英文支持                         |
| NFR-S1 | Epic 7           | 二级 Sidebar 显示/隐藏平滑过渡动画，无布局抖动 |
| NFR-S2 | Epic 7           | 热力图数据计算在后端完成，不阻塞主线程         |
| NFR-S3 | Epic 7           | 热力图响应式重布局，不溢出或截断               |
| NFR-S4 | Epic 7           | 所有新增动画遵循 prefers-reduced-motion        |
| NFR-S5 | Epic 7           | 本次改动不影响现有路由结构和其他页面功能       |

### AR Coverage Map

| AR   | Epic                                   | 说明                                      |
| ---- | -------------------------------------- | ----------------------------------------- |
| AR1  | Epic 0                                 | Vite + React + Express 项目搭建           |
| AR2  | Epic 0                                 | Zustand Store 骨架                        |
| AR3  | Epic 1                                 | 文件系统扫描 + 内存缓存                   |
| AR4  | Epic 0（REST 骨架）                    | REST API 基础；SSE 推迟到需要时引入       |
| AR5  | Epic 1                                 | Fuse.js 前端搜索                          |
| AR6  | Epic 0                                 | Zod schema 校验                           |
| AR7  | Epic 1                                 | react-markdown 渲染                       |
| AR8  | Epic 3                                 | @dnd-kit 拖拽排序                         |
| AR9  | Epic 1                                 | react-hotkeys-hook 快捷键                 |
| AR10 | Epic 1                                 | @tanstack/react-virtual 虚拟滚动          |
| AR11 | Epic 0（代码就位）+ Epic 4（首次使用） | 原子写入                                  |
| AR12 | Epic 0（代码就位）+ Epic 2（首次使用） | async-mutex 并发控制                      |
| AR13 | Post-MVP                               | MVP 不使用文件监听（FR31），AR13 不适用   |
| AR14 | Epic 0                                 | React Router 5 个路由                     |
| AR15 | Epic 0                                 | CLI 命令（bin/cli.js）                    |
| AR16 | Epic 0                                 | shared/ 目录类型定义（渐进扩展）          |
| AR17 | Epic 0                                 | Express 绑定 127.0.0.1 + 路径遍历防护     |
| AR18 | Epic 0                                 | ApiResponse<T> 统一响应格式               |
| AR19 | Epic 0                                 | AppError + ErrorBoundary + 全局错误中间件 |
| AR20 | Epic 0                                 | concurrently 启动脚本                     |

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

### Epic 1.5: UI 视觉优化与组件补全

UI 视觉质感全面提升：补全 shadcn/ui 组件基础设施（Input/Select/Checkbox/Badge/Separator/Tooltip/AlertDialog/Dialog/ScrollArea），添加顶部栏与状态栏布局骨架，侧边栏活跃状态绿色竖线，统一所有页面手写样式为组件化实现，占位页面空状态设计，预览面板滑入动画，emoji 图标全部替换为 Lucide SVG。
**UX-DRs:** UX-DR1(顶部栏/状态栏补全), UX-DR3(组件映射完善), UX-DR9(状态指示器占位), UX-DR13(无障碍增强), UX-DR14(Toast堆叠), UX-DR15(占位页空状态), UX-DR17(按钮层级统一)
**NFRs:** NFR8, NFR9, NFR10
**限制：** 不超过 6 个 Story / 4 天工时

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

### Epic 5: 分类设置页重组织 & 套件管理

用户可以在重组织后的分类页中管理分类和套件，通过套件将常用分类组合保存并一键激活，在不同工作场景下快速切换分类配置。
**FRs:** FR-CS-01 ~ FR-CS-24（来源：prd-category-settings-and-bundles.md）
**NFRs:** NFR-CS-01 ~ NFR-CS-06
**Stories:** 5.1（后端基础层）、5.2（API 路由层）、5.3（页面 Tab 化）、5.4（套件 CRUD UI）、5.5（套件激活）、5.6（损坏引用处理）

### Epic 6: UX 体验全面优化

基于全页面实地体验审计，修复分类计数与 Skill 归属脱节、工作流缺少已有列表入口、同步页引导断裂、导入页路径预设割裂、Command Palette 缺少描述摘要等 6 类用户体验痛点，打通已有功能的"最后一公里"。
**FRs:** FR-E6-01 ~ FR-E6-12（来源：prd-epic6-ux-polish.md）
**NFRs:** NFR-E6-01 ~ NFR-E6-03
**依赖:** Epic 3/4（工作流功能）→ Story 6-2；Epic 5（路径预设）→ Story 6-3
**Stories:** 6.1（分类系统数据一致性修复）、6.2（工作流已有列表管理）、6.3（同步页引导 + 导入页预设集成）、6.4（Command Palette 搜索增强）

### Epic 7: Sidebar 重设计与交互优化

Sidebar 从单纯导航工具升级为「系统状态仪表盘」：分类目录树迁移至 Skill 库二级 Sidebar，主 Sidebar 新增系统统计面板（Skill / 工作流 / 分类总数）和活跃度热力图（近 12 周豆点图），分类管理 Tab 切换增加滑块平移动画。
**FRs:** FR-S1-1 ~ FR-S1-5, FR-S2-1 ~ FR-S2-9, FR-S3-1 ~ FR-S3-5（来源：prd-sidebar-redesign.md）
**NFRs:** NFR-S1 ~ NFR-S5
**ARs:** AD-23（二级 Sidebar）、AD-24（StatsPanel + ActivityHeatmap）、AD-25（Tab 滑块动画）
**依赖:** Epic 1（CategoryTree 组件已就绪）、Epic 5（SettingsPage Tab 结构已就绪）
**Stories:** 7.1（分类导航迁移至二级 Sidebar）、7.2（Sidebar 系统状态面板 + 活跃度热力图）、7.3（分类管理 Tab 滑块动画）

### Epic 8: External Skills Hub（外部技能仓库聚合与管理）

系统从「个人 Skill 资产管理」扩展为「技能生态聚合平台」：通过配置文件驱动的多仓库注册机制，自动从 GitHub 仓库（首批：`anthropics/skills`）拉取高质量 Skill，经过白名单/黑名单筛选后同步到项目 `skills/` 目录。外部 Skill 带有来源标签（可点击跳转 GitHub 仓库），以只读模式管理。预设分类从 4 个扩展到 9 个，所有出厂分类聚合为默认套件。GitHub Action 定时自动同步并创建 PR。
**FRs:** FR-EH-01 ~ FR-EH-36（来源：prd-external-skills-hub.md）
**NFRs:** NFR-EH-01 ~ NFR-EH-11
**ARs:** AD-31（仓库配置 Schema）、AD-32（.gitignore）、AD-33（GitHub Action 权限）、AD-34（同步脚本）、AD-35（Frontmatter 解析扩展）、AD-36（只读错误处理）、AD-37（前端来源标签 UI）、AD-38（分类扩展）、AD-39（默认套件自动创建）、AD-40（边界情况容错）
**依赖:** Epic 1（SkillCard/SkillPreview 组件已就绪）、Epic 5（bundleService 已就绪）
**Stories:** 8.1（SkillMeta 类型扩展与 Schema 更新）、8.2（仓库配置文件与解析）、8.3（预设分类扩展与默认套件）、8.4（后端只读保护）、8.5（前端来源标签与只读标识）、8.6（同步脚本核心逻辑）、8.7（GitHub Action 工作流）

### 依赖关系

```
        Epic 0 (脚手架)
            │
        Epic 1 (浏览+分类)
            │
        Epic 1.5 (UI 视觉优化)
       ╱    │    ╲
    Epic 2  Epic 3  Epic 4
   (导入)  (编排)  (同步)
            │
        Epic 5 (分类设置页 & 套件)
            │
        Epic 6 (UX 体验全面优化)
            │
        Epic 7 (Sidebar 重设计)
            │
        Epic 8 (External Skills Hub)
```

- Epic 0 → Epic 1：线性依赖
- Epic 1 → Epic 1.5：线性依赖（UI 优化基于 Epic 1 已实现的组件和页面）
- Epic 1.5 → Epic 2/3/4：钻石依赖（2/3/4 之间无相互依赖，但都依赖 Epic 1 的 Skill CRUD API 和分类 API，且受益于 Epic 1.5 的组件基础设施）
- Epic 5 → Epic 7：Epic 7 的 Story 7.3 依赖 Epic 5 已完成的 SettingsPage Tab 结构
- Epic 1 → Epic 7：Epic 7 的 Story 7.1 依赖 Epic 1 已完成的 CategoryTree 组件
- Epic 1 + Epic 5 → Epic 8：Epic 8 依赖 Epic 1 的 SkillCard/SkillPreview 组件和 Epic 5 的 bundleService
- **Epic 8 可与 Epic 7 并行**：两者无相互依赖，都依赖 Epic 1 和 Epic 5
- **建议执行顺序**：Epic 2 当前 in-progress，Epic 1.5 可在 Epic 2 完成后立即执行，也可与 Epic 2 剩余 stories 并行（UI 优化不影响后端逻辑）
- 单人开发时按 Epic 2 → 1.5 → 3 → 4 串行；多人可 Epic 2 + 1.5 并行

### Story 生命周期（强制质量门禁）

每个 Story 必须严格遵循以下完整生命周期，**不允许跳过 QA 和 CR 阶段**：

```
backlog → ready-for-dev → in-progress → qa → review → done
```

| 阶段          | 动作               | 工具                             | 门禁条件                                         |
| ------------- | ------------------ | -------------------------------- | ------------------------------------------------ |
| ready-for-dev | 创建 Story 文件    | `bmad-create-story`              | Story 文件包含完整 AC 和上下文                   |
| in-progress   | 实现 + 单元测试    | `bmad-dev-story`                 | 每个 task 有单元测试，`tsc --noEmit` 通过        |
| **qa**        | **测试覆盖验证**   | **`bmad-qa-generate-e2e-tests`** | **集成/E2E 测试覆盖所有 AC，全量测试 100% 通过** |
| **review**    | **对抗式代码审查** | **`bmad-code-review`**           | **审查通过，无阻塞性问题**                       |
| done          | 签收完成           | —                                | 实现 + 测试 + 审查全部通过                       |

**回退规则：**

- qa 阶段测试失败 → 回退到 in-progress 修复
- review 阶段发现问题 → 回退到 in-progress 修复 → 重新走 qa → review

**Story 文件 Dev Agent Record 必须记录：**

- ✅ 每个 task 的实现和单元测试结果
- ✅ QA 阶段：生成的测试文件列表、测试通过/失败数
- ✅ CR 阶段：审查发现、解决方案、最终审查结论

### 对抗式审查决议

本 Epic 方案经过以下团队成员的对抗式审查：

| 审查者     | 角色            | 关键贡献                                                            |
| ---------- | --------------- | ------------------------------------------------------------------- |
| 📋 John    | Product Manager | 发现 Epic 1 过载问题；将分类管理前置；合并过薄的 Skill 管理 Epic    |
| 🏗️ Winston | Architect       | 确认 AR13 在 MVP 不适用；SSE 简化为 REST-only；shared/ 渐进扩展原则 |
| 🧪 Murat   | Test Architect  | 要求 12 个 NFR 显式映射到 Epic；识别跨 Epic 集成测试风险点          |

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

## Epic 1.5: UI 视觉优化与组件补全

UI 视觉质感全面提升：补全 shadcn/ui 组件基础设施，添加顶部栏与状态栏布局骨架，统一所有页面的手写样式为组件化实现，消除原生 HTML 元素与暗色主题的割裂感。

### 设计系统参考（ui-ux-pro-max）

| 维度     | 规范                                                                                  |
| -------- | ------------------------------------------------------------------------------------- |
| **配色** | Code Dark #0F172A + Run Green #22C55E + Surface #1E293B + Elevated #334155            |
| **字体** | Fira Code（标题/代码）+ Fira Sans（正文），本地 woff2                                 |
| **风格** | 现代开发者工具风格，大间距（48px+ gaps），bold hover（color shift），200-300ms 过渡   |
| **图标** | Lucide React SVG 图标，**禁止使用 emoji 作为 UI 图标**                                |
| **交互** | 所有可点击元素 `cursor-pointer`，hover 提供清晰视觉反馈，smooth transitions 150-300ms |
| **避免** | 扁平无层次设计、文字堆砌页面、layout shift 的 hover 效果                              |

### Story 1.5.1: shadcn/ui 组件补全与统一

As a 开发者,
I want 拥有完整的 shadcn/ui 组件基础设施,
So that 所有 UI 元素视觉风格统一，不再出现原生 HTML 元素与暗色主题的割裂。

**Acceptance Criteria:**

**Given** 当前仅有 Button 和 Card 两个 shadcn/ui 组件
**When** 补全组件库
**Then** 以下 shadcn/ui 组件全部可用且映射到暗色主题 CSS Variables：

- `Input` — 替代所有手写 `<input>` 元素
- `Select` / `SelectTrigger` / `SelectContent` / `SelectItem` — 替代所有原生 `<select>`
- `Checkbox` — 替代所有原生 `<input type="checkbox">`
- `Badge` — 用于分类标签、状态标签、类型标识
- `Separator` — 替代所有 `<div>` + border 分割线
- `Tooltip` — 替代所有 `title` 属性的操作提示
- `AlertDialog` — 替代所有 `window.confirm()` 原生弹窗
- `Dialog` — 用于 Frontmatter 编辑等表单弹窗
- `ScrollArea` — 用于侧边栏和预览面板的滚动区域
  **And** 所有组件使用 `hsl(var(--xxx))` CSS Variables，与暗色主题一致
  **And** 所有组件支持 `:focus-visible` 焦点指示器（2px solid Run Green）
  **And** `tsc --noEmit` 编译通过

**Technical Notes:**

- 参考 shadcn/ui 官方文档创建组件（代码复制到项目中，非 npm 依赖）
- 组件放置在 `src/components/ui/` 目录
- 使用 `cva` + `cn()` 工具函数保持一致性
- 禁止使用原生 `<select>`，必须使用 `<Select>` 组件（shadcn 最佳实践）

### Story 1.5.2: 顶部栏（Header）与状态栏（StatusBar）布局

As a 用户,
I want 看到一个完整的应用框架（顶部栏 + 状态栏）,
So that 应用具有专业的开发者工具质感，而不是一个半成品。

**Acceptance Criteria:**

**Given** 用户打开应用
**When** 页面渲染完成
**Then** 顶部栏（Header）包含以下元素：

- 左侧：应用 Logo（⚡ 图标 + "Skill Manager" 文字，Fira Code 字体）
- 中间：全局搜索入口（显示 "⌘K 搜索 Skill..." 占位符，点击触发 Command Palette）
- 右侧：同步状态指示器占位（显示 "🟢 已同步" 或 "— 未配置"）
  **And** 状态栏（StatusBar）位于页面底部，包含：
- 左侧：应用版本号（v0.1.0）
- 中间：Skill 总数统计（如 "32 Skills"）
- 右侧：最后操作时间（如 "最后同步: 3 min ago"）
  **And** 顶部栏固定在页面顶部，不随内容滚动
  **And** 状态栏固定在页面底部，不随内容滚动
  **And** 三栏布局调整为：顶部栏 → 中间区域（侧边栏 + 主内容 + 预览面板）→ 状态栏
  **And** Logo 从侧边栏移至顶部栏，侧边栏顶部直接显示导航菜单
  **And** 搜索框从 SkillBrowsePage 移至顶部栏（全局可用）

**Technical Notes:**

- 创建 `src/components/layout/Header.tsx` 和 `src/components/layout/StatusBar.tsx`
- 修改 `AppLayout.tsx` 为垂直布局：Header → flex row（Sidebar + Main + Preview）→ StatusBar
- Header 高度固定 48px，StatusBar 高度固定 28px
- 顶部栏背景色使用 `--card`（#1E293B），底部边框使用 `--border`
- 状态栏背景色使用 `--background`（#0F172A），顶部边框使用 `--border`，文字使用 `--muted-foreground`

### Story 1.5.3: 侧边栏视觉增强

As a 用户,
I want 侧边栏导航具有清晰的活跃状态指示和精致的视觉层次,
So that 我能一眼看出当前所在页面，导航体验流畅。

**Acceptance Criteria:**

**Given** 用户在侧边栏中导航
**When** 点击某个导航项
**Then** 活跃状态的导航项左侧显示 2px 宽的 Run Green (#22C55E) 竖线指示器
**And** 活跃状态文字颜色为 Run Green，背景色为 `--accent`
**And** 非活跃状态 hover 时背景色平滑过渡（200ms）到 `--accent`
**And** 分类目录树使用 `ScrollArea` 组件替代原生滚动
**And** 分类目录树支持 `Collapsible` 折叠/展开动画
**And** 分类项的 Skill 计数使用 `Badge` 组件显示
**And** 侧边栏底部版本号移至 StatusBar，侧边栏底部空间释放
**And** 所有导航项 hover 时显示 `cursor-pointer`

**Technical Notes:**

- 活跃状态竖线使用 `border-l-2 border-[hsl(var(--primary))]` 实现
- 分类折叠使用 Radix UI `Collapsible` 组件
- 过渡动画使用 `transition-colors duration-200`

### Story 1.5.4: 页面级样式统一与手写样式替换

As a 开发者,
I want 所有页面中的手写 inline Tailwind 样式替换为 shadcn/ui 组件,
So that 视觉风格完全统一，代码可维护性提升。

**Acceptance Criteria:**

**Given** SkillBrowsePage、ImportPage、SettingsPage 中存在大量手写样式
**When** 完成样式统一
**Then** SkillBrowsePage 中：

- 搜索框使用 `Input` 组件（搜索框已移至 Header，页面内仅保留筛选功能）
- 视图切换按钮组使用 `Button` 组件（variant: ghost/outline）
- 刷新按钮使用 `Button` 组件（variant: outline, size: icon）
- 冷启动引导区域使用 `Card` + `Badge` 组件
- 空状态和错误提示使用统一的 `Alert` 样式
  **And** ImportPage 中：
- 扫描路径输入框使用 `Input` 组件
- 扫描按钮使用 `Button` 组件
- 分类选择器使用 `Select` 组件替代原生 `<select>`
- 文件勾选使用 `Checkbox` 组件替代原生 checkbox
- 确认删除使用 `AlertDialog` 组件替代 `window.confirm()`
- 文件列表分割线使用 `Separator` 组件
  **And** SettingsPage / CategoryManager 中：
- 所有表单输入使用 `Input` 组件
- 所有按钮使用 `Button` 组件
- 删除确认使用 `AlertDialog` 组件
  **And** SkillCard 中：
- 分类标签使用 `Badge` 组件
- 类型标识使用 `Badge` 组件（variant: secondary）
- 标签使用 `Badge` 组件（variant: outline）
  **And** SkillPreview 中：
- 元数据标签使用 `Badge` 组件
- 编辑按钮使用 `Button` 组件（variant: ghost, size: icon）
- 滚动区域使用 `ScrollArea` 组件
  **And** MetadataEditor 中：
- 所有表单使用 `Input` / `Select` 组件
- 保存/取消按钮使用 `Button` 组件
  **And** 所有操作按钮 hover 时有 `Tooltip` 提示
  **And** 所有手写的 `border-[hsl(var(--border))]` 分割线替换为 `Separator`

**Technical Notes:**

- 逐页面替换，每替换一个页面后运行 `tsc --noEmit` 确认无类型错误
- Badge 变体：default（绿色，分类）、secondary（蓝色，类型）、outline（灰色，标签）
- 保持所有现有功能不变，仅替换视觉实现

### Story 1.5.5: 占位页面空状态设计与预览面板增强

As a 用户,
I want 未完成的功能页面有精致的空状态引导，预览面板有流畅的过渡动画,
So that 整个应用没有"半成品"的感觉。

**Acceptance Criteria:**

**Given** 用户访问 WorkflowPage 或 SyncPage
**When** 页面渲染完成
**Then** WorkflowPage 显示精致的空状态：

- Lucide `GitBranch` SVG 图标（48px，`--primary` 色，opacity 0.6）
- 标题："工作流编排"（Fira Code，20px）
- 描述："组合多个 Skill 创建自动化工作流，即将推出"（Fira Sans，14px，`--muted-foreground`）
- 状态标签：`Badge` 显示 "Coming Soon"（`--info` 色）
  **And** SyncPage 显示精致的空状态：
- Lucide `RefreshCw` SVG 图标（48px，`--primary` 色，opacity 0.6）
- 标题："IDE 同步"（Fira Code，20px）
- 描述："将 Skill 同步到 IDE 项目目录，即将推出"（Fira Sans，14px，`--muted-foreground`）
- 状态标签：`Badge` 显示 "Coming Soon"（`--info` 色）
  **And** 预览面板（SkillPreview）增强：
- 打开时有从右侧滑入的过渡动画（transform translateX，200ms ease-out）
- 面板顶部有明显的关闭按钮（`X` 图标，`Button` ghost variant）
- 关闭按钮点击后面板滑出并关闭
- 支持 `prefers-reduced-motion` 时禁用动画
  **And** 所有空状态使用 Lucide SVG 图标，**禁止使用 emoji 图标**（📭 📂 🔍 等全部替换为 SVG）
  **And** EmptyState 组件中的 emoji 替换为对应的 Lucide 图标

**Technical Notes:**

- 预览面板动画使用 CSS transition + Tailwind 类名切换
- 空状态图标统一使用 Lucide React，size=48，className 包含 opacity
- 替换清单：📭→Package、📂→FolderOpen、🔍→Search、📦→Package、⚡→Zap、🔄→RefreshCw、📥→Download
- 侧边栏 Logo 中的 ⚡ emoji 替换为 Lucide `Zap` SVG 图标

### Story 1.5.6: 视觉微调与一致性收尾

As a 用户,
I want 整个应用的视觉细节精致统一,
So that 每个像素都体现专业的开发者工具品质。

**Acceptance Criteria:**

**Given** 所有前置 Story 已完成
**When** 进行最终视觉审查
**Then** 卡片网格间距统一为 16px（gap-4），卡片内边距统一为 16px（p-4）
**And** 所有圆角统一：卡片 8px（rounded-lg）、输入框 6px（rounded-md）、标签 4px（rounded-sm）
**And** 所有 hover 过渡时间统一为 200ms（`transition-colors duration-200`）
**And** 所有文本层级严格遵循字体规范：

- H1: Fira Code, 24px, 700
- H2: Fira Code, 20px, 600
- Body: Fira Sans, 14px, 400
- Small: Fira Sans, 12px, 400
  **And** 所有信息性文本对比度 ≥ 4.5:1（WCAG AA），装饰性文本除外
  **And** Toast 通知系统增强：最大堆叠 3 个，超出时最早的自动消失
  **And** Command Palette 搜索结果按类型分组显示（Skills / 快速操作）
  **And** axe-core 扫描所有页面 0 个 WCAG AA 违规
  **And** `tsc --noEmit` 编译通过
  **And** `npm run build` 构建成功

**Technical Notes:**

- 使用 axe-core 或浏览器 DevTools Accessibility 面板验证对比度
- Toast 堆叠限制在 ToastContainer 组件中实现
- Command Palette 分组使用 cmdk 的 `Command.Group` API

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
**And** 正文包含 `## Step N` + `**使用 Skill:** \`name\``格式（FR12）
**And** 用户可以预览生成的工作流文件内容（FR13）
**And** 确认后文件自动保存到`skills/workflows/` 目录（FR14）
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

### Story 4.5: 工作流 Markdown 解析后移后端（Epic 3 回顾改进）

As a 开发者,
I want 后端提供结构化的工作流数据 API,
So that 前端不需要解析 Markdown 格式，降低耦合和脆弱性。

**Acceptance Criteria:**

**Given** 前端请求工作流详情
**When** 调用 `GET /api/workflows/:id` 端点
**Then** 后端返回结构化的工作流数据（包含 name、description、steps 数组）
**And** 前端 WorkflowList 组件移除 Markdown 正则解析逻辑，改用 API 返回的结构化数据
**And** 已有工作流功能（编辑、删除）行为不变

**Technical Notes:**

- 来源：Epic 3 回顾 — 前端不应解析后端数据格式
- 当前 WorkflowList.tsx 中 `handleEdit` 使用正则解析 Markdown 步骤，脆弱且违反职责分离

### Story 4.6: WorkflowPreview 组件测试补全（Epic 3 回顾改进）

As a 开发者,
I want WorkflowPreview 组件有完整的单元测试覆盖,
So that 预览和保存功能的正确性有测试保障。

**Acceptance Criteria:**

**Given** WorkflowPreview 组件
**When** 运行测试套件
**Then** 覆盖以下场景：预览按钮禁用/启用状态、预览 API 调用、保存（新建/编辑模式）、loading 状态、错误处理、Toast 通知
**And** 所有测试通过

**Technical Notes:**

- 来源：Epic 3 回顾 — WorkflowPreview 是唯一缺少测试的工作流组件
- 组件包含 API 调用（预览和保存）、loading 状态管理、编辑/新建模式切换

### Story 4.7: 工作流删除撤销功能（Epic 3 回顾改进）

As a 用户,
I want 删除工作流后有 5 秒撤销窗口,
So that 我可以在误删时快速恢复。

**Acceptance Criteria:**

**Given** 用户确认删除一个工作流
**When** 删除操作执行后
**Then** 显示包含撤销按钮的 Toast 通知，持续 5 秒（UX-DR14）
**And** 用户点击撤销按钮后恢复已删除的工作流文件
**And** 5 秒内未撤销则永久删除
**And** 撤销成功后刷新列表并 Toast 通知

**Technical Notes:**

- 来源：Epic 3 回顾 — 删除操作缺少撤销功能（UX-DR14 未完全实现）
- 可采用软删除 + 延迟硬删除策略，或前端缓存已删除内容

### Story 4.8: Story 3-3 和 3-4 补建 Story 文件（Epic 3 回顾改进）

As a 项目管理者,
I want 为 Story 3-3 和 3-4 补建独立的 story 文件并填写 Dev Agent Record,
So that 项目的 story 生命周期记录完整，便于后续追溯。

**Acceptance Criteria:**

**Given** Story 3-3（工作流文件生成与预览）和 Story 3-4（工作流管理编辑与删除）缺少独立 story 文件
**When** 补建 story 文件
**Then** 创建 `3-3-workflow-file-generation-and-preview.md` 和 `3-4-workflow-management-edit-and-delete.md`
**And** 包含完整的 Tasks/Subtasks 列表（全部标记 [x]）
**And** Dev Agent Record 记录已实现的文件列表和关键决策
**And** Status 标记为 done

**Technical Notes:**

- 来源：Epic 3 回顾 — Story 3-3 和 3-4 缺少独立 story 文件，违反生命周期规范
- 这是文档补全任务，不涉及代码修改

---

## Epic 5: 分类设置页重组织 & 套件管理

用户可以在重组织后的分类页中管理分类和套件，通过套件将常用分类组合保存并一键激活，在不同工作场景下快速切换分类配置。

**FRs covered:** FR-CS-01 ~ FR-CS-24
**NFRs covered:** NFR-CS-01 ~ NFR-CS-06
**来源 PRD:** prd-category-settings-and-bundles.md

### Story 5.1: 套件后端基础层（数据模型 + Schema + 服务层）

As a 开发者,
I want 套件功能的后端基础层（类型定义、Schema 校验、服务函数）就绪,
So that 后续的 API 路由和前端功能可以基于稳定的数据层构建。

**Acceptance Criteria:**

**Given** `shared/types.ts` 中尚无 `SkillBundle` 类型
**When** 完成本 Story
**Then** `shared/types.ts` 新增 `SkillBundle` 接口（id、name、displayName、description?、categoryNames、createdAt、updatedAt）
**And** `AppConfig` 接口追加 `skillBundles: SkillBundle[]` 和 `activeCategories: string[]` 字段

**Given** `shared/schemas.ts` 中尚无套件相关 Schema
**When** 完成本 Story
**Then** 新增 `SkillBundleSchema`（含 `categoryNames.max(20)` 约束）
**And** 新增 `SkillBundleCreateSchema`、`SkillBundleUpdateSchema`
**And** `AppConfigSchema` 追加 `skillBundles: z.array(SkillBundleSchema).max(50).default([])`
**And** `AppConfigSchema` 追加 `activeCategories: z.array(z.string()).default([])`
**And** 旧版 `settings.yaml`（无 `skillBundles` 字段）读取时默认为空数组（向后兼容）

**Given** `server/services/bundleService.ts` 不存在
**When** 完成本 Story
**Then** 新建 `bundleService.ts`，导出以下函数：`getBundles()`、`addBundle(data)`、`updateBundle(id, data)`、`removeBundle(id)`、`applyBundle(id)`
**And** `addBundle` 校验 `name` 唯一性（大小写不敏感）
**And** `addBundle` 校验 `categoryNames` 引用的分类必须存在（调用 `categoryService.getCategories()` 交叉验证）
**And** `applyBundle` 以覆盖模式写入 `activeCategories`（不叠加），跳过已删除分类引用
**And** `applyBundle` 返回 `{ applied: string[], skipped: string[] }`
**And** 所有写操作通过 `safeWrite()` 保证原子性
**And** `shared/constants.ts` 新增套件相关错误码常量

**Given** 套件服务层完成
**When** 运行单元测试
**Then** `bundleService` 的所有函数有对应单元测试（CRUD + applyBundle + 唯一性校验 + 向后兼容）
**And** 所有测试通过，TypeScript 零错误

**Technical Notes:**

- 复用 `pathPresetService` 的函数式导出模式（不使用 class）
- ID 生成格式：`bundle-{ts36}-{rand4}`（复用 `generateId()` 函数）
- 套件名称正则校验：`/^[a-z0-9-]+$/`（防路径注入，与 `importService` 的 `VALID_CATEGORY_RE` 一致）
- `getBundles()` 需注入 `brokenCategoryNames` 字段（与 `categoryService.getCategories()` 做 diff）

### Story 5.2: 套件 API 路由层

As a 开发者,
I want 套件功能的 REST API 端点就绪,
So that 前端可以通过标准 API 进行套件的 CRUD 和激活操作。

**Acceptance Criteria:**

**Given** `server/routes/bundleRoutes.ts` 不存在
**When** 完成本 Story
**Then** 新建 `bundleRoutes.ts`，注册以下端点：

- `GET /api/skill-bundles` — 返回所有套件（含 `brokenCategoryNames` 注入）
- `POST /api/skill-bundles` — 创建套件（Zod 校验 `SkillBundleCreateSchema`）
- `PUT /api/skill-bundles/:id` — 更新套件（Zod 校验 `SkillBundleUpdateSchema`）
- `DELETE /api/skill-bundles/:id` — 删除套件
- `PUT /api/skill-bundles/:id/apply` — 一键激活套件
- `GET /api/skill-bundles/export` — 返回 501 Not Implemented（占位）
- `POST /api/skill-bundles/import` — 返回 501 Not Implemented（占位）

**Given** 路由注册顺序
**When** 服务启动
**Then** `GET /api/skill-bundles/export` 必须在 `GET /api/skill-bundles/:id` 之前注册（防止 "export" 被当作 `:id`）
**And** `bundleRoutes` 在 `server/app.ts` 中正确注册

**Given** 请求体校验
**When** POST/PUT 请求体不符合 Schema
**Then** 返回 400 + `VALIDATION_ERROR`

**Given** 套件不存在
**When** PUT/DELETE/apply 操作指定不存在的 id
**Then** 返回 404 + 对应错误码

**Given** 超出数据上限
**When** 已有 50 个套件时尝试创建新套件
**Then** 返回 400 + 错误提示

**Given** API 层完成
**When** 运行集成测试
**Then** 所有 7 个端点有对应集成测试（含正常流程 + 错误场景）
**And** 所有测试通过

**Given** `src/lib/api.ts` 尚无套件相关函数
**When** 完成本 Story
**Then** 新增以下 API 客户端函数：`fetchSkillBundles()`、`createSkillBundle(data)`、`updateSkillBundle(id, data)`、`deleteSkillBundle(id)`、`applySkillBundle(id)`

**Technical Notes:**

- 路由层薄封装：只做请求解析、Zod 校验和响应格式化，业务逻辑全部委托给 `bundleService`
- 所有路由处理器用 try/catch 包裹，catch 中调用 `next(err)`
- 响应格式遵循 `ApiResponse<T>`：成功 `{ success: true, data: T }`，失败 `{ success: false, error: {...} }`

### Story 5.3: 设置页 Tab 化重组织 + 导航重命名

As a 用户,
I want 侧边栏导航显示"分类"而非"设置"，且分类页内有"分类设置"和"套件管理"两个 Tab,
So that 我能直观理解导航入口的功能，并在分类管理和套件管理之间快速切换。

**Acceptance Criteria:**

**Given** 侧边栏当前显示"设置"导航入口
**When** 完成本 Story
**Then** 侧边栏导航文字从"设置"改为"分类"
**And** 路由 `/settings` 保持不变（无破坏性变更）
**And** `AppLayout.tsx` 中对应导航项文字更新

**Given** `SettingsPage.tsx` 当前只渲染 `CategoryManager`
**When** 完成本 Story
**Then** 页面顶部显示两个 Tab："分类设置"（默认激活）和"套件管理"
**And** 使用现有 shadcn/ui `Tabs` 组件实现
**And** "分类设置" Tab 渲染现有 `CategoryManager` 组件（零改动）
**And** "套件管理" Tab 渲染占位内容（"套件管理功能即将上线"或空状态组件，Story 5.4 实现完整功能）
**And** 页面 H1 标题显示"分类管理"

**Given** Tab 切换
**When** 用户在两个 Tab 之间切换
**Then** 各 Tab 的滚动位置和内部状态不重置
**And** Tab 切换动画流畅

**Given** 现有 CategoryManager 功能
**When** 切换到"分类设置" Tab
**Then** 所有现有分类管理功能（创建、编辑、删除分类，展开查看 Skill，批量移出分类）100% 正常工作
**And** 分类设置 Tab 内的标题从"分类管理"改为"分类设置"

**Given** 本 Story 完成
**When** 运行现有 CategoryManager 相关测试
**Then** 所有测试通过（零回归）
**And** 新增 SettingsPage Tab 切换的单元测试

**Technical Notes:**

- `CategoryManager.tsx` 零改动，只修改 `SettingsPage.tsx` 和 `AppLayout.tsx`
- Tab 组件使用 `src/components/ui/` 中已有的 shadcn/ui Tabs（如不存在则新建）
- "套件管理" Tab 本 Story 只需占位，完整实现在 Story 5.4

### Story 5.4: 套件管理 UI — CRUD 交互

As a 用户,
I want 在"套件管理" Tab 中创建、查看、编辑和删除套件,
So that 我可以将常用的分类组合保存为套件，方便后续复用。

**Acceptance Criteria:**

**Given** `src/stores/bundle-store.ts` 不存在
**When** 完成本 Story
**Then** 新建 `bundle-store.ts`，包含：`bundles`、`bundlesLoading`、`bundlesError` 状态，以及 `fetchBundles`、`createBundle`、`updateBundle`、`deleteBundle` action

**Given** `src/components/settings/BundleManager.tsx` 不存在
**When** 完成本 Story
**Then** 新建 `BundleManager.tsx` 组件，在"套件管理" Tab 中渲染

**Given** 套件列表为空
**When** 用户进入"套件管理" Tab
**Then** 显示空状态引导，文案说明套件用途："套件是分类的组合，一键激活整套分类配置"
**And** 提供"新建套件"按钮

**Given** 套件列表有数据
**When** 用户进入"套件管理" Tab
**Then** 每个套件以卡片形式展示：套件显示名称、描述（可选）、包含的分类数量、分类 Tag Chip 列表
**And** 套件卡片支持展开/折叠，折叠时显示摘要，展开时显示完整分类列表

**Given** 用户点击"新建套件"
**When** 填写名称（英文标识）、显示名称，并从分类列表中多选至少 1 个分类
**Then** 套件创建成功，卡片出现在列表中
**And** 分类选择器支持搜索过滤
**And** 名称重复时显示错误提示
**And** 名称不符合 `/^[a-z0-9-]+$/` 时显示错误提示
**And** 未选择分类时"确认创建"按钮禁用

**Given** 用户点击套件卡片的编辑按钮
**When** 修改显示名称、描述或分类列表后确认
**Then** 套件更新成功，卡片内容刷新

**Given** 用户点击套件卡片的删除按钮
**When** 确认删除
**Then** 套件从列表中移除（仅删除套件本身，不影响其中引用的分类）
**And** 显示删除成功 Toast

**Given** 本 Story 完成
**When** 运行测试
**Then** `bundle-store.ts` 有完整单元测试（CRUD actions + loading/error 状态）
**And** `BundleManager.tsx` 有组件测试（空状态、列表渲染、创建表单、编辑、删除）
**And** 所有测试通过

**Technical Notes:**

- 参考 `CategoryManager.tsx` 的实现模式（展开/折叠、编辑模式、AlertDialog 确认删除）
- 分类选择器可复用 `Input` + `Checkbox` 组合，支持搜索过滤（fuse.js 或简单 filter）
- 暗色主题样式与现有组件保持一致

### Story 5.5: 套件一键激活功能

As a 用户,
I want 点击套件卡片上的"激活"按钮，将套件中的分类设为当前激活分类,
So that 我可以在不同工作场景下快速切换整套分类配置，无需逐条手动调整。

**Acceptance Criteria:**

**Given** 用户点击套件卡片上的"激活"按钮
**When** 激活操作执行
**Then** 后端 `PUT /api/skill-bundles/:id/apply` 被调用
**And** `config/settings.yaml` 中 `activeCategories` 字段更新为套件中的有效分类列表（覆盖模式，不叠加）
**And** Toast 提示激活结果："已激活 N 个分类"

**Given** 激活操作完成
**When** 用户查看套件列表
**Then** 当前激活的套件卡片有视觉标识（绿色边框或"已激活" Badge）
**And** 同一时间只有一个套件显示"已激活"状态

**Given** 套件激活后用户激活另一个套件
**When** 新的激活操作完成
**Then** 旧套件的"已激活"标识消失，新套件显示"已激活"
**And** `activeCategories` 被新套件的分类列表覆盖

**Given** 激活操作的性能
**When** 执行激活操作
**Then** 操作完成时间 < 500ms（NFR-CS-02）

**Given** 本 Story 完成
**When** 运行测试
**Then** `applyBundle` 服务函数有单元测试（正常激活 + 覆盖模式验证）
**And** `PUT /api/skill-bundles/:id/apply` 端点有集成测试
**And** 前端激活交互有组件测试（按钮点击 + 视觉标识更新）
**And** 所有测试通过

**Technical Notes:**

- `bundle-store.ts` 新增 `applyBundle(id)` action 和 `activeBundleId` 状态
- 激活后需刷新 `bundles` 列表（或通过 `activeBundleId` 本地状态管理"已激活"标识）
- 激活视觉标识：参考现有 Badge 组件，使用 `--primary` 色（绿色）

### Story 5.6: 损坏引用处理与向后兼容验证

As a 用户,
I want 当套件中引用的分类被删除后，套件卡片显示明确的警告提示，而不是静默失效,
So that 我能清楚知道套件状态，并决定是否需要修复套件。

**Acceptance Criteria:**

**Given** 套件引用了分类 A，用户删除了分类 A
**When** 用户查看套件管理 Tab
**Then** 该套件卡片显示黄色警告 Badge："包含 N 个已删除分类"
**And** 展开套件时，已删除的分类 Tag 显示删除线样式和"已删除"标注
**And** 有效分类 Tag 正常显示

**Given** 用户激活一个包含损坏引用的套件
**When** 激活操作执行
**Then** 自动跳过已删除的分类引用，仅激活有效分类
**And** Toast 提示："已激活 N 个分类，跳过 M 个已删除分类"

**Given** 用户删除一个分类
**When** 删除操作执行
**Then** 删除操作不被套件阻断（职责分离，`categoryService` 不感知 `bundleService`）
**And** 删除成功后，引用该分类的套件在下次加载时自动显示损坏警告

**Given** 旧版 `settings.yaml`（无 `skillBundles` 和 `activeCategories` 字段）
**When** 应用启动
**Then** 正常启动，`skillBundles` 默认为空数组，`activeCategories` 默认为空数组（NFR-CS-03）
**And** 现有分类管理功能无任何回归（NFR-CS-04）

**Given** 本 Story 完成
**When** 运行完整测试套件
**Then** `getBundles()` 的 `brokenCategoryNames` 注入逻辑有单元测试
**And** 损坏引用的 UI 展示有组件测试（警告 Badge + 删除线样式）
**And** 激活损坏套件的跳过逻辑有单元测试
**And** 向后兼容性有集成测试（旧版 settings.yaml 读取）
**And** 所有测试通过，TypeScript 零错误

**Technical Notes:**

- `getBundles()` 后端注入 `brokenCategoryNames`：与 `categoryService.getCategories()` 做 diff，找出 `categoryNames` 中不存在的分类名
- 前端套件卡片：`brokenCategoryNames.length > 0` 时显示黄色警告（使用 `--warning` 或 `--destructive` 色系的 Badge）
- 删除线样式：CSS `line-through` + `text-muted-foreground`
- 向后兼容由 `AppConfigSchema` 的 `.default([])` 保证，本 Story 需验证该行为

---

## Epic 6: UX 体验全面优化

基于对 Skill Manager v0.1.0 的全页面实地体验审计（Chrome DevTools MCP），修复 6 类用户体验痛点，打通已有功能的"最后一公里"，让每一个已有功能都能被用户顺畅发现、正确理解、高效使用。

**FRs covered:** FR-E6-01 ~ FR-E6-12
**NFRs covered:** NFR-E6-01 ~ NFR-E6-03
**来源 PRD:** prd-epic6-ux-polish.md
**依赖:** Epic 3/4（工作流功能）→ Story 6.2；Epic 5（路径预设）→ Story 6.3

### Story 6.1: 分类系统数据一致性修复

As a 用户,
I want 侧边栏分类计数与主区域 Skill 展示数量完全一致,
So that 我能准确通过分类筛选找到目标 Skill，分类系统真正可用。

**Acceptance Criteria:**

**Given** Skill 的 Frontmatter `category` 字段值（如 `coding`）与分类配置 `id` 大小写不一致
**When** 系统计算分类归属
**Then** 进行大小写不敏感的规范化匹配，`coding`、`Coding`、`CODING` 均能正确归入对应分类
**And** 侧边栏分类计数与主区域该分类下的 Skill 数量完全一致

**Given** Skill 的 `category` 字段值无法匹配任何已知分类
**When** 系统加载 Skill 列表
**Then** 该 Skill 归入「未分类」虚拟分类
**And** 侧边栏显示「未分类 N」条目
**And** UI 在 Skill 卡片上提示「分类未匹配，点击修复」（或类似引导）

**Given** 分类计数计算
**When** 加载 500 个 Skill 规模的列表
**Then** 分类计数计算不影响列表加载性能（< 200ms，NFR-E6-01）

**Given** 本 Story 完成
**When** 运行测试
**Then** `category` 字段规范化匹配逻辑有单元测试（大小写不敏感 + 别名映射 + 未匹配归入未分类）
**And** 侧边栏计数与主区域一致性有集成测试
**And** 所有测试通过

**Technical Notes:**

- 只做读取时规范化，不修改源 Skill 文件的 `category` 字段（避免破坏用户文件）
- 规范化逻辑放在 `skillService` 的 `getSkills()` 或分类归属计算函数中
- 「未分类」虚拟分类不持久化到 `settings.yaml`，仅在运行时动态生成
- 来源：痛点 1（P0 — 阻断性问题）

### Story 6.2: 工作流页面已有工作流管理

As a 用户,
I want 在工作流页面直接看到并管理已有工作流，而不是每次都进入空白新建状态,
So that 我可以快速找到并编辑已有工作流，无需跨页面跳转。

**Acceptance Criteria:**

**Given** 用户进入 `/workflow` 页面
**When** 已有工作流存在
**Then** 页面顶部或侧边展示已有工作流列表（折叠式或标签页形式）
**And** 每条工作流显示名称和步骤数量
**And** 点击工作流条目，编排器加载该工作流的步骤进入编辑模式

**Given** 用户处于编辑已有工作流状态
**When** 点击「新建工作流」按钮
**Then** 编排器清空，进入新建模式
**And** 新建模式与编辑模式在 UI 上有明确区分（如标题显示「新建工作流」vs「编辑：{工作流名称}」）

**Given** 工作流列表为空
**When** 用户进入工作流页面
**Then** 直接进入新建模式（当前行为保持不变）
**And** 无需展示空的工作流列表区域

**Given** 本 Story 完成
**When** 运行测试
**Then** 工作流列表加载有单元测试
**And** 新建/编辑模式切换有组件测试
**And** 所有测试通过

**Technical Notes:**

- 复用现有 `workflowService`，不引入新数据源（工作流数据已存在）
- 工作流列表 UI 参考 `CategoryManager` 的折叠列表模式
- 来源：痛点 2（P0 — 阻断性问题）

### Story 6.3: 同步页引导优化 + 导入页路径预设集成 + 顶部栏引导闭环

As a 用户,
I want 同步页有清晰的操作步骤引导，导入页能直接使用已保存的路径预设，顶部栏引导能直接打开配置对话框,
So that 我在配置同步和导入时不会因为操作顺序不明确而困惑，已有的路径预设配置能被复用。

**Acceptance Criteria:**

**Given** 用户进入同步页 `/sync`，且同步目标列表为空
**When** 查看右侧面板
**Then** 右侧面板展示醒目的引导卡片，说明操作顺序：「第一步：添加同步目标」→「第二步：选择 Skill」→「第三步：开始同步」
**And** 引导卡片在添加第一个同步目标后自动消失

**Given** 同步目标为空时用户点击「开始同步」
**When** 按钮 tooltip 显示
**Then** 提示文案为「请先在右侧添加同步目标」（而非当前的「请先选择要同步的 Skill」）

**Given** 用户在导入页 `/import` 的扫描路径输入框旁
**When** 点击「从预设选择」下拉按钮
**Then** 列出路径配置页面已保存的所有路径预设
**And** 点击预设条目，路径自动填入输入框

**Given** 路径预设列表为空
**When** 用户点击「从预设选择」下拉按钮
**Then** 下拉菜单展示「前往路径配置添加预设」快捷入口，点击跳转到路径配置页

**Given** 用户点击顶部栏「未配置同步目标」按钮
**When** 跳转到同步页
**Then** 自动触发「添加同步目标」对话框弹出（或高亮右侧添加按钮）
**And** 引导链完整闭环，用户无需自行寻找操作入口

**Given** 本 Story 完成
**When** 运行测试
**Then** 同步页引导卡片的显示/隐藏逻辑有组件测试
**And** 导入页路径预设下拉有组件测试（有预设 + 无预设两种状态）
**And** 顶部栏引导跳转有 E2E 测试
**And** 所有测试通过

**Technical Notes:**

- 本 Story 依赖 Epic 5 完成（路径预设 `pathPresetService` 已就绪）
- 导入页路径预设下拉复用 `pathPresetService.getPresets()`
- 顶部栏跳转触发对话框：可通过 URL query param（如 `/sync?action=add-target`）或全局状态实现
- 来源：痛点 3（P1）+ 痛点 4（P1）+ 痛点 6（P2）

### Story 6.4: Command Palette 搜索增强

As a 用户,
I want Command Palette 搜索结果展示 Skill 描述摘要并按类型分组,
So that 当多个 Skill 名称相似时，我能通过描述快速识别目标，无需逐一点击查看。

**Acceptance Criteria:**

**Given** 用户在 Command Palette 中搜索关键词
**When** 搜索结果展示
**Then** 每条 Skill 结果在名称下方显示描述摘要（截取 `description` 字段前 60 字符，超出显示省略号）
**And** 描述摘要使用次要文字色（`text-muted-foreground`）展示

**Given** 搜索结果包含多种类型（Skills、工作流、页面导航）
**When** 结果列表渲染
**Then** 结果按类型分组展示（「Skills」分组 / 「工作流」分组 / 「页面」分组）
**And** 每个分组有清晰的分组标题

**Given** Command Palette 搜索结果渲染
**When** 含描述摘要的结果列表渲染完成
**Then** 渲染时间 < 100ms（NFR-E6-02）

**Given** Skill 的 `description` 字段为空
**When** 搜索结果展示
**Then** 不显示描述摘要行（不显示空白占位）

**Given** 本 Story 完成
**When** 运行测试
**Then** 描述摘要截取逻辑有单元测试（正常截取 + 空描述 + 超长描述）
**And** 分组展示有组件测试
**And** 所有测试通过

**Technical Notes:**

- 修改 Command Palette 的搜索结果渲染组件（`CommandItem` 或类似组件）
- 描述摘要截取：`description?.slice(0, 60) + (description?.length > 60 ? '...' : '')`
- 分组使用 shadcn/ui `CommandGroup` 组件（已有基础设施）
- 来源：痛点 5（P2）

---

## Epic 7: Sidebar 重设计与交互优化

Sidebar 从单纯导航工具升级为「系统状态仪表盘」：分类目录树迁移至 Skill 库二级 Sidebar，主 Sidebar 新增系统统计面板（Skill / 工作流 / 分类总数）和活跃度热力图（近 12 周豆点图），分类管理 Tab 切换增加滑块平移动画。

**来源：** `prd-sidebar-redesign.md`
**架构决策：** AD-23（二级 Sidebar）、AD-24（StatsPanel + ActivityHeatmap）、AD-25（Tab 滑块动画）
**依赖：** Epic 1（CategoryTree 组件）、Epic 5（SettingsPage Tab 结构）

---

### Story 7.1: 分类导航迁移至 Skill 库二级 Sidebar

As a Skill Manager 用户,
I want 当我进入 Skill 库时，在页面左侧看到分类目录，而不是通过顶层导航跳转到独立的「分类」页面,
So that 我可以在不离开 Skill 库的情况下快速切换分类筛选，减少认知跳转成本。

**Acceptance Criteria:**

**Given** 用户处于任意页面
**When** 查看主 Sidebar 导航列表
**Then** 导航列表中不再出现「分类」导航项（原 `{ to: "/settings", icon: Settings, label: "分类" }`）
**And** 导航列表中不再出现底部的 `CategoryTree` 组件

**Given** 用户处于 Skill 库页面（路由 `/`）
**When** 页面渲染完成
**Then** 主 Sidebar 右侧出现一个二级 Sidebar
**And** 二级 Sidebar 顶部显示「分类」标题
**And** 二级 Sidebar 内容为现有的 `CategoryTree` 组件（零改动）
**And** 二级 Sidebar 底部有「管理分类」链接，点击跳转到 `/settings`
**And** 二级 Sidebar 与主 Sidebar 之间有明显的视觉分隔线（`border-l border-[hsl(var(--border))]`）

**Given** 用户从 Skill 库页面切换到其他页面（工作流、同步等）
**When** 路由变化完成
**Then** 二级 Sidebar 自动隐藏（`width: 0; opacity: 0; overflow: hidden`）
**And** 主内容区域平滑扩展，无布局抖动（NFR-S1）

**Given** 用户从其他页面切换回 Skill 库页面
**When** 路由变化完成
**Then** 二级 Sidebar 平滑出现（`transition: width 200ms ease-in-out, opacity 200ms ease-in-out`）

**Given** 用户在二级 Sidebar 中点击某个分类
**When** 分类被选中
**Then** Skill 库主内容区域按该分类筛选（现有 `CategoryTree` 交互行为不变）
**And** 二级 Sidebar 中的分类项无编辑/删除操作（只读筛选导航）

**Given** 本 Story 完成
**When** 运行测试
**Then** 二级 Sidebar 条件渲染逻辑有组件测试（路由 `/` 显示 + 其他路由隐藏）
**And** 主 Sidebar 导航项移除有单元测试
**And** 二级 Sidebar 显示/隐藏动画有视觉回归测试
**And** 所有测试通过

**Technical Notes:**

- 新建 `src/components/layout/SecondarySidebar.tsx`，包含 `CategoryTree` + 底部「管理分类」链接
- `AppLayout.tsx` 中通过 `location.pathname === "/"` 条件渲染 `SecondarySidebar`
- 二级 Sidebar 宽度：`180px`，CSS 变量 `--secondary-sidebar-width: 180px`
- 背景色：`bg-[hsl(var(--card))]`，与主 Sidebar 保持一致
- `CategoryTree.tsx` 零改动（内容完全不变）
- 来源：FR-S1-1 ~ FR-S1-5，NFR-S1，AD-23

---

### Story 7.2: Sidebar 系统状态面板 + 活跃度热力图

As a Skill Manager 用户,
I want 在侧边栏中能快速看到我的 Skill 库整体状态（Skill 数、工作流数、分类数），以及近 12 周的活跃度热力图,
So that 我对自己的 Skill 资产有直观感知，就像 GitHub 首页的贡献热力图一样。

**Acceptance Criteria:**

**Given** 用户打开应用
**When** 主 Sidebar 渲染完成
**Then** 导航列表下方（分隔线之后）出现系统统计信息区块
**And** 统计区块展示三项数据：Skill 总数（排除工作流）、工作流总数、分类总数
**And** 每项统计包含图标、数字和标签，采用紧凑三列布局

**Given** 用户执行导入、删除、同步等文件操作
**When** 操作完成
**Then** 统计数字自动更新，反映最新数据状态（FR-S2-2）

**Given** 主 Sidebar 渲染完成
**When** 统计区块下方渲染
**Then** 出现活跃度热力图，展示近 12 周（84 天）的每日 Skill 修改频率
**And** 热力图为 7 列（周一至周日）× 12 行（12 周）= 84 个豆点
**And** 每个豆点大小 `8px × 8px`，间距 `2px`
**And** 豆点颜色按修改次数映射：0 次 → `hsl(var(--muted))`；1-2 次 → `hsl(var(--primary) / 0.3)`；3-5 次 → `hsl(var(--primary) / 0.6)`；6+ 次 → `hsl(var(--primary))`

**Given** 用户鼠标悬停在某个豆点上
**When** Tooltip 显示
**Then** Tooltip 内容为「YYYY-MM-DD · N 次修改」格式

**Given** 热力图渲染
**When** Sidebar 宽度变化（如窗口缩放）
**Then** 热力图宽度自适应，不出现溢出或截断（NFR-S3）

**Given** 用户系统开启了 `prefers-reduced-motion`
**When** 热力图豆点颜色变化
**Then** 颜色变化无过渡动画（NFR-S4）

**Given** 本 Story 完成
**When** 运行测试
**Then** `StatsPanel` 统计数字计算有单元测试（Skill 总数 / 工作流总数 / 分类总数）
**And** `ActivityHeatmap` 颜色映射逻辑有单元测试（0 次 / 1-2 次 / 3-5 次 / 6+ 次）
**And** 热力图 Tooltip 有组件测试
**And** 后端 `GET /api/stats/activity` 有 API 测试（正常返回 + 空数据）
**And** 所有测试通过

**Technical Notes:**

- 新建 `src/components/stats/StatsPanel.tsx`
  - 数据来源：`useSkillStore` selector（已有数据，无需新 API）
  - `skillCount = skills.filter(sk => sk.type !== 'workflow').length`
  - `workflowCount = skills.filter(sk => sk.type === 'workflow').length`
  - `categoryCount = useCategoryStore(s => s.categories.length)`
- 新建 `src/components/stats/ActivityHeatmap.tsx`
  - 数据来源：后端 `GET /api/stats/activity?weeks=12`
  - 响应格式：`ApiResponse<ActivityDay[]>`，`ActivityDay = { date: string; count: number }`
- 新建 `server/routes/statsRoutes.ts`
  - 扫描 `skills/` 目录下所有 `.md` 文件的 `fs.stat().mtime`
  - 按日期聚合，返回过去 N 周的每日修改文件数
- `server/app.ts` 注册 `statsRoutes`
- `src/lib/api.ts` 新增 `fetchActivityStats(weeks?: number)`
- 热力图整体提供 `aria-label="近 12 周 Skill 修改活跃度"`，每个豆点提供 `title` 属性作为 Tooltip 降级方案
- 来源：FR-S2-1 ~ FR-S2-9，NFR-S2 ~ NFR-S4，AD-24

---

### Story 7.3: 分类管理 Tab 滑块平移动画

As a Skill Manager 用户,
I want 在「分类管理」页面切换「分类设置」和「套件管理」两个 Tab 时，看到平滑的滑块动画，而不是生硬的内容切换,
So that 交互体验更流畅、更现代，与整体 UI 风格保持一致。

**Acceptance Criteria:**

**Given** 用户在 `/settings` 页面
**When** 查看 Tab 切换组件
**Then** Tab 组件呈现为胶囊形背景容器，内含「分类设置」和「套件管理」两个 Tab 按钮

**Given** 用户点击非当前激活的 Tab
**When** Tab 切换发生
**Then** 背景滑块以 `200ms ease-in-out` 的平移动画从当前 Tab 位置移动到目标 Tab 位置
**And** 动画使用 `transform: translateX()` 实现（不使用 `left/margin-left`）
**And** Tab 内容区域切换为目标 Tab 的内容

**Given** 用户系统开启了 `prefers-reduced-motion`
**When** Tab 切换发生
**Then** 滑块直接跳转到目标位置，无平移动画（FR-S3-5，NFR-S4）

**Given** Tab 切换动画执行中
**When** 在低性能设备上渲染
**Then** 动画帧率 ≥ 60fps（GPU 加速，不触发 layout reflow）

**Given** 本 Story 完成
**When** 运行测试
**Then** Tab 切换状态管理有单元测试（activeIndex 变化）
**And** 滑块位置计算有单元测试（0 → 0%，1 → 100%）
**And** `prefers-reduced-motion` 降级有组件测试
**And** 所有测试通过

**Technical Notes:**

- 修改 `src/pages/SettingsPage.tsx`，将现有 Tab 切换逻辑替换为带滑块动画的实现
- 可选：抽取为 `src/components/settings/AnimatedTabSwitcher.tsx` 独立组件，供其他页面复用
- 滑块实现核心代码：
  ```tsx
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  // 滑块层：position: absolute，transform: translateX(activeIndex * 100%)
  // transition: prefersReducedMotion ? 'none' : 'transform 200ms ease-in-out'
  ```
- 滑块背景色：`bg-[hsl(var(--background))]`，容器背景：`bg-[hsl(var(--muted))]`
- 本 Story 不依赖后端，纯前端改动
- 来源：FR-S3-1 ~ FR-S3-5，NFR-S4，AD-25

---

## Epic 8: External Skills Hub（外部技能仓库聚合与管理）

**目标：** 系统从「个人 Skill 资产管理」扩展为「技能生态聚合平台」。通过配置文件驱动的多仓库注册机制，自动从 GitHub 仓库拉取高质量 Skill，经过白名单/黑名单筛选后同步到项目 `skills/` 目录。外部 Skill 带有来源标签（可点击跳转 GitHub 仓库），以只读模式管理。预设分类从 4 个扩展到 9 个，所有出厂分类聚合为默认套件。GitHub Action 定时自动同步并创建 PR。

**依赖：** Epic 1（SkillCard/SkillPreview 组件已就绪）、Epic 5（bundleService 已就绪）
**FRs:** FR-EH-01 ~ FR-EH-36
**NFRs:** NFR-EH-01 ~ NFR-EH-11
**ARs:** AD-31 ~ AD-40

---

### Story 8.1: SkillMeta 类型扩展与 Schema 更新

As a 开发者,
I want SkillMeta 类型和 Schema 支持外部 Skill 的来源元数据和只读标识,
So that 后续的前后端功能可以基于稳定的类型定义构建。

**Acceptance Criteria:**

**Given** `shared/types.ts` 中 `SkillMeta` 接口尚无外部 Skill 相关字段
**When** 完成本 Story
**Then** `SkillMeta` 新增 4 个可选字段：

- `source?: string` — 来源仓库 ID
- `sourceUrl?: string` — Skill 在 GitHub 上的 URL
- `sourceRepo?: string` — 仓库 GitHub URL
- `readonly?: boolean` — 是否只读

**Given** `shared/types.ts` 中尚无仓库配置相关类型
**When** 完成本 Story
**Then** 新增 `RepoSkillMapping` 接口（`name: string`、`targetCategory: string`）
**And** 新增 `ExternalRepository` 接口（`id`、`name`、`url`、`branch`、`skillsPath`、`enabled`、`include: RepoSkillMapping[]`、`exclude: string[]`）
**And** 新增 `RepositoriesConfig` 接口（`repositories: ExternalRepository[]`）

**Given** `shared/schemas.ts` 中 `SkillMetaSchema` 尚无外部 Skill 字段
**When** 完成本 Story
**Then** `SkillMetaSchema` 新增 `source`（`z.string().optional()`）、`sourceUrl`（`z.string().url().optional()`）、`sourceRepo`（`z.string().url().optional()`）、`readonly`（`z.boolean().optional()`）
**And** 新增 `RepoSkillMappingSchema`、`ExternalRepositorySchema`、`RepositoriesConfigSchema`
**And** `ExternalRepositorySchema` 的 `url` 字段校验为合法 GitHub HTTPS URL（`z.string().regex(/^https:\/\/github\.com\//)`)

**Given** `shared/constants.ts` 中尚无 `SKILL_READONLY` 错误码
**When** 完成本 Story
**Then** 新增 `SKILL_READONLY: "SKILL_READONLY"` 错误码常量

**Given** `server/utils/frontmatterParser.ts` 尚未解析外部 Skill 字段
**When** 完成本 Story
**Then** `frontmatterParser` 解析 Frontmatter 时提取 `source`、`sourceUrl`、`sourceRepo`、`readonly` 字段
**And** 缺失字段返回 `undefined`（不报错）

**Given** 本 Story 完成
**When** 运行测试
**Then** TypeScript 编译零错误（`tsc --noEmit`）
**And** Schema 校验有单元测试（合法/非法 URL、可选字段缺失）
**And** `frontmatterParser` 新字段解析有单元测试
**And** 所有测试通过

**Technical Notes:**

- 修改 `shared/types.ts`：`SkillMeta` 追加 4 个可选字段；新增 `RepoSkillMapping`、`ExternalRepository`、`RepositoriesConfig` 接口
- 修改 `shared/schemas.ts`：`SkillMetaSchema` 追加 4 个可选字段；新增 3 个 Schema
- 修改 `shared/constants.ts`：新增 `SKILL_READONLY` 错误码
- 修改 `server/utils/frontmatterParser.ts`：解析新字段
- 来源：FR-EH-34 ~ FR-EH-36，AD-31，AD-35

---

### Story 8.2: 仓库配置文件与解析

As a 开发者,
I want 系统能读取和校验 `config/repositories.yaml` 仓库注册配置文件,
So that 同步脚本和后端服务可以获取外部仓库的注册信息。

**Acceptance Criteria:**

**Given** `config/repositories.yaml` 不存在
**When** 完成本 Story
**Then** 创建 `config/repositories.yaml`，包含 `anthropic-official` 仓库配置
**And** `include` 白名单包含 9 个通用 Skill（pdf、docx、xlsx、pptx、mcp-builder、webapp-testing、skill-creator、frontend-design、claude-api）
**And** `exclude` 黑名单包含 8 个非通用 Skill（slack-gif-creator、algorithmic-art、brand-guidelines、canvas-design、theme-factory、internal-comms、web-artifacts-builder、doc-coauthoring）
**And** 每个 `include` 项包含 `name` 和 `targetCategory`

**Given** `.gitignore` 中尚无 `skill-repos/` 规则
**When** 完成本 Story
**Then** `.gitignore` 新增 `skill-repos/` 忽略规则

**Given** 系统启动时
**When** `config/repositories.yaml` 存在且格式正确
**Then** 系统正确解析并返回 `RepositoriesConfig` 对象

**Given** 系统启动时
**When** `config/repositories.yaml` 不存在
**Then** 系统正常启动，返回空数组（`{ repositories: [] }`）（FR-EH-05）

**Given** 系统启动时
**When** `config/repositories.yaml` 格式错误（YAML 语法错误或 Schema 校验失败）
**Then** 记录错误日志，返回空数组，不阻塞系统启动（FR-EH-06）

**Given** 本 Story 完成
**When** 运行测试
**Then** 配置文件解析有单元测试（正常解析、文件不存在、格式错误）
**And** Zod Schema 校验有单元测试（合法配置、非法 URL、缺失必填字段）
**And** 所有测试通过

**Technical Notes:**

- 新建 `config/repositories.yaml`（内容参考 PRD 中的配置示例）
- 修改 `.gitignore`：新增 `skill-repos/` 规则
- 新建或修改配置读取逻辑（可复用 `server/utils/` 中的 YAML 读取模式）
- 使用 Story 8.1 中定义的 `RepositoriesConfigSchema` 进行 Zod 校验
- 来源：FR-EH-01 ~ FR-EH-06，AD-31，AD-32，AD-40（场景 1/2/8/9）

---

### Story 8.3: 预设分类扩展与默认套件

As a 用户,
I want 系统的预设分类从 4 个扩展到 9 个，并自动创建包含所有出厂分类的默认套件,
So that 外部 Skill 有合适的分类归属，且我开箱即用就有完整的技能组合。

**Acceptance Criteria:**

**Given** `config/categories.yaml` 当前只有 4 个分类
**When** 完成本 Story
**Then** `categories.yaml` 包含 9 个分类：

- 原有：`coding`、`writing`、`devops`、`workflows`
- 新增：`document-processing`（文档处理）、`dev-tools`（开发工具）、`testing`（测试）、`design`（设计）、`meta-skills`（元技能）
  **And** 每个新增分类有准确的 `displayName` 和 `description`

**Given** 现有 Skill 已归属到原有 4 个分类
**When** 分类扩展完成
**Then** 现有 Skill 的分类归属不变（FR-EH-29）

**Given** 系统启动时 `settings.yaml` 中不存在 `name: "default"` 的套件
**When** `bundleService` 初始化
**Then** 自动创建默认套件：`name: "default"`、`displayName: "默认套件"`、`description: "包含所有出厂预设分类的完整技能组合"`
**And** 默认套件的 `categoryNames` 包含所有 9 个出厂分类
**And** 默认套件的 `id` 固定为 `bundle-default`

**Given** 系统启动时 `settings.yaml` 中已存在 `name: "default"` 的套件
**When** `bundleService` 初始化
**Then** 不重复创建（幂等操作）

**Given** 用户尝试删除默认套件
**When** 调用 `removeBundle` API
**Then** 返回 400 错误，提示"默认套件不可删除"

**Given** 用户编辑默认套件（修改包含的分类）
**When** 调用 `updateBundle` API
**Then** 正常更新（默认套件可编辑）

**Given** 本 Story 完成
**When** 运行测试
**Then** `ensureDefaultBundle()` 有单元测试（首次创建、幂等跳过）
**And** `removeBundle` 默认套件删除保护有单元测试
**And** 分类扩展后现有 Skill 归属不变有集成测试
**And** 所有测试通过

**Technical Notes:**

- 修改 `config/categories.yaml`：追加 5 个新分类
- 修改 `server/services/bundleService.ts`：新增 `ensureDefaultBundle()` 函数 + `removeBundle` 默认套件删除保护
- 修改 `server/index.ts`：启动序列新增 `ensureDefaultBundle()` 调用（在 `initializeSkillCache()` 之后）
- `DEFAULT_BUNDLE_CATEGORIES` 常量包含 9 个分类名
- 来源：FR-EH-27 ~ FR-EH-33，AD-38，AD-39

---

### Story 8.4: 后端只读保护

As a 用户,
I want 外部 Skill 在后端被保护为只读，任何编辑/删除/移动操作都被拦截,
So that 外部 Skill 不会被误操作修改，下次同步时能正常覆盖更新。

**Acceptance Criteria:**

**Given** `server/types/errors.ts` 中尚无 `skillReadonly` 工厂方法
**When** 完成本 Story
**Then** `AppError` 新增 `skillReadonly(skillId: string)` 静态工厂方法
**And** 返回 `new AppError(403, "SKILL_READONLY", \`Skill "${skillId}" is readonly (external skill)\`)`

**Given** 用户调用 `PUT /api/skills/:id/meta` 更新一个 `readonly: true` 的 Skill
**When** 后端 `updateSkillMeta` 执行
**Then** 在 `skillNotFound` 检查之后、实际更新之前，检测 `meta.readonly`
**And** 为 `true` 时抛出 `AppError.skillReadonly(id)`，返回 403 + `SKILL_READONLY`

**Given** 用户调用 `DELETE /api/skills/:id` 删除一个 `readonly: true` 的 Skill
**When** 后端 `deleteSkill` 执行
**Then** 检测 `meta.readonly`，为 `true` 时返回 403 + `SKILL_READONLY`

**Given** 用户调用 `PATCH /api/skills/:id/move` 移动一个 `readonly: true` 的 Skill
**When** 后端 `moveSkillToCategory` 执行
**Then** 检测 `meta.readonly`，为 `true` 时返回 403 + `SKILL_READONLY`

**Given** 用户对非只读 Skill 执行编辑/删除/移动操作
**When** 后端执行
**Then** 正常处理，不受影响

**Given** 本 Story 完成
**When** 运行测试
**Then** `AppError.skillReadonly()` 工厂方法有单元测试
**And** `updateSkillMeta` 只读拦截有单元测试（readonly=true → 403，readonly=false → 正常）
**And** `deleteSkill` 只读拦截有单元测试
**And** `moveSkillToCategory` 只读拦截有单元测试
**And** 所有测试通过

**Technical Notes:**

- 修改 `server/types/errors.ts`：新增 `AppError.skillReadonly()` 静态方法
- 修改 `server/services/skillService.ts`：`updateSkillMeta`、`deleteSkill`、`moveSkillToCategory` 三个函数新增 `if (meta.readonly) throw AppError.skillReadonly(id)` 检查
- `readonly` 检查必须在 `skillNotFound` 检查之后（先确认资源存在，再检查权限）
- 来源：FR-EH-21 ~ FR-EH-26，AD-36

---

### Story 8.5: 前端来源标签与只读标识

As a 用户,
I want 在 Skill 卡片和预览面板中看到外部 Skill 的来源标签和只读标识,
So that 我能清楚区分本地 Skill 和外部 Skill，并能快速跳转到 GitHub 仓库查看原始内容。

**Acceptance Criteria:**

**Given** 一个外部 Skill（`source` 字段有值）在 SkillCard 中渲染
**When** 卡片渲染完成
**Then** 卡片右上角显示来源标签：GitHub 图标（`lucide-react` 的 `Github`）+ 仓库显示名称
**And** 来源标签使用 `muted` 色调，不抢占卡片主要信息的视觉焦点（FR-EH-20）

**Given** 用户点击 SkillCard 上的来源标签
**When** 点击事件触发
**Then** 浏览器新标签页打开 `sourceUrl`（`target="_blank"` + `rel="noopener noreferrer"`）
**And** 点击事件不冒泡到卡片点击事件（`e.stopPropagation()`）

**Given** 一个外部 Skill（`readonly: true`）在 SkillCard 中渲染
**When** 卡片渲染完成
**Then** 卡片左下角显示锁图标（`lucide-react` 的 `Lock`）
**And** 锁图标 Tooltip 提示"外部 Skill（只读）"

**Given** 一个本地 Skill（无 `source` 字段）在 SkillCard 中渲染
**When** 卡片渲染完成
**Then** 不显示来源标签和锁图标

**Given** 用户在 SkillPreview 中查看一个外部 Skill
**When** 预览面板渲染完成
**Then** 底部显示来源信息区域：仓库名称、仓库链接、"在 GitHub 上查看"按钮
**And** "在 GitHub 上查看"按钮点击后新标签页打开 `sourceUrl` 或 `sourceRepo`

**Given** 用户在 SkillPreview 中查看一个外部 Skill
**When** 元数据编辑区域渲染
**Then** 分类、标签、描述等编辑控件显示为禁用状态
**And** Tooltip 提示"外部 Skill 为只读，由上游仓库管理"

**Given** 用户在 SkillPreview 中查看一个外部 Skill
**When** 删除按钮渲染
**Then** 删除按钮显示为禁用状态
**And** Tooltip 提示"外部 Skill 不可删除"

**Given** 来源标签渲染
**When** 性能测量
**Then** 额外渲染开销 < 5ms（NFR-EH-02）

**Given** 本 Story 完成
**When** 运行测试
**Then** SkillCard 来源标签渲染有组件测试（有 source → 显示，无 source → 不显示）
**And** SkillCard 锁图标渲染有组件测试（readonly=true → 显示，readonly=false → 不显示）
**And** 来源标签点击跳转有组件测试（`window.open` 调用验证）
**And** SkillPreview 来源信息区域有组件测试
**And** SkillPreview 只读禁用有组件测试
**And** 所有测试通过

**Technical Notes:**

- 修改 `src/components/skills/SkillCard.tsx`：新增来源 Badge（右上角）+ 锁图标（左下角）
- 修改 `src/components/skills/SkillPreview.tsx`：底部新增来源信息区域 + 元数据编辑区域 `disabled` 逻辑 + 删除按钮 `disabled` 逻辑
- 新增 i18n 翻译键：`skill.viewOnGithub`、`skill.sourceInfo`、`skill.readonlyTooltip`、`skill.readonlyEditTooltip`、`skill.readonlyDeleteTooltip`
- 使用 `lucide-react` 的 `Github`、`Lock`、`ExternalLink` 图标
- 来源：FR-EH-16 ~ FR-EH-26，NFR-EH-02，NFR-EH-09，AD-37

---

### Story 8.6: 同步脚本核心逻辑

As a 开发者,
I want 一个 Node.js 同步脚本能自动从外部仓库拉取、筛选、复制 Skill 并注入来源元数据,
So that GitHub Action 可以调用此脚本完成自动化同步。

**Acceptance Criteria:**

**Given** `scripts/sync-external-skills.mjs` 不存在
**When** 完成本 Story
**Then** 创建 `scripts/sync-external-skills.mjs`，ESM 格式

**Given** 同步脚本执行
**When** 读取 `config/repositories.yaml`
**Then** 正确解析配置，遍历所有 `enabled: true` 的仓库

**Given** 同步脚本处理一个仓库（首次）
**When** `skill-repos/{id}/` 目录不存在
**Then** 执行 `git clone {url} --branch {branch} --single-branch skill-repos/{id}/`
**And** clone 超时设置为 60 秒

**Given** 同步脚本处理一个仓库（增量）
**When** `skill-repos/{id}/` 目录已存在
**Then** 执行 `git -C skill-repos/{id}/ pull`

**Given** 同步脚本完成仓库拉取
**When** 根据 `include`/`exclude` 规则筛选
**Then** 黑名单优先级高于白名单
**And** `exclude` 中的 Skill 即使在 `include` 中也被排除

**Given** 筛选后的 Skill 列表
**When** 复制到 `skills/{targetCategory}/{skillName}/`
**Then** 完整复制 Skill 目录（包含所有文件）
**And** 目标分类目录不存在时自动创建（`fs.mkdirSync({ recursive: true })`）

**Given** 复制完成的 Skill
**When** 注入 Frontmatter 来源元数据
**Then** 在 Skill 的主 `.md` 文件（`SKILL.md` 或目录下第一个 `.md` 文件）的 Frontmatter 中注入：

- `source: "{repoId}"`
- `sourceUrl: "{url}/tree/{branch}/{skillsPath}/{skillName}"`
- `sourceRepo: "{url}"`
- `readonly: true`
  **And** 已有 Frontmatter 时追加字段，无 Frontmatter 时创建

**Given** 本地 `skills/` 目录中已存在同名 Skill（非外部来源）
**When** 同步脚本检测到 ID 冲突
**Then** 跳过该外部 Skill，本地 Skill 优先
**And** 记录 `[sync] WARN: Skill "{name}" already exists locally, skipping external version`

**Given** 仓库 clone/pull 失败（网络错误或超时）
**When** 同步脚本处理该仓库
**Then** 记录错误日志，跳过该仓库，继续处理其他仓库
**And** 保留上次同步的 Skill 不删除

**Given** `include` 中的 Skill 在仓库中不存在
**When** 同步脚本筛选
**Then** 记录警告日志，跳过该 Skill

**Given** Skill 文件格式异常（无 Frontmatter）
**When** 同步脚本注入元数据
**Then** 记录警告，仍复制文件（降级为无来源元数据）

**Given** 同步脚本使用 `--dry-run` 参数执行
**When** 脚本运行
**Then** 仅输出将要执行的操作（clone/pull/copy/inject），不实际执行文件操作

**Given** 同步脚本执行完成
**When** 输出变更摘要
**Then** 列出新增/更新/跳过的 Skill 列表
**And** 全部成功或部分失败 → exit 0
**And** 脚本自身未捕获异常 → exit 1

**Given** 本 Story 完成
**When** 运行测试
**Then** 配置读取有单元测试
**And** `include`/`exclude` 筛选逻辑有单元测试（白名单、黑名单优先、空列表）
**And** Frontmatter 注入逻辑有单元测试（有 Frontmatter、无 Frontmatter、注入失败降级）
**And** ID 冲突检测有单元测试
**And** `--dry-run` 模式有单元测试
**And** 所有测试通过

**Technical Notes:**

- 新建 `scripts/sync-external-skills.mjs`（ESM 格式）
- 使用 `child_process.execSync` 执行 git 命令，设置 `timeout: 60000`
- 所有日志使用 `[sync]` 前缀
- 同步脚本**永远不删除** `skills/` 目录下的现有文件——只新增或覆盖
- ID 冲突检测：检查目标路径是否已存在且 Frontmatter 中无 `source` 字段（说明是本地 Skill）
- 来源：FR-EH-07 ~ FR-EH-15，NFR-EH-01，NFR-EH-10，NFR-EH-11，AD-34，AD-40

---

### Story 8.7: GitHub Action 工作流

As a 开发者,
I want 一个 GitHub Action 工作流能定时触发同步脚本并自动创建 PR,
So that 外部 Skill 能自动保持与上游仓库的同步，且变更经过人工审核后才合并。

**Acceptance Criteria:**

**Given** `.github/workflows/sync-external-skills.yml` 不存在
**When** 完成本 Story
**Then** 创建 `.github/workflows/sync-external-skills.yml`

**Given** GitHub Action 工作流配置
**When** 查看触发条件
**Then** 支持 cron 定时触发（`0 0 * * *`，每日 UTC 00:00）
**And** 支持 `workflow_dispatch` 手动触发

**Given** GitHub Action 执行
**When** 工作流运行
**Then** 执行以下步骤：

1. `actions/checkout@v4` — 检出代码
2. `actions/setup-node@v4` — 安装 Node.js 18
3. `npm ci` — 安装依赖
4. `node scripts/sync-external-skills.mjs` — 执行同步脚本
5. `peter-evans/create-pull-request@v6` — 如有变更则创建 PR

**Given** 同步脚本执行后有文件变更
**When** 创建 PR
**Then** PR 标题格式：`chore: sync external skills`
**And** PR 分支名：`chore/sync-external-skills`
**And** PR 描述包含变更摘要
**And** commit message：`chore: sync external skills`

**Given** 同步脚本执行后无文件变更
**When** PR 创建步骤执行
**Then** 不创建 PR（`peter-evans/create-pull-request` 默认行为）

**Given** GitHub Action 工作流权限
**When** 查看权限配置
**Then** 包含 `contents: write`（提交变更）和 `pull-requests: write`（创建 PR）

**Given** 本 Story 完成
**When** 查看工作流文件
**Then** YAML 语法正确，可被 GitHub Actions 正确解析
**And** 所有 Action 版本使用主版本号锁定（`@v4`、`@v6`）

**Technical Notes:**

- 新建 `.github/workflows/sync-external-skills.yml`
- 使用 `peter-evans/create-pull-request@v6` 创建 PR
- 工作流需要 `permissions: contents: write, pull-requests: write`
- 本 Story 不需要单元测试（YAML 配置文件），但需要人工验证 YAML 语法正确性
- 来源：FR-EH-07 ~ FR-EH-15，AD-33
