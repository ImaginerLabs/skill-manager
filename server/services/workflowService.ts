// ============================================================
// server/services/workflowService.ts — 工作流生成与管理服务
// ============================================================

import fs from "fs-extra";
import matter from "gray-matter";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Workflow, WorkflowStep } from "../../shared/types.js";
import { AppError } from "../types/errors.js";
import { safeWrite } from "../utils/fileUtils.js";
import { isSubPath, normalizePath, slugify } from "../utils/pathUtils.js";
import { refreshSkillCache } from "./skillService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");
const SKILLS_ROOT = path.join(PROJECT_ROOT, "skills");
const WORKFLOWS_DIR = path.join(SKILLS_ROOT, "workflows");

/**
 * 生成 "pushy" 触发策略的 description
 * 不仅描述功能，还主动包含触发场景和关键词，提高 Agent 触发率
 */
function generatePushyDescription(
  workflowName: string,
  steps: WorkflowStep[],
): string {
  const skillNames = steps
    .filter((s) => s.type === "skill" && s.skillName)
    .map((s) => s.skillName!);
  const customDescriptions = steps
    .filter((s) => s.type === "custom" && s.description)
    .map(
      (s) =>
        s.description.slice(0, 20) + (s.description.length > 20 ? "..." : ""),
    );

  const parts = [...skillNames, ...customDescriptions].filter(Boolean);
  if (parts.length === 0) return `${workflowName}工作流。`;

  const funcDesc = `组合${parts.join("、")}${customDescriptions.length > 0 ? "和自定义步骤" : ""}的${workflowName}工作流。`;
  const triggerScene =
    skillNames.length > 0
      ? `当用户需要${workflowName}、${skillNames.join("、")}时使用此工作流。`
      : `当用户需要${workflowName}时使用此工作流。`;

  return `${funcDesc}${triggerScene}`;
}

/**
 * 生成工作流 .md 文件内容
 * 对齐 skill-creator 规范：Frontmatter 字段、pushy description、正文结构
 */
function generateWorkflowContent(workflow: Workflow): string {
  // tags 从步骤 Skill 名称聚合 + "workflow"
  const tags = [
    "workflow",
    ...workflow.steps
      .filter((s) => s.type === "skill" && s.skillName)
      .map((s) => s.skillName!.toLowerCase().replace(/\s+/g, "-")),
  ];

  // description 优先使用用户输入，否则自动生成 pushy description
  const description = workflow.description.trim()
    ? workflow.description
    : generatePushyDescription(workflow.name, workflow.steps);

  const frontmatter = {
    name: workflow.name,
    description,
    category: "workflows",
    type: "workflow",
    tags: [...new Set(tags)],
  };

  // 正文：概述段落 + Step 列表
  const stepsContent = workflow.steps
    .map((step: WorkflowStep) => {
      const title =
        step.type === "custom"
          ? step.description.slice(0, 30) +
            (step.description.length > 30 ? "..." : "")
          : step.skillName || step.skillId || "未知 Skill";

      let section = `## Step ${step.order}: ${title}\n`;

      if (step.type !== "custom" && step.skillId) {
        section += `\n**使用 Skill:** \`${step.skillName || step.skillId}\``;
      }
      if (step.description) {
        section += `\n\n${step.description}`;
      }
      return section;
    })
    .join("\n\n");

  // 构建正文：概述段落（如果有用户描述）+ 步骤列表
  let body = "";
  if (workflow.description.trim()) {
    body += `${workflow.description.trim()}\n\n---\n\n`;
  }
  body += stepsContent;

  return matter.stringify(`\n${body}\n`, frontmatter);
}

/**
 * 创建工作流 — 生成 .md 文件并保存到 skills/workflows/
 */
export async function createWorkflow(
  workflow: Workflow,
): Promise<{ id: string; filePath: string }> {
  if (!workflow.name.trim()) {
    throw AppError.validationError("工作流名称不能为空");
  }
  if (workflow.steps.length === 0) {
    throw AppError.validationError("工作流至少需要一个步骤");
  }

  // 确保 workflows 目录存在
  await fs.ensureDir(WORKFLOWS_DIR);

  // 生成文件名（slug 化）
  const baseSlug = slugify(workflow.name);
  let fileName = `${baseSlug}.md`;
  let filePath = path.join(WORKFLOWS_DIR, fileName);

  // 处理文件名冲突
  let counter = 2;
  while (await fs.pathExists(filePath)) {
    fileName = `${baseSlug}-${counter}.md`;
    filePath = path.join(WORKFLOWS_DIR, fileName);
    counter++;
  }

  // 生成内容并写入
  const content = generateWorkflowContent(workflow);
  await safeWrite(filePath, content);

  // 刷新 Skill 缓存
  try {
    await refreshSkillCache();
  } catch {
    console.error("[workflowService] 刷新缓存失败");
  }

  const id = slugify(fileName);
  return {
    id,
    filePath: normalizePath(path.relative(SKILLS_ROOT, filePath)),
  };
}

