// ============================================================
// components/skills/SkillListView.tsx — Skill 列表视图（含筛选逻辑）
// ============================================================

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { SkillMeta } from "../../../shared/types";
import { useKeyboardNav } from "../../hooks/useKeyboardNav";
import { useSkillActions } from "../../hooks/useSkillActions";
import { useSkillFiltering } from "../../hooks/useSkillFiltering";
import { useSkillStore } from "../../stores/skill-store";
import { useUIStore } from "../../stores/ui-store";
import ConfirmDialog from "../shared/ConfirmDialog";
import EmptyState from "./EmptyState";
import SkillList from "./SkillList";

/**
 * Skill 列表视图 — 根据分类筛选和搜索条件展示 Skill 列表
 * 支持 J/K 键盘导航、Space 预览、Delete 删除
 */
export default function SkillListView() {
  const {
    skills,
    categories,
    selectedCategory,
    selectedSource,
    searchQuery,
    selectSkill,
  } = useSkillStore();
  const { setPreviewOpen } = useUIStore();
  const { t } = useTranslation();

  // 组合式 Hooks
  const { filteredSkills, isCategoryEmpty } = useSkillFiltering({
    skills,
    categories,
    selectedCategory,
    selectedSource,
    searchQuery,
  });

  const {
    confirmState: deleteState,
    requestDelete,
    handleConfirmDelete,
    handleCancelDelete,
  } = useSkillActions();

  // 判断搜索框是否聚焦
  const isSearchFocused = useCallback(() => {
    const active = document.activeElement;
    return (
      active?.tagName === "INPUT" &&
      (active as HTMLInputElement).dataset.testid === "search-input"
    );
  }, []);

  const { getWrappedItemProps } = useKeyboardNav({
    skills: filteredSkills,
    isActive: filteredSkills.length > 0 && !isSearchFocused(),
    onSelect: selectSkill,
    onPreview: (id) => {
      selectSkill(id);
      setPreviewOpen(true);
    },
    onDeleteRequest: requestDelete,
  });

  if (filteredSkills.length === 0) {
    return (
      <EmptyState
        hasSkills={skills.length > 0}
        isCategoryEmpty={isCategoryEmpty}
      />
    );
  }

  return (
    <>
      <SkillList
        skills={filteredSkills}
        getItemProps={getWrappedItemProps}
        onDeleteSkill={(skill: SkillMeta) =>
          requestDelete({ id: skill.id, name: skill.name })
        }
      />

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={deleteState.open}
        onOpenChange={(open) => !open && handleCancelDelete()}
        variant="danger"
        title={t("metadata.deleteConfirmTitle")}
        description={t("metadata.deleteConfirmDesc")}
        confirmLabel={t("common.delete")}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
