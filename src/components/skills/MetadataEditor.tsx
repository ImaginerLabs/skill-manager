// ============================================================
// components/skills/MetadataEditor.tsx — Skill Frontmatter 元数据编辑表单
// ============================================================

import { FolderInput, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      setError(err instanceof Error ? err.message : t("metadata.saveFailed"));
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
      setError(err instanceof Error ? err.message : t("metadata.deleteFailed"));
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
      setError(err instanceof Error ? err.message : t("metadata.moveFailed"));
    }
  };

  return (
    <div className="p-4 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold font-[var(--font-code)]">
          {t("metadata.title")}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7"
          aria-label={t("metadata.closePanel")}
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
          <label
            htmlFor="meta-name"
            className="block text-xs text-[hsl(var(--muted-foreground))] mb-1"
          >
            {t("metadata.fieldName")}
          </label>
          <Input
            id="meta-name"
            name="meta-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 text-sm"
          />
        </div>

        {/* 描述 */}
        <div>
          <label
            htmlFor="meta-description"
            className="block text-xs text-[hsl(var(--muted-foreground))] mb-1"
          >
            {t("metadata.fieldDescription")}
          </label>
          <textarea
            id="meta-description"
            name="meta-description"
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
          <label
            htmlFor="meta-tags"
            className="block text-xs text-[hsl(var(--muted-foreground))] mb-1"
          >
            {t("metadata.fieldTags")}
          </label>
          <Input
            id="meta-tags"
            name="meta-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tag1, tag2, tag3"
            className="h-8 text-sm"
          />
        </div>

        {/* 移动分类 */}
        <div>
          <label
            htmlFor="meta-move-category"
            className="block text-xs text-[hsl(var(--muted-foreground))] mb-1"
          >
            {t("metadata.fieldMoveCategory")}
          </label>
          <div className="flex gap-2">
            <Input
              id="meta-move-category"
              name="meta-move-category"
              value={moveCategory}
              onChange={(e) => setMoveCategory(e.target.value)}
              placeholder={t("metadata.movePlaceholder")}
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
              {t("metadata.moveButton")}
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
            {saving ? t("common.saving") : t("common.save")}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-1">
                <Trash2 size={14} />
                {t("common.delete")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("metadata.deleteConfirmTitle")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("metadata.deleteConfirmDesc")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  {t("metadata.deleteConfirmTitle")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
