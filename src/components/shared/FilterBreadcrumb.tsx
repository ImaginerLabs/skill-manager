// ============================================================
// components/shared/FilterBreadcrumb.tsx — 筛选面包屑导航（Story 9.5, AD-46）
// ============================================================

import { ChevronRight, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSkillStore } from "../../stores/skill-store";

/** 面包屑层级项 */
interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isCurrent?: boolean;
}

/**
 * 筛选面包屑导航 — 显示当前筛选路径（如 全部 > coding > 来源: local）
 * 支持点击回退到某个层级，右侧 × 清除全部筛选
 * 数据源来自 useSkillStore（selectedCategory / selectedSource）
 * URL 参数同步由 useSyncSearchParams Hook 处理
 */
export default function FilterBreadcrumb() {
  const {
    selectedCategory,
    selectedSource,
    categories,
    setCategory,
    setSource,
  } = useSkillStore();
  const { t } = useTranslation();

  // 无筛选条件时不渲染
  if (!selectedCategory && !selectedSource) return null;

  // 构建面包屑层级
  const items: BreadcrumbItem[] = [];

  // 第一级：全部（点击清除所有筛选）
  items.push({
    label: t("skillBrowse.breadcrumbAll"),
    onClick: () => {
      setCategory(null);
    },
    isCurrent: false,
  });

  // 第二级：分类名（如果选中了分类）
  if (selectedCategory) {
    const cat = categories.find((c) => c.name === selectedCategory);
    const displayLabel = cat?.displayName || selectedCategory;
    items.push({
      label: displayLabel,
      onClick: () => {
        // 有来源时，点击分类层级仅清除来源，保留分类
        // 无来源时，点击分类层级清除分类回到全部
        if (selectedSource) {
          setSource(null);
        } else {
          setCategory(null);
        }
      },
      isCurrent: !selectedSource,
    });
  }

  // 第三级：来源（分类+来源同时选中时，来源为第三级）
  if (selectedSource) {
    items.push({
      label: t("skillBrowse.breadcrumbSource", { source: selectedSource }),
      onClick: () => {
        // 回退到分类层级：清除来源
        setSource(null);
      },
      isCurrent: true,
    });
  }

  // 清除全部筛选
  const handleClear = () => {
    setCategory(null);
    setSource(null);
  };

  return (
    <nav
      data-testid="filter-breadcrumb"
      aria-label={t("skillBrowse.breadcrumbNavLabel")}
      className="flex items-center gap-1.5 text-xs mb-3"
    >
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1.5">
          {index > 0 && <ChevronRight size={12} className="text-slate-500" />}
          {item.isCurrent ? (
            <span className="text-slate-200 font-medium truncate max-w-[200px]">
              {item.label}
            </span>
          ) : (
            <button
              type="button"
              onClick={item.onClick}
              className="text-slate-400 hover:text-green-400 cursor-pointer transition-colors duration-150 truncate max-w-[200px]"
            >
              {item.label}
            </button>
          )}
        </span>
      ))}

      {/* 清除按钮 */}
      <button
        type="button"
        data-testid="breadcrumb-clear"
        onClick={handleClear}
        className="ml-1.5 flex items-center justify-center w-5 h-5 rounded-sm text-slate-400 hover:text-green-400 hover:bg-slate-700/50 transition-colors duration-150"
        title={t("skillBrowse.breadcrumbClearFilter")}
        aria-label={t("skillBrowse.breadcrumbClearFilter")}
      >
        <X size={12} />
      </button>
    </nav>
  );
}
