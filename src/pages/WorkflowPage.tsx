// ============================================================
// pages/WorkflowPage.tsx — 工作流页面（Tab 布局：已有工作流 / 新建工作流）
// ============================================================

import { Edit2, Plus, Trash2, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "../components/shared/toast-store";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import WorkflowEditor from "../components/workflow/WorkflowEditor";
import {
  deleteWorkflow as apiDeleteWorkflow,
  fetchWorkflowDetail,
  fetchWorkflows,
} from "../lib/api";
import { useSkillStore } from "../stores/skill-store";
import { useWorkflowStore } from "../stores/workflow-store";

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  filePath: string;
}

type TabMode = "list" | "editor";

/**
 * WorkflowPage — 工作流页面
 * Tab 布局：「已有工作流」列表 / 「新建工作流」编排器
 */
export default function WorkflowPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [mode, setMode] = useState<TabMode>("list");
  const pendingDeleteIds = useRef<Set<string>>(new Set());
  const { loadWorkflow, reset } = useWorkflowStore();
  const { fetchSkills } = useSkillStore();
  const { t } = useTranslation();

  const loadWorkflows = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await fetchWorkflows();
      setWorkflows(data);
      // 无工作流时默认进入新建模式
      if (data.length === 0) {
        setMode("editor");
      }
    } catch {
      // 静默失败
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  const handleEdit = useCallback(
    async (workflow: WorkflowItem) => {
      try {
        const detail = await fetchWorkflowDetail(workflow.id);
        loadWorkflow(detail.id, detail.name, detail.description, detail.steps);
        setMode("editor");
        toast.success(t("toast.workflowLoaded", { name: workflow.name }));
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : t("toast.workflowLoadFailed"),
        );
      }
    },
    [loadWorkflow, t],
  );

  const handleDelete = useCallback(
    (workflow: WorkflowItem) => {
      if (pendingDeleteIds.current.has(workflow.id)) return;
      pendingDeleteIds.current.add(workflow.id);

      setWorkflows((prev) => prev.filter((wf) => wf.id !== workflow.id));

      toast.undoable(
        t("toast.workflowDeleted", { name: workflow.name }),
        async () => {
          pendingDeleteIds.current.delete(workflow.id);
          try {
            await apiDeleteWorkflow(workflow.id);
            await fetchSkills();
          } catch (err) {
            toast.error(
              err instanceof Error
                ? err.message
                : t("toast.workflowDeleteFailed"),
            );
            await loadWorkflows();
          }
        },
        () => {
          pendingDeleteIds.current.delete(workflow.id);
          setWorkflows((prev) => {
            if (prev.some((wf) => wf.id === workflow.id)) return prev;
            return [...prev, workflow];
          });
          toast.success(t("toast.workflowUndoDelete", { name: workflow.name }));
        },
        5000,
      );
    },
    [fetchSkills, loadWorkflows, t],
  );

  /** 保存成功后回调：切换回列表模式并刷新 */
  const handleSaveSuccess = useCallback(async () => {
    await loadWorkflows();
    setMode("list");
  }, [loadWorkflows]);

  /** 切换到新建模式时重置编排器 */
  const handleSwitchToEditor = useCallback(() => {
    reset();
    setMode("editor");
  }, [reset]);

  return (
    <div className="flex flex-col h-full">
      {/* Tab 切换栏 */}
      <div className="shrink-0 flex items-center gap-1 px-4 pt-4 pb-0 border-b border-[hsl(var(--border))]">
        <button
          data-testid="tab-list"
          onClick={() => setMode("list")}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors ${
            mode === "list"
              ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))] bg-[hsl(var(--accent))]"
              : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          }`}
        >
          <Zap size={14} />
          {t("workflow.tabList")}
          {workflows.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
              {workflows.length}
            </span>
          )}
        </button>
        <button
          data-testid="tab-editor"
          onClick={handleSwitchToEditor}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors ${
            mode === "editor"
              ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))] bg-[hsl(var(--accent))]"
              : "border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          }`}
        >
          <Plus size={14} />
          {t("workflow.tabNew")}
        </button>
      </div>

      {/* 内容区 */}
      <div className="flex-1 min-h-0">
        {mode === "list" ? (
          /* 已有工作流列表 */
          <div className="h-full flex flex-col p-4">
            {loadingList ? (
              <div className="flex-1 flex items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">
                {t("workflow.loading")}
              </div>
            ) : workflows.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                <Zap
                  size={40}
                  className="text-[hsl(var(--muted-foreground))] opacity-30"
                />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {t("workflow.empty")}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {t("workflow.emptyHint")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSwitchToEditor}
                  className="gap-1.5 mt-2"
                >
                  <Plus size={14} />
                  {t("workflow.createNew")}
                </Button>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {workflows.map((wf) => (
                    <div
                      key={wf.id}
                      data-testid={`workflow-item-${wf.id}`}
                      className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 hover:bg-[hsl(var(--accent))] group transition-colors"
                    >
                      <Zap
                        size={16}
                        className="shrink-0 text-[hsl(var(--primary))]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium font-[var(--font-code)] text-[hsl(var(--foreground))] truncate">
                          {wf.name}
                        </p>
                        {wf.description && (
                          <p className="text-xs text-[hsl(var(--muted-foreground))] truncate mt-0.5">
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
                          aria-label={t("workflow.editAriaLabel", {
                            name: wf.name,
                          })}
                          data-testid={`edit-workflow-${wf.id}`}
                        >
                          <Edit2 size={13} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-[hsl(var(--destructive))]"
                          onClick={() => handleDelete(wf)}
                          aria-label={t("workflow.deleteAriaLabel", {
                            name: wf.name,
                          })}
                          data-testid={`delete-workflow-${wf.id}`}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        ) : (
          /* 新建/编辑工作流编排器 */
          <WorkflowEditor onSaveSuccess={handleSaveSuccess} />
        )}
      </div>
    </div>
  );
}
