// ============================================================
// hooks/useSyncSearchParams.ts — 筛选状态 ↔ URL 参数双向同步（Story 9.5, AD-46）
// 数据源来自 useSearchParams（React Router），不新增 Zustand store
// ============================================================

import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useSkillStore } from "../stores/skill-store";

/** URL 参数 key 定义 */
const PARAM_CATEGORY = "category";
const PARAM_SOURCE = "source";
const PARAM_QUERY = "q";

/**
 * 筛选状态 ↔ URL 参数双向同步 Hook
 *
 * - URL → Store：页面加载/URL 变化时，从 searchParams 读取筛选状态并同步到 store
 * - Store → URL：store 中筛选状态变化时，写入 searchParams
 * - 避免循环：使用版本号标记同步来源，跳过自身触发的更新
 */
export function useSyncSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    selectedCategory,
    selectedSource,
    searchQuery,
    setCategory,
    setSource,
    setSearchQuery,
  } = useSkillStore();

  // 使用版本号追踪同步方向，避免循环更新
  const syncVersionRef = useRef(0);
  const lastSyncedVersionRef = useRef(0);

  // ── Store → URL：筛选状态变化时同步到 URL ──
  useEffect(() => {
    // 跳过由 URL→Store 触发的间接更新
    if (syncVersionRef.current !== lastSyncedVersionRef.current) return;

    const params = new URLSearchParams();
    if (selectedCategory) params.set(PARAM_CATEGORY, selectedCategory);
    if (selectedSource) params.set(PARAM_SOURCE, selectedSource);
    if (searchQuery.trim()) params.set(PARAM_QUERY, searchQuery.trim());

    syncVersionRef.current += 1;
    setSearchParams(params, { replace: true });
  }, [selectedCategory, selectedSource, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── URL → Store：初始化 + URL 参数变化时同步 ──
  useEffect(() => {
    const urlCategory = searchParams.get(PARAM_CATEGORY);
    const urlSource = searchParams.get(PARAM_SOURCE);
    const urlQuery = searchParams.get(PARAM_QUERY) || "";

    // 检查 URL 参数是否与 store 不同
    const categoryDiffers = (urlCategory ?? null) !== selectedCategory;
    const sourceDiffers = (urlSource ?? null) !== selectedSource;
    const queryDiffers = urlQuery !== searchQuery;

    if (categoryDiffers || sourceDiffers || queryDiffers) {
      lastSyncedVersionRef.current = syncVersionRef.current + 1;

      if (categoryDiffers) {
        setCategory(urlCategory || null);
      }
      if (sourceDiffers) {
        setSource(urlSource || null);
      }
      if (queryDiffers) {
        setSearchQuery(urlQuery);
      }
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 手动同步方法（供外部调用） ──
  const syncToUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set(PARAM_CATEGORY, selectedCategory);
    if (selectedSource) params.set(PARAM_SOURCE, selectedSource);
    if (searchQuery.trim()) params.set(PARAM_QUERY, searchQuery.trim());
    setSearchParams(params, { replace: true });
  }, [selectedCategory, selectedSource, searchQuery, setSearchParams]);

  return { syncToUrl };
}
