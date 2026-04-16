---
# 注意不要修改本文头文件，如修改，CodeBuddy（内网版）将按照默认逻辑设置
type: always
---

# Skill Package 项目规则

> **完整文档参考：** [docs/](./docs/)  
> **执行流程：** [docs/execution-pipeline.md](./docs/execution-pipeline.md)  
> **技能清单：** [docs/bmad-skills-inventory.md](./docs/bmad-skills-inventory.md)

---

## 核心文件结构

### 必读文件（P0）

- `_bmad-output/project-context.md` - 项目上下文（每次任务前加载）

### 主要规划产物（P1）

- `_bmad-output/planning-artifacts/architecture.md` - 架构决策文档
- `_bmad-output/planning-artifacts/prd/prd.md` - 产品需求文档
- `_bmad-output/planning-artifacts/epics/epics.md` - Epics 列表
- `_bmad-output/planning-artifacts/ux/ux-design-specification.md` - UX 设计规范

### 实施追踪（P2）

- `_bmad-output/implementation-artifacts/sprint-status.yaml` - Sprint 状态
- `implementation-artifacts/{story-id}.md` - Story 文件

---

## 核心工作流程

### 四阶段开发流程

1. **分析** → 产品简报/PRFAQ → 市场研究/技术研究
2. **规划** → PRD 创建/验证 → UX 设计
3. **方案设计** → 架构设计 → Epic/Story 创建
4. **实施** → Sprint 规划 → Story 执行 → 回顾

### Story 执行流程（7步）

1. **CS:create** - 创建 Story 文件
2. **CS:validate** - 验证 Story 就绪（推荐）
3. **DS** - 实现 + 单元测试
4. **QA** - 集成/E2E 测试（强制）
5. **CR** - 代码审查（强制）
6. **done** - Story 签收
7. **ER** - Epic 回顾

### 关键技能

- **bmad-help** - 帮助导航
- **bmad-party-mode** - 多 Agent 讨论
- **bmad-create-prd** - 创建 PRD
- **bmad-create-architecture** - 创建架构
- **bmad-dev-story** - 开发 Story
- **bmad-code-review** - 代码审查
- **bmad-qa-generate-e2e-tests** - 生成测试

### 状态流转

```
backlog → ready-for-dev → in-progress → qa → review → done
```

## 详细文档

- **技能清单**: [docs/bmad-skills-inventory.md](./docs/bmad-skills-inventory.md)
- **执行流程**: [docs/execution-pipeline.md](./docs/execution-pipeline.md)
