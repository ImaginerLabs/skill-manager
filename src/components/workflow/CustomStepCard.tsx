// ============================================================
// components/workflow/CustomStepCard.tsx — 自定义步骤卡片组件
// ============================================================

import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import type { WorkflowStep } from "../../../shared/types";
import { useSortableStep } from "../../hooks/useSortableStep";

interface CustomStepCardProps {
  step: WorkflowStep;
  index: number;
  onDescriptionChange: (index: number, description: string) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
}

/**
 * CustomStepCard — 自定义步骤卡片
 * 虚线边框 + ✏️ 图标 + 自动扩展 Textarea，与 Skill 步骤视觉区分
 */
export default function CustomStepCard({
  step,
  index,
  onDescriptionChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: CustomStepCardProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    style,
    isDragging,
    handleKeyDown,
  } = useSortableStep({
    id: `custom-${step.order}`,
    index,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
  });
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    // 最大 6 行（每行约 24px）
    const maxHeight = 144;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [step.description, adjustHeight]);

  // 新建时自动聚焦
  useEffect(() => {
    if (step.description === "" && textareaRef.current) {
      textareaRef.current.focus();
    }
    // 仅在挂载时执行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-3 rounded-md px-3 py-3 group transition-colors
        border-2 border-dashed bg-[hsl(var(--card))]
        bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(71,85,105,0.05)_10px,rgba(71,85,105,0.05)_20px)]
        ${isDragging ? "border-[hsl(var(--primary))] opacity-50 shadow-lg" : "border-[#475569]"}
        focus-within:outline focus-within:outline-2 focus-within:outline-[#22C55E]`}
      onKeyDown={handleKeyDown}
      role="listitem"
      aria-label={`自定义步骤 ${step.order}`}
    >
      {/* 拖拽手柄 */}
      <button
        className="mt-0.5 p-1 rounded cursor-grab active:cursor-grabbing text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors shrink-0 touch-none"
        aria-label="拖拽排序"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>

      {/* 序号 + 图标 */}
      <div className="flex items-center gap-1.5 mt-0.5 shrink-0">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[hsl(var(--muted)/0.3)] text-[hsl(var(--muted-foreground))] text-xs font-bold font-[var(--font-code)]">
          {step.order}
        </span>
        <Pencil size={14} className="text-[hsl(var(--muted-foreground))]" />
      </div>

      {/* 内容区 */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
          自定义步骤
        </p>
        <textarea
          ref={textareaRef}
          value={step.description}
          onChange={(e) => {
            onDescriptionChange(index, e.target.value);
          }}
          onInput={adjustHeight}
          placeholder="输入自定义步骤描述，如：检查暂存区的代码，并分析意图"
          rows={1}
          className="w-full resize-none border-0 bg-transparent p-0 font-mono text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:outline-none focus:ring-0"
          style={{ maxHeight: "144px", overflow: "auto" }}
          aria-label="自定义步骤描述"
        />
      </div>

      {/* 移除按钮 */}
      <button
        onClick={() => onRemove(index)}
        className="mt-0.5 p-1.5 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.1)] opacity-0 group-hover:opacity-100 transition-all shrink-0"
        aria-label="移除此步骤"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
