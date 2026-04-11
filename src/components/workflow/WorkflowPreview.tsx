// ============================================================
// components/workflow/WorkflowPreview.tsx — 工作流生成结果预览
// ============================================================

import { Eye, Save } from "lucide-react";
import { useCallback, useState } from "react";
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

/**
 * WorkflowPreview — 工作流生成结果预览与保存
 * 支持新建和编辑模式
 */
export default function WorkflowPreview() {
  const { workflowName, workflowDescription, steps, editingWorkflowId, reset } =
    useWorkflowStore();
  const { fetchSkills } = useSkillStore();
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEditing = editingWorkflowId !== null;
  const canGenerate = workflowName.trim() !== "" && steps.length > 0;

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
  ]);

  return (
    <div className="flex flex-col gap-3 p-4 border-t border-[hsl(var(--border))]">
      {/* 操作按钮 */}
      <div className="flex items-center gap-2">
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
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!canGenerate || saving}
          className="gap-1.5"
        >
          <Save size={14} />
          {saving ? "保存中..." : isEditing ? "更新工作流" : "生成工作流"}
        </Button>
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
  );
}
