// ============================================================
// components/workflow/WorkflowEditor.tsx — 工作流编排器主组件
// ============================================================

import { RotateCcw } from "lucide-react";
import { useWorkflowStore } from "../../stores/workflow-store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import SkillSelector from "./SkillSelector";
import StepList from "./StepList";
import WorkflowList from "./WorkflowList";
import WorkflowPreview from "./WorkflowPreview";

/**
 * WorkflowEditor — 工作流编排页面核心组件
 * 双栏布局：左侧 Skill 选择列表 + 右侧工作流步骤列表
 * 响应式：>= 1024px 左右双栏，< 1024px 上下堆叠
 */
export default function WorkflowEditor() {
  const {
    workflowName,
    workflowDescription,
    steps,
    setWorkflowName,
    setWorkflowDescription,
    reset,
  } = useWorkflowStore();

  return (
    <div className="flex flex-col h-full">
      {/* 顶部：工作流名称和描述 */}
      <div className="shrink-0 border-b border-[hsl(var(--border))] p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 space-y-2">
            <Input
              placeholder="工作流名称"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="h-9 text-sm font-[var(--font-code)]"
              aria-label="工作流名称"
            />
            <Input
              placeholder="工作流描述（可选）"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              className="h-9 text-sm"
              aria-label="工作流描述"
            />
          </div>
          {/* 重置按钮 */}
          {(workflowName || workflowDescription || steps.length > 0) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={reset}
              className="shrink-0"
              aria-label="重置工作流"
            >
              <RotateCcw size={16} />
            </Button>
          )}
        </div>
        {steps.length > 0 && (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            已添加 {steps.length} 个步骤
          </p>
        )}
      </div>

      {/* 双栏布局：左侧 Skill 选择 + 右侧步骤列表 */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* 左侧：Skill 选择器 */}
        <div className="lg:w-[360px] lg:shrink-0 lg:border-r border-b lg:border-b-0 border-[hsl(var(--border))] h-[300px] lg:h-auto flex flex-col">
          <div className="flex-1 min-h-0">
            <SkillSelector />
          </div>
          {/* 已有工作流列表 */}
          <WorkflowList />
        </div>

        {/* 右侧：步骤列表 */}
        <div className="flex-1 min-h-[300px] flex flex-col">
          <div className="flex-1 min-h-0">
            <StepList />
          </div>
          {/* 底部：预览与生成 */}
          <WorkflowPreview />
        </div>
      </div>
    </div>
  );
}
