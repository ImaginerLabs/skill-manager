// ============================================================
// components/skills/MetadataEditor.tsx — Skill Frontmatter 元数据编辑表单
// ============================================================

import { FolderInput, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { SkillMeta } from "../../../shared/types";
import { deleteSkill, moveSkillCategory, updateSkillMeta } from "../../lib/api";
import { cn } from "../../lib/utils";
import { useSkillStore } from "../../stores/skill-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface MetadataEditorProps {
  skill: SkillMeta;
  onClose: () => void;
  onUpdated: () => void;
}

/**
 * 元数据编辑器 — 编辑 Skill 的 Frontmatter 元数据
 * 支持编辑分类、标签、描述，以及删除和移动操作
 */
export default function MetadataEditor({
  skill,
  onClose,
  onUpdated,
}: MetadataEditorProps) {
  const { selectSkill } = useSkillStore();
  const [name, setName] = useState(skill.name);
  const [description, setDescription] = useState(skill.description);
  const [tags, setTags] = useState(skill.tags.join(", "));
  const [moveCategory, setMoveCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 保存元数据
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateSkillMeta(skill.id, {
        name: name.trim(),
        description: description.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  // 删除 Skill
  const handleDelete = async () => {
    try {
      await deleteSkill(skill.id);
      selectSkill(null);
      onUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    }
  };

  // 移动分类
  const handleMove = async () => {
    if (!moveCategory.trim()) return;
    try {
      await moveSkillCategory(skill.id, moveCategory.trim());
      setMoveCategory("");
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "移动失败");
    }
  };

  return (
    <div className="p-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold font-[var(--font-code)]">
          编辑元数据
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7"
        >
          <X size={14} />
        </Button>
      </div>

      {error && (
        <div className="mb-3 p-2 rounded text-xs bg-[hsl(var(--destructive))/0.1] text-[hsl(var(--destructive))]">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {/* 名称 */}
        <div>
          <label className="block text-xs text-[hsl(var(--muted-foreground))] mb-1">
            名称
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 text-sm"
          />
        </div>

        {/* 描述 */}
        <div>
          <label className="block text-xs text-[hsl(var(--muted-foreground))] mb-1">
            描述
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={cn(
              "flex w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] ring-offset-[hsl(var(--background))] placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
            )}
          />
        </div>

        {/* 标签 */}
        <div>
          <label className="block text-xs text-[hsl(var(--muted-foreground))] mb-1">
            标签（逗号分隔）
          </label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
            className="h-8 text-sm"
          />
        </div>

        {/* 移动分类 */}
        <div>
          <label className="block text-xs text-[hsl(var(--muted-foreground))] mb-1">
            移动到分类
          </label>
          <div className="flex gap-2">
            <Input
              value={moveCategory}
              onChange={(e) => setMoveCategory(e.target.value)}
              placeholder="目标分类名称"
              className="h-8 text-sm flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleMove}
              disabled={!moveCategory.trim()}
              className="gap-1"
            >
              <FolderInput size={12} />
              移动
            </Button>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="gap-1"
          >
            <Save size={14} />
            {saving ? "保存中..." : "保存"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-1">
                <Trash2 size={14} />
                删除
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除</AlertDialogTitle>
                <AlertDialogDescription>
                  确定要删除 &quot;{skill.name}&quot; 吗？此操作不可撤销。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  确认删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
