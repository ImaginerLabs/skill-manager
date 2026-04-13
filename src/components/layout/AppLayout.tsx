import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSkillStore } from "../../stores/skill-store";
import { useUIStore } from "../../stores/ui-store";
import CommandPalette from "../shared/CommandPalette";
import ToastContainer from "../shared/Toast";
import SkillPreview from "../skills/SkillPreview";
import Header from "./Header";
import Sidebar from "./Sidebar";
import StatusBar from "./StatusBar";

/**
 * 应用主布局
 * 垂直结构：Header(48px) → 中间区域(flex-1) → StatusBar(28px)
 * 中间区域：侧边栏(240px) + 主内容区(flex-1) + 预览面板(400px)
 */
export default function AppLayout() {
  const { previewOpen, toggleSidebar, togglePreview } = useUIStore();
  const { selectedSkillId, fetchSkills } = useSkillStore();
  const location = useLocation();

  // 全局初始化：确保任何页面刷新都能加载分类和 Skill 数据
  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // 预览面板仅在 Skill 浏览页（/）下生效，切换到其他页面自动关闭
  const isSkillBrowsePage = location.pathname === "/";
  const showPreview = isSkillBrowsePage && (previewOpen || !!selectedSkillId);

  // 全局键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // ⌘B 切换侧边栏
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // Space 切换预览面板（非输入框内）
      if (e.key === " " && !isInput) {
        e.preventDefault();
        togglePreview();
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar, togglePreview]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[hsl(var(--background))]">
      {/* 顶部栏 */}
      <Header />

      {/* 中间区域：侧边栏 + 主内容 + 预览面板 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧边栏 */}
        <Sidebar />

        {/* 主内容区 */}
        <main className="flex-1 overflow-auto p-6 min-w-[480px]">
          <Outlet />
        </main>

        {/* 右侧预览面板 — 滑入动画 */}
        {showPreview && (
          <aside
            className="border-l border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0 overflow-hidden animate-slide-in-preview motion-reduce:animate-none relative"
            style={{ width: "var(--preview-width)" }}
          >
            <SkillPreview />
          </aside>
        )}
      </div>

      {/* 状态栏 */}
      <StatusBar />

      {/* Command Palette（全局浮层） */}
      <CommandPalette />

      {/* Toast 通知容器 */}
      <ToastContainer />
    </div>
  );
}
