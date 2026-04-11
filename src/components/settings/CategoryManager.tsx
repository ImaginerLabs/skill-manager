// ============================================================
// components/settings/CategoryManager.tsx — 分类管理组件
// ============================================================

import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Category } from "../../../shared/types";
import {
  createCategory as apiCreateCategory,
  deleteCategory as apiDeleteCategory,
  updateCategory as apiUpdateCategory,
  fetchCategories,
} from "../../lib/api";
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
import { Input } from "../ui/input";

/**
 * 分类管理 — 添加、修改、删除分类
 */
export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 新建表单
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // 编辑状态
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // 加载分类列表
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载分类失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

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
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建分类失败");
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
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新分类失败");
    }
  };

  // 删除分类
  const handleDelete = async (name: string) => {
    try {
      await apiDeleteCategory(name);
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除分类失败");
    }
  };

  // 开始编辑
  const startEdit = (cat: Category) => {
    setEditingName(cat.name);
    setEditDisplayName(cat.displayName);
    setEditDescription(cat.description || "");
  };

  if (loading) {
    return <div className="text-[hsl(var(--muted-foreground))]">加载中...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold font-[var(--font-code)]">分类管理</h2>
        <Button
          onClick={() => setShowAddForm(true)}
          size="sm"
          className="gap-1"
        >
          <Plus size={14} />
          新建分类
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
              placeholder="分类标识（英文，如 coding）"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Input
              placeholder="显示名称（如 编程开发）"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
            />
            <Input
              placeholder="描述（可选）"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreate} size="sm" className="gap-1">
                <Check size={14} />
                创建
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="gap-1"
              >
                <X size={14} />
                取消
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 分类列表 */}
      {categories.length === 0 ? (
        <div className="py-8 text-center text-[hsl(var(--muted-foreground))]">
          <p className="mb-2">暂无分类</p>
          <p className="text-xs">点击"新建分类"开始创建</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="flex items-center gap-3 p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
            >
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
                    placeholder="描述"
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
                  <div className="flex-1">
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
                    title="编辑"
                  >
                    <Pencil size={14} />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]"
                        title="删除"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                          确定要删除分类 &quot;{cat.name}&quot; 吗？
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(cat.name)}
                        >
                          确认删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
