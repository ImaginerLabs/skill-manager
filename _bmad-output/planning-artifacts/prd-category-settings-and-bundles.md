---
stepsCompleted: ["step-01-init", "step-02-discovery", "step-02b-vision", "step-02c-executive-summary", "step-03-success", "step-04-journeys", "step-05-domain", "step-06-innovation", "step-07-project-type", "step-08-scoping", "step-09-functional", "step-10-nonfunctional", "step-11-polish", "step-12-complete"]
inputDocuments: ["prd.md", "project-context.md"]
workflowType: 'prd'
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 1
  projectDocs: 2
classification:
  projectType: developer_tool
  domain: general
  complexity: low
  projectContext: brownfield
parentPrd: "prd.md"
partyModeDiscussion: true
---

# Product Requirements Document — 分类设置页重组织 & 套件功能

**Author:** Alex
**Date:** 2026-04-13
**类型:** 功能增量 PRD（Brownfield）
**父 PRD:** [prd.md](./prd.md)

---

## Executive Summary

本 PRD 描述对 Skill Manager 设置页的两项改进：

1. **分类设置页重组织**：将现有"设置"导航入口重命名为"分类"，页面内通过顶部 Tab 区分"分类设置"和"套件管理"两个功能区，解决当前设置页命名模糊、功能单一的问题。

2. **套件（Bundle）功能**：新增"套件"概念——套件是多个分类的引用集合，用户可以将常用的分类组合保存为套件，在不同工作场景下一键激活整套分类配置，无需每次手动逐条调整。

**核心价值：** 让用户在切换工作上下文（项目、角色、任务类型）时，能够一键加载对应的分类配置，提升 Skill 管理效率。

**Party Mode 讨论参与者：** 📋 John（PM）、🎨 Sally（UX 设计师）、🏗️ Winston（架构师）

---

## 背景与问题陈述

### 当前问题

1. **命名问题**：侧边栏导航显示"设置"，但点进去只有分类管理功能，用户预期与实际不符。"设置"暗示有更多配置项，但实际只有一个功能。

2. **功能缺失**：用户在不同工作场景下需要使用不同的分类组合（如：写代码时关注 `coding`、`testing`；写文档时关注 `writing`、`translation`），但目前没有办法保存和快速切换这些组合。

3. **扩展性不足**：设置页目前只有 `CategoryManager` 一个组件，未来添加新功能时缺乏清晰的组织结构。

### 用户痛点（Jobs-to-be-Done）

> 🎯 **"当我切换到新项目/新任务模式时，我想要一键加载对应的分类配置，这样我不需要每次都手动重新整理。"**

---

## Success Criteria

### 用户成功指标

- 用户能在 30 秒内创建一个套件并激活它
- 用户能直观理解"套件是分类的集合"这个概念（无需文档说明）
- 导航命名变更后，用户能准确预期点击"分类"后看到的内容

### 技术成功指标

- 零破坏性变更：现有 `CategoryManager` 功能 100% 保留
- 向后兼容：旧版 `settings.yaml`（无 `skillBundles` 字段）正常读取，默认为空数组
- 所有新增 API 端点有对应的单元测试和集成测试

---

## 功能范围

### 本次包含（MVP）

1. **导航重命名**：侧边栏"设置"→"分类"
2. **设置页 Tab 化**：顶部 Tab 切换"分类设置"和"套件管理"
3. **套件 CRUD**：创建、查看、编辑、删除套件
4. **套件一键激活**：将套件中的分类设置为当前激活分类
5. **损坏引用提示**：套件中引用的分类被删除后，显示警告而非静默失效

### 本次不包含（后续迭代）

- 套件导入/导出（API 占位，返回 501）
- 套件共享/团队协作
- 套件嵌套（套件包含套件）
- 分类激活状态的持久化跨会话同步（V1 仅本地状态）

---

## User Journeys

### Journey 1: 用户创建第一个套件

**场景：** Alex 在不同项目间切换，每次都要手动调整分类筛选。

**流程：**
1. Alex 点击侧边栏"分类"入口
2. 看到顶部两个 Tab："分类设置"（默认激活）和"套件管理"
3. 切换到"套件管理" Tab
4. 看到空状态引导："套件是分类的组合，点击「新建套件」开始创建"
5. 点击"新建套件"，填写名称"前端日常开发"，选择分类 `coding`、`testing`、`writing`
6. 确认创建，套件卡片出现在列表中，展示包含的 3 个分类 Tag
7. 点击"激活"，系统将这 3 个分类设为当前激活状态

**成功标准：** 整个流程 < 30 秒，无需查阅文档

### Journey 2: 套件中的分类被删除

**场景：** Alex 删除了 `testing` 分类，但他有一个套件引用了它。

**流程：**
1. Alex 在"分类设置" Tab 中删除 `testing` 分类
2. 切换到"套件管理" Tab
3. "前端日常开发"套件卡片显示黄色警告："包含 1 个已删除分类"
4. 展开套件，看到 `testing` 标签显示为删除线样式
5. Alex 可以编辑套件移除该引用，或忽略（激活时自动跳过损坏项）

