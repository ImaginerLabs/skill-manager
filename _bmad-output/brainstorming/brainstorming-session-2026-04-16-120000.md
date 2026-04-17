---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: "扩展套件管理功能 - 支持按来源和手动选择创建套件"
session_goals: "通过头脑风暴，整理出完整的规格说明，然后进入快速开发流程"
selected_approach: "ai-recommended"
techniques_used: ["SCAMPER", "Six Thinking Hats", "Decision Tree Mapping"]
ideas_generated: 15
session_active: false
workflow_completed: true
context_file: "_bmad-output/project-context.md"
---

# 头脑风暴会话总结

**日期:** 2026-04-16
**参与者:** Alex + AI Facilitation
**时长:** ~40 分钟
**技术方法:** SCAMPER + Six Thinking Hats + Decision Tree Mapping

---

## Session Overview

**Topic:** 扩展套件管理功能 - 支持按来源和手动选择创建套件

**Goals:** 通过头脑风暴，整理出完整的规格说明，然后进入快速开发流程

---

## Technique Execution Results

### SCAMPER Method

**Phase 1 关键洞察:**

1. **S - Substitute（替代）**
   - 核心决策：来源套件采用**动态查询模式**，存储 `sourceNames[]` 但使用时实时筛选
   - 优势：新 Skill 自动包含，无需手动更新

2. **C - Combine（组合）**
   - 核心决策：采用**统一混合条件模型**，支持多维度组合
   - 数据结构：`criteria: { categories?, sources?, skills? }`

3. **M - Modify（修改）**
   - UI 改进：Tab 切换 + 所见即所得预览

4. **P - Put to other uses（其他用途）**
   - Scope 确定：仅核心功能，不做扩展场景

5. **R - Reverse（颠倒）**
   - 激活模式：覆盖（保持现有逻辑）
   - 空来源：归入 `""`（与 SourceTree 一致）

6. **E - Eliminate（消除）**
   - 默认套件迁移：启动时自动迁移

### Six Thinking Hats

**各视角分析:**

| 帽子 | 视角 | 关键发现 |
|------|------|----------|
| 白帽 | 事实 | Skill 的 `source` 字段可选；来源从 Skill 自动聚合 |
| 红帽 | 直觉 | 用户对统一模型方案满意 |
| 黄帽 | 优势 | 统一模型扩展性好；动态查询减少维护成本 |
| 黑帽 | 风险 | 迁移失败风险；性能需关注 |
| 绿帽 | 创意 | 套件模板、组合套件（暂不做） |
| 蓝帽 | 流程 | 推荐分 4 个 Phase 实施 |

---

## Design Decisions Summary

### 核心决策

| # | 决策点 | 结论 |
|---|--------|------|
| D1 | 来源套件模式 | 动态查询，不依赖快照 |
| D2 | 数据模型 | 统一混合条件模型 `criteria: { categories, sources, skills }` |
| D3 | 迁移策略 | V3 直接重构，启动时自动迁移 |
| D4 | UI 改进 | Tab 切换 + 所见即所得预览 |
| D5 | Scope 边界 | 仅核心功能，不做扩展场景 |
| D6 | 激活模式 | 覆盖（保持现有逻辑） |
| D7 | 空来源处理 | 归入 `""`（与 SourceTree 一致） |

---

## Functional Specification

### 1. 数据模型

#### 1.1 统一套件结构

```typescript
// shared/types.ts - 新增
interface SkillBundleCriteria {
  categories?: string[];  // 分类条件（可选）
  sources?: string[];     // 来源条件（可选，动态）
  skills?: string[];      // 特定 Skill 条件（可选）
}

interface SkillBundle {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  criteria: SkillBundleCriteria;
  createdAt: string;
  updatedAt: string;
}
```

#### 1.2 向后兼容

旧格式迁移：`categoryNames[]` → `criteria.categories`

```typescript
// bundleService.ts 迁移逻辑
function migrateToNewFormat(bundle: OldSkillBundle): SkillBundle {
  return {
    ...bundle,
    criteria: {
      categories: bundle.categoryNames,  // 旧字段映射
    }
  };
}
```

### 2. API 设计

#### 2.1 创建/更新请求体

```typescript
// shared/schemas.ts - 更新 Zod Schema
const SkillBundleCriteriaSchema = z.object({
  categories: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
}).refine(
  (data) => data.categories?.length || data.sources?.length || data.skills?.length,
  { message: "至少需要选择一个条件" }
);

const SkillBundleCreateSchema = z.object({
  name: z.string().regex(/^[a-z0-9-]+$/),
  displayName: z.string(),
  description: z.string().optional(),
  criteria: SkillBundleCriteriaSchema,
});
```

