# Skill Manager — Skill 管理器

> 本地 AI Skill 文件的浏览、编排与 IDE 同步工具

📖 [English Documentation](./README.en.md)

---

## 简介

**Skill Manager** 是一个运行在本地的全栈 Web 应用，帮助你管理 AI 编程助手（如 CodeBuddy）所使用的 Skill 文件。你可以通过它浏览、搜索、编排工作流，并将 Skill 一键同步到 IDE。

---

## 功能特性

| 功能            | 说明                                                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| 📚 Skill 浏览   | 分类目录树 + 卡片/列表双视图 + Markdown 预览，大小写不敏感分类匹配；列表视图点击行打开详情                                 |
| 🔍 模糊搜索     | Fuse.js 前端内存搜索，< 200ms 响应；Command Palette 支持描述摘要与分组展示                                                 |
| 🔗 工作流编排   | 拖拽排序，将多个 Skill 组合为工作流文件；Tab 布局管理已有工作流；草稿自动持久化                                            |
| 🔄 IDE 同步     | 将选中 Skill 推送到 IDE 目录（支持 CodeBuddy）；分步引导新用户配置                                                         |
| 📥 IDE 导入     | 从 IDE 目录扫描并导入 Skill 到仓库                                                                                         |
| ⚙️ 配置管理     | 管理 IDE 路径、分类定义、路径预设；分类批量操作（多选移出）                                                                |
| 📦 套件管理     | 将常用分类组合保存为套件，一键激活整套分类配置；损坏引用自动警告                                                           |
| ⌨️ 键盘快捷键   | `⌘K` 全局搜索（含描述摘要 + 类型分组），`Alt+↑/↓` 步骤排序                                                                 |
| 📋 快捷操作     | Skill 详情侧边栏支持一键复制路径；版本号与 `package.json` 自动                                                             |
| 同步            |
| 🗂️ 二级导航     | 主页左侧二级侧边栏（220px），按分类快速筛选 Skill，路由联动高亮当前分类；标题栏含图标，底部提供管理分类快捷入口            |
| 📊 统计面板     | Sidebar 底部展示 Skill 总数、分类数、同步数等关键指标                                                                      |
| 🔥 活跃度热力图 | 可视化近期 Skill 文件修改活跃度，类 GitHub 贡献热力图风格；hover 浮窗展示当日修改次数与文件列表                            |
| 🌓 主题切换     | 支持亮色/暗色主题切换，Header 右侧 Sun/Moon 按钮一键切换；偏好持久化到 localStorage，初始化跟随系统 `prefers-color-scheme` |

---

## 技术栈

| 层级     | 技术                                  |
| -------- | ------------------------------------- |
| 前端框架 | React 19 + TypeScript                 |
| 构建工具 | Vite 8                                |
| 样式     | Tailwind CSS v4 + shadcn/ui           |
| 状态管理 | Zustand 5                             |
| 后端     | Node.js + Express 5                   |
| 数据存储 | 文件系统（`.md` + `.yaml`，无数据库） |
| 搜索     | Fuse.js                               |
| 拖拽     | @dnd-kit                              |
| 测试     | Vitest + Playwright                   |

---

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与启动

```bash
# 克隆仓库
git clone https://github.com/your-username/skill-package.git
cd skill-package

# 安装依赖
npm install

# 启动开发服务器（前后端同时启动）
npm run dev
```

浏览器访问：**http://localhost:5173**

### 生产模式

```bash
# 构建
npm run build

# 启动（单进程，端口 3000）
npm start
```

### 全局命令

```bash
# 全局安装后可直接启动
npm link
skill-manager
```

---

## 项目结构

