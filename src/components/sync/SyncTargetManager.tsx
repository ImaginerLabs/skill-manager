// ============================================================
// components/sync/SyncTargetManager.tsx — 同步目标管理组件
// ============================================================

import { Check, Edit2, FolderOpen, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { PathPreset } from "../../../shared/types";
import { fetchPathPresets, validateSyncPath } from "../../lib/api";
import { useSyncStore } from "../../stores/sync-store";
import { PathPresetSelect } from "../shared/PathPresetSelect";
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
} from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";

// ─── 主组件 ───────────────────────────────────────────────────────────────────

interface EditingState {
  id: string | null;
  name: string;
  path: string;
}

/**
 * SyncTargetManager — 同步目标路径配置管理
 * 支持添加、编辑、删除、启用/禁用同步目标
 */
export default function SyncTargetManager() {
  const {
    targets,
    targetsLoading,
    fetchTargets,
    addTarget,
    updateTarget,
    removeTarget,
  } = useSyncStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPath, setNewPath] = useState("");
  const [adding, setAdding] = useState(false);
  const [pathPresets, setPathPresets] = useState<PathPreset[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [editing, setEditing] = useState<EditingState>({
    id: null,
    name: "",
    path: "",
  });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [pathStatus, setPathStatus] = useState<{
    exists: boolean;
    writable: boolean;
  } | null>(null);

  useEffect(() => {
    fetchTargets();
    fetchPathPresets()
      .then(setPathPresets)
      .catch(() => {});
  }, [fetchTargets]);

  // 仅在挂载时检测 URL 参数 action=add-target，自动展开添加表单
  useEffect(() => {
    if (searchParams.get("action") === "add-target") {
      setShowAddForm(true);
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 路径校验（防抖）
  const handleValidatePath = useCallback(async (targetPath: string) => {
    if (!targetPath.trim()) {
      setPathStatus(null);
      return;
    }
    setValidating(true);
    try {
      const result = await validateSyncPath(targetPath);
      setPathStatus(result);
    } catch {
      setPathStatus(null);
    } finally {
      setValidating(false);
    }
  }, []);

  const handleAdd = useCallback(async () => {
    if (!newName.trim() || !newPath.trim()) return;
    setAdding(true);
    try {
      await addTarget({ name: newName.trim(), path: newPath.trim() });
      toast.success(`同步目标「${newName.trim()}」已添加`);
      setNewName("");
      setNewPath("");
      setShowAddForm(false);
      setPathStatus(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "添加同步目标失败");
    } finally {
      setAdding(false);
    }
  }, [newName, newPath, addTarget]);

  const handleStartEdit = useCallback(
    (id: string, name: string, path: string) => {
      setEditing({ id, name, path });
    },
    [],
  );

  const handleSaveEdit = useCallback(async () => {
    if (!editing.id || !editing.name.trim() || !editing.path.trim()) return;
    try {
      await updateTarget(editing.id, {
        name: editing.name.trim(),
        path: editing.path.trim(),
      });
      toast.success("同步目标已更新");
      setEditing({ id: null, name: "", path: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "更新同步目标失败");
    }
  }, [editing, updateTarget]);

  const handleCancelEdit = useCallback(() => {
    setEditing({ id: null, name: "", path: "" });
  }, []);

  const handleToggleEnabled = useCallback(
    async (id: string, enabled: boolean) => {
      try {
        await updateTarget(id, { enabled: !enabled });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "更新状态失败");
      }
    },
    [updateTarget],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const target = targets.find((t) => t.id === deleteTarget);
      await removeTarget(deleteTarget);
      toast.success(`同步目标「${target?.name ?? ""}」已删除`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "删除同步目标失败");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, targets, removeTarget]);

  if (targetsLoading && targets.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
        加载中...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen size={18} className="text-[hsl(var(--primary))]" />
          <h3 className="text-sm font-medium text-[hsl(var(--foreground))]">
            同步目标 ({targets.length})
          </h3>
        </div>
        {!showAddForm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="gap-1.5"
          >
            <Plus size={14} />
            添加目标
          </Button>
        )}
      </div>

      {/* 添加表单 */}
      {showAddForm && (
        <div className="rounded-md border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--card))] p-4 space-y-3">
          <Input
            placeholder="目标名称（如：CodeBuddy 项目）"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-9 text-sm"
            aria-label="同步目标名称"
          />
          <div className="space-y-1">
            <div className="flex gap-2">
              <Input
                placeholder="绝对路径（如：/Users/alex/project/.codebuddy/skills）"
                value={newPath}
                onChange={(e) => {
                  setNewPath(e.target.value);
                  setPathStatus(null);
                }}
                onBlur={() => handleValidatePath(newPath)}
                className="h-9 text-sm font-[var(--font-code)]"
                aria-label="同步目标路径"
              />
              <PathPresetSelect
                presets={pathPresets}
                onSelect={(val) => {
                  setNewPath(val);
                  setPathStatus(null);
                }}
              />
            </div>
            {validating && (
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                校验路径中...
              </p>
            )}
            {pathStatus && !validating && (
              <p
                className={`text-xs ${
                  pathStatus.exists && pathStatus.writable
                    ? "text-[hsl(var(--primary))]"
                    : pathStatus.exists
                      ? "text-yellow-500"
                      : "text-[hsl(var(--muted-foreground))]"
                }`}
              >
                {pathStatus.exists && pathStatus.writable
                  ? "✓ 路径存在且可写"
                  : pathStatus.exists
                    ? "⚠ 路径存在但不可写"
                    : "路径不存在（同步时将自动创建）"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!newName.trim() || !newPath.trim() || adding}
              className="gap-1.5"
            >
              <Plus size={14} />
              {adding ? "添加中..." : "确认添加"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAddForm(false);
                setNewName("");
                setNewPath("");
                setPathStatus(null);
              }}
            >
              取消
            </Button>
          </div>
        </div>
      )}

      {/* 目标列表 */}
      {targets.length === 0 && !showAddForm ? (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
          {/* 引导标题 */}
          <p className="text-sm font-medium text-[hsl(var(--foreground))]">
            开始使用同步功能
          </p>
          {/* 分步引导 */}
          <div className="w-full max-w-xs space-y-2 text-left">
            {/* 步骤 1（高亮） */}
            <div className="flex items-start gap-3 rounded-md border border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.05)] px-3 py-2.5">
              <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-[10px] font-bold mt-0.5">
                1
              </span>
              <div>
                <p className="text-xs font-medium text-[hsl(var(--primary))]">
                  添加同步目标
                </p>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">
                  配置 IDE 项目路径
                </p>
              </div>
            </div>
            {/* 步骤 2（灰色） */}
            <div className="flex items-start gap-3 rounded-md border border-[hsl(var(--border))] px-3 py-2.5 opacity-50">
              <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] text-[10px] font-bold mt-0.5">
                2
              </span>
              <div>
                <p className="text-xs font-medium text-[hsl(var(--foreground))]">
                  选择 Skill
                </p>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">
                  在左侧选择要同步的 Skill
                </p>
              </div>
            </div>
            {/* 步骤 3（灰色） */}
            <div className="flex items-start gap-3 rounded-md border border-[hsl(var(--border))] px-3 py-2.5 opacity-50">
              <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] text-[10px] font-bold mt-0.5">
                3
              </span>
              <div>
                <p className="text-xs font-medium text-[hsl(var(--foreground))]">
                  开始同步
                </p>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">
                  一键同步到目标路径
                </p>
              </div>
            </div>
          </div>
          {/* 添加按钮 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="gap-1.5 mt-2"
            data-testid="guide-add-target-btn"
          >
            <Plus size={14} />
            添加同步目标
          </Button>
        </div>
      ) : (
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2">
            {targets.map((target) => (
              <div
                key={target.id}
                className={`rounded-md border px-4 py-3 transition-colors ${
                  target.enabled
                    ? "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
                    : "border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card)/0.5)] opacity-60"
                }`}
              >
                {editing.id === target.id ? (
                  /* 编辑模式 */
                  <div className="space-y-2">
                    <Input
                      value={editing.name}
                      onChange={(e) =>
                        setEditing((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="h-8 text-sm"
                      aria-label="编辑目标名称"
                    />
                    <Input
                      value={editing.path}
                      onChange={(e) =>
                        setEditing((prev) => ({
                          ...prev,
                          path: e.target.value,
                        }))
                      }
                      className="h-8 text-sm font-[var(--font-code)]"
                      aria-label="编辑目标路径"
                    />
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleSaveEdit}
                        aria-label="保存编辑"
                      >
                        <Check size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleCancelEdit}
                        aria-label="取消编辑"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* 显示模式 */
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                          {target.name}
                        </p>
                        <Badge
                          variant={target.enabled ? "default" : "secondary"}
                          className="text-[10px] px-1.5 py-0 cursor-pointer"
                          onClick={() =>
                            handleToggleEnabled(target.id, target.enabled)
                          }
                        >
                          {target.enabled ? "启用" : "禁用"}
                        </Badge>
                      </div>
                      <p className="text-xs font-[var(--font-code)] text-[hsl(var(--muted-foreground))] truncate">
                        {target.path}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          handleStartEdit(target.id, target.name, target.path)
                        }
                        aria-label={`编辑 ${target.name}`}
                      >
                        <Edit2 size={13} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-[hsl(var(--destructive))]"
                        onClick={() => setDeleteTarget(target.id)}
                        aria-label={`删除 ${target.name}`}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* 删除确认对话框 */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除同步目标</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除同步目标「
              {targets.find((t) => t.id === deleteTarget)?.name}
              」吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive)/0.9)]"
            >
              {deleting ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
