// ============================================================
// components/workflow/StepItem.tsx — 单个可拖拽工作流步骤项
// ============================================================

import { ChevronDown, GripVertical, Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { WorkflowStep } from "../../../shared/types";
import { useSortableStep } from "../../hooks/useSortableStep";
import { Input } from "../ui/input";

// 预设描述列表
const PRESET_DESCRIPTIONS = [
  "可选的",
  "必须执行",
  "根据用户要求执行",
  "仅在需要时执行",
  "自动执行",
  "需要用户确认后执行",
] as const;

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
 * 支持拖拽排序、inline 描述编辑、键盘排序 Alt+↑/↓、移除、预设描述快速选择
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
  const [presetOpen, setPresetOpen] = useState(false);
  const presetRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    style,
    isDragging,
    handleKeyDown,
  } = useSortableStep({
    id: (step.skillId ?? "unknown") + "-" + step.order,
    index,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
  });

  const handleSelectPreset = useCallback(
    (preset: string) => {
      onUpdateDescription(index, preset);
      setPresetOpen(false);
    },
    [index, onUpdateDescription],
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-3 rounded-md border bg-[hsl(var(--card))] px-3 py-3 group transition-colors
        ${isDragging ? "border-[hsl(var(--primary))] opacity-50 shadow-lg" : "border-[hsl(var(--border))]"}`}
      onKeyDown={handleKeyDown}
      role="listitem"
      aria-label={`步骤 ${step.order}: ${step.skillName ?? "自定义步骤"}`}
    >
      {/* 拖拽手柄 */}
      <button
        className="mt-0.5 p-1 rounded cursor-grab active:cursor-grabbing text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors shrink-0 touch-none"
        aria-label={`拖拽排序 ${step.skillName ?? "步骤"}`}
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
          {step.skillName ?? "未知 Skill"}
        </p>
        {/* 描述输入 + 预设按钮 */}
        <div className="relative flex items-center gap-1">
          <Input
            placeholder="添加步骤描述..."
            value={step.description}
            onChange={(e) => onUpdateDescription(index, e.target.value)}
            className="h-7 text-xs bg-transparent border-[hsl(var(--border)/0.5)] focus:border-[hsl(var(--primary))]"
            aria-label={`${step.skillName ?? "步骤"} 的描述`}
          />
          {/* 预设描述按钮 */}
          <div ref={presetRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setPresetOpen((v) => !v)}
              className="flex items-center gap-0.5 h-7 px-2 rounded text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] border border-[hsl(var(--border)/0.5)] transition-colors whitespace-nowrap"
              aria-label="选择预设描述"
              aria-expanded={presetOpen}
            >
              预设
              <ChevronDown
                size={12}
                className={`transition-transform ${presetOpen ? "rotate-180" : ""}`}
              />
            </button>
            {/* 预设下拉面板 */}
            {presetOpen && (
              <>
                {/* 点击外部关闭 */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setPresetOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 min-w-[140px] rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--popover))] shadow-md py-1">
                  {PRESET_DESCRIPTIONS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]
                        ${step.description === preset ? "text-[hsl(var(--primary))] font-medium" : "text-[hsl(var(--foreground))]"}`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 移除按钮 */}
      <button
        onClick={() => onRemove(index)}
        className="mt-0.5 p-1.5 rounded-md text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.1)] opacity-0 group-hover:opacity-100 transition-all shrink-0"
        aria-label={`移除 ${step.skillName ?? "步骤"}`}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
