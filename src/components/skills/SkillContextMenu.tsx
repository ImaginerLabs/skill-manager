// ============================================================
// components/skills/SkillContextMenu.tsx — Skill 右键上下文菜单
// ============================================================

import { Copy, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSyncStore } from "../../stores/sync-store";
import { toast } from "../shared/toast-store";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../ui/context-menu";

interface SkillContextMenuProps {
  skillId: string;
  skillName: string;
  skillPath: string;
  isReadonly: boolean;
  onEditMeta?: () => void;
  onDelete?: () => void;
  children: React.ReactNode;
}

/**
 * SkillContextMenu — Skill 卡片右键上下文菜单
 *
 * 菜单项：编辑元数据 / 同步到 IDE / 复制路径 / 删除
 * 只读 Skill 隐藏「编辑元数据」和「删除」
 */
export default function SkillContextMenu({
  skillId,
  skillName: _skillName,
  skillPath,
  isReadonly,
  onEditMeta,
  onDelete,
  children,
}: SkillContextMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toggleSkillSelection } = useSyncStore();

  const handleCopyPath = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(skillPath);
      toast.success(t("skill.pathCopied"));
    } catch {
      // 降级：clipboard API 不可用时静默失败
    }
  }, [skillPath, t]);

  const handleSyncToIDE = useCallback(() => {
    toggleSkillSelection(skillId);
    navigate("/sync");
  }, [skillId, toggleSkillSelection, navigate]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {/* 编辑元数据（只读 Skill 隐藏） */}
        {!isReadonly && onEditMeta && (
          <ContextMenuItem
            onClick={onEditMeta}
            className="gap-2 cursor-pointer"
          >
            <Pencil size={14} />
            {t("skill.editMeta")}
          </ContextMenuItem>
        )}

        {/* 同步到 IDE */}
        <ContextMenuItem
          onClick={handleSyncToIDE}
          className="gap-2 cursor-pointer"
        >
          <RefreshCw size={14} />
          {t("skill.syncToIDE")}
        </ContextMenuItem>

        {/* 复制路径 */}
        <ContextMenuItem
          onClick={handleCopyPath}
          className="gap-2 cursor-pointer"
        >
          <Copy size={14} />
          {t("skill.copyPath")}
        </ContextMenuItem>

        {/* 删除（只读 Skill 隐藏） */}
        {!isReadonly && onDelete && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={onDelete}
              className="gap-2 cursor-pointer text-[hsl(var(--destructive))] focus:text-[hsl(var(--destructive))]"
            >
              <Trash2 size={14} />
              {t("common.delete")}
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
