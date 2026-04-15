// ============================================================
// components/workflow/StepList.tsx — 右侧工作流步骤列表（拖拽排序）
// ============================================================

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { GitBranch, Pencil } from "lucide-react";
import { useCallback } from "react";
import { useWorkflowStore } from "../../stores/workflow-store";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import CustomStepCard from "./CustomStepCard";
import StepItem from "./StepItem";

/**
 * 生成步骤的唯一 sortable ID
 */
function getSortableId(step: {
  type?: string;
  skillId: string | null;
  order: number;
}): string {
  if (step.type === "custom") return `custom-${step.order}`;
  return `${step.skillId ?? "unknown"}-${step.order}`;
}

/**
 * StepList — 工作流编排器右侧步骤列表
 * 支持 @dnd-kit 拖拽排序、键盘排序 Alt+↑/↓、inline 描述编辑
 */
export default function StepList() {
  const {
    steps,
    removeStep,
    reorderSteps,
    updateStepDescription,
    addCustomStep,
  } = useWorkflowStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = steps.findIndex((s) => getSortableId(s) === active.id);
      const newIndex = steps.findIndex((s) => getSortableId(s) === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderSteps(oldIndex, newIndex);
      }
    },
    [steps, reorderSteps],
  );

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index > 0) reorderSteps(index, index - 1);
    },
    [reorderSteps],
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index < steps.length - 1) reorderSteps(index, index + 1);
    },
    [steps.length, reorderSteps],
  );

  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center">
        <GitBranch
          size={48}
          className="text-[hsl(var(--muted-foreground))] mb-4 opacity-30"
        />
        <h3 className="text-base font-medium font-[var(--font-code)] text-[hsl(var(--foreground))] mb-2">
          开始编排工作流
        </h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-xs">
          从左侧选择 Skill
          添加到工作流中，或添加自定义步骤，组合为一个自动化工作流
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4 border-dashed gap-1.5"
          onClick={addCustomStep}
        >
          <Pencil size={14} />
          添加自定义步骤
        </Button>
      </div>
    );
  }

  const sortableIds = steps.map((s) => getSortableId(s));

  return (
    <ScrollArea className="h-full">
      <div className="p-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortableIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2" role="list" aria-label="工作流步骤列表">
              {steps.map((step, index) =>
                step.type === "custom" ? (
                  <CustomStepCard
                    key={sortableIds[index]}
                    step={step}
                    index={index}
                    onDescriptionChange={updateStepDescription}
                    onRemove={removeStep}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    isFirst={index === 0}
                    isLast={index === steps.length - 1}
                  />
                ) : (
                  <StepItem
                    key={sortableIds[index]}
                    step={step}
                    index={index}
                    onRemove={removeStep}
                    onUpdateDescription={updateStepDescription}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    isFirst={index === 0}
                    isLast={index === steps.length - 1}
                  />
                ),
              )}
            </div>
          </SortableContext>
        </DndContext>

        {/* 添加自定义步骤按钮 */}
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            className="border-dashed gap-1.5 w-full"
            onClick={addCustomStep}
          >
            <Pencil size={14} />
            添加自定义步骤
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
