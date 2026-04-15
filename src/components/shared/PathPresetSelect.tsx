// ============================================================
// components/shared/PathPresetSelect.tsx — 路径预设下拉选择组件（共享）
// 从 SyncTargetManager 中提取，供同步页面和导入页面复用
// ============================================================

import { FolderOpen } from "lucide-react";
import { memo, useMemo } from "react";
import type { PathPreset } from "../../../shared/types";
import { matchIDEByPath } from "../settings/ide-icons/ide-matcher";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// ─── 预设选项 IDE Icon 展示 ───────────────────────────────────────────────────

interface PresetOptionProps {
  preset: PathPreset;
}

/** 在下拉选项中展示 IDE icon + 标签 + 路径 */
export function PresetOption({ preset }: PresetOptionProps) {
  const ide = useMemo(() => matchIDEByPath(preset.path), [preset.path]);

  return (
    <span className="flex items-center gap-2 min-w-0">
      {/* IDE icon 或通用文件夹 */}
      <span className="shrink-0 flex items-center justify-center w-4 h-4">
        {ide ? (
          <ide.Icon
            width={14}
            height={14}
            style={{ color: ide.Icon.colorPrimary }}
          />
        ) : (
          <FolderOpen
            size={13}
            className="text-[hsl(var(--muted-foreground))]"
          />
        )}
      </span>
      {/* 标签 + 路径 */}
      <span className="flex flex-col min-w-0">
        <span className="text-xs font-medium leading-tight truncate">
          {preset.label ?? ide?.label ?? "通用路径"}
        </span>
        <span className="text-[10px] font-mono text-[hsl(var(--muted-foreground))] leading-tight truncate">
          {preset.path}
        </span>
      </span>
    </span>
  );
}

// ─── 路径预设下拉选择器 ───────────────────────────────────────────────────────

interface PathPresetSelectProps {
  /** 路径预设列表 */
  presets: PathPreset[];
  /** 选中路径后的回调 */
  onSelect: (path: string) => void;
  /** 占位文本 */
  placeholder?: string;
  /** 触发器标题（tooltip） */
  title?: string;
  /** 触发器额外 className */
  triggerClassName?: string;
}

/**
 * PathPresetSelect — 路径预设下拉选择器
 *
 * 展示已配置的路径预设列表，每个选项带有 IDE 图标识别。
 * 仅在 presets 非空时渲染。
 */
export const PathPresetSelect = memo(function PathPresetSelect({
  presets,
  onSelect,
  placeholder = "从预设选择",
  title = "从预设选择",
  triggerClassName = "h-9 w-auto min-w-[120px] max-w-[200px] shrink-0 text-xs",
}: PathPresetSelectProps) {
  if (presets.length === 0) return null;

  return (
    <Select
      value=""
      onValueChange={(val) => {
        if (val) onSelect(val);
      }}
    >
      <SelectTrigger className={triggerClassName} title={title}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-w-[320px]">
        {presets.map((p) => (
          <SelectItem key={p.id} value={p.path} className="py-2 pl-2 pr-3">
            <PresetOption preset={p} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});
