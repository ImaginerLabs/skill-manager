// ============================================================
// tools/branch-generator/history.ts — 历史记录本地存储管理
// ============================================================

import type { HistoryEntry } from "./types";

const STORAGE_KEY = "branchHistory";
const MAX_ENTRIES = 20;

/** 从 localStorage 读取历史记录 */
export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryEntry[];
  } catch {
    return [];
  }
}

/** 保存一条历史记录（自动去重 + 截断） */
export function addHistory(branchName: string): HistoryEntry[] {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const time = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const entry: HistoryEntry = { branchName, time };

  // 去重：同名分支只保留最新
  let list = loadHistory().filter((h) => h.branchName !== branchName);
  list = [entry, ...list];

  // 截断到 MAX_ENTRIES
  if (list.length > MAX_ENTRIES) {
    list = list.slice(0, MAX_ENTRIES);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return list;
}

/** 清空所有历史记录 */
export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
