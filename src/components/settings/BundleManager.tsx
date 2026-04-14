// ============================================================
// components/settings/BundleManager.tsx — 套件管理组件
// ============================================================

import {
  Check,
  ChevronDown,
  ChevronRight,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Category } from "../../../shared/types";
import { fetchCategories } from "../../lib/api";
import { useBundleStore } from "../../stores/bundle-store";
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

/** 套件名称校验正则 */
const VALID_BUNDLE_NAME_RE = /^[a-z0-9-]+$/;

/**
 * 套件管理 — 创建、查看、编辑、删除套件
 */
export default function BundleManager() {
  const {
    bundles,
    bundlesLoading,
    bundlesError,
    fetchBundles,
    createBundle,
    updateBundle,
    deleteBundle,
    applyBundle,
    activeBundleId,
  } = useBundleStore();
  const { t } = useTranslation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // 展开状态
  const [expandedBundles, setExpandedBundles] = useState<Set<string>>(
    new Set(),
  );

  // 新建表单
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSelectedCategories, setNewSelectedCategories] = useState<string[]>(
    [],
  );
  const [newCategorySearch, setNewCategorySearch] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // 编辑状态
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSelectedCategories, setEditSelectedCategories] = useState<
    string[]
  >([]);
  const [editCategorySearch, setEditCategorySearch] = useState("");
  const [updating, setUpdating] = useState(false);

  // 激活状态
  const [applying, setApplying] = useState<string | null>(null);

  // 加载数据
  const loadData = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const [cats] = await Promise.all([fetchCategories(), fetchBundles()]);
      setCategories(cats);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("bundle.loadFailed"));
    } finally {
      setCategoriesLoading(false);
    }
  }, [fetchBundles, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 切换展开/折叠
  const toggleExpand = (id: string) => {
    setExpandedBundles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 名称实时校验
  const handleNameChange = (value: string) => {
    setNewName(value);
    if (value && !VALID_BUNDLE_NAME_RE.test(value)) {
      setNameError(t("bundle.nameError"));
    } else {
      setNameError(null);
    }
  };

  // 创建套件
  const handleCreate = async () => {
    if (
      !newName.trim() ||
      !newDisplayName.trim() ||
      newSelectedCategories.length === 0 ||
      nameError
    )
      return;
    setCreating(true);
    try {
      await createBundle({
        name: newName.trim(),
        displayName: newDisplayName.trim(),
        description: newDescription.trim() || undefined,
        categoryNames: newSelectedCategories,
      });
      toast.success(t("bundle.createSuccess"));
      setShowAddForm(false);
      setNewName("");
      setNewDisplayName("");
      setNewDescription("");
      setNewSelectedCategories([]);
      setNewCategorySearch("");
      setNameError(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("bundle.createFailed"),
      );
    } finally {
      setCreating(false);
    }
  };

  // 开始编辑
  const startEdit = (bundleId: string) => {
    const bundle = bundles.find((b) => b.id === bundleId);
    if (!bundle) return;
    setEditingId(bundleId);
    setEditDisplayName(bundle.displayName);
    setEditDescription(bundle.description ?? "");
    setEditSelectedCategories([...bundle.categoryNames]);
    setEditCategorySearch("");
  };

  // 保存编辑
  const handleUpdate = async (id: string) => {
    if (!editDisplayName.trim() || editSelectedCategories.length === 0) return;
    setUpdating(true);
    try {
      await updateBundle(id, {
        displayName: editDisplayName.trim(),
        description: editDescription.trim() || undefined,
        categoryNames: editSelectedCategories,
      });
      toast.success(t("bundle.updateSuccess"));
      setEditingId(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("bundle.updateFailed"),
      );
    } finally {
      setUpdating(false);
    }
  };

  // 删除套件
  const handleDelete = async (id: string) => {
    try {
      await deleteBundle(id);
      toast.success(t("bundle.deleteSuccess"));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("bundle.deleteFailed"),
      );
    }
  };

  // 激活套件
  const handleApply = async (id: string) => {
    setApplying(id);
    try {
      const result = await applyBundle(id);
      const msg =
        result.skipped.length > 0
          ? t("bundle.activateSuccess_withSkipped", {
              applied: result.applied.length,
              skipped: result.skipped.length,
            })
          : t("bundle.activateSuccess", { applied: result.applied.length });
      toast.success(msg);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("bundle.activateFailed"),
      );
    } finally {
      setApplying(null);
    }
  };

  // 分类多选切换
  const toggleCategory = (
    catName: string,
    selected: string[],
    setSelected: (v: string[]) => void,
  ) => {
    if (selected.includes(catName)) {
      setSelected(selected.filter((c) => c !== catName));
    } else {
      setSelected([...selected, catName]);
    }
  };

  // 过滤分类列表
  const filteredCategories = (search: string) =>
    categories.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.displayName.toLowerCase().includes(search.toLowerCase()),
    );

  if (bundlesLoading || categoriesLoading) {
    return (
      <div className="text-[hsl(var(--muted-foreground))] text-sm py-4">
        {t("common.loading")}
      </div>
    );
  }

  if (bundlesError) {
    return (
      <div className="p-3 rounded-md bg-[hsl(var(--destructive))/0.1] border border-[hsl(var(--destructive))/0.3] text-sm text-[hsl(var(--destructive))]">
        {bundlesError}
      </div>
    );
  }

  return (
    <div>
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold font-[var(--font-code)]">
          {t("bundle.title")}
        </h2>
        <Button
          onClick={() => setShowAddForm(true)}
          size="sm"
          className="gap-1"
          disabled={showAddForm}
        >
          <Plus size={14} />
          {t("bundle.createNew")}
        </Button>
      </div>

      {/* 新建表单 */}
      {showAddForm && (
        <div className="mb-4 p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <div className="grid gap-3">
            <div>
              <Input
                placeholder={t("bundle.namePlaceholder")}
                value={newName}
                onChange={(e) => handleNameChange(e.target.value)}
              />
              {nameError && (
                <p className="text-xs text-[hsl(var(--destructive))] mt-1">
                  {nameError}
                </p>
              )}
            </div>
            <Input
              placeholder={t("bundle.displayNamePlaceholder")}
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
            />
            <Input
              placeholder={t("bundle.descriptionPlaceholder")}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            {/* 分类选择器 */}
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mb-2">
                {t("bundle.selectCategories")}
              </p>
              <div className="relative mb-2">
                <Search
                  size={14}
                  className="absolute left-2.5 top-2.5 text-[hsl(var(--muted-foreground))]"
                />
                <Input
                  placeholder={t("bundle.searchCategories")}
                  value={newCategorySearch}
                  onChange={(e) => setNewCategorySearch(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1 rounded-md border border-[hsl(var(--border))] p-2">
                {filteredCategories(newCategorySearch).map((cat) => (
                  <label
                    key={cat.name}
                    className="flex items-center gap-2 cursor-pointer hover:bg-[hsl(var(--accent))] rounded px-2 py-1"
                  >
                    <Checkbox
                      checked={newSelectedCategories.includes(cat.name)}
                      onCheckedChange={() =>
                        toggleCategory(
                          cat.name,
                          newSelectedCategories,
                          setNewSelectedCategories,
                        )
                      }
                    />
                    <span className="text-sm">{cat.displayName}</span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))] font-[var(--font-code)]">
                      {cat.name}
                    </span>
                  </label>
                ))}
                {filteredCategories(newCategorySearch).length === 0 && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))] text-center py-2">
                    {t("bundle.noMatchCategories")}
                  </p>
                )}
              </div>
              {newSelectedCategories.length > 0 && (
                <p className="text-xs text-[hsl(var(--primary))] mt-1">
                  {t("bundle.selectedCount", {
                    count: newSelectedCategories.length,
                  })}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                size="sm"
                className="gap-1"
                disabled={
                  !newName.trim() ||
                  !newDisplayName.trim() ||
                  newSelectedCategories.length === 0 ||
                  !!nameError ||
                  creating
                }
              >
                <Check size={14} />
                {creating ? t("common.creating") : t("bundle.confirmCreate")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setNewName("");
                  setNewDisplayName("");
                  setNewDescription("");
                  setNewSelectedCategories([]);
                  setNameError(null);
                }}
                className="gap-1"
              >
                <X size={14} />
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 套件列表 */}
      {bundles.length === 0 ? (
        <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium mb-1">{t("bundle.empty")}</p>
          <p className="text-xs">{t("bundle.emptyHint")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {bundles.map((bundle) => {
            const isExpanded = expandedBundles.has(bundle.id);
            const isEditing = editingId === bundle.id;

            return (
              <div
                key={bundle.id}
                className={`rounded-lg border overflow-hidden ${
                  activeBundleId === bundle.id
                    ? "border-[hsl(var(--primary))]"
                    : "border-[hsl(var(--border))]"
                } bg-[hsl(var(--card))]`}
              >
                {/* 套件头部行 */}
                <div className="flex items-center gap-3 p-3">
                  {isEditing ? (
                    /* 编辑模式 */
                    <div className="flex-1 grid gap-2">
                      <Input
                        value={editDisplayName}
                        onChange={(e) => setEditDisplayName(e.target.value)}
                        placeholder={t("bundle.displayNameLabel")}
                        className="h-8 text-sm"
                      />
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder={t("bundle.descriptionPlaceholder")}
                        className="h-8 text-sm"
                      />
                      {/* 编辑分类选择器 */}
                      <div>
                        <div className="relative mb-1">
                          <Search
                            size={14}
                            className="absolute left-2.5 top-2 text-[hsl(var(--muted-foreground))]"
                          />
                          <Input
                            placeholder={t("bundle.searchCategories")}
                            value={editCategorySearch}
                            onChange={(e) =>
                              setEditCategorySearch(e.target.value)
                            }
                            className="pl-8 h-7 text-xs"
                          />
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-1 rounded-md border border-[hsl(var(--border))] p-1">
                          {filteredCategories(editCategorySearch).map((cat) => (
                            <label
                              key={cat.name}
                              className="flex items-center gap-2 cursor-pointer hover:bg-[hsl(var(--accent))] rounded px-2 py-0.5"
                            >
                              <Checkbox
                                checked={editSelectedCategories.includes(
                                  cat.name,
                                )}
                                onCheckedChange={() =>
                                  toggleCategory(
                                    cat.name,
                                    editSelectedCategories,
                                    setEditSelectedCategories,
                                  )
                                }
                              />
                              <span className="text-xs">{cat.displayName}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdate(bundle.id)}
                          className="h-7 w-7 text-[hsl(var(--primary))]"
                          disabled={
                            !editDisplayName.trim() ||
                            editSelectedCategories.length === 0 ||
                            updating
                          }
                        >
                          <Check size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingId(null)}
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
                        onClick={() => toggleExpand(bundle.id)}
                        className="shrink-0 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                        aria-label={
                          isExpanded ? t("common.collapse") : t("common.expand")
                        }
                      >
                        {isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>

                      {/* 套件信息 */}
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => toggleExpand(bundle.id)}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">
                            {bundle.displayName}
                          </span>
                          <span className="text-xs text-[hsl(var(--muted-foreground))] font-[var(--font-code)]">
                            {bundle.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="h-5 px-1.5 text-[10px]"
                          >
                            {t("category.skillCount", {
                              count: bundle.categoryNames.length,
                            })}
                          </Badge>
                          {activeBundleId === bundle.id && (
                            <Badge
                              variant="default"
                              className="h-5 px-1.5 text-[10px]"
                            >
                              {t("bundle.activated")}
                            </Badge>
                          )}
                          {bundle.brokenCategoryNames.length > 0 && (
                            <Badge
                              variant="outline"
                              className="h-5 px-1.5 text-[10px] border-yellow-500 text-yellow-500"
                            >
                              {t("bundle.brokenRef", {
                                count: bundle.brokenCategoryNames.length,
                              })}
                            </Badge>
                          )}
                        </div>
                        {bundle.description && (
                          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                            {bundle.description}
                          </p>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant={
                          activeBundleId === bundle.id ? "default" : "outline"
                        }
                        onClick={() => handleApply(bundle.id)}
                        disabled={applying === bundle.id}
                        className="h-7 text-xs px-2 shrink-0"
                        title={t("bundle.activate")}
                      >
                        {applying === bundle.id
                          ? t("common.processing")
                          : activeBundleId === bundle.id
                            ? t("bundle.activated")
                            : t("bundle.activate")}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(bundle.id)}
                        className="h-8 w-8"
                        title={t("bundle.edit")}
                      >
                        <Pencil size={14} />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]"
                            title={t("bundle.delete")}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t("metadata.deleteConfirmTitle")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("category.deleteConfirmDesc", {
                                name: bundle.displayName,
                              })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t("common.cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(bundle.id)}
                            >
                              {t("metadata.deleteConfirmTitle")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>

                {/* 展开的分类 Tag 列表 */}
                {isExpanded && !isEditing && (
                  <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {bundle.categoryNames.map((catName) => {
                        const isBroken =
                          bundle.brokenCategoryNames.includes(catName);
                        return (
                          <Badge
                            key={catName}
                            variant={isBroken ? "outline" : "secondary"}
                            className={`text-xs font-[var(--font-code)] ${
                              isBroken
                                ? "line-through text-[hsl(var(--muted-foreground))] border-[hsl(var(--destructive))/0.4]"
                                : ""
                            }`}
                          >
                            {catName}
                            {isBroken && " (deleted)"}
                          </Badge>
                        );
                      })}
                    </div>
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
