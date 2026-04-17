---
story: bundle-v2-ui-tab-preview
epic: bundle-v2
title: "套件管理 UI 增强 — Tab 切换 + 实时预览"
status: ready-for-dev
priority: P1
created: "2026-04-16"
last_updated: "2026-04-16"
dependencies:
  - bundle-v2-data-model-refactor
source_doc: "_bmad-output/brainstorming/brainstorming-session-2026-04-16-120000.md"
---

# Story: 套件管理 UI 增强 — Tab 切换 + 实时预览

## Story Overview

**Story ID:** bundle-v2-ui-tab-preview
**Epic:** bundle-v2
**Title:** 套件管理 UI 增强 — Tab 切换 + 实时预览
**Status:** ready-for-dev
**Priority:** P1

## Story

作为用户，我需要在创建套件时能够通过 Tab 切换选择「按分类」「按来源」或「手动选择」三种方式，并实时预览当前选择包含的 Skill 数量，以便更直观地管理套件。

## Acceptance Criteria

### AC-1: Tab 切换模式
- [ ] 套件创建表单支持三个 Tab：「按分类」「按来源」「手动选择」
- [ ] Tab 切换有平滑动画效果（滑块平移）
- [ ] 当前 Tab 高亮显示

### AC-2: 按分类选择
- [ ] 显示所有分类列表，每个分类显示 Skill 数量
- [ ] 支持多选 Checkbox
- [ ] 支持「全选」/「取消全选」按钮

### AC-3: 按来源选择
- [ ] 从 Skill 缓存动态聚合来源列表
- [ ] 每个来源显示 Skill 数量
- [ ] 来源映射显示（如 `""` → 「我的 Skill」）
- [ ] 支持多选 Checkbox

### AC-4: 手动选择 Skill
- [ ] 显示 Skill 列表（可搜索）
- [ ] 支持多选 Checkbox
- [ ] 显示已选数量

### AC-5: 所见即所得预览
- [ ] 实时计算当前选择包含的 Skill 总数
- [ ] 显示在表单底部
- [ ] 支持三种条件的并集计算

### AC-6: 列表展示
- [ ] 套件列表卡片显示条件类型标签
- [ ] 展开详情显示实际包含的分类/来源/Skill 标签

## Tasks/Subtasks

- [x] T1: 更新 `BundleManager.tsx` — 添加 Tab 切换组件
- [x] T2: 实现按分类选择 — 复用现有分类列表
- [x] T3: 实现按来源选择 — 从 Skill 缓存聚合来源
- [x] T4: 实现手动选择 Skill — Skill 列表 + 搜索
- [x] T5: 实现实时预览 — 计算并显示 Skill 总数
- [x] T6: 更新套件列表展示 — 显示条件类型
- [x] T7: E2E 测试 — 套件创建流程（使用 Playwright）

## Dev Notes

### UI Layout

```
┌─────────────────────────────────────────────────────────┐
│ 套件管理                                    [+ 新建]   │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [按分类] [按来源] [手动选择]  ← 滑块动画 Tab        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ （Tab 内容区域）                                        │
│                                                         │
│ ─────────────────────────────                          │
│ 📊 预览: 将包含 38 个 Skill    ← 实时预览              │
│ ─────────────────────────────                          │
│                                                         │
│ [取消]                           [确认创建]            │
└─────────────────────────────────────────────────────────┘
```

### 预览计算逻辑

```typescript
function calculatePreview(criteria: SkillBundleCriteria): number {
  const matchedIds = new Set<string>();

  // 分类
  for (const cat of criteria.categories ?? []) {
    getSkillsByCategory(cat).forEach(s => matchedIds.add(s.id));
  }

  // 来源（动态）
  for (const skill of getAllSkills()) {
    if (criteria.sources?.includes(skill.source ?? "")) {
      matchedIds.add(skill.id);
    }
  }

  // 特定 Skill
  criteria.skills?.forEach(id => matchedIds.add(id));

  return matchedIds.size;
}
```

## File List

```
src/components/settings/BundleManager.tsx    # Tab UI + 预览
src/components/settings/CategorySelector.tsx   # 分类选择组件（复用）
src/components/settings/SourceSelector.tsx    # 来源选择组件（新建）
src/components/settings/SkillSelector.tsx     # Skill 选择组件（新建）
tests/e2e/bundle-management.spec.ts         # E2E 测试
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

- Vitest 组件测试：Tab 切换、预览计算
- E2E 测试：完整创建流程

## Dependencies

本 Story 依赖 `bundle-v2-data-model-refactor` 完成后的新 API 和类型定义。
