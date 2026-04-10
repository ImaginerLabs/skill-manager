# Story 0.4: 暗色主题设计系统与空壳布局

Status: done

## Story

As a 用户,
I want 看到一个暗色主题的开发者工具风格界面,
So that 我知道应用已正常运行并感受到专业的视觉体验。

## Acceptance Criteria (AC)

1. **AC-1: 暗色主题设计系统**
   - Given 用户在浏览器中打开应用
   - When 页面加载完成
   - Then 页面背景色为 Code Dark（#0F172A），主色调为 Run Green（#22C55E）
   - And CSS Variables 主题系统就位，映射到 shadcn/ui 组件

2. **AC-2: 字体系统**
   - Given 页面加载完成
   - When 查看字体渲染
   - Then Fira Code（标题/代码）和 Fira Sans（正文）字体正确加载
   - And 使用 font-display: swap + preload

3. **AC-3: shadcn/ui 基础组件**
   - Given Tailwind CSS 和 shadcn/ui 已配置
   - When 使用组件
   - Then Button、Card 等基础组件可用
   - And 按钮层级体系就位：Primary（绿色填充）、Secondary（暗色边框）、Ghost（透明）、Destructive（红色填充）

4. **AC-4: 三栏布局骨架**
   - Given 用户打开应用
   - When 页面渲染完成
   - Then 三栏布局骨架渲染（侧边栏 240px + 主内容区 flex-1 + 预览面板 400px 占位）
   - And 5 个路由页面显示对应空壳内容

5. **AC-5: Zustand Store 骨架**
   - Given 状态管理已配置
   - When 导入 Store
   - Then 4 个空 Store 骨架就位（skill-store、workflow-store、sync-store、ui-store）

6. **AC-6: TypeScript 编译通过**
   - Given 所有文件已创建
   - When 运行 `tsc --noEmit`
   - Then 编译通过，无错误

## Tasks / Subtasks

- [x] Task 1: 安装 Tailwind CSS + shadcn/ui 依赖 (AC: #1, #3)
  - [x] 1.1 安装 tailwindcss、@tailwindcss/vite
  - [x] 1.2 配置 Tailwind（通过 @tailwindcss/vite 插件）
  - [x] 1.3 安装 shadcn/ui 核心依赖（class-variance-authority、clsx、tailwind-merge、lucide-react、@radix-ui/react-slot）
  - [x] 1.4 创建 src/lib/utils.ts（cn 工具函数）
  - [x] 1.5 安装 zustand

- [x] Task 2: 创建暗色主题 CSS Variables (AC: #1)
  - [x] 2.1 创建 src/index.css，定义 CSS Variables（Code Dark + Run Green 主题）
  - [x] 2.2 在 main.tsx 中导入 index.css

- [x] Task 3: 配置字体系统 (AC: #2)
  - [x] 3.1 下载 Fira Code 和 Fira Sans 的 woff2 字体文件到 public/fonts/
  - [x] 3.2 在 index.css 中定义 @font-face 规则
  - [x] 3.3 在 index.html 中添加 preload link

- [x] Task 4: 创建 shadcn/ui 基础组件 (AC: #3)
  - [x] 4.1 创建 Button 组件（src/components/ui/button.tsx）
  - [x] 4.2 创建 Card 组件（src/components/ui/card.tsx）

- [x] Task 5: 创建三栏布局组件 (AC: #4)
  - [x] 5.1 创建 AppLayout 组件（src/components/layout/AppLayout.tsx）
  - [x] 5.2 创建 Sidebar 组件（src/components/layout/Sidebar.tsx）
  - [x] 5.3 更新 App.tsx 使用 AppLayout 包裹路由
  - [x] 5.4 更新页面组件显示页面名称

- [x] Task 6: 创建 Zustand Store 骨架 (AC: #5)
  - [x] 6.1 创建 skill-store.ts
  - [x] 6.2 创建 workflow-store.ts
  - [x] 6.3 创建 sync-store.ts
  - [x] 6.4 创建 ui-store.ts

- [x] Task 7: 集成验证 (AC: #6)
  - [x] 7.1 运行 `tsc --noEmit` 确认编译通过
  - [x] 7.2 运行 `npm run build` 确认构建成功

## Dev Notes

### 关键颜色 Token

- Code Dark: #0F172A (背景)
- Run Green: #22C55E (主色)
- Surface: #1E293B (卡片背景)
- Surface Elevated: #334155 (悬浮)
- Border: #475569 (边框)
- Text Primary: #F8FAFC
- Text Secondary: #94A3B8
- Error: #EF4444
- Warning: #F59E0B

### References

- [Source: ux-design-specification.md#Design-System-Foundation]
- [Source: architecture.md#Frontend-Architecture]

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (Amelia)

### Completion Notes List

- ✅ Task 1: 安装 tailwindcss、@tailwindcss/vite、class-variance-authority、clsx、tailwind-merge、lucide-react、@radix-ui/react-slot、zustand
- ✅ Task 2: 创建 src/index.css — 暗色主题 CSS Variables（Code Dark + Run Green）+ @font-face + 全局样式 + 焦点指示器 + 滚动条 + prefers-reduced-motion
- ✅ Task 3: 下载 4 个 woff2 字体文件 + index.html preload
- ✅ Task 4: 创建 Button（6 个变体）+ Card（6 个子组件）
- ✅ Task 5: 创建 AppLayout 三栏布局 + Sidebar 导航（5 个路由 + lucide 图标）+ 更新 App.tsx 使用嵌套路由 + Outlet
- ✅ Task 6: 创建 4 个 Zustand Store（skill-store、workflow-store、sync-store、ui-store）
- ✅ Task 7: tsc --noEmit ✅ + vite build ✅（1739 modules, 289.46 KB JS + 27.60 KB CSS）

### Verification Results

- `tsc --noEmit` ✅ 编译通过
- `vite build` ✅ 构建成功

### File List

- src/index.css (新建)
- src/lib/utils.ts (新建)
- src/components/ui/button.tsx (新建)
- src/components/ui/card.tsx (新建)
- src/components/layout/AppLayout.tsx (新建)
- src/components/layout/Sidebar.tsx (新建)
- src/stores/skill-store.ts (新建)
- src/stores/workflow-store.ts (新建)
- src/stores/sync-store.ts (新建)
- src/stores/ui-store.ts (新建)
- src/App.tsx (修改 — 使用 AppLayout 嵌套路由)
- src/main.tsx (修改 — 导入 index.css)
- vite.config.ts (修改 — 添加 @tailwindcss/vite 插件)
- index.html (修改 — 添加字体 preload)
- package.json (修改 — 添加依赖)
- public/fonts/FiraCode-Regular.woff2 (新建)
- public/fonts/FiraCode-Bold.woff2 (新建)
- public/fonts/FiraSans-Regular.woff2 (新建)
- public/fonts/FiraSans-Bold.woff2 (新建)
- src/pages/SkillBrowsePage.tsx (修改)
- src/pages/WorkflowPage.tsx (修改)
- src/pages/SyncPage.tsx (修改)
- src/pages/SettingsPage.tsx (修改)
- src/components/ui/.gitkeep (删除)
- src/components/layout/.gitkeep (删除)
- src/stores/.gitkeep (删除)
- public/fonts/.gitkeep (删除)
