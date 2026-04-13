---
title: "亮色/暗色主题切换"
type: "feature"
created: "2026-04-13"
status: "draft"
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 项目目前仅支持暗色主题（Code Dark #0F172A），用户无法切换到亮色模式，在强光环境或个人偏好下体验受限。

**Approach:** 在 CSS 中新增亮色主题变量集（通过 `[data-theme="light"]` 选择器），在 `ui-store` 中添加主题状态并持久化到 `localStorage`，在 Header 中添加切换按钮，在 `html` 元素上动态写入 `data-theme` 属性。

## Boundaries & Constraints

**Always:**

- 亮色主题配色方案：背景 `#F8FAFC`（slate-50），表面 `#FFFFFF`，主色保持 `#22C55E`（Run Green 品牌色不变）
- 主题状态持久化到 `localStorage`（key: `skill-manager-theme`），刷新后恢复
- 初始化时优先读取 `localStorage`，其次跟随系统 `prefers-color-scheme`
- 切换按钮放在 Header 右侧，`SyncStatusIndicator` 左边
- 所有现有暗色样式保持不变（向后兼容），亮色变量通过 `[data-theme="light"]` 覆盖
- 遵循项目 CSS 变量规范：HSL 格式，通过 `hsl(var(--xxx))` 引用

**Ask First:**

- 如果亮色主题下某些组件视觉效果不理想，是否需要额外的组件级样式调整

**Never:**

- 不修改现有暗色 CSS 变量（`:root` 块保持不变）
- 不引入新的 CSS-in-JS 或主题库
- 不修改 Tailwind 配置（仅通过 CSS 变量实现）
- 不为亮色主题单独创建组件副本

## I/O & Edge-Case Matrix

| Scenario                    | Input / State     | Expected Output / Behavior        | Error Handling                    |
| --------------------------- | ----------------- | --------------------------------- | --------------------------------- |
| 首次访问（无 localStorage） | 系统为暗色偏好    | 应用暗色主题                      | N/A                               |
| 首次访问（无 localStorage） | 系统为亮色偏好    | 应用亮色主题                      | N/A                               |
| 点击切换按钮                | 当前暗色          | 切换为亮色，持久化到 localStorage | N/A                               |
| 点击切换按钮                | 当前亮色          | 切换为暗色，持久化到 localStorage | N/A                               |
| 刷新页面                    | localStorage 有值 | 恢复上次主题，无闪烁              | localStorage 读取失败时降级为暗色 |

</frozen-after-approval>

## Code Map

- `src/index.css` — 主样式文件，添加 `[data-theme="light"]` CSS 变量覆盖块
- `src/stores/ui-store.ts` — UI 状态管理，添加 `theme` 状态 + `toggleTheme` action + localStorage 持久化
- `src/components/layout/Header.tsx` — 顶部栏，添加主题切换按钮（Sun/Moon 图标）
- `src/main.tsx` — 应用入口，添加初始化主题的内联脚本（防止 FOUC）

## Tasks & Acceptance

**Execution:**

- [ ] `src/index.css` -- 在文件末尾添加 `[data-theme="light"]` 选择器块，覆盖所有 CSS 变量为亮色值；同时将 `html { color-scheme: dark }` 改为由 JS 动态控制 -- 亮色主题视觉基础

- [ ] `src/stores/ui-store.ts` -- 添加 `theme: "dark" | "light"` 状态字段和 `toggleTheme()` action；初始值从 `localStorage.getItem("skill-manager-theme")` 读取，降级到 `window.matchMedia("(prefers-color-scheme: light)").matches`；`toggleTheme` 切换后写入 `localStorage` 并同步更新 `document.documentElement.dataset.theme` -- 主题状态管理与持久化

- [ ] `src/components/layout/Header.tsx` -- 引入 `Sun`/`Moon` 图标（lucide-react），在右侧 `SyncStatusIndicator` 左边添加主题切换 `<button>`，根据当前 `theme` 显示对应图标，`aria-label` 为「切换主题」 -- 用户可见的切换入口

- [ ] `src/main.tsx` -- 在 React 渲染前添加同步初始化逻辑：读取 localStorage 或 matchMedia，立即设置 `document.documentElement.dataset.theme`，防止首屏闪烁（FOUC） -- 无闪烁主题初始化

**Tests (MANDATORY — do NOT delete this section):**

- [ ] `tests/unit/stores/ui-store-theme.test.ts` -- 编写 Vitest 单元测试：覆盖 `toggleTheme` 切换逻辑、localStorage 读写、matchMedia 降级、`document.documentElement.dataset.theme` 同步 -- 核心逻辑验证

- [ ] `tests/e2e/theme-toggle.spec.ts` -- 编写 Playwright E2E 测试：点击切换按钮后 `html[data-theme]` 属性变化、刷新后主题持久化 -- 用户流程验证

**Acceptance Criteria:**

- Given 用户首次访问且系统为暗色偏好，when 页面加载，then `html` 元素有 `data-theme="dark"` 且背景为深色
- Given 用户首次访问且系统为亮色偏好，when 页面加载，then `html` 元素有 `data-theme="light"` 且背景为浅色
- Given 当前为暗色主题，when 点击 Header 中的切换按钮，then 主题切换为亮色，按钮图标变为 Sun，localStorage 写入 `"light"`
- Given 用户已切换为亮色并刷新页面，when 页面加载，then 恢复亮色主题，无明显闪烁
- Given 亮色主题激活，when 查看任意页面，then 背景为浅色（`#F8FAFC`），文字为深色，主色 Run Green 保持不变

## Design Notes

**亮色主题 CSS 变量映射（参考 shadcn/ui light 主题）：**

```css
[data-theme="light"] {
  --background: 210 40% 98%; /* #F8FAFC slate-50 */
  --foreground: 222.2 84% 4.9%; /* #0F172A 深色文字 */
  --card: 0 0% 100%; /* #FFFFFF 白色卡片 */
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 142.1 76.2% 36.3%; /* #22C55E 保持品牌色 */
  --primary-foreground: 355.7 100% 97.3%;
  --secondary: 210 40% 96.1%; /* #F1F5F9 */
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%; /* #E2E8F0 */
  --input: 214.3 31.8% 91.4%;
  --ring: 142.1 76.2% 36.3%;
  --surface: 210 40% 96.1%;
  --surface-elevated: 0 0% 100%;
}
```

**FOUC 防止策略：** 在 `src/main.tsx` 的 `ReactDOM.createRoot` 之前执行同步 JS，立即设置 `data-theme`，避免 React 水合前的主题闪烁。

## Verification

**Commands:**

- `npm run typecheck` -- expected: 零 TypeScript 错误
- `npm run test:run -- tests/unit/stores/ui-store-theme.test.ts` -- expected: 所有测试通过
- `npm run test:e2e -- tests/e2e/theme-toggle.spec.ts` -- expected: 所有 E2E 测试通过

**Manual checks (if no CLI):**

- 在浏览器中点击切换按钮，确认背景色、文字色、卡片色均正确切换
- 刷新页面后确认主题持久化，无白色闪烁
- 检查 `html` 元素的 `data-theme` 属性在切换时正确更新
