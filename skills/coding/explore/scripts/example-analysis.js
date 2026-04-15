// explore Skill 示例分析脚本
// 展示代码探索和分析的实际应用

/**
 * 示例：React组件问题分析
 * 这个示例展示如何分析一个常见的React组件问题
 */

// 问题组件示例（模拟有问题的代码）
const problematicComponent = `
import React, { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 问题1: 在useEffect中缺少依赖项
  useEffect(() => {
    setLoading(true);
    fetch('/api/users')
      .then(response => response.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []); // 缺少依赖项，可能导致过时闭包

  // 问题2: 直接修改状态
  const addUser = (newUser) => {
    users.push(newUser); // 直接修改状态数组
    setUsers(users);     // 不会触发重新渲染
  };

  // 问题3: 未处理加载状态
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>User List</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      <button onClick={() => addUser({ id: Date.now(), name: 'New User' })}>
        Add User
      </button>
    </div>
  );
}

export default UserList;
`;

/**
 * 分析函数 - 识别React组件中的常见问题
 * @param {string} code - 要分析的代码字符串
 * @returns {Object} 分析结果
 */
function analyzeReactComponent(code) {
  const issues = [];
  const suggestions = [];

  // 检查1: useEffect依赖项
  if (code.includes("useEffect") && code.includes("[]")) {
    // 检查是否在useEffect中使用了外部变量但缺少依赖
    const useEffectRegex = /useEffect\(([\s\S]*?)\), \[\]\)/g;
    let match;

    while ((match = useEffectRegex.exec(code)) !== null) {
      const effectBody = match[1];
      // 检查是否使用了可能变化的外部变量
      if (effectBody.includes("set") || effectBody.includes("fetch")) {
        issues.push({
          type: "React Hook",
          severity: "medium",
          description: "useEffect缺少依赖项，可能导致过时闭包",
          location: "useEffect hook",
          codeSnippet: match[0],
        });

        suggestions.push({
          suggestion: "添加所有依赖项到useEffect的依赖数组中",
          example: "useEffect(() => {...}, [dependency1, dependency2])",
        });
      }
    }
  }

  // 检查2: 直接状态修改
  if (code.includes(".push(") && code.includes("set")) {
    const pushRegex = /(\w+)\.push\([^)]*\)\s*;\s*set\w*\(\1\)/g;
    if (pushRegex.test(code)) {
      issues.push({
        type: "State Management",
        severity: "high",
        description: "直接修改状态对象，不会触发重新渲染",
        location: "状态更新逻辑",
        codeSnippet: code.match(pushRegex)[0],
      });

      suggestions.push({
        suggestion: "使用不可变更新模式",
        example: "setUsers(prevUsers => [...prevUsers, newUser])",
      });
    }
  }

  // 检查3: 错误处理
  if (code.includes(".catch(") && !code.includes("setError")) {
    issues.push({
      type: "Error Handling",
      severity: "low",
      description: "错误处理不完整，仅打印到控制台",
      location: "fetch错误处理",
      codeSnippet: code.includes(".catch(error => {")
        ? code.match(/\.catch\([^}]*\}/)[0]
        : "catch block",
    });

    suggestions.push({
      suggestion: "添加错误状态和用户反馈",
      example:
        "const [error, setError] = useState(null);并在catch中setError(error)",
    });
  }

  return {
    issues,
    suggestions,
    summary: `发现 ${issues.length} 个问题，建议进行 ${suggestions.length} 项改进`,
  };
}

/**
 * 生成分析报告
 * @param {Object} analysisResult 分析结果
 * @returns {string} Markdown格式的报告
 */
function generateReport(analysisResult) {
  const { issues, suggestions, summary } = analysisResult;

  let report = `# React组件分析报告
\n## 概述\n${summary}\n\n`;

  if (issues.length > 0) {
    report += "## 发现问题\n\n";
    issues.forEach((issue, index) => {
      report += `### 问题 ${index + 1}: ${issue.type}\n`;
      report += `- **严重程度**: ${issue.severity}\n`;
      report += `- **描述**: ${issue.description}\n`;
      report += `- **位置**: ${issue.location}\n`;
      report += `- **代码片段**: \`\`\`javascript\n${issue.codeSnippet}\n\`\`\`\n\n`;
    });
  }

  if (suggestions.length > 0) {
    report += "## 改进建议\n\n";
    suggestions.forEach((suggestion, index) => {
      report += `### 建议 ${index + 1}\n`;
      report += `- **建议**: ${suggestion.suggestion}\n`;
      report += `- **示例**: \`\`\`javascript\n${suggestion.example}\n\`\`\`\n\n`;
    });
  }

  report += "## 总结\n\n建议按照上述建议进行代码重构，提高代码质量和可维护性。";

  return report;
}

// 执行分析
console.log("开始分析React组件代码...\n");

const analysisResult = analyzeReactComponent(problematicComponent);
const report = generateReport(analysisResult);

console.log(report);
console.log("\n分析完成！");

module.exports = {
  analyzeReactComponent,
  generateReport,
};
