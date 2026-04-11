// ============================================================
// components/workflow/WorkflowList.tsx — 已有工作流列表（编辑/删除）
// ============================================================

import { Edit2, Trash2, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { WorkflowStep } from "../../../shared/types";
import {
  deleteWorkflow as apiDeleteWorkflow,
  fetchSkillById,
  fetchWorkflows,
} from "../../lib/api";
import { useSkillStore } from "../../stores/skill-store";
import { useWorkflowStore } from "../../stores/workflow-store";
import { toast } from "../shared/toast-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  filePath: string;
}

/**
 * WorkflowList — 已有工作流列表
 * 支持编辑（加载到编排器）和删除（确认对话框）
 */
export default function WorkflowList() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WorkflowItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { loadWorkflow } = useWorkflowStore();
  const { fetchSkills } = useSkillStore();

  const loadWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWorkflows();
      setWorkflows(data);
    } catch {
      // 静默失败
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  const handleEdit = useCallback(
    async (workflow: WorkflowItem) => {
      try {
        // 获取完整 Skill 内容以解析步骤
        const full = await fetchSkillById(workflow.id);
        // 使用 content 字段（不含 Frontmatter）解析步骤
        const content = full.content;

        // 从 Markdown 内容解析步骤
        const stepRegex =
          /## Step (\d+)\s*\n\n\*\*使用 Skill:\*\* `([^`]+)`(?:\n\n([\s\S]*?))?(?=\n## Step|\s*$)/g;
        const steps: WorkflowStep[] = [];
        let match;
        while ((match = stepRegex.exec(content)) !== null) {
          const skillName = match[2];
          // 尝试从 skills 列表中找到对应的 skillId
          const skillStore = useSkillStore.getState();
          const skill = skillStore.skills.find((s) => s.name === skillName);
          steps.push({
            order: parseInt(match[1], 10),
            skillId: skill?.id || skillName.toLowerCase().replace(/\s+/g, "-"),
            skillName,
            description: (match[3] || "").trim(),
          });
        }

        loadWorkflow(workflow.id, workflow.name, workflow.description, steps);
        toast.success(`已加载工作流「${workflow.name}」到编排器`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "加载工作流失败");
      }
    },
    [loadWorkflow],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDeleteWorkflow(deleteTarget.id);
      toast.success(`工作流「${deleteTarget.name}」已删除`);
      await fetchSkills();
      await loadWorkflows();
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除工作流失败");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, fetchSkills, loadWorkflows]);

  if (loading) {
    return (
      <div className="p-3 text-center text-sm text-[hsl(var(--muted-foreground))]">
        加载中...
      </div>
    );
  }

  if (workflows.length === 0) {
    return null; // 无工作流时不显示列表
  }

  return (
    <>
      <div className="border-t border-[hsl(var(--border))]">
        <div className="px-3 py-2 flex items-center gap-2">
          <Zap size={14} className="text-[hsl(var(--primary))]" />
          <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
            已有工作流 ({workflows.length})
          </span>
        </div>
        <ScrollArea className="max-h-[200px]">
          <div className="px-2 pb-2 space-y-1">
            {workflows.map((wf) => (
              <div
                key={wf.id}
                className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-[hsl(var(--accent))] group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium font-[var(--font-code)] text-[hsl(var(--foreground))] truncate">
                    {wf.name}
                  </p>
                  {wf.description && (
                    <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                      {wf.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleEdit(wf)}
                    aria-label={`编辑 ${wf.name}`}
                  >
                    <Edit2 size={13} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-[hsl(var(--destructive))]"
                    onClick={() => setDeleteTarget(wf)}
                    aria-label={`删除 ${wf.name}`}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除工作流</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除工作流「{deleteTarget?.name}」吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive)/0.9)]"
            >
              {deleting ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
