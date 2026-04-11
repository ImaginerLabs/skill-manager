// ============================================================
// components/workflow/StepItem.tsx — 单个可拖拽工作流步骤项
// ============================================================

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { useCallback } from "react";
import type { WorkflowStep } from "../../../shared/types";
import { Input } from "../ui/input";

interface StepItemProps {
  step: WorkflowStep;
  index: number;
  onRemove: (index: number) => void;
  onUpdateDescription: (index: number, desc: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
}

/**
 * StepItem — 单个可拖拽工作流步骤
 * 支持拖拽排序、inline 描述编辑、键盘排序 Alt+↑/↓、移除
 */
export default function StepItem({
  step,
  index,
  onRemove,
  onUpdateDescription,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: StepItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.skillId + "-" + step.order });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.altKey && e.key === "ArrowUp" && !isFirst) {
        e.preventDefault();
        onMoveUp(index);
      } else if (e.altKey && e.key === "ArrowDown" && !isLast) {
        e.preventDefault();
        onMoveDown(index);
      }
    },
    [index, isFirst, isLast, onMoveUp, onMoveDown],
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-3 rounded-md border bg-[hsl(var(--card))] px-3 py-3 group transition-colors
        ${isDragging ? "border-[hsl(var(--primary))] opacity-50 shadow-lg" : "border-[hsl(var(--border))]"}`}
      onKeyDown={handleKeyDown}
      role="listitem"
      aria-label={`步骤 ${step.order}: ${step.skillName}`}
    >
      {/* 拖拽手柄 */}
      <button
        className="mt-0.5 p-1 rounded cursor-grab active:cursor-grabbing text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors shrink-0 touch-none"
        aria-label={`拖拽排序 ${step.skillName}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>

      {/* 序号 */}
      <span className="flex items-center justify-center w-6 h-6 mt-0.5 rounded-full bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] text-xs font-bold font-[var(--font-code)] shrink-0">
        {step.order}
      </span>

      {/* 内容区 */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="text-sm font-medium font-[var(--font-code)] text-[hsl(var(--foreground))] truncate">
          {step.skillName}
        </p>
        <Input
          placeholder="添加步骤描述..."
          value={step.description}
          onChange={(e) => onUpdateDescription(index, e.target.value)}
          className="h-7 text-xs bg-transparent border-[hsl(var(--border)/0.5)] focus:border-[hsl(var(--primary))]"
          aria-label={`${step.skillName} 的描述`}
        />
      </div>

      {/* 移除按钮 */}
      <button
        onClick={() => onRemove(index)}
        className="mt-0.5 p-1.5 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.1)] opacity-0 group-hover:opacity-100 transition-all shrink-0"
        aria-label={`移除 ${step.skillName}`}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
