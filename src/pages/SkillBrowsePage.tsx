import { LayoutGrid, List, RefreshCw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SkillGrid from "../components/skills/SkillGrid";
import SkillListView from "../components/skills/SkillListView";
import { useSkillSearch } from "../hooks/useSkillSearch";
import { detectCodeBuddy, refreshSkills } from "../lib/api";
import { useSkillStore } from "../stores/skill-store";

/**
 * Skill 浏览页 — 搜索栏 + 视图切换 + 卡片/列表视图
 */
export default function SkillBrowsePage() {
  const {
    fetchSkills,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    skills,
    viewMode,
    setViewMode,
    selectedCategory,
  } = useSkillStore();

  const navigate = useNavigate();
  const [coldStart, setColdStart] = useState<{
    detected: boolean;
    path: string;
    fileCount: number;
  } | null>(null);

  // 计算过滤后的 Skill 数量（与子组件逻辑一致）
  const categoryFiltered = selectedCategory
    ? skills.filter((s) => s.category === selectedCategory)
    : skills;
  const filteredSkills = useSkillSearch(categoryFiltered, searchQuery);

  // 首次加载时获取 Skill 列表
  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // 冷启动检测：skills 为空时检测 CodeBuddy 目录
  useEffect(() => {
    if (!loading && skills.length === 0) {
      detectCodeBuddy()
        .then(setColdStart)
        .catch(() => {});
    }
  }, [loading, skills.length]);

  // 手动刷新
  const handleRefresh = async () => {
    await refreshSkills();
    await fetchSkills();
  };

  // 视图偏好保存到 localStorage
  useEffect(() => {
    const saved = localStorage.getItem("skill-view-mode");
    if (saved === "grid" || saved === "list") {
      setViewMode(saved);
    }
  }, [setViewMode]);

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("skill-view-mode", mode);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 顶部工具栏 */}
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-xl font-bold font-[var(--font-code)] text-[hsl(var(--foreground))]">
          Skill 库
        </h1>
        <span className="text-sm text-[hsl(var(--muted-foreground))]">
          {filteredSkills.length === skills.length
            ? `${skills.length} 个 Skill`
            : `${filteredSkills.length} / ${skills.length} 个 Skill`}
        </span>

        {/* 搜索框 */}
        <div className="flex-1 max-w-md ml-auto relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
          />
          <input
            type="text"
            placeholder="搜索 Skill...  ⌘K"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent"
          />
        </div>

        {/* 视图切换 */}
        <div className="flex items-center border border-[hsl(var(--border))] rounded-md overflow-hidden">
          <button
            onClick={() => handleViewModeChange("grid")}
            className={`p-2 transition-colors ${
              viewMode === "grid"
                ? "bg-[hsl(var(--accent))] text-[hsl(var(--primary))]"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            }`}
            title="卡片视图"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => handleViewModeChange("list")}
            className={`p-2 transition-colors ${
              viewMode === "list"
                ? "bg-[hsl(var(--accent))] text-[hsl(var(--primary))]"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            }`}
            title="列表视图"
          >
            <List size={16} />
          </button>
        </div>

        {/* 刷新按钮 */}
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 rounded-md border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors disabled:opacity-50"
          title="刷新 Skill 列表"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* 冷启动引导 */}
      {!loading && skills.length === 0 && coldStart?.detected && (
        <div className="mb-4 p-6 rounded-lg border-2 border-dashed border-[hsl(var(--primary))/0.4] bg-[hsl(var(--primary))/0.05]">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
            🎉 检测到 CodeBuddy IDE Skill 文件
          </h2>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">
            在{" "}
            <code className="text-xs bg-[hsl(var(--muted))] px-1 py-0.5 rounded">
              {coldStart.path}
            </code>{" "}
            中发现 {coldStart.fileCount} 个 Skill 文件，点击下方按钮开始导入。
          </p>
          <button
            onClick={() => navigate("/import")}
            className="px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium text-sm hover:opacity-90 transition-opacity"
          >
            开始导入 →
          </button>
        </div>
      )}

      {/* 空状态（无冷启动检测结果） */}
      {!loading &&
        skills.length === 0 &&
        (!coldStart || !coldStart.detected) && (
          <div className="mb-4 p-6 rounded-lg border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))/50] text-center">
            <p className="text-[hsl(var(--muted-foreground))] text-lg mb-2">
              📭 暂无 Skill
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              前往{" "}
              <button
                onClick={() => navigate("/import")}
                className="text-[hsl(var(--primary))] hover:underline"
              >
                导入页面
              </button>{" "}
              从 IDE 导入 Skill 文件
            </p>
          </div>
        )}

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 rounded-md bg-[hsl(var(--destructive))/0.1] border border-[hsl(var(--destructive))/0.3] text-sm text-[hsl(var(--destructive))]">
          {error}
        </div>
      )}

      {/* 加载状态 */}
      {loading && skills.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw
            size={24}
            className="animate-spin text-[hsl(var(--primary))]"
          />
          <span className="ml-3 text-[hsl(var(--muted-foreground))]">
            加载中...
          </span>
        </div>
      ) : (
        /* Skill 视图 */
        <div className="flex-1 overflow-auto">
          {viewMode === "grid" ? <SkillGrid /> : <SkillListView />}
        </div>
      )}
    </div>
  );
}
