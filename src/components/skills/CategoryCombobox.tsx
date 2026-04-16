// ============================================================
// components/skills/CategoryCombobox.tsx — 分类选择器 Combobox
// ============================================================

import { Loader2, Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { createCategory } from "../../lib/api";
import { useSkillStore } from "../../stores/skill-store";
import { toast } from "../shared/toast-store";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface CategoryComboboxProps {
  value: string;
  onChange: (categoryName: string) => void;
}

const CATEGORY_NAME_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export default function CategoryCombobox({
  value,
  onChange,
}: CategoryComboboxProps) {
  const { categories, fetchSkills } = useSkillStore();
  const { t } = useTranslation();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDisplayName, setNewCategoryDisplayName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const handleValueChange = useCallback(
    (newValue: string) => {
      if (newValue === "__create__") {
        setShowCreateForm(true);
        return;
      }
      if (newValue && newValue !== value) {
        onChange(newValue);
      }
    },
    [onChange, value],
  );

  const handleNameChange = useCallback(
    (name: string) => {
      setNewCategoryName(name.toLowerCase());
      if (name && !CATEGORY_NAME_REGEX.test(name)) {
        setNameError(t("category.invalidNameFormat"));
      } else {
        setNameError(null);
      }
    },
    [t],
  );

  const handleCreateSubmit = useCallback(async () => {
    if (!newCategoryName || !newCategoryDisplayName || nameError) return;

    const existing = categories.find((c) => c.name === newCategoryName);
    if (existing) {
      setNameError(t("category.nameAlreadyExists"));
      return;
    }

    setCreating(true);
    try {
      const newCategory = await createCategory({
        name: newCategoryName,
        displayName: newCategoryDisplayName,
      });
      await fetchSkills();
      setShowCreateForm(false);
      setNewCategoryName("");
      setNewCategoryDisplayName("");
      onChange(newCategory.name);
      toast.success(
        t("category.createdSuccess", { name: newCategory.displayName }),
      );
    } catch (err) {
      setNameError(
        err instanceof Error ? err.message : t("category.createFailed"),
      );
    } finally {
      setCreating(false);
    }
  }, [
    newCategoryName,
    newCategoryDisplayName,
    nameError,
    categories,
    fetchSkills,
    onChange,
    t,
  ]);

  const handleCancelCreate = useCallback(() => {
    setShowCreateForm(false);
    setNewCategoryName("");
    setNewCategoryDisplayName("");
    setNameError(null);
  }, []);

  if (showCreateForm) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <Input
          value={newCategoryName}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder={t("category.namePlaceholder")}
          className="h-8 text-sm"
          autoFocus
        />
        {nameError && (
          <p className="text-xs text-[hsl(var(--destructive))]">{nameError}</p>
        )}
        <Input
          value={newCategoryDisplayName}
          onChange={(e) => setNewCategoryDisplayName(e.target.value)}
          placeholder={t("category.displayNamePlaceholder")}
          className="h-8 text-sm"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleCreateSubmit}
            disabled={
              !newCategoryName ||
              !newCategoryDisplayName ||
              !!nameError ||
              creating
            }
            className="gap-1"
          >
            {creating && <Loader2 size={12} className="animate-spin" />}
            {t("common.create")}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCancelCreate}>
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    );
  }

  const currentCategory = categories.find((c) => c.name === value);

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger className="h-8 text-sm flex-1">
        <SelectValue placeholder={t("metadata.movePlaceholder")}>
          {currentCategory?.displayName || t("metadata.movePlaceholder")}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.name} value={category.name}>
            <div className="flex flex-col">
              <span>{category.displayName}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                {category.skillCount} Skills
              </span>
            </div>
          </SelectItem>
        ))}
        <SelectItem value="__create__" className="gap-1">
          <div className="flex items-center gap-1 text-[hsl(var(--primary))]">
            <Plus size={14} />
            <span>{t("category.createNew")}</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
