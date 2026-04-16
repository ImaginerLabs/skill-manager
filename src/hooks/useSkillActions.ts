// ============================================================
// hooks/useSkillActions.ts — 组合式 Hook：删除确认 + 列表操作
// ============================================================

import { useTranslation } from "react-i18next";
import { toast } from "../components/shared/toast-store";
import { deleteSkill } from "../lib/api";
import { useSkillStore } from "../stores/skill-store";
import { useConfirmDialog } from "./useConfirmDialog";

export interface DeleteTarget {
  id: string;
  name: string;
}

export interface UseSkillActionsReturn {
  confirmState: { open: boolean; target: DeleteTarget | null };
  requestDelete: (target: DeleteTarget) => void;
  handleConfirmDelete: () => void;
  handleCancelDelete: () => void;
}

/**
 * useSkillActions — 基于 useConfirmDialog 封装删除确认逻辑
 *
 * 内部处理 deleteSkill API 调用、toast 通知、fetchSkills 刷新。
 */
export function useSkillActions(): UseSkillActionsReturn {
  const { fetchSkills } = useSkillStore();
  const { t } = useTranslation();

  const {
    confirmState,
    requestConfirm: requestDelete,
    handleConfirm,
    handleCancel,
  } = useConfirmDialog<DeleteTarget>(async (target) => {
    try {
      await deleteSkill(target.id);
      toast.success(t("toast.workflowDeleted", { name: target.name }));
      await fetchSkills();
    } catch {
      toast.error(t("metadata.deleteFailed"));
    }
  });

  return {
    confirmState,
    requestDelete,
    handleConfirmDelete: handleConfirm,
    handleCancelDelete: handleCancel,
  };
}