```
skill-package/
├── src/                    # 前端源码
│   ├── components/         # React 组件（按功能域划分）
│   │   ├── ui/             # shadcn/ui 基础组件
│   │   ├── layout/         # 布局组件（AppLayout、Sidebar、SecondarySidebar）
│   │   ├── stats/          # 统计组件（StatsPanel、ActivityHeatmap）
│   │   ├── skills/         # Skill 浏览
│   │   ├── workflow/       # 工作流编排
│   │   ├── sync/           # IDE 同步
│   │   ├── import/         # 导入管理
│   │   ├── settings/       # 设置
│   │   └── shared/         # 共享组件
│   ├── stores/             # Zustand 状态管理
│   ├── hooks/              # 自定义 Hooks
│   └── lib/                # 工具库
├── server/                 # 后端源码
│   ├── routes/             # API 路由
│   ├── services/           # 业务逻辑
│   ├── utils/              # 工具函数
│   └── middleware/         # Express 中间件
├── shared/                 # 前后端共享类型
├── skills/                 # Skill 文件目录
│   ├── coding/
│   ├── writing/
│   ├── devops/
│   └── workflows/
├── config/                 # 用户配置（YAML）
├── tests/                  # 集成测试 & E2E
└── bin/                    # CLI 入口
```

---

## 开发指南

### 常用命令

```bash
npm run dev           # 启动开发服务器
npm run build         # 构建生产版本
npm run typecheck     # TypeScript 类型检查
npm run lint          # ESLint 检查
npm run lint:fix      # 自动修复 lint 问题
npm run format        # Prettier 格式化
npm run test          # 运行单元测试（watch 模式）
npm run test:run      # 运行单元测试（单次）
npm run test:coverage # 测试覆盖率报告
npm run test:e2e      # 运行 E2E 测试
npm run test:all      # 运行全部测试
```

### 代码质量

项目采用严格的代码质量检查机制：

- **ESLint**: 配置了完整的 React Hooks 规则，确保依赖项正确声明
- **TypeScript**: 严格模式启用，包含完整的 Node.js 类型定义支持
- **Prettier**: 统一的代码格式化标准
- **Husky**: 提交前自动检查，确保代码质量

### Git Hooks

项目使用 **Husky** 管理 Git 钩子，确保代码质量和文档同步：

| 钩子         | 触发时机        | 执行内容                                                     |
| ------------ | --------------- | ------------------------------------------------------------ |
| `pre-commit` | `git commit` 前 | lint-staged（ESLint + Prettier）+ 单元测试 + README 同步检查 |
| `commit-msg` | 提交信息写入后  | commitlint 校验（Conventional Commits 规范）                 |
| `pre-push`   | `git push` 前   | E2E 测试 + 主分支自动语义化发版                              |

**README 同步检查规则：**

当 `src/`、`server/`、`shared/`、`skills/` 或 `_bmad-output/` 下有文件变更时，**必须同时更新 `README.md`（中文）和 `README.en.md`（英文）**，否则提交将被阻断。

**Project Context 更新提示：**

当业务文件变更时，hook 还会提示是否需要同步更新 `_bmad-output/project-context.md`（AI 代理项目上下文）。若本次变更涉及技术栈、架构模式、目录结构或开发规范，建议使用 `bmad-generate-project-context` 技能重新生成或手动更新该文件。此检查为**非阻断性提示**，不影响提交。

```bash
# 如确认无需更新文档，可跳过检查
git commit --no-verify
```

---

### API 概览

```
GET    /api/skills              # 获取所有 Skill 列表
GET    /api/skills/:id          # 获取 Skill 详情
PUT    /api/skills/:id/meta     # 更新 Skill 元数据
DELETE /api/skills/:id          # 删除 Skill
GET    /api/categories          # 获取分类列表
GET    /api/workflows           # 获取工作流列表
POST   /api/sync/push           # 推送到 IDE
POST   /api/sync/import         # 从 IDE 导入
GET    /api/config              # 读取配置
POST   /api/refresh             # 刷新 Skill 缓存
GET    /api/health              # 健康检查
GET    /api/skill-bundles       # 获取套件列表
POST   /api/skill-bundles       # 创建套件
PUT    /api/skill-bundles/:id   # 更新套件
DELETE /api/skill-bundles/:id   # 删除套件
PUT    /api/skill-bundles/:id/apply  # 一键激活套件
GET    /api/stats/activity           # 获取近期活跃度数据（支持 ?weeks= 参数）
```

---

## Skill 文件格式

每个 Skill 是一个带有 YAML Frontmatter 的 Markdown 文件：

```markdown
---
name: my-skill
description: 这个 Skill 的功能描述
category: coding
tags: [review, typescript]
author: Alex
version: 1.0.0
---

# Skill 正文内容

在这里编写 Skill 的具体指令和说明...
```

---

## 许可证

MIT © Alex
