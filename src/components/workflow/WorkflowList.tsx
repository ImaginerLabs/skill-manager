// ============================================================
// components/workflow/WorkflowList.tsx — 已有工作流列表（编辑/删除）
// ============================================================

import { Edit2, Trash2, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteWorkflow as apiDeleteWorkflow,
  fetchWorkflowDetail,
  fetchWorkflows,
} from "../../lib/api";
import { useSkillStore } from "../../stores/skill-store";
import { useWorkflowStore } from "../../stores/workflow-store";
import { toast } from "../shared/toast-store";
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
 * 支持编辑（加载到编排器）和删除（5 秒撤销窗口）
 */
export default function WorkflowList() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(false);
  /** 正在等待撤销的工作流 ID 集合（乐观删除，尚未真正调用后端） */
  const pendingDeleteIds = useRef<Set<string>>(new Set());
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
        // 通过后端 API 获取结构化的工作流数据（含 steps）
        const detail = await fetchWorkflowDetail(workflow.id);
        loadWorkflow(detail.id, detail.name, detail.description, detail.steps);
        toast.success(`已加载工作流「${workflow.name}」到编排器`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "加载工作流失败");
      }
    },
    [loadWorkflow],
  );

  /**
   * 删除工作流 — 乐观移除 + 5 秒撤销窗口
   * 点击删除后立即从列表中移除，显示带撤销按钮的 Toast。
   * 5 秒内点击撤销 → 恢复列表项；超时 → 真正调用后端删除 API。
   */
  const handleDelete = useCallback(
    (workflow: WorkflowItem) => {
      // 防止重复删除
      if (pendingDeleteIds.current.has(workflow.id)) return;
      pendingDeleteIds.current.add(workflow.id);

      // 乐观移除：立即从列表中隐藏
      setWorkflows((prev) => prev.filter((wf) => wf.id !== workflow.id));

      // 显示带撤销按钮的 Toast（5 秒倒计时）
      toast.undoable(
        `工作流「${workflow.name}」已删除`,
        // onConfirm：超时后真正执行删除
        async () => {
          pendingDeleteIds.current.delete(workflow.id);
          try {
            await apiDeleteWorkflow(workflow.id);
            await fetchSkills();
          } catch (err) {
            // 删除失败：恢复列表并提示
            toast.error(err instanceof Error ? err.message : "删除工作流失败");
            await loadWorkflows();
          }
        },
        // onUndo：撤销时恢复列表项
        () => {
          pendingDeleteIds.current.delete(workflow.id);
          setWorkflows((prev) => {
            // 避免重复添加
            if (prev.some((wf) => wf.id === workflow.id)) return prev;
            return [...prev, workflow];
          });
          toast.success(`已撤销删除工作流「${workflow.name}」`);
        },
        5000,
      );
    },
    [fetchSkills, loadWorkflows],
  );

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
                  onClick={() => handleDelete(wf)}
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
  );
}
