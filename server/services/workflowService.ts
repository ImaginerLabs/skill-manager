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
 * 生成工作流 .md 文件内容
 */
function generateWorkflowContent(workflow: Workflow): string {
  const frontmatter = {
    name: workflow.name,
    description: workflow.description,
    category: "workflows",
    type: "workflow",
    tags: ["workflow"],
  };

  const stepsContent = workflow.steps
    .map((step: WorkflowStep) => {
      let section = `## Step ${step.order}\n\n**使用 Skill:** \`${step.skillName}\``;
      if (step.description) {
        section += `\n\n${step.description}`;
      }
      return section;
    })
    .join("\n\n");

  return matter.stringify(`\n${stepsContent}\n`, frontmatter);
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

  // 从 Markdown 内容解析步骤
  const stepRegex =
    /## Step (\d+)\s*\n\n\*\*使用 Skill:\*\* `([^`]+)`(?:\n\n([\s\S]*?))?(?=\n## Step|\s*$)/g;
  const steps: WorkflowStep[] = [];
  let match;
  while ((match = stepRegex.exec(content)) !== null) {
    steps.push({
      order: parseInt(match[1], 10),
      skillId: match[2].toLowerCase().replace(/\s+/g, "-"),
      skillName: match[2],
      description: (match[3] || "").trim(),
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
