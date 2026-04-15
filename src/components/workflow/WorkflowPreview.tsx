// ============================================================
// components/workflow/WorkflowPreview.tsx — 工作流生成结果预览
// ============================================================

import { Eye, RotateCcw, Save } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createWorkflow as apiCreateWorkflow,
  previewWorkflow as apiPreviewWorkflow,
  updateWorkflow as apiUpdateWorkflow,
} from "../../lib/api";
import { useSkillStore } from "../../stores/skill-store";
import { useWorkflowStore } from "../../stores/workflow-store";
import { toast } from "../shared/toast-store";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

/**
 * 根据当前状态返回按钮禁用原因
 */
function getDisabledReason(
  workflowName: string,
  steps: { skillId: string | null; type?: string; description?: string }[],
): string | null {
  if (workflowName.trim() === "") return "请先填写工作流名称";
  if (steps.length === 0) return "请至少添加一个步骤";
  // 检查自定义步骤描述是否为空
  const emptyCustomStep = steps.find(
    (s) => s.type === "custom" && !(s.description ?? "").trim(),
  );
  if (emptyCustomStep) return "请填写所有自定义步骤的描述";
  return null;
}

/**
 * WorkflowPreview — 工作流生成结果预览与保存
 * 支持新建和编辑模式
 */
export default function WorkflowPreview({
  onSaveSuccess,
}: {
  onSaveSuccess?: () => void;
}) {
  const { workflowName, workflowDescription, steps, editingWorkflowId, reset } =
    useWorkflowStore();
  const { fetchSkills } = useSkillStore();
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditing = editingWorkflowId !== null;
  const canGenerate = workflowName.trim() !== "" && steps.length > 0;
  const disabledReason = getDisabledReason(workflowName, steps);
  const hasContent =
    workflowName !== "" || workflowDescription !== "" || steps.length > 0;
  const { t } = useTranslation();

  const handlePreview = useCallback(async () => {
    if (!canGenerate) return;
    setLoading(true);
    try {
      const result = await apiPreviewWorkflow({
        name: workflowName,
        description: workflowDescription,
        steps,
      });
      setPreview(result.content);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "预览生成失败");
    } finally {
      setLoading(false);
    }
  }, [canGenerate, workflowName, workflowDescription, steps]);

  const handleSave = useCallback(async () => {
    if (!canGenerate) return;
    setSaving(true);
    try {
      const workflow = {
        name: workflowName,
        description: workflowDescription,
        steps,
      };

      if (isEditing) {
        await apiUpdateWorkflow(editingWorkflowId, workflow);
        toast.success("工作流更新成功！");
      } else {
        await apiCreateWorkflow(workflow);
        toast.success("工作流创建成功！");
      }

      // 刷新 Skill 列表并重置编排器
      await fetchSkills();
      reset();
      setPreview(null);
      // 通知父组件保存成功
      onSaveSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "工作流保存失败");
    } finally {
      setSaving(false);
    }
  }, [
    canGenerate,
    workflowName,
    workflowDescription,
    steps,
    isEditing,
    editingWorkflowId,
    fetchSkills,
    reset,
    onSaveSuccess,
  ]);

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-3 p-4 border-t border-[hsl(var(--border))]">
        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          {/* 预览按钮 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handlePreview}
                  disabled={!canGenerate || loading}
                  className="gap-1.5"
                >
                  <Eye size={14} />
                  {loading ? "生成中..." : "预览"}
                </Button>
              </span>
            </TooltipTrigger>
            {disabledReason && (
              <TooltipContent side="top">
                <p>{disabledReason}</p>
              </TooltipContent>
            )}
          </Tooltip>

          {/* 生成/更新工作流按钮 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!canGenerate || saving}
                  className="gap-1.5"
                >
                  <Save size={14} />
                  {saving
                    ? "保存中..."
                    : isEditing
                      ? "更新工作流"
                      : "生成工作流"}
                </Button>
              </span>
            </TooltipTrigger>
            {disabledReason && (
              <TooltipContent side="top">
                <p>{disabledReason}</p>
              </TooltipContent>
            )}
          </Tooltip>

          {/* 重置按钮 */}
          {hasContent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                reset();
                setPreview(null);
              }}
              className="gap-1.5 ml-auto text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              aria-label={t("workflow.reset")}
            >
              <RotateCcw size={14} />
              {t("workflow.reset")}
            </Button>
          )}
          {isEditing && (
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              正在编辑：{workflowName}
            </span>
          )}
        </div>

        {/* 预览内容 */}
        {preview && (
          <div className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
            <div className="px-3 py-2 border-b border-[hsl(var(--border))] flex items-center justify-between">
              <span className="text-xs font-medium font-[var(--font-code)] text-[hsl(var(--muted-foreground))]">
                预览：{workflowName}.md
              </span>
              <button
                onClick={() => setPreview(null)}
                className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                关闭
              </button>
            </div>
            <ScrollArea className="max-h-[300px]">
              <pre className="p-3 text-xs font-[var(--font-code)] text-[hsl(var(--foreground))] whitespace-pre-wrap">
                {preview}
              </pre>
            </ScrollArea>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
