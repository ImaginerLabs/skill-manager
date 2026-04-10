import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

/**
 * 三栏布局容器
 * 侧边栏 240px + 主内容区 flex-1 + 预览面板 400px（后续 Story 实现）
 */
export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
      {/* 左侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto p-6 min-w-[480px]">
        <Outlet />
      </main>

      {/* 右侧预览面板占位（后续 Story 实现） */}
    </div>
  );
}
