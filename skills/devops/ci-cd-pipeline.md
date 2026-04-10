---
name: CI/CD 流水线配置
description: 帮助配置和优化 CI/CD 流水线，支持 GitHub Actions、GitLab CI 等平台
category: devops
tags:
  - ci-cd
  - github-actions
  - automation
author: Alex
version: "1.0.0"
---

# CI/CD 流水线配置

## 用途

协助配置持续集成和持续部署流水线：

- **GitHub Actions**: 工作流配置、矩阵构建、缓存优化
- **GitLab CI**: Pipeline 配置、Stage 编排
- **通用**: 测试自动化、构建优化、部署策略

## 最佳实践

1. 使用缓存加速依赖安装
2. 并行运行独立的测试任务
3. 使用环境变量管理敏感信息
4. 设置合理的超时时间
