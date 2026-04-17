---
story: bundle-v2-sync-integration
epic: bundle-v2
title: "同步页面套件选择 — 支持新套件类型"
status: ready-for-dev
priority: P1
created: "2026-04-16"
last_updated: "2026-04-16"
dependencies:
  - bundle-v2-data-model-refactor
source_doc: "_bmad-output/brainstorming/brainstorming-session-2026-04-16-120000.md"
---

# Story: 同步页面套件选择 — 支持新套件类型

## Story Overview

**Story ID:** bundle-v2-sync-integration
**Epic:** bundle-v2
**Title:** 同步页面套件选择 — 支持新套件类型
**Status:** ready-for-dev
**Priority:** P1

## Story

作为用户，我需要在 IDE 同步页面的套件快速选择区域能够使用新类型的套件（按来源、按特定 Skill），以便更便捷地选择要同步的 Skill。

## Acceptance Criteria

### AC-1: 统一套件选中逻辑
- [ ] `SyncSkillSelector` 组件支持解析三种套件类型
- [ ] `resolveBundleSkills` 函数统一处理 `criteria` 字段
- [ ] 分类、来源、Skill 条件取并集

### AC-2: 来源套件支持
- [ ] 点击来源套件时，动态查询该来源的所有 Skill
- [ ] 自动包含新增的该来源 Skill
- [ ] 选中状态正确计算（全选/部分选中/未选中）

### AC-3: Skill 套件支持
- [ ] 点击 Skill 套件时，直接选中 `criteria.skills` 中的 Skill
- [ ] 选中状态正确显示

### AC-4: 套件类型标识
- [ ] 套件按钮显示类型标识（分类/来源/Skill）
- [ ] 使用 Badge 或图标区分

### AC-5: 向后兼容
- [ ] 现有分类套件功能不受影响
- [ ] 旧 API 响应（`categoryNames`）仍然正常工作

## Tasks/Subtasks

- [ ] T1: 更新 `SyncSkillSelector.tsx` — 统一套件解析逻辑
- [ ] T2: 实现来源套件动态查询
- [ ] T3: 实现 Skill 套件选中
- [ ] T4: 添加套件类型标识 UI
- [ ] T5: 单元测试 — 套件解析逻辑
- [ ] T6: E2E 测试 — 同步页面套件筛选

## Dev Notes

### 统一解析逻辑

```typescript
// 统一的套件 Skill 解析
function resolveBundleSkills(bundle: SkillBundle, allSkills: SkillMeta[]): string[] {
  const skillIds = new Set<string>();

  // 1. 分类条件
  if (bundle.criteria.categories?.length) {
    const categoryMap = new Map<string, string[]>();
    for (const skill of allSkills) {
      const cat = skill.category.toLowerCase();
      if (!categoryMap.has(cat)) categoryMap.set(cat, []);
      categoryMap.get(cat)!.push(skill.id);
    }
    for (const cat of bundle.criteria.categories) {
      categoryMap.get(cat.toLowerCase())?.forEach(id => skillIds.add(id));
    }
  }

  // 2. 来源条件（动态）
  if (bundle.criteria.sources?.length) {
    for (const skill of allSkills) {
      if (bundle.criteria.sources.includes(skill.source ?? "")) {
        skillIds.add(skill.id);
      }
    }
  }

  // 3. 特定 Skill 条件
  if (bundle.criteria.skills?.length) {
    bundle.criteria.skills.forEach(id => skillIds.add(id));
  }

  return [...skillIds];
}
```

### 选中状态计算

```typescript
// 判断套件选中状态
function getBundleCheckState(
  bundle: SkillBundle,
  selectedSkillIds: string[],
  allSkills: SkillMeta[],
): "all" | "some" | "none" {
  const bundleSkillIds = resolveBundleSkills(bundle, allSkills);
  if (bundleSkillIds.length === 0) return "none";

  const selectedCount = bundleSkillIds.filter(id =>
    selectedSkillIds.includes(id)
  ).length;

  if (selectedCount === 0) return "none";
  if (selectedCount === bundleSkillIds.length) return "all";
  return "some";
}
```

## File List

```
src/components/sync/SyncSkillSelector.tsx       # 更新套件解析逻辑
tests/unit/components/sync/SyncSkillSelector.test.tsx  # 单元测试
tests/e2e/sync-bundle-selection.spec.ts        # E2E 测试
```

## Change Log

| 日期 | 操作 | 说明 |
|------|------|------|
| 2026-04-16 | 创建 | 初始版本 |

## Dev Agent Record

### Implementation Plan

_待实现后填充_

### Debug Log

_待实现后填充_

### Completion Notes

_待实现后填充_

### Test Coverage

- Vitest 单元测试：套件解析、选中状态计算
- E2E 测试：同步页面完整套件筛选流程

## Dependencies

本 Story 依赖 `bundle-v2-data-model-refactor` 完成后的新 API 和类型定义。
