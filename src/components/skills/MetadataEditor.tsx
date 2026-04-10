// ============================================================
// components/skills/MetadataEditor.tsx — Skill Frontmatter 元数据编辑表单
// ============================================================

import { FolderInput, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { SkillMeta } from "../../../shared/types";
import { deleteSkill, moveSkillCategory, updateSkillMeta } from "../../lib/api";
import { useSkillStore } from "../../stores/skill-store";

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
    if (!confirm(`确定要删除 "${skill.name}" 吗？此操作不可撤销。`)) return;
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
        <button
          onClick={onClose}
          className="p-1 rounded text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <X size={14} />
        </button>
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
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-2 py-1.5 rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm"
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
            className="w-full px-2 py-1.5 rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm resize-none"
          />
        </div>

        {/* 标签 */}
        <div>
          <label className="block text-xs text-[hsl(var(--muted-foreground))] mb-1">
            标签（逗号分隔）
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
            className="w-full px-2 py-1.5 rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm"
          />
        </div>

        {/* 移动分类 */}
        <div>
          <label className="block text-xs text-[hsl(var(--muted-foreground))] mb-1">
            移动到分类
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={moveCategory}
              onChange={(e) => setMoveCategory(e.target.value)}
              placeholder="目标分类名称"
              className="flex-1 px-2 py-1.5 rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm"
            />
            <button
              onClick={handleMove}
              disabled={!moveCategory.trim()}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded border border-[hsl(var(--border))] text-xs disabled:opacity-50 hover:bg-[hsl(var(--accent))]"
            >
              <FolderInput size={12} />
              移动
            </button>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "保存中..." : "保存"}
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-[hsl(var(--destructive))] text-[hsl(var(--destructive))] text-sm hover:bg-[hsl(var(--destructive))/0.1]"
          >
            <Trash2 size={14} />
            删除
          </button>
        </div>
      </div>
    </div>
  );
}
