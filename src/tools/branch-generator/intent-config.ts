// ============================================================
// tools/branch-generator/intent-config.ts — 分支意图配置
// ============================================================

import type { IntentConfig, IntentId } from "./types";

/** 9 种分支意图配置 */
export const INTENT_CONFIGS: IntentConfig[] = [
  {
    id: "feature",
    prefix: "feature/",
    labelKey: "branchGenerator.intentFeature",
    icon: "➕",
    colorClass: "text-green-400",
    borderClass: "border-green-500/50",
    bgClass: "bg-green-500/10",
    descKey: "branchGenerator.intentDescFeature",
  },
  {
    id: "bugfix",
    prefix: "bugfix/",
    labelKey: "branchGenerator.intentBugfix",
    icon: "🐛",
    colorClass: "text-red-400",
    borderClass: "border-red-500/50",
    bgClass: "bg-red-500/10",
    descKey: "branchGenerator.intentDescBugfix",
  },
  {
    id: "hotfix",
    prefix: "hotfix/",
    labelKey: "branchGenerator.intentHotfix",
    icon: "🔥",
    colorClass: "text-orange-400",
    borderClass: "border-orange-500/50",
    bgClass: "bg-orange-500/10",
    descKey: "branchGenerator.intentDescHotfix",
  },
  {
    id: "release",
    prefix: "release/",
    labelKey: "branchGenerator.intentRelease",
    icon: "🚀",
    colorClass: "text-blue-400",
    borderClass: "border-blue-500/50",
    bgClass: "bg-blue-500/10",
    descKey: "branchGenerator.intentDescRelease",
  },
  {
    id: "refactor",
    prefix: "refactor/",
    labelKey: "branchGenerator.intentRefactor",
    icon: "🔄",
    colorClass: "text-purple-400",
    borderClass: "border-purple-500/50",
    bgClass: "bg-purple-500/10",
    descKey: "branchGenerator.intentDescRefactor",
  },
  {
    id: "chore",
    prefix: "chore/",
    labelKey: "branchGenerator.intentChore",
    icon: "🔧",
    colorClass: "text-gray-400",
    borderClass: "border-gray-500/50",
    bgClass: "bg-gray-500/10",
    descKey: "branchGenerator.intentDescChore",
  },
  {
    id: "docs",
    prefix: "docs/",
    labelKey: "branchGenerator.intentDocs",
    icon: "📄",
    colorClass: "text-cyan-400",
    borderClass: "border-cyan-500/50",
    bgClass: "bg-cyan-500/10",
    descKey: "branchGenerator.intentDescDocs",
  },
  {
    id: "test",
    prefix: "test/",
    labelKey: "branchGenerator.intentTest",
    icon: "🧪",
    colorClass: "text-yellow-400",
    borderClass: "border-yellow-500/50",
    bgClass: "bg-yellow-500/10",
    descKey: "branchGenerator.intentDescTest",
  },
  {
    id: "perf",
    prefix: "perf/",
    labelKey: "branchGenerator.intentPerf",
    icon: "⚡",
    colorClass: "text-pink-400",
    borderClass: "border-pink-500/50",
    bgClass: "bg-pink-500/10",
    descKey: "branchGenerator.intentDescPerf",
  },
];

/** 根据 ID 获取意图配置 */
export function getIntentConfig(id: IntentId): IntentConfig {
  return INTENT_CONFIGS.find((c) => c.id === id)!;
}

/** 预设目标分支 */
export const TARGET_BRANCHES = [
  { name: "main", icon: "👑", descKey: "branchGenerator.target.main" },
  { name: "master", icon: "👑", descKey: "branchGenerator.target.master" },
  { name: "develop", icon: "💻", descKey: "branchGenerator.target.develop" },
  { name: "staging", icon: "🖥️", descKey: "branchGenerator.target.staging" },
] as const;
