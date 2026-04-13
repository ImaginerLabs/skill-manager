// ============================================================
// components/sync/SyncSkillSelector.tsx — Skill 勾选选择列表
// ============================================================

import {
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Layers,
  Minus,
  Search,
  Square,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { SkillBundleWithStatus, SkillMeta } from "../../../shared/types";
import { useSkillSearch } from "../../hooks/useSkillSearch";
import { fetchSkillBundles } from "../../lib/api";
import { useSkillStore } from "../../stores/skill-store";
import { useSyncStore } from "../../stores/sync-store";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";

/**
 * SyncSkillSelector — 同步页面 Skill 勾选列表
 * 支持搜索筛选、逐个勾选、按分类批量选择、全选/取消全选
 */
export default function SyncSkillSelector() {
  const { skills, categories, loading, fetchSkills } = useSkillStore();
  const {
    selectedSkillIds,
    toggleSkillSelection,
    selectByCategory,
    clearSelection,
  } = useSyncStore();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  // 套件相关状态
  const [bundles, setBundles] = useState<SkillBundleWithStatus[]>([]);
  const [bundlesLoading, setBundlesLoading] = useState(false);
  const [bundleSectionOpen, setBundleSectionOpen] = useState(true);
  // 分类折叠状态：默认全部折叠
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  const filteredSkills = useSkillSearch(skills, query);

  // 搜索时自动展开所有分类，清空搜索时重新折叠
  useEffect(() => {
    if (query.trim()) {
      // 展开所有分类
      setExpandedCategories(new Set(skills.map((s) => s.category)));
    } else {
      setExpandedCategories(new Set());
    }
  }, [query, skills]);

  const toggleCategoryExpand = useCallback((categoryName: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (skills.length === 0 && !loading) {
      fetchSkills();
    }
  }, [skills.length, loading, fetchSkills]);

  // 加载套件列表
  useEffect(() => {
    setBundlesLoading(true);
    fetchSkillBundles()
      .then(setBundles)
      .catch(() => setBundles([]))
      .finally(() => setBundlesLoading(false));
  }, []);

  // 按分类分组
  const groupedSkills = useMemo(() => {
    const groups = new Map<string, SkillMeta[]>();
    for (const skill of filteredSkills) {
      const cat = skill.category;
      if (!groups.has(cat)) {
        groups.set(cat, []);
      }
      groups.get(cat)!.push(skill);
    }
    return groups;
  }, [filteredSkills]);

  // 分类名 -> 该分类下所有 skill id（基于全量 skills，不受搜索过滤影响）
  const categorySkillIdsMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const skill of skills) {
      const cat = skill.category;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(skill.id);
    }
    return map;
  }, [skills]);

  // 分类显示名映射
  const categoryDisplayNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const cat of categories) {
      map.set(cat.name, cat.displayName);
    }
    return map;
  }, [categories]);

  // 全选/取消全选
  const allFilteredIds = useMemo(
    () => filteredSkills.map((s) => s.id),
    [filteredSkills],
  );

  const allSelected =
    allFilteredIds.length > 0 &&
    allFilteredIds.every((id) => selectedSkillIds.includes(id));

  const someSelected =
    !allSelected && allFilteredIds.some((id) => selectedSkillIds.includes(id));

  const handleToggleAll = useCallback(() => {
    if (allSelected) {
      clearSelection();
    } else {
      const newIds = new Set([...selectedSkillIds, ...allFilteredIds]);
      selectByCategory([...newIds]);
    }
  }, [
    allSelected,
    allFilteredIds,
    selectedSkillIds,
    selectByCategory,
    clearSelection,
  ]);

  // 按分类批量选择/取消
  const handleToggleCategory = useCallback(
    (categoryName: string) => {
      const categorySkillIds =
        groupedSkills.get(categoryName)?.map((s) => s.id) ?? [];
      const allCatSelected = categorySkillIds.every((id) =>
        selectedSkillIds.includes(id),
      );

      if (allCatSelected) {
        const catIdSet = new Set(categorySkillIds);
        selectByCategory(selectedSkillIds.filter((id) => !catIdSet.has(id)));
      } else {
        const newIds = new Set([...selectedSkillIds, ...categorySkillIds]);
        selectByCategory([...newIds]);
      }
    },
    [groupedSkills, selectedSkillIds, selectByCategory],
  );

  // 判断分类是否全选/部分选中
  const getCategoryCheckState = useCallback(
    (categoryName: string): "all" | "some" | "none" => {
      const categorySkillIds =
        groupedSkills.get(categoryName)?.map((s) => s.id) ?? [];
      if (categorySkillIds.length === 0) return "none";
      const selectedCount = categorySkillIds.filter((id) =>
        selectedSkillIds.includes(id),
      ).length;
      if (selectedCount === categorySkillIds.length) return "all";
      if (selectedCount > 0) return "some";
      return "none";
    },
    [groupedSkills, selectedSkillIds],
  );

  // 点击套件：将套件下所有分类的 Skill 追加到已选中
  const handleSelectBundle = useCallback(
    (bundle: SkillBundleWithStatus) => {
      // 收集套件下所有有效分类的 skill id
      const bundleSkillIds: string[] = [];
      for (const catName of bundle.categoryNames) {
        const ids = categorySkillIdsMap.get(catName) ?? [];
        bundleSkillIds.push(...ids);
      }
      if (bundleSkillIds.length === 0) return;

      // 判断是否已全部选中 → 切换逻辑
      const allBundleSelected = bundleSkillIds.every((id) =>
        selectedSkillIds.includes(id),
      );
      if (allBundleSelected) {
        const bundleIdSet = new Set(bundleSkillIds);
        selectByCategory(selectedSkillIds.filter((id) => !bundleIdSet.has(id)));
      } else {
        const newIds = new Set([...selectedSkillIds, ...bundleSkillIds]);
        selectByCategory([...newIds]);
      }
    },
    [categorySkillIdsMap, selectedSkillIds, selectByCategory],
  );

  // 判断套件选中状态
  const getBundleCheckState = useCallback(
    (bundle: SkillBundleWithStatus): "all" | "some" | "none" => {
      const bundleSkillIds: string[] = [];
      for (const catName of bundle.categoryNames) {
        const ids = categorySkillIdsMap.get(catName) ?? [];
        bundleSkillIds.push(...ids);
      }
      if (bundleSkillIds.length === 0) return "none";
      const selectedCount = bundleSkillIds.filter((id) =>
        selectedSkillIds.includes(id),
      ).length;
      if (selectedCount === bundleSkillIds.length) return "all";
      if (selectedCount > 0) return "some";
      return "none";
    },
    [categorySkillIdsMap, selectedSkillIds],
  );

  return (
    <div className="space-y-3">
      {/* 顶部：已选统计 + 搜索 */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckSquare size={18} className="text-[hsl(var(--primary))]" />
          <h3 className="text-sm font-medium text-[hsl(var(--foreground))]">
            {t("sync.selectSkills")}
          </h3>
          {selectedSkillIds.length > 0 && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0">
              {t("sync.selectedCount", { count: selectedSkillIds.length })}
            </Badge>
          )}
        </div>
        {selectedSkillIds.length > 0 && (
          <button
            onClick={clearSelection}
            className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            {t("sync.clearSelection")}
          </button>
        )}
      </div>

      {/* 套件快速选择区域 */}
      <div className="rounded-md border border-[hsl(var(--border))] overflow-hidden">
        <button
          onClick={() => setBundleSectionOpen((v) => !v)}
          className="flex items-center gap-2 w-full px-3 py-2 bg-[hsl(var(--muted)/0.4)] hover:bg-[hsl(var(--muted)/0.6)] transition-colors text-left"
        >
          <Layers size={14} className="text-[hsl(var(--primary))] shrink-0" />
          <span className="text-xs font-medium text-[hsl(var(--foreground))] flex-1">
            {t("sync.bundleSelect")}
          </span>
          {bundleSectionOpen ? (
            <ChevronDown
              size={14}
              className="text-[hsl(var(--muted-foreground))]"
            />
          ) : (
            <ChevronRight
              size={14}
              className="text-[hsl(var(--muted-foreground))]"
            />
          )}
        </button>

        {bundleSectionOpen && (
          <div className="p-2">
            {bundlesLoading ? (
              <p className="text-xs text-[hsl(var(--muted-foreground))] px-1 py-1">
                {t("common.loading")}
              </p>
            ) : bundles.length === 0 ? (
              <p className="text-xs text-[hsl(var(--muted-foreground))] px-1 py-1">
                {t("bundle.empty")}
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {bundles.map((bundle) => {
                  const state = getBundleCheckState(bundle);
                  return (
                    <button
                      key={bundle.id}
                      onClick={() => handleSelectBundle(bundle)}
                      title={bundle.description ?? bundle.displayName}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-colors ${
                        state === "all"
                          ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]"
                          : state === "some"
                            ? "bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.4)]"
                            : "bg-transparent text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] hover:text-[hsl(var(--foreground))]"
                      }`}
                    >
                      {state === "all" ? (
                        <CheckSquare size={11} className="shrink-0" />
                      ) : state === "some" ? (
                        <Minus size={11} className="shrink-0" />
                      ) : (
                        <Square size={11} className="shrink-0" />
                      )}
                      {bundle.displayName}
                      {bundle.brokenCategoryNames.length > 0 && (
                        <span className="opacity-60 text-[10px]">(!)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
        />
        <Input
          id="sync-skill-search"
          name="sync-skill-search"
          placeholder="搜索 Skill..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 h-9 text-sm"
          aria-label="搜索 Skill"
        />
      </div>

      {/* 全选 */}
      {filteredSkills.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <button
            onClick={handleToggleAll}
            className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            aria-label={allSelected ? "取消全选" : "全选"}
          >
            {allSelected ? (
              <CheckSquare size={14} className="text-[hsl(var(--primary))]" />
            ) : someSelected ? (
              <Minus size={14} className="text-[hsl(var(--primary))]" />
            ) : (
              <Square size={14} />
            )}
            {allSelected ? "取消全选" : `全选 (${filteredSkills.length})`}
          </button>
        </div>
      )}

      {/* Skill 列表（按分类分组） */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            加载中...
          </p>
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Search
            size={32}
            className="text-[hsl(var(--muted-foreground))] mb-2 opacity-40"
          />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {query ? "未找到匹配的 Skill" : "暂无可用 Skill"}
          </p>
        </div>
      ) : (
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-3">
            {[...groupedSkills.entries()].map(
              ([categoryName, categorySkills]) => {
                const checkState = getCategoryCheckState(categoryName);
                const displayName =
                  categoryDisplayNames.get(categoryName) ?? categoryName;

                return (
                  <div key={categoryName} className="space-y-1">
                    {/* 分类标题：左侧折叠箭头，右侧勾选区 */}
                    <div className="flex items-center gap-1 rounded-md hover:bg-[hsl(var(--accent))] transition-colors">
                      {/* 折叠/展开箭头 */}
                      <button
                        onClick={() => toggleCategoryExpand(categoryName)}
                        className="flex items-center justify-center w-6 h-7 shrink-0 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                        aria-label={
                          expandedCategories.has(categoryName)
                            ? `折叠 ${displayName}`
                            : `展开 ${displayName}`
                        }
                      >
                        {expandedCategories.has(categoryName) ? (
                          <ChevronDown size={13} />
                        ) : (
                          <ChevronRight size={13} />
                        )}
                      </button>
                      {/* 勾选区（点击批量选择该分类） */}
                      <button
                        onClick={() => handleToggleCategory(categoryName)}
                        className="flex items-center gap-2 flex-1 py-1.5 pr-2"
                        aria-label={`${checkState === "all" ? "取消选择" : "选择"}分类 ${displayName} 下所有 Skill`}
                      >
                        {checkState === "all" ? (
                          <CheckSquare
                            size={14}
                            className="text-[hsl(var(--primary))] shrink-0"
                          />
                        ) : checkState === "some" ? (
                          <Minus
                            size={14}
                            className="text-[hsl(var(--primary))] shrink-0"
                          />
                        ) : (
                          <Square
                            size={14}
                            className="text-[hsl(var(--muted-foreground))] shrink-0"
                          />
                        )}
                        <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                          {displayName}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 ml-auto"
                        >
                          {categorySkills.length}
                        </Badge>
                      </button>
                    </div>

                    {/* 分类下的 Skill 列表（折叠时隐藏） */}
                    <div
                      className={`pl-2 space-y-0.5 ${expandedCategories.has(categoryName) ? "" : "hidden"}`}
                    >
                      {categorySkills.map((skill) => {
                        const isSelected = selectedSkillIds.includes(skill.id);
                        return (
                          <label
                            key={skill.id}
                            className={`flex items-center gap-3 rounded-md px-2 py-2 cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-[hsl(var(--primary)/0.08)]"
                                : "hover:bg-[hsl(var(--accent))]"
                            }`}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                toggleSkillSelection(skill.id)
                              }
                              aria-label={`选择 ${skill.name}`}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                {skill.type === "workflow" && (
                                  <Zap
                                    size={12}
                                    className="text-[hsl(var(--primary))] shrink-0"
                                  />
                                )}
                                <span className="text-sm font-[var(--font-code)] text-[hsl(var(--foreground))] truncate">
                                  {skill.name}
                                </span>
                              </div>
                              {skill.description && (
                                <p className="text-xs text-[hsl(var(--muted-foreground))] truncate mt-0.5">
                                  {skill.description}
                                </p>
                              )}
                            </div>
                            {skill.type === "workflow" && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 shrink-0"
                              >
                                workflow
                              </Badge>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
