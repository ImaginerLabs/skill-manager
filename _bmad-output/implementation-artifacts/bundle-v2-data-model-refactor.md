---
story: bundle-v2-data-model-refactor
epic: bundle-v2
title: "V3 数据模型重构 — 统一混合条件套件"
status: ready-for-dev
priority: P1
created: "2026-04-16"
last_updated: "2026-04-16"
source_doc: "_bmad-output/brainstorming/brainstorming-session-2026-04-16-120000.md"
---

# Story: V3 数据模型重构 — 统一混合条件套件

## Story Overview

**Story ID:** bundle-v2-data-model-refactor
**Epic:** bundle-v2
**Title:** V3 数据模型重构 — 统一混合条件套件
**Status:** ready-for-dev
**Priority:** P1

## Story

作为系统，我需要统一套件数据模型，支持按分类、按来源、按特定 Skill 三种条件维度，以便用户可以更灵活地创建和管理套件。

## Acceptance Criteria

### AC-1: 统一套件数据模型
- [ ] `SkillBundle` 类型新增 `criteria` 字段，包含 `categories`、`sources`、`skills` 三个可选数组
- [ ] 向后兼容旧格式：`categoryNames` 字段在读取时自动映射到 `criteria.categories`
- [ ] `SkillBundleCreate` 和 `SkillBundleUpdate` Schema 支持新格式

### AC-2: 动态来源条件
- [ ] 来源条件（`criteria.sources`）使用时实时查询，不依赖快照
- [ ] `source` 字段为空或 undefined 的 Skill 归入 `""` 来源
- [ ] 来源列表从 Skill 缓存动态聚合

### AC-3: 统一激活逻辑
- [ ] `applyBundle` 函数合并三种条件取并集
- [ ] 返回结果包含激活的 Skill ID 列表和总数
- [ ] 覆盖模式写入 `activeCategories`（保持现有逻辑）

### AC-4: 启动迁移
- [ ] 服务启动时自动检测并迁移旧格式套件到 V3
- [ ] 迁移失败使用 try/catch 保护，不阻塞应用启动
- [ ] 迁移后旧 `categoryNames` 字段保留用于兼容性检测

### AC-5: 验证规则
- [ ] `criteria` 中 `categories`、`sources`、`skills` 至少有一个非空
- [ ] 单个条件数组最多 50 项
- [ ] 名称格式校验保持 `^[a-z0-9-]+$`

## Tasks/Subtasks

- [x] T1: 更新 `shared/types.ts` — 新增 `SkillBundleCriteria` 类型，更新 `SkillBundle` 接口
- [x] T2: 更新 `shared/schemas.ts` — 新增 `SkillBundleCriteriaSchema`，更新创建/更新 Schema
- [x] T3: 更新 `server/services/bundleService.ts` — 添加迁移逻辑，统一激活函数
- [x] T4: 更新 `server/index.ts` — 调用启动迁移
- [x] T5: 编写单元测试 — bundleService 迁移和激活逻辑测试（41 个测试全部通过）

## Dev Notes

### Architecture

```typescript
// shared/types.ts - 新增类型
interface SkillBundleCriteria {
  categories?: string[];  // 分类条件
  sources?: string[];     // 来源条件（动态）
  skills?: string[];      // 特定 Skill 条件
}

interface SkillBundle {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  criteria: SkillBundleCriteria;  // 替代 categoryNames
  createdAt: string;
  updatedAt: string;
}
```

### 迁移策略

```typescript
// 迁移函数
function migrateToNewFormat(bundle: OldSkillBundle): SkillBundle {
  if ('criteria' in bundle) return bundle as SkillBundle;  // 已是新格式
  return {
    ...bundle,
    criteria: {
      categories: bundle.categoryNames,  // 旧字段映射
    }
  };
}
```

### 激活逻辑

```typescript
// 统一激活：三种条件取并集
async function applyBundle(id: string): Promise<ApplyBundleResult> {
  const bundle = await getBundleById(id);
  const matchedSkillIds = new Set<string>();

  // 分类条件
  if (bundle.criteria.categories?.length) {
    // 现有逻辑...
  }

  // 来源条件（动态）
  if (bundle.criteria.sources?.length) {
    const allSkills = getAllSkills();
    for (const skill of allSkills) {
      if (bundle.criteria.sources.includes(skill.source || "")) {
        matchedSkillIds.add(skill.id);
      }
    }
  }

  // 特定 Skill 条件
  if (bundle.criteria.skills?.length) {
    bundle.criteria.skills.forEach(id => matchedSkillIds.add(id));
  }

  return {
    applied: [...matchedSkillIds],
    total: matchedSkillIds.size,
  };
}
```

## File List

```
shared/types.ts                    # 新增 SkillBundleCriteria 类型
shared/schemas.ts                  # 新增 SkillBundleCriteriaSchema
server/services/bundleService.ts    # 迁移逻辑 + 统一激活
server/index.ts                     # 启动迁移调用
tests/unit/server/services/bundleService.test.ts  # 单元测试
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

- Vitest 单元测试：迁移逻辑、激活逻辑
- 覆盖率目标：> 80%
