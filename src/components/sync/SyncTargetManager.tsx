// ============================================================
// components/sync/SyncTargetManager.tsx — 同步目标管理组件
// ============================================================

import {
  Check,
  Edit2,
  Eraser,
  FolderOpen,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import type { PathPreset } from "../../../shared/types";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import {
  deleteSkillsByPath,
  fetchPathPresets,
  validateSyncPath,
} from "../../lib/api";
import { useSyncStore } from "../../stores/sync-store";
import ConfirmDialog from "../shared/ConfirmDialog";
import { PathPresetSelect } from "../shared/PathPresetSelect";
import { toast } from "../shared/toast-store";
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
  const { t } = useTranslation();

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
  const [deleting, setDeleting] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [validating, setValidating] = useState(false);
  const [pathStatus, setPathStatus] = useState<{
    exists: boolean;
    writable: boolean;
  } | null>(null);

  // 删除确认对话框状态
  const {
    confirmState: deleteState,
    requestConfirm: requestDelete,
    handleConfirm: handleConfirmDelete,
    handleCancel: handleCancelDelete,
  } = useConfirmDialog<string>(async (targetId) => {
    setDeleting(true);
    try {
      const target = targets.find((t) => t.id === targetId);
      await removeTarget(targetId);
      toast.success(
        t("syncTarget.deleteSuccess", { name: target?.name ?? "" }),
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("syncTarget.deleteFailed"),
      );
    } finally {
      setDeleting(false);
    }
  });

  // 删除目录下所有 Skills 确认对话框状态
  const {
    confirmState: deleteAllState,
    requestConfirm: requestDeleteAll,
    handleConfirm: handleConfirmDeleteAll,
    handleCancel: handleCancelDeleteAll,
  } = useConfirmDialog<string>(async (targetId) => {
    setDeletingAll(true);
    try {
      const target = targets.find((t) => t.id === targetId);
      const result = await deleteSkillsByPath(target?.path ?? "");
      toast.success(
        t("syncTarget.deleteAllSkillsSuccess", {
          count: result.deleted.length,
        }),
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : t("syncTarget.deleteAllSkillsFailed"),
      );
    } finally {
      setDeletingAll(false);
    }
  });

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
      toast.success(t("syncTarget.createSuccess", { name: newName.trim() }));
      setNewName("");
      setNewPath("");
      setShowAddForm(false);
      setPathStatus(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("syncTarget.createFailed"),
      );
    } finally {
      setAdding(false);
    }
  }, [newName, newPath, addTarget, t]);

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
      toast.success(t("syncTarget.updateSuccess"));
      setEditing({ id: null, name: "", path: "" });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("syncTarget.updateFailed"),
      );
    }
  }, [editing, updateTarget, t]);

  const handleCancelEdit = useCallback(() => {
    setEditing({ id: null, name: "", path: "" });
  }, []);

  const handleToggleEnabled = useCallback(
    async (id: string, enabled: boolean) => {
      try {
        await updateTarget(id, { enabled: !enabled });
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : t("syncTarget.updateFailed"),
        );
      }
    },
    [updateTarget, t],
  );

  // 全部启用 / 全部禁用
  const allEnabled = targets.length > 0 && targets.every((t) => t.enabled);
  const handleToggleAll = useCallback(async () => {
    const newEnabled = !allEnabled;
    try {
      await Promise.all(
        targets.map((tgt) => updateTarget(tgt.id, { enabled: newEnabled })),
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("syncTarget.updateFailed"),
      );
    }
  }, [allEnabled, targets, updateTarget, t]);

  if (targetsLoading && targets.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
        {t("common.loading")}
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
            {t("syncTarget.title")} ({targets.length})
          </h3>
          {targets.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleToggleAll}
            >
              {allEnabled
                ? t("syncTarget.disableAll")
                : t("syncTarget.enableAll")}
            </Button>
          )}
        </div>
        {!showAddForm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="gap-1.5"
          >
            <Plus size={14} />
            {t("syncTarget.addTarget")}
          </Button>
        )}
      </div>

      {/* 添加表单 */}
      {showAddForm && (
        <div className="rounded-md border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--card))] p-4 space-y-3">
          <Input
            placeholder={t("syncTarget.namePlaceholder")}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-9 text-sm"
            aria-label={t("syncTarget.nameLabel")}
          />
          <div className="space-y-1">
            <div className="flex gap-2">
              <Input
                placeholder={t("syncTarget.pathPlaceholder")}
                value={newPath}
                onChange={(e) => {
                  setNewPath(e.target.value);
                  setPathStatus(null);
                }}
                onBlur={() => handleValidatePath(newPath)}
                className="h-9 text-sm font-[var(--font-code)]"
                aria-label={t("syncTarget.pathLabel")}
              />
              <PathPresetSelect
                presets={pathPresets}
                onSelect={(preset) => {
                  setNewPath(preset.path);
                  setNewName(preset.label ?? "");
                  setPathStatus(null);
                }}
              />
            </div>
            {validating && (
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {t("syncTarget.validating")}
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
                  ? t("syncTarget.pathValid")
                  : pathStatus.exists
                    ? "⚠ " + t("syncTarget.pathInvalid")
                    : t("syncTarget.pathInvalid")}
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
              {adding ? t("common.processing") : t("common.confirm")}
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
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      )}

      {/* 目标列表 */}
      {targets.length === 0 && !showAddForm ? (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
          {/* 引导标题 */}
          <p className="text-sm font-medium text-[hsl(var(--foreground))]">
            {t("syncTarget.noTargets")}
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
                  {t("syncTarget.addTarget")}
                </p>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">
                  {t("syncTarget.noTargetsHint")}
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
                  {t("sync.selectSkills")}
                </p>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">
                  {t("sync.subtitle")}
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
                  {t("sync.startSync")}
                </p>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">
                  {t("sync.subtitle")}
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
            {t("syncTarget.addTarget")}
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
                      aria-label={t("syncTarget.nameLabel")}
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
                      aria-label={t("syncTarget.pathLabel")}
                    />
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleSaveEdit}
                        aria-label={t("common.save")}
                      >
                        <Check size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleCancelEdit}
                        aria-label={t("common.cancel")}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* 显示模式 - 点击整行切换启用/关闭 */
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() =>
                        handleToggleEnabled(target.id, target.enabled)
                      }
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                          {target.name}
                        </p>
                        <Badge
                          variant={target.enabled ? "default" : "secondary"}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {target.enabled
                            ? t("syncTarget.enabledLabel")
                            : t("common.close")}
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
                        aria-label={`${t("common.edit")} ${target.name}`}
                      >
                        <Edit2 size={13} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => requestDeleteAll(target.id)}
                        aria-label={`${t("syncTarget.deleteAllSkillsTitle")} ${target.name}`}
                      >
                        <Eraser size={13} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-[hsl(var(--destructive))]"
                        onClick={() => requestDelete(target.id)}
                        aria-label={`${t("common.delete")} ${target.name}`}
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
      <ConfirmDialog
        open={deleteState.open}
        onOpenChange={(open) => !open && handleCancelDelete()}
        variant="danger"
        title={t("syncTarget.deleteConfirmTitle")}
        description={t("syncTarget.deleteConfirmDesc", {
          name:
            targets.find((tgt) => tgt.id === deleteState.target)?.name ?? "",
        })}
        confirmLabel={deleting ? t("common.processing") : t("common.delete")}
        onConfirm={handleConfirmDelete}
        confirmDisabled={deleting}
      />

      {/* 删除目录下所有 Skills 确认对话框 */}
      <ConfirmDialog
        open={deleteAllState.open}
        onOpenChange={(open) => !open && handleCancelDeleteAll()}
        variant="danger"
        title={t("syncTarget.deleteAllSkillsTitle")}
        description={t("syncTarget.deleteAllSkillsDesc", {
          name:
            targets.find((tgt) => tgt.id === deleteAllState.target)?.name ?? "",
        })}
        confirmLabel={deletingAll ? t("common.processing") : t("common.delete")}
        onConfirm={handleConfirmDeleteAll}
        confirmDisabled={deletingAll}
      />
    </div>
  );
}
