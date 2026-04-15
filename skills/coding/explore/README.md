# explore Skill

> 🔍 专业的代码探索、问题分析和上下文研究工具

## 概述

explore Skill 是一个强大的代码分析工具，专门用于：

- **代码库探索** - 分析项目结构和技术栈
- **问题诊断** - 识别代码问题和潜在bug
- **上下文研究** - 理解陌生代码库的业务逻辑
- **解决方案提供** - 给出具体的修复建议和最佳实践

## 快速开始

### 安装与启用

1. 确保Skill目录位于正确的路径：

   ```bash
   /Users/alex/Desktop/Github/General-Skills/explore/
   ```

2. Skill会自动在Claude中可用，当用户提到相关关键词时触发

### 触发关键词

当用户提到以下内容时，explore Skill会自动激活：

- "代码探索"、"项目分析"、"技术栈识别"
- "问题诊断"、"bug分析"、"错误排查"
- "上下文理解"、"代码逻辑梳理"、"调用链分析"
- "代码审查"、"质量检查"、"性能分析"

## 功能特性

### 🎯 核心能力

1. **智能代码探索**
   - 自动分析项目目录结构
   - 识别技术栈和框架使用
   - 定位核心模块和关键文件

2. **深度问题诊断**
   - 识别常见编码问题模式
   - 分析性能瓶颈和内存问题
   - 检测安全风险和边界条件

3. **上下文理解**
   - 梳理业务逻辑和数据流
   - 分析模块职责和依赖关系
   - 解释复杂代码逻辑

4. **解决方案提供**
   - 给出具体的修复建议
   - 提供最佳实践指导
   - 生成结构化分析报告

### 📊 支持的分析类型

- **前端项目**: React, Vue, Angular, 小程序等
- **后端项目**: Node.js, Express, NestJS等
- **全栈项目**: Next.js, Nuxt.js等
- **通用编程**: JavaScript, TypeScript, Python等

## 使用示例

### 示例1: 分析React组件问题

```javascript
// 用户提供有问题的代码
function ProblematicComponent() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData().then((result) => {
      data.push(...result); // 错误: 直接修改状态
      setData(data); // 不会触发重新渲染
    });
  }, []);

  return <div>{data.length} items</div>;
}
```

**explore Skill分析结果**:

- 🐛 发现问题: 直接修改状态对象
- 💡 建议: 使用不可变更新 `setData(prev => [...prev, ...result])`
- 📍 位置: useEffect中的状态更新逻辑

### 示例2: 项目技术栈分析

**用户请求**: "帮我分析这个项目用了什么技术"

**explore Skill分析流程**:

1. 扫描项目根目录文件
2. 识别package.json、配置文件等
3. 分析依赖关系和框架使用
4. 输出完整技术栈报告

### 示例3: Bug诊断

**用户描述**: "这个函数有时候会返回错误的结果"

**explore Skill分析步骤**:

1. 阅读相关代码文件
2. 分析数据流和边界条件
3. 识别潜在的问题模式
4. 提供修复建议和测试用例

## 文件结构

```
explore/
├── SKILL.md          # Skill元数据和核心指令
├── README.md         # 使用说明文档
├── references/       # 参考资源
│   ├── code-analysis-guide.md    # 代码分析技术指南
│   └── common-issues.md          # 常见问题模式
└── scripts/          # 工具脚本
    ├── example-analysis.js       # 示例分析脚本
    └── validate-skill.js         # Skill验证脚本
```

## 参考资源

### 📚 技术指南

- [代码分析技术指南](./references/code-analysis-guide.md) - 详细的分析方法论和最佳实践
- [常见问题模式](./references/common-issues.md) - 各类代码问题的识别和修复模式

### 🛠️ 工具脚本

- [示例分析脚本](./scripts/example-analysis.js) - 展示实际分析工作流程
- [Skill验证脚本](./scripts/validate-skill.js) - 检查Skill完整性和规范性

## 最佳实践

### 提供足够上下文

当使用explore Skill时，请提供：

- 相关的代码片段或文件路径
- 具体的问题描述或分析目标
- 期望的分析深度和范围

### 分析结果解读

explore Skill会提供：

- 结构化的问题描述
- 具体的代码证据支持
- 可行的修复建议
- 相关的最佳实践指导

## 质量保证

✅ **证据驱动** - 所有结论都有代码证据支持  
✅ **具体可行** - 建议都是具体可操作的  
✅ **透明可复现** - 分析过程清晰可追溯  
✅ **尊重原有架构** - 遵循项目现有的代码风格和模式

## 技术支持

如果您在使用过程中遇到问题，或者有改进建议，请：

1. 检查Skill验证状态：

   ```bash
   node scripts/validate-skill.js
   ```

2. 参考技术指南文档
3. 查看示例脚本了解使用方法

## 版本信息

- **当前版本**: 1.0.0
- **创建日期**: 2026-04-07
- **最后更新**: 2026-04-07
- **维护者**: Claude AI Assistant

---

**探索代码，理解逻辑，解决问题** - explore Skill让代码分析变得简单高效！ 🚀
