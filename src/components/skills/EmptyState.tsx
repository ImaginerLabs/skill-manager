// ============================================================
// components/skills/EmptyState.tsx — 空状态引导组件
// ============================================================

import { Download, FolderOpen, Package, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

interface EmptyStateProps {
  /** 是否已有 Skill（用于区分"无搜索结果"和"完全无 Skill"） */
  hasSkills: boolean;
  /** 当前分类下无 Skill（非搜索导致的空结果） */
  isCategoryEmpty?: boolean;
}

/**
 * 空状态引导 — 无 Skill 时提示从 IDE 导入，搜索无结果时提示调整条件，
 * 分类为空时展示居中 Package 图标
 */
export default function EmptyState({
  hasSkills,
  isCategoryEmpty,
}: EmptyStateProps) {
  const { t } = useTranslation();

  if (hasSkills && isCategoryEmpty) {
    // 有 Skill 但当前分类下为空
    return (
      <div
        data-testid="empty-state-category"
        className="flex flex-col items-center justify-center h-full min-h-[320px] text-center"
      >
        <Package
          size={48}
          className="text-[hsl(var(--muted-foreground))] mb-3 opacity-30"
        />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {t("category.noSkills")}
        </p>
      </div>
    );
  }

  if (hasSkills) {
    // 有 Skill 但筛选/搜索无结果
    return (
      <div
        data-testid="empty-state"
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <Search
          size={48}
          className="text-[hsl(var(--muted-foreground))] mb-4 opacity-40"
        />
        <h3 className="text-lg font-medium font-[var(--font-code)] text-[hsl(var(--foreground))] mb-2">
          {t("skillBrowse.emptyTitle")}
        </h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-md">
          {t("skillBrowse.searchPlaceholder")}
        </p>
      </div>
    );
  }

  // 完全无 Skill
  return (
    <div
      data-testid="empty-state"
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <FolderOpen
        size={48}
        className="text-[hsl(var(--primary))] mb-4 opacity-60"
      />
      <h3 className="text-lg font-medium font-[var(--font-code)] text-[hsl(var(--foreground))] mb-2">
        {t("skillBrowse.emptyTitle")}
      </h3>
      <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-md mb-4">
        {t("skillBrowse.emptyHint")}
      </p>
      <Button asChild>
        <Link to="/import" className="gap-2">
          <Download size={16} />
          {t("skillBrowse.coldStartImport")}
        </Link>
      </Button>
    </div>
  );
}
