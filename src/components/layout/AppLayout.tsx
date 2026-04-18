import { X } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router-dom";
import { usePreviewMode } from "../../hooks/usePreviewMode";
import { useSkillStore } from "../../stores/skill-store";
import { useUIStore } from "../../stores/ui-store";
import CommandPalette from "../shared/CommandPalette";
import ToastContainer from "../shared/Toast";
import SkillPreview from "../skills/SkillPreview";
import { Button } from "../ui/button";
import Header from "./Header";
import SecondarySidebar from "./SecondarySidebar";
import Sidebar from "./Sidebar";
import StatusBar from "./StatusBar";

/**
 * 应用主布局
 * 垂直结构：Header(48px) → 中间区域(flex-1) → StatusBar(28px)
 * 中间区域：侧边栏(240px) + 主内容区(flex-1) + 预览面板(响应式)
 *
 * 预览面板三断点行为（Story 9.1 / AD-41）：
 * - Wide (≥1440px)：三栏常驻，预览面板 400px
 * - Standard (1024-1439px)：push 模式，点击卡片后推入 360px
 * - Compact (<1024px)：overlay 模式，覆盖主内容区
 */
export default function AppLayout() {
  const {
    toggleSidebar,
    previewOpen,
    setPreviewOpen,
    sidebarOpen,
    commandPaletteOpen,
  } = useUIStore();
  const { t } = useTranslation();
  const { fetchSkills, selectedSkillId } = useSkillStore();
  const location = useLocation();
  const { previewMode, containerRef } = usePreviewMode();

  // 全局初始化：确保任何页面刷新都能加载分类和 Skill 数据
  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const isSkillBrowsePage =
    location.pathname === "/" || location.pathname.startsWith("/skills");

  // Wide 断点下预览面板始终可见；push/overlay 模式下由 previewOpen 控制
  const isPreviewVisible =
    isSkillBrowsePage &&
    (previewMode === "always" || (previewOpen && !!selectedSkillId));

  // 关闭预览面板
  const closePreview = useCallback(() => {
    if (previewMode !== "always") {
      setPreviewOpen(false);
    }
  }, [previewMode, setPreviewOpen]);

  // 选中 Skill 时自动打开预览面板（push/overlay 模式）
  useEffect(() => {
    if (
      isSkillBrowsePage &&
      selectedSkillId &&
      previewMode !== "always" &&
      !previewOpen
    ) {
      setPreviewOpen(true);
    }
  }, [
    isSkillBrowsePage,
    selectedSkillId,
    previewMode,
    previewOpen,
    setPreviewOpen,
  ]);

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

      // ⌘\ 切换预览面板（Story 9.1: 替代原 Space 键）
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        if (isSkillBrowsePage) {
          setPreviewOpen(!previewOpen);
        }
        return;
      }

      // Escape 关闭预览面板（Standard/Compact 断点，CommandPalette 未打开时）
      if (
        e.key === "Escape" &&
        !isInput &&
        !commandPaletteOpen &&
        isPreviewVisible &&
        previewMode !== "always"
      ) {
        e.preventDefault();
        closePreview();
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    toggleSidebar,
    isSkillBrowsePage,
    previewOpen,
    setPreviewOpen,
    isPreviewVisible,
    previewMode,
    closePreview,
    commandPaletteOpen,
  ]);

  // 预览面板宽度和样式计算
  const previewWidth =
    previewMode === "always"
      ? "var(--preview-width)"
      : "var(--preview-panel-width-std)";

  // push 模式下主内容区需要收缩
  const mainStyle =
    previewMode === "push" && isPreviewVisible
      ? { minWidth: "380px" }
      : { minWidth: "480px" };

  // 预览面板 class 计算
  const getPreviewClassName = () => {
    const base =
      "border-l border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0 overflow-hidden relative";

    if (previewMode === "always") {
      return `${base} animate-slide-in-preview motion-reduce:animate-none`;
    }

    if (previewMode === "overlay") {
      return `${base} preview-panel preview-panel-overlay ${!isPreviewVisible ? "preview-panel-hidden" : ""}`;
    }

    // push 模式
    return `${base} preview-panel ${!isPreviewVisible ? "preview-panel-hidden" : ""}`;
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[hsl(var(--background))]">
      {/* 顶部栏 */}
      <Header />

      {/* 中间区域：侧边栏 + 主内容 + 预览面板 */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* 左侧边栏 */}
        <Sidebar />

        {/* 二级侧边栏 — 仅在 Skill 库页面且主 Sidebar 展开时显示分类目录 */}
        {isSkillBrowsePage && sidebarOpen && <SecondarySidebar />}

        {/* 主内容区 */}
        <main className="flex-1 overflow-auto p-6" style={mainStyle}>
          <Outlet />
        </main>

        {/* 右侧预览面板 — 响应式推拉（Story 9.1） */}
        {isSkillBrowsePage && (
          <aside
            className={getPreviewClassName()}
            style={{
              width: previewMode === "overlay" ? undefined : previewWidth,
            }}
            data-testid="preview-panel-aside"
          >
            {/* 关闭按钮 — Wide 断点下隐藏 */}
            {previewMode !== "always" && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 h-7 w-7"
                onClick={closePreview}
                aria-label={t("skillBrowse.closePreview")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <SkillPreview />
          </aside>
        )}
      </div>

      {/* overlay 模式遮罩 */}
      {previewMode === "overlay" && isPreviewVisible && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          style={{ top: "48px", bottom: "28px" }}
          onClick={closePreview}
        />
      )}

      {/* 状态栏 */}
      <StatusBar />

      {/* Command Palette（全局浮层） */}
      <CommandPalette />

      {/* Toast 通知容器 */}
      <ToastContainer />
    </div>
  );
}
