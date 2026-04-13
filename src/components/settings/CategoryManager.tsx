// ============================================================
// components/settings/CategoryManager.tsx — 分类管理组件
// ============================================================

import {
  Check,
  ChevronDown,
  ChevronRight,
  FileText,
  GitBranch,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Category, SkillMeta } from "../../../shared/types";
import {
  createCategory as apiCreateCategory,
  deleteCategory as apiDeleteCategory,
  updateCategory as apiUpdateCategory,
  fetchCategories,
  fetchSkills,
  moveSkillCategory,
} from "../../lib/api";
import { toast } from "../shared/toast-store";
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
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";

/**
 * 分类管理 — 添加、修改、删除分类，支持展开查看 Skill 并批量操作
 */
export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allSkills, setAllSkills] = useState<SkillMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  // 新建表单
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // 编辑状态
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // 展开状态：记录哪些分类已展开
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  // 批量选中状态：{ [categoryName]: Set<skillId> }
  const [selectedSkills, setSelectedSkills] = useState<
    Record<string, Set<string>>
  >({});

  // 批量操作 loading
  const [batchLoading, setBatchLoading] = useState<string | null>(null);

  // 加载分类列表和 Skill 列表
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [cats, skills] = await Promise.all([
        fetchCategories(),
        fetchSkills(),
      ]);
      setCategories(cats);
      setAllSkills(skills);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("category.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 获取某分类下的 Skill 列表
  const getSkillsForCategory = useCallback(
    (catName: string) =>
      allSkills.filter(
        (s) => s.category.toLowerCase() === catName.toLowerCase(),
      ),
    [allSkills],
  );

  // 切换分类展开/折叠
  const toggleExpand = (catName: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catName)) {
        next.delete(catName);
        // 折叠时清除该分类的选中状态
        setSelectedSkills((s) => {
          const ns = { ...s };
          delete ns[catName];
          return ns;
        });
      } else {
        next.add(catName);
      }
      return next;
    });
  };

  // 切换单个 Skill 选中状态
  const toggleSkillSelect = (catName: string, skillId: string) => {
    setSelectedSkills((prev) => {
      const catSet = new Set(prev[catName] ?? []);
      if (catSet.has(skillId)) {
        catSet.delete(skillId);
      } else {
        catSet.add(skillId);
      }
      return { ...prev, [catName]: catSet };
    });
  };

  // 全选/取消全选
  const toggleSelectAll = (catName: string) => {
    const skills = getSkillsForCategory(catName);
    const currentSelected = selectedSkills[catName] ?? new Set<string>();
    const allSelected = skills.every((s) => currentSelected.has(s.id));
    setSelectedSkills((prev) => ({
      ...prev,
      [catName]: allSelected
        ? new Set<string>()
        : new Set(skills.map((s) => s.id)),
    }));
  };

  // 批量移出分类（移到 uncategorized）
  const handleBatchRemove = async (catName: string) => {
    const ids = Array.from(selectedSkills[catName] ?? []);
    if (ids.length === 0) return;
    setBatchLoading(catName);
    try {
      await Promise.all(
        ids.map((id) => moveSkillCategory(id, "uncategorized")),
      );
      toast.success(t("category.batchRemoveSuccess", { count: ids.length }));
      // 清除选中并刷新数据
      setSelectedSkills((prev) => {
        const ns = { ...prev };
        delete ns[catName];
        return ns;
      });
      await loadData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("category.batchRemoveFailed"),
      );
    } finally {
      setBatchLoading(null);
    }
  };

  // 创建分类
  const handleCreate = async () => {
    if (!newName.trim() || !newDisplayName.trim()) return;
    try {
      await apiCreateCategory({
        name: newName.trim(),
        displayName: newDisplayName.trim(),
        description: newDescription.trim() || undefined,
      });
      setShowAddForm(false);
      setNewName("");
      setNewDisplayName("");
      setNewDescription("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("category.createFailed"));
    }
  };

  // 更新分类
  const handleUpdate = async (name: string) => {
    try {
      await apiUpdateCategory(name, {
        displayName: editDisplayName.trim() || undefined,
        description: editDescription.trim() || undefined,
      });
      setEditingName(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("category.updateFailed"));
    }
  };

  // 删除分类
  const handleDelete = async (name: string) => {
    try {
      await apiDeleteCategory(name);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("category.deleteFailed"));
    }
  };

  // 开始编辑
  const startEdit = (cat: Category) => {
    setEditingName(cat.name);
    setEditDisplayName(cat.displayName);
    setEditDescription(cat.description || "");
  };

  if (loading) {
    return (
      <div className="text-[hsl(var(--muted-foreground))]">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold font-[var(--font-code)]">
          {t("category.title")}
        </h2>
        <Button
          onClick={() => setShowAddForm(true)}
          size="sm"
          className="gap-1"
        >
          <Plus size={14} />
          {t("category.createNew")}
        </Button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 rounded-md bg-[hsl(var(--destructive))/0.1] border border-[hsl(var(--destructive))/0.3] text-sm text-[hsl(var(--destructive))] flex items-center justify-between">
          <span>{error}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setError(null)}
            className="h-6 w-6 shrink-0 text-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive))]"
          >
            <X size={14} />
          </Button>
        </div>
      )}

      {/* 新建表单 */}
      {showAddForm && (
        <div className="mb-4 p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <div className="grid gap-3">
            <Input
              placeholder={t("category.namePlaceholder")}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Input
              placeholder={t("category.displayNamePlaceholder")}
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
            />
            <Input
              placeholder={t("category.descriptionPlaceholder")}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreate} size="sm" className="gap-1">
                <Check size={14} />
                {t("category.createButton")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="gap-1"
              >
                <X size={14} />
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 分类列表 */}
      {categories.length === 0 ? (
        <div className="py-8 text-center text-[hsl(var(--muted-foreground))]">
          <p className="mb-2">{t("category.empty")}</p>
          <p className="text-xs">{t("category.emptyHint")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => {
            const isExpanded = expandedCategories.has(cat.name);
            const catSkills = getSkillsForCategory(cat.name);
            const catSelected = selectedSkills[cat.name] ?? new Set<string>();
            const selectedCount = catSelected.size;
            const allSelected =
              catSkills.length > 0 &&
              catSkills.every((s) => catSelected.has(s.id));

            return (
              <div
                key={cat.name}
                className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden"
              >
                {/* 分类头部行 */}
                <div className="flex items-center gap-3 p-3">
                  {editingName === cat.name ? (
                    /* 编辑模式 */
                    <div className="flex-1 grid gap-2">
                      <Input
                        value={editDisplayName}
                        onChange={(e) => setEditDisplayName(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder={t("category.descriptionLabel")}
                        className="h-8 text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdate(cat.name)}
                          className="h-7 w-7 text-[hsl(var(--primary))]"
                        >
                          <Check size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingName(null)}
                          className="h-7 w-7"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* 显示模式 */
                    <>
                      {/* 展开/折叠按钮 */}
                      <button
                        onClick={() => toggleExpand(cat.name)}
                        className="shrink-0 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                        aria-label={
                          isExpanded
                            ? t("category.collapse")
                            : t("category.expand")
                        }
                      >
                        {isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>

                      {/* 分类信息 */}
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => toggleExpand(cat.name)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {cat.displayName}
                          </span>
                          <span className="text-xs text-[hsl(var(--muted-foreground))] font-[var(--font-code)]">
                            {cat.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="h-5 px-1.5 text-[10px]"
                          >
                            {cat.skillCount} Skill
                          </Badge>
                        </div>
                        {cat.description && (
                          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                            {cat.description}
                          </p>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(cat)}
                        className="h-8 w-8"
                        title={t("common.edit")}
                      >
                        <Pencil size={14} />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]"
                            title={t("common.delete")}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t("category.deleteConfirmTitle")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("category.deleteConfirmDesc", {
                                name: cat.name,
                              })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t("common.cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(cat.name)}
                            >
                              {t("category.deleteConfirmTitle")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>

                {/* 展开的 Skill 列表 */}
                {isExpanded && (
                  <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]">
                    {catSkills.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                        {t("category.noSkills")}
                      </p>
                    ) : (
                      <>
                        {/* 批量操作工具栏 */}
                        <div className="flex items-center gap-3 px-4 py-2 border-b border-[hsl(var(--border))]">
                          <Checkbox
                            id={`select-all-${cat.name}`}
                            checked={allSelected}
                            onCheckedChange={() => toggleSelectAll(cat.name)}
                          />
                          <label
                            htmlFor={`select-all-${cat.name}`}
                            className="text-xs text-[hsl(var(--muted-foreground))] cursor-pointer select-none"
                          >
                            {selectedCount > 0
                              ? t("category.selectedCount", {
                                  count: selectedCount,
                                })
                              : t("category.selectAllLabel")}
                          </label>
                          {selectedCount > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-auto h-7 text-xs gap-1 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))/0.4] hover:bg-[hsl(var(--destructive))/0.1]"
                              onClick={() => handleBatchRemove(cat.name)}
                              disabled={batchLoading === cat.name}
                            >
                              {batchLoading === cat.name
                                ? t("category.processing")
                                : t("category.batchRemoveButton", {
                                    count: selectedCount,
                                  })}
                            </Button>
                          )}
                        </div>

                        {/* Skill 列表 */}
                        <div className="divide-y divide-[hsl(var(--border))]">
                          {catSkills.map((skill) => (
                            <div
                              key={skill.id}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-[hsl(var(--accent))] transition-colors"
                            >
                              <Checkbox
                                id={`skill-${skill.id}`}
                                checked={catSelected.has(skill.id)}
                                onCheckedChange={() =>
                                  toggleSkillSelect(cat.name, skill.id)
                                }
                              />
                              {skill.type === "workflow" ? (
                                <GitBranch
                                  size={13}
                                  className="shrink-0 text-[hsl(var(--info))]"
                                />
                              ) : (
                                <FileText
                                  size={13}
                                  className="shrink-0 text-[hsl(var(--primary))]"
                                />
                              )}
                              <label
                                htmlFor={`skill-${skill.id}`}
                                className="flex-1 text-sm cursor-pointer select-none truncate"
                              >
                                {skill.name}
                              </label>
                              {skill.description && (
                                <span className="text-xs text-[hsl(var(--muted-foreground))] truncate max-w-[200px]">
                                  {skill.description}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