**成功标准：** 用户清楚知道套件状态，不会产生困惑

---

## 功能需求

### 导航与页面结构

- **FR-CS-01**: 侧边栏导航入口从"设置"重命名为"分类"（路由保持 `/settings` 不变，避免破坏性变更）
- **FR-CS-02**: 分类页顶部显示两个 Tab："分类设置"（默认）和"套件管理"
- **FR-CS-03**: Tab 切换时保持各自的滚动位置和状态（不重置）

### 分类设置 Tab（现有功能保留）

- **FR-CS-04**: 保留现有 `CategoryManager` 的全部功能（创建、编辑、删除分类，展开查看 Skill，批量移出分类）
- **FR-CS-05**: 分类设置 Tab 的标题从"分类管理"改为"分类设置"

### 套件管理 Tab（新功能）

#### 套件列表

- **FR-CS-06**: 套件管理 Tab 展示所有套件的卡片列表
- **FR-CS-07**: 每张套件卡片展示：套件名称、描述（可选）、包含的分类数量、分类 Tag Chip 列表
- **FR-CS-08**: 套件卡片支持展开/折叠，折叠时显示摘要，展开时显示完整分类列表
- **FR-CS-09**: 套件列表为空时显示空状态引导，说明套件的用途并引导创建

#### 套件 CRUD

- **FR-CS-10**: 用户可以创建套件，必填字段：名称（英文标识，`/^[a-z0-9-]+$/`）、显示名称、至少选择 1 个分类；可选字段：描述
- **FR-CS-11**: 创建套件时，分类选择器从现有分类列表中多选，支持搜索过滤
- **FR-CS-12**: 用户可以编辑套件的显示名称、描述和分类列表
- **FR-CS-13**: 用户可以删除套件（仅删除套件本身，不影响其中引用的分类）
- **FR-CS-14**: 套件名称（英文标识）在系统内唯一，重复时提示错误

#### 套件激活

- **FR-CS-15**: 每个套件卡片提供"激活"按钮，点击后将套件中的分类设为当前激活分类（覆盖模式，不叠加）
- **FR-CS-16**: 激活操作将 `activeCategories` 写入 `config/settings.yaml`，持久化保存
- **FR-CS-17**: 激活结果展示：成功激活的分类数量，以及因引用损坏被跳过的分类数量
- **FR-CS-18**: 当前激活的套件在卡片上有视觉标识（如绿色边框或"已激活"Badge）

#### 损坏引用处理

- **FR-CS-19**: 套件中引用的分类被删除后，套件卡片显示黄色警告 Badge："包含 N 个已删除分类"
- **FR-CS-20**: 展开损坏套件时，已删除的分类 Tag 显示删除线样式和"已删除"标注
- **FR-CS-21**: 激活损坏套件时，自动跳过已删除的分类引用，仅激活有效分类
- **FR-CS-22**: 删除分类时不阻断操作，不反向扫描套件（职责分离）

#### 数据上限

- **FR-CS-23**: 系统最多支持 50 个套件，超限时创建操作返回错误提示
- **FR-CS-24**: 单个套件最多引用 20 个分类，超限时提示错误

---

## 非功能需求

### 性能

- **NFR-CS-01**: 套件列表加载时间 < 200ms（50 个套件规模）
- **NFR-CS-02**: 套件激活操作（写入 settings.yaml）< 500ms

### 兼容性

- **NFR-CS-03**: 旧版 `settings.yaml`（无 `skillBundles` 和 `activeCategories` 字段）正常读取，默认为空数组和空数组
- **NFR-CS-04**: 现有 `CategoryManager` 功能零破坏性变更

### 安全

- **NFR-CS-05**: 套件名称通过 `/^[a-z0-9-]+$/` 正则校验，防止路径注入
- **NFR-CS-06**: 所有写操作通过 `safeWrite()` 保证原子性和并发安全

---

## 技术架构（Winston 方案）

### 数据模型

**新增类型（`shared/types.ts`）：**

```typescript
interface SkillBundle {
  id: string;              // 格式：bundle-{ts36}-{rand4}
  name: string;            // 英文标识，唯一，/^[a-z0-9-]+$/
  displayName: string;     // 显示名称
  description?: string;
  categoryNames: string[]; // 引用分类的 name（英文标识）
  createdAt: string;       // ISO 8601
  updatedAt: string;
}
```

**`AppConfig` 扩展（`shared/types.ts`）：**

```typescript
interface AppConfig {
  // ...现有字段...
  skillBundles: SkillBundle[];    // 新增，默认 []
  activeCategories: string[];     // 新增，默认 []
}
```

**存储位置：** `config/settings.yaml`（`skillBundles` 和 `activeCategories` 字段）

### API 端点