/**
 * 获取所有工作流列表
 */
export async function getWorkflows(): Promise<
  Array<{ id: string; name: string; description: string; filePath: string }>
> {
  if (!(await fs.pathExists(WORKFLOWS_DIR))) {
    return [];
  }

  const files = await fs.readdir(WORKFLOWS_DIR);
  const workflows: Array<{
    id: string;
    name: string;
    description: string;
    filePath: string;
  }> = [];

  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const fullPath = path.join(WORKFLOWS_DIR, file);
    try {
      const raw = await fs.readFile(fullPath, "utf-8");
      const parsed = matter(raw);
      workflows.push({
        id: slugify(file),
        name: (parsed.data.name as string) || path.basename(file, ".md"),
        description: (parsed.data.description as string) || "",
        filePath: normalizePath(path.relative(SKILLS_ROOT, fullPath)),
      });
    } catch {
      // 解析失败跳过
    }
  }

  return workflows;
}

/**
 * 获取单个工作流详情（结构化数据）
 */
export async function getWorkflowById(id: string): Promise<{
  id: string;
  name: string;
  description: string;
  filePath: string;
  steps: WorkflowStep[];
}> {
  const filePath = await findWorkflowFile(id);
  if (!filePath) {
    throw AppError.notFound(`工作流 "${id}" 未找到`);
  }

  const raw = await fs.readFile(filePath, "utf-8");
  const parsed = matter(raw);
  const content = parsed.content;

  // 从 Markdown 内容解析步骤（兼容 Skill 步骤和自定义步骤）
  const stepRegex =
    /## Step (\d+)(?::\s*(.+?))?\s*\n(?:\n\*\*使用 Skill:\*\* `([^`]+)`)?(?:\n\n([\s\S]*?))?(?=\n## Step|\s*$)/g;
  const steps: WorkflowStep[] = [];
  let match;
  while ((match = stepRegex.exec(content)) !== null) {
    const hasSkill = !!match[3];
    steps.push({
      order: parseInt(match[1], 10),
      skillId: hasSkill ? match[3].toLowerCase().replace(/\s+/g, "-") : null,
      skillName: hasSkill ? match[3] : null,
      description: (match[4] || match[2] || "").trim(),
      type: hasSkill ? "skill" : "custom",
    });
  }

  return {
    id,
    name: (parsed.data.name as string) || path.basename(filePath, ".md"),
    description: (parsed.data.description as string) || "",
    filePath: normalizePath(path.relative(SKILLS_ROOT, filePath)),
    steps,
  };
}

/**
 * 更新工作流 — 覆盖已有 .md 文件
 */
export async function updateWorkflow(
  id: string,
  workflow: Workflow,
): Promise<{ id: string; filePath: string }> {
  if (!workflow.name.trim()) {
    throw AppError.validationError("工作流名称不能为空");
  }
  if (workflow.steps.length === 0) {
    throw AppError.validationError("工作流至少需要一个步骤");
  }

  // 查找对应文件
  const filePath = await findWorkflowFile(id);
  if (!filePath) {
    throw AppError.notFound(`工作流 "${id}" 未找到`);
  }

  const content = generateWorkflowContent(workflow);
  await safeWrite(filePath, content);

  try {
    await refreshSkillCache();
  } catch {
    console.error("[workflowService] 刷新缓存失败");
  }

  return {
    id,
    filePath: normalizePath(path.relative(SKILLS_ROOT, filePath)),
  };
}

/**
 * 删除工作流
 */
export async function deleteWorkflow(id: string): Promise<void> {
  const filePath = await findWorkflowFile(id);
  if (!filePath) {
    throw AppError.notFound(`工作流 "${id}" 未找到`);
  }

  // 路径安全校验
  const resolved = normalizePath(path.resolve(filePath));
  if (!isSubPath(resolved, normalizePath(WORKFLOWS_DIR))) {
    throw AppError.pathTraversal("非法路径访问");
  }

  await fs.remove(filePath);

  try {
    await refreshSkillCache();
  } catch {
    console.error("[workflowService] 刷新缓存失败");
  }
}

/**
 * 预览工作流内容（不保存，仅生成预览）
 */
export function previewWorkflow(workflow: Workflow): string {
  return generateWorkflowContent(workflow);
}

/**
 * 查找工作流文件路径
 */
async function findWorkflowFile(id: string): Promise<string | null> {
  if (!(await fs.pathExists(WORKFLOWS_DIR))) {
    return null;
  }

  const files = await fs.readdir(WORKFLOWS_DIR);
  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    if (slugify(file) === id) {
      return path.join(WORKFLOWS_DIR, file);
    }
  }
  return null;
}
