#!/usr/bin/env node

// explore Skill 验证脚本
// 检查Skill的完整性和规范性

const fs = require("fs");
const path = require("path");

/**
 * Skill验证器类
 */
class SkillValidator {
  constructor(skillPath) {
    this.skillPath = skillPath;
    this.errors = [];
    this.warnings = [];
  }

  /**
   * 验证Skill目录结构
   */
  validateStructure() {
    console.log("🔍 验证Skill目录结构...");

    const requiredFiles = [
      "SKILL.md",
      "references/code-analysis-guide.md",
      "references/common-issues.md",
      "scripts/example-analysis.js",
      "scripts/validate-skill.js",
    ];

    requiredFiles.forEach((file) => {
      const filePath = path.join(this.skillPath, file);
      if (!fs.existsSync(filePath)) {
        this.errors.push(`缺少必需文件: ${file}`);
      } else {
        console.log(`✅ ${file} 存在`);
      }
    });

    // 检查目录结构
    const directories = ["references", "scripts"];
    directories.forEach((dir) => {
      const dirPath = path.join(this.skillPath, dir);
      if (!fs.existsSync(dirPath)) {
        this.errors.push(`缺少目录: ${dir}`);
      } else if (!fs.statSync(dirPath).isDirectory()) {
        this.errors.push(`${dir} 不是目录`);
      }
    });
  }

  /**
   * 验证SKILL.md元数据
   */
  validateMetadata() {
    console.log("\n📝 验证SKILL.md元数据...");

    const skillMdPath = path.join(this.skillPath, "SKILL.md");
    if (!fs.existsSync(skillMdPath)) {
      this.errors.push("SKILL.md 文件不存在");
      return;
    }

    const content = fs.readFileSync(skillMdPath, "utf8");

    // 检查YAML frontmatter
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    if (!frontmatterMatch) {
      this.errors.push("SKILL.md 缺少YAML frontmatter");
      return;
    }

    const frontmatter = frontmatterMatch[1];

    // 检查name字段
    const nameMatch = frontmatter.match(/name:\s*(.+)/);
    if (!nameMatch) {
      this.errors.push("SKILL.md 缺少name字段");
    } else {
      const name = nameMatch[1].trim();
      if (name !== "explore") {
        this.warnings.push(`name字段应为"explore"，当前为"${name}"`);
      }

      // 检查命名规范
      if (!/^[a-z0-9-]+$/.test(name)) {
        this.errors.push("name字段只能包含小写字母、数字和连字符");
      }
    }

    // 检查description字段
    const descMatch = frontmatter.match(
      /description:\s*>[\s\S]*?This skill should be used when/,
    );
    if (!descMatch) {
      this.errors.push(
        "description字段缺少触发条件描述（This skill should be used when）",
      );
    }

    // 检查description长度
    const descContent = frontmatter.match(
      /description:\s*>(\s*[\s\S]*?)(?=\n\w|$)/,
    );
    if (descContent && descContent[1].length > 1024) {
      this.warnings.push("description字段可能超过1024字符限制");
    }
  }

  /**
   * 验证文件内容规范
   */
  validateContent() {
    console.log("\n📖 验证文件内容规范...");

    // 检查SKILL.md行数
    const skillMdPath = path.join(this.skillPath, "SKILL.md");
    if (fs.existsSync(skillMdPath)) {
      const skillMdContent = fs.readFileSync(skillMdPath, "utf8");
      const lineCount = skillMdContent.split("\n").length;

      if (lineCount > 500) {
        this.warnings.push(`SKILL.md 行数(${lineCount})可能超过500行推荐限制`);
      }
    }

    // 检查参考文件是否存在
    const refFiles = [
      "references/code-analysis-guide.md",
      "references/common-issues.md",
    ];

    refFiles.forEach((refFile) => {
      const refPath = path.join(this.skillPath, refFile);
      if (fs.existsSync(refPath)) {
        const content = fs.readFileSync(refPath, "utf8");
        if (content.length < 100) {
          this.warnings.push(`${refFile} 内容可能过于简短`);
        }
      }
    });

    // 检查脚本文件
    const scriptFiles = [
      "scripts/example-analysis.js",
      "scripts/validate-skill.js",
    ];

    scriptFiles.forEach((scriptFile) => {
      const scriptPath = path.join(this.skillPath, scriptFile);
      if (fs.existsSync(scriptPath)) {
        // 检查脚本是否有执行权限
        try {
          fs.accessSync(scriptPath, fs.constants.X_OK);
          console.log(`✅ ${scriptFile} 有执行权限`);
        } catch {
          this.warnings.push(`${scriptFile} 缺少执行权限`);
        }
      }
    });
  }

  /**
   * 运行所有验证
   */
  validateAll() {
    console.log("🚀 开始验证 explore Skill...\n");

    this.validateStructure();
    this.validateMetadata();
    this.validateContent();

    console.log("\n📊 验证结果:");
    console.log("=".repeat(50));

    if (this.errors.length > 0) {
      console.log("❌ 错误:");
      this.errors.forEach((error) => console.log(`  - ${error}`));
    } else {
      console.log("✅ 没有发现严重错误");
    }

    if (this.warnings.length > 0) {
      console.log("\n⚠️  警告:");
      this.warnings.forEach((warning) => console.log(`  - ${warning}`));
    } else {
      console.log("✅ 没有发现警告");
    }

    console.log("=".repeat(50));

    if (this.errors.length === 0) {
      console.log("🎉 Skill验证通过！");
      console.log("\n📋 下一步建议:");
      console.log("1. 测试Skill的实际使用场景");
      console.log("2. 完善示例和文档");
      console.log("3. 考虑添加更多分析模式");
    } else {
      console.log("❌ Skill验证失败，请修复上述错误");
      process.exit(1);
    }
  }
}

// 主执行逻辑
if (require.main === module) {
  // 获取Skill根目录（当前脚本所在目录的父目录）
  const scriptDir = __dirname;
  const skillPath = path.dirname(scriptDir);

  console.log(`验证路径: ${skillPath}`);

  const validator = new SkillValidator(skillPath);
  validator.validateAll();
}

module.exports = SkillValidator;
