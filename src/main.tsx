import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import "./i18n/index"; // i18n 必须在所有其他 import 之前初始化
import "./index.css";

// 同步初始化主题，防止首屏闪烁（FOUC）
// 必须在 React 渲染前执行，直接操作 DOM
(function initTheme() {
  let theme = "dark";
  try {
    const stored = localStorage.getItem("skill-manager-theme");
    if (stored === "light" || stored === "dark") {
      theme = stored;
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      theme = "light";
    }
  } catch {
    // localStorage 不可用时保持默认暗色
  }
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
