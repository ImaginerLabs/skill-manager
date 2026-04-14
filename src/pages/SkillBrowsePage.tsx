import {
  LayoutGrid,
  List,
  Package,
  RefreshCw,
  Search,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import SkillGrid from "../components/skills/SkillGrid";
import SkillListView from "../components/skills/SkillListView";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
    selectSkill,
    selectedSkillId,
  } = useSkillStore();
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [coldStart, setColdStart] = useState<{
    detected: boolean;
    path: string;
    fileCount: number;
  } | null>(null);

  // 计算过滤后的 Skill 数量（与子组件逻辑一致，大小写不敏感）
  const categoryFiltered = selectedCategory
    ? skills.filter(
        (s) => s.category.toLowerCase() === selectedCategory.toLowerCase(),
      )
    : skills;
  const filteredSkills = useSkillSearch(categoryFiltered, searchQuery);

  const { selectSkill, selectedSkillId } = useSkillStore();

  // 首次加载时获取 Skill 列表
  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // skills 加载完成后，若未选中任何 skill，自动选中第一个
  useEffect(() => {
    if (!loading && skills.length > 0 && !selectedSkillId) {
      selectSkill(skills[0].id);
    }
  }, [loading, skills, selectedSkillId, selectSkill]);

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
          {t("skillBrowse.title")}
        </h1>
        <span className="text-sm text-[hsl(var(--muted-foreground))]">
          {filteredSkills.length === skills.length
            ? t("skillBrowse.skillCount", { count: skills.length })
            : t("skillBrowse.skillCountFiltered", {
                filtered: filteredSkills.length,
                total: skills.length,
              })}
        </span>

        {/* 搜索框 */}
        <div className="flex-1 max-w-md ml-auto relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] pointer-events-none"
          />
          <Input
            data-testid="search-input"
            type="text"
            placeholder={t("skillBrowse.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* 视图切换 */}
        <div
          data-testid="view-toggle"
          className="flex items-center border border-[hsl(var(--border))] rounded-md overflow-hidden"
        >
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => handleViewModeChange("grid")}
            className={`h-9 w-9 rounded-none ${viewMode === "grid" ? "text-[hsl(var(--primary))]" : ""}`}
            title={t("skillBrowse.cardView")}
          >
            <LayoutGrid size={16} />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => handleViewModeChange("list")}
            className={`h-9 w-9 rounded-none ${viewMode === "list" ? "text-[hsl(var(--primary))]" : ""}`}
            title={t("skillBrowse.listView")}
          >
            <List size={16} />
          </Button>
        </div>

        {/* 刷新按钮 */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={loading}
          title={t("skillBrowse.refresh")}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      {/* 冷启动引导 */}
      {!loading && skills.length === 0 && coldStart?.detected && (
        <div className="mb-4 p-6 rounded-lg border-2 border-dashed border-[hsl(var(--primary))/0.4] bg-[hsl(var(--primary))/0.05]">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={20} className="text-[hsl(var(--primary))]" />
            <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
              {t("skillBrowse.coldStartDetected")}
            </h2>
            <Badge variant="default" className="text-xs">
              {t("skillBrowse.coldStartFiles", { count: coldStart.fileCount })}
            </Badge>
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">
            <code className="text-xs bg-[hsl(var(--surface-elevated))] px-1 py-0.5 rounded">
              {coldStart.path}
            </code>{" "}
            {t("skillBrowse.coldStartLocation")}
          </p>
          <Button onClick={() => navigate("/import")}>
            {t("skillBrowse.coldStartImport")}
          </Button>
        </div>
      )}

      {/* 空状态（无冷启动检测结果） */}
      {!loading &&
        skills.length === 0 &&
        (!coldStart || !coldStart.detected) && (
          <div className="mb-4 p-6 rounded-lg border border-dashed border-[hsl(var(--border))] text-center">
            <Package
              size={48}
              className="mx-auto text-[hsl(var(--muted-foreground))] mb-3 opacity-40"
            />
            <p className="text-[hsl(var(--muted-foreground))] text-lg mb-2">
              {t("skillBrowse.emptyTitle")}
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              <button
                onClick={() => navigate("/import")}
                className="text-[hsl(var(--primary))] hover:underline"
              >
                {t("skillBrowse.emptyImportLink")}
              </button>{" "}
              {t("skillBrowse.emptyHint")}
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
            {t("skillBrowse.loadingText")}
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
