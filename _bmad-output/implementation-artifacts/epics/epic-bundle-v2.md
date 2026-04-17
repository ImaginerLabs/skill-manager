---
epic: bundle-v2
title: "Bundle-V2: 套件管理功能扩展 — 按来源和手动选择创建套件"
status: in-progress
priority: P1
created: "2026-04-16"
last_updated: "2026-04-16"
dependencies:
  - epic-8
  - epic-bundle
  source_doc: "_bmad-output/brainstorming/brainstorming-session-2026-04-16-120000.md"
---

# Epic Bundle-V2: 套件管理功能扩展

## Epic Overview

**Epic ID:** bundle-v2
**Title:** 套件管理功能扩展 — 按来源和手动选择创建套件
**Status:** in-progress
**Priority:** P1

## Source

本 Epic 源自 2026-04-16 的头脑风暴会话：
`_bmad-output/brainstorming/brainstorming-session-2026-04-16-120000.md`

## Background

现有套件管理仅支持**按分类**创建套件（`categoryNames[]`）。用户需求：

1. **按来源创建套件**：把多个来源（Source）多选作为一个套件，来源就类似于分类
2. **手动选择 Skill 创建套件**：让用户多选具体 Skill 保存为套件
3. **同步页面应用**：这两种新套件也要在 IDE 同步页面提供快捷筛选

## Design Decisions

| # | 决策点 | 结论 |
|---|--------|------|
| D1 | 来源套件模式 | 动态查询，不依赖快照 |
| D2 | 数据模型 | 统一混合条件模型 `criteria: { categories, sources, skills }` |
| D3 | 迁移策略 | V3 直接重构，启动时自动迁移 |
| D4 | UI 改进 | Tab 切换 + 所见即所得预览 |
| D5 | Scope 边界 | 仅核心功能，不做扩展场景 |
| D6 | 激活模式 | 覆盖（保持现有逻辑） |
| D7 | 空来源处理 | 归入 `""`（与 SourceTree 一致） |

## Stories

### Story 1: bundle-v2-data-model-refactor
**Title:** V3 数据模型重构 — 统一混合条件套件
**Status:** backlog

### Story 2: bundle-v2-ui-tab-preview
**Title:** 套件管理 UI 增强 — Tab 切换 + 实时预览
**Status:** backlog

### Story 3: bundle-v2-sync-integration
**Title:** 同步页面套件选择 — 支持新套件类型
**Status:** backlog

## Functional Requirements

### FR-BV2-01: 统一套件数据模型
套件支持三种条件维度：`categories`、`sources`、`skills`，取并集作为激活结果

### FR-BV2-02: 按来源创建套件
用户可多选来源作为套件条件，来源套件采用动态查询

### FR-BV2-03: 手动选择 Skill 创建套件
用户可在创建套件时多选具体 Skill

### FR-BV2-04: 所见即所得预览
套件创建界面实时显示当前选择包含的 Skill 数量

### FR-BV2-05: 同步页面套件筛选
IDE 同步页面的套件快速选择支持新套件类型

### FR-BV2-06: 向后兼容迁移
服务启动时自动将旧格式套件迁移到 V3 格式

## Non-Functional Requirements

### NFR-BV2-01: 性能
来源动态查询应高效处理 ≤1000 个 Skill

### NFR-BV2-02: 稳定性
迁移失败不应导致应用无法启动

### NFR-BV2-03: 用户体验
Tab 切换提供清晰的视觉反馈

## Implementation Notes

1. 统一模型采用 `criteria` 字段，替代原来的 `categoryNames`
2. 激活逻辑合并三种条件取并集
3. 迁移在服务启动时执行，使用 try/catch 保护
4. UI 采用 Tab 组件实现分类/来源/手动选择切换