#### 2.2 API 端点（保持现有端点不变）

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/skill-bundles` | 获取所有套件 |
| POST | `/api/skill-bundles` | 创建套件 |
| PUT | `/api/skill-bundles/:id` | 更新套件 |
| DELETE | `/api/skill-bundles/:id` | 删除套件 |
| PUT | `/api/skill-bundles/:id/apply` | 激活套件 |

### 3. 后端激活逻辑

```typescript
// bundleService.ts - 统一激活逻辑
async function applyBundle(id: string): Promise<ApplyBundleResult> {
  const bundle = await getBundleById(id);
  const { criteria } = bundle;

  const matchedSkillIds = new Set<string>();

  // 1. 分类条件
  if (criteria.categories?.length) {
    for (const cat of criteria.categories) {
      const catSkills = getSkillsByCategory(cat);
      catSkills.forEach(s => matchedSkillIds.add(s.id));
    }
  }

  // 2. 来源条件（动态查询）
  if (criteria.sources?.length) {
    const allSkills = getAllSkills();
    for (const skill of allSkills) {
      if (criteria.sources.includes(skill.source || "")) {
        matchedSkillIds.add(skill.id);
      }
    }
  }

  // 3. 特定 Skill 条件
  if (criteria.skills?.length) {
    criteria.skills.forEach(s => matchedSkillIds.add(s));
  }

  // 更新激活状态
  await updateActiveSkills([...matchedSkillIds]);

  return {
    applied: [...matchedSkillIds],
    total: matchedSkillIds.size,
  };
}
```

### 4. 前端 UI

#### 4.1 套件管理页面 (BundleManager.tsx)

```
┌─────────────────────────────────────────────────────────┐
│ 套件管理                                    [+ 新建]   │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [按分类] [按来源] [手动选择]                          │ │
│ │   ●       ○        ○                               │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ 分类:                                                   │
│ ☑ coding (23)                                          │
│ ☑ writing (15)                                         │
│ ☐ devops (8)                                           │
│                                                         │
│ 来源:                                                   │
│ ☑ 我的 Skill (10)                                      │
│ ☑ anthropic-official (15)                              │
│                                                         │
│ ─────────────────────────────                          │
│ 📊 预览: 将包含 38 个 Skill                              │
│ ─────────────────────────────                          │
│                                                         │
│ [取消]                           [确认创建]            │
└─────────────────────────────────────────────────────────┘
```

#### 4.2 同步页面套件选择 (SyncSkillSelector.tsx)

更新套件选中逻辑，支持：
- 按分类的套件（现有逻辑）
- 按来源的套件（新增）
- 按特定 Skill 的套件（新增）

```typescript
// 统一的套件选中逻辑
function resolveBundleSkills(bundle: SkillBundle): string[] {
  const skillIds = new Set<string>();

  if (bundle.criteria.categories) {
    // 分类逻辑...
  }
  if (bundle.criteria.sources) {
    // 来源动态查询...
  }
  if (bundle.criteria.skills) {
    bundle.criteria.skills.forEach(id => skillIds.add(id));
  }

  return [...skillIds];
}
```

### 5. 迁移流程

```typescript
// server/index.ts - 服务启动时
async function startup() {
  // ... 其他启动逻辑

  // 迁移旧套件到新格式
  const settings = await readSettings();
  const needsMigration = settings.skillBundles?.some(
    b => !('criteria' in b)
  );

  if (needsMigration) {
    settings.skillBundles = settings.skillBundles.map(migrateToNewFormat);
    await writeSettings(settings);
    console.log("[bundleService] 套件已迁移到 V3 格式");
  }

  // 确保默认套件存在
  await ensureDefaultBundle();
}
```

### 6. 验证规则

| 规则 | 说明 |
|------|------|
| 至少选择一个条件 | `categories`, `sources`, `skills` 至少有一个非空 |
| 条件数量上限 | 单个条件数组最多 50 项 |
| 套件数量上限 | 最多 50 个套件（保持不变） |
| 名称格式 | `^[a-z0-9-]+$`（保持不变） |

---

## Implementation Plan

### Phase 1: 数据模型重构

| 任务 | 文件 | 改动 |
|------|------|------|
| T1.1 | `shared/types.ts` | 新增 `SkillBundleCriteria` 和更新 `SkillBundle` |
| T1.2 | `shared/schemas.ts` | 更新 Zod Schema |
| T1.3 | `shared/constants.ts` | 新增相关常量 |
| T1.4 | `server/services/bundleService.ts` | 添加迁移逻辑 |

### Phase 2: 后端服务

| 任务 | 文件 | 改动 |
|------|------|------|
| T2.1 | `server/services/bundleService.ts` | 更新激活逻辑 |
| T2.2 | `server/index.ts` | 添加启动迁移调用 |

### Phase 3: 前端 UI

| 任务 | 文件 | 改动 |
|------|------|------|
| T3.1 | `src/components/settings/BundleManager.tsx` | Tab UI + 预览 |
| T3.2 | `src/components/sync/SyncSkillSelector.tsx` | 更新套件选中逻辑 |
| T3.3 | `src/stores/bundle-store.ts` | 更新类型定义 |
| T3.4 | `src/lib/api.ts` | 更新 API 类型 |

### Phase 4: 测试

| 任务 | 说明 |
|------|------|
| T4.1 | 单元测试：bundleService 迁移和激活逻辑 |
| T4.2 | E2E 测试：创建来源套件和手动选择套件 |
| T4.3 | 同步页面测试：新套件类型筛选功能 |

---

## Key Risks & Mitigations

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 迁移失败 | 应用无法启动 | 添加 try/catch，迁移失败时使用旧格式 |
| 性能问题 | Skill 数量多时激活慢 | 添加缓存或分批处理 |
| 用户困惑 | 三种条件混合太复杂 | UI 设计强调 Tab 隔离 |

---

## Success Metrics

- [ ] 所有旧套件成功迁移到新格式
- [ ] 可以创建按来源的套件
- [ ] 可以创建手动选择 Skill 的套件
- [ ] 同步页面可以正常使用新套件
- [ ] 现有分类套件功能不受影响
- [ ] 单元测试覆盖率 > 80%
- [ ] E2E 测试全部通过

---

## Session Insights

**关键突破:**
1. 从"三种独立套件类型" → "统一混合条件模型" 的设计演进
2. 来源套件的动态查询特性被发现并确认
3. UI Tab 切换 + 预览的改进方案

**用户偏好:**
- 喜欢直接重构，一次搞定
- 避免过度设计，聚焦核心功能
- 对渐进式改进持开放态度

**下一步:**
- 进入 Quick Dev 流程实现规格