```
GET    /api/skill-bundles              — 获取所有套件（含 brokenCategoryNames 注入）
POST   /api/skill-bundles              — 创建套件
PUT    /api/skill-bundles/:id          — 更新套件
DELETE /api/skill-bundles/:id          — 删除套件
PUT    /api/skill-bundles/:id/apply    — 一键激活套件

GET    /api/skill-bundles/export       — 501 占位（未来导出功能）
POST   /api/skill-bundles/import       — 501 占位（未来导入功能）
```

### 服务层

```
server/services/bundleService.ts
  - getBundles(): Promise<SkillBundle[]>
  - addBundle(data): Promise<SkillBundle>
  - updateBundle(id, data): Promise<SkillBundle>
  - removeBundle(id): Promise<void>
  - applyBundle(id): Promise<ApplyResult>
```

### 前端

```
src/stores/bundle-store.ts           — 套件状态管理
src/components/settings/BundleManager.tsx  — 套件管理组件
src/pages/SettingsPage.tsx           — 改造：加顶部 Tab
```

### 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `shared/types.ts` | 修改 | 新增 `SkillBundle`，`AppConfig` 追加字段 |
| `shared/schemas.ts` | 修改 | 新增 `SkillBundleSchema`，`AppConfigSchema` 扩展 |
| `shared/constants.ts` | 修改 | 新增 `BUNDLE_NOT_FOUND` 等错误码 |
| `server/services/bundleService.ts` | **新建** | 复用 pathPresetService 模式 |
| `server/routes/bundleRoutes.ts` | **新建** | 7个端点（含2个501占位） |
| `server/app.ts` | 修改 | 注册 bundleRoutes |
| `src/lib/api.ts` | 修改 | 新增5个 API 函数 |
| `src/stores/bundle-store.ts` | **新建** | Zustand store |
| `src/components/settings/BundleManager.tsx` | **新建** | 套件管理 UI 组件 |
| `src/pages/SettingsPage.tsx` | 修改 | 加顶部 Tab，重命名标题 |

**零改动文件：** `CategoryManager.tsx`、`categoryService.ts`、`categoryRoutes.ts`

---

## Party Mode 讨论结论

本 PRD 基于 Party Mode 多智能体讨论产出，以下是关键决策记录：

| 决策点 | 结论 | 讨论来源 |
|--------|------|----------|
| 导航命名 | "分类"（简洁直接） | John 提议，Sally/Winston 认同 |
| 功能名称 | "套件"（英文：bundle） | John 提议，Winston 确认技术映射 |
| 页面结构 | 顶部 Tab（分类设置 / 套件管理） | Sally 提议，Winston 确认实现简单 |
| 数据存储 | `settings.yaml`（`skillBundles` 字段） | Winston 提议，与 pathPresets 模式一致 |
| 引用关系 | 引用（不是包含），分类独立存在 | John 提议，三方认同 |
| 删除策略 | 显示"已损坏"警告，不阻断删除 | Winston 提议，John 认同 |
| 激活模式 | 覆盖（replace），不叠加 | Winston 提议，避免状态混乱 |
| 导出功能 | 本版本不做，API 占位 501 | Winston 提议，John 认同留口 |
| 数据上限 | 最多 50 个套件，单套件最多 20 个分类 | Winston 提议 |

---

## 验收标准

### AC-1: 导航重命名
- [ ] 侧边栏显示"分类"而非"设置"
- [ ] 路由 `/settings` 保持不变
- [ ] 页面 H1 标题显示"分类管理"

### AC-2: Tab 结构
- [ ] 页面顶部有"分类设置"和"套件管理"两个 Tab
- [ ] 默认激活"分类设置" Tab
- [ ] 切换 Tab 不重置各自的状态

### AC-3: 分类设置 Tab
- [ ] 现有 CategoryManager 功能 100% 保留
- [ ] Tab 标题显示"分类设置"

### AC-4: 套件创建
- [ ] 可以创建套件（名称、显示名称、选择分类）
- [ ] 名称重复时显示错误
- [ ] 名称不符合 `/^[a-z0-9-]+$/` 时显示错误
- [ ] 未选择分类时无法提交

### AC-5: 套件展示
- [ ] 套件卡片展示名称、描述、分类 Tag Chip
- [ ] 支持展开/折叠
- [ ] 空状态有引导文案

### AC-6: 套件激活
- [ ] 点击"激活"后，`settings.yaml` 中 `activeCategories` 更新
- [ ] 激活结果 Toast 提示成功数量
- [ ] 当前激活套件有视觉标识

### AC-7: 损坏引用
- [ ] 分类被删除后，引用该分类的套件显示黄色警告
- [ ] 激活损坏套件时自动跳过已删除分类
- [ ] 删除分类操作不被套件阻断

### AC-8: 向后兼容
- [ ] 旧版 `settings.yaml`（无 `skillBundles` 字段）正常启动
- [ ] 现有分类管理功能无回归

---

*本 PRD 由 Party Mode 多智能体讨论产出，参与者：📋 John（PM）、🎨 Sally（UX）、🏗️ Winston（Architect）*
*生成时间：2026-04-13*
