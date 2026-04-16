// ============================================================
// components/skills/SkillGrid.tsx — Skill 卡片网格视图
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useKeyboardNav } from "../../hooks/useKeyboardNav";
import { useSkillActions } from "../../hooks/useSkillActions";
import { useSkillFiltering } from "../../hooks/useSkillFiltering";
import { useSkillStore } from "../../stores/skill-store";
import { useUIStore } from "../../stores/ui-store";
import ConfirmDialog from "../shared/ConfirmDialog";
import EmptyState from "./EmptyState";
import SkillCard from "./SkillCard";

/**
 * Skill 卡片网格 — 根据分类筛选和搜索条件展示 Skill 卡片
 * 支持 J/K 键盘导航、Space 预览、Delete 删除
 */
export default function SkillGrid() {
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

  const {
    focusedIndex: _focusedIndex,
    getItemProps,
    getKeyDownHandler,
  } = useKeyboardNav({
    skills: filteredSkills,
    isActive: filteredSkills.length > 0 && !isSearchFocused(),
    onSelect: selectSkill,
    onPreview: (id) => {
      selectSkill(id);
      setPreviewOpen(true);
    },
    onDeleteRequest: requestDelete,
  });

  // 过渡动效（Story 9.5, AD-47）：分类/来源/搜索变化时触发淡入
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    setEntering(true);
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setEntering(false);
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [selectedCategory, selectedSource, searchQuery]);

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
      <div
        data-testid="skill-grid"
        className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4"
        role="grid"
        aria-label={t("skillBrowse.title")}
      >
        {filteredSkills.map((skill, index) => {
          const itemProps = getItemProps(index);
          const keyDownHandler = getKeyDownHandler(index);
          return (
            <div
              key={skill.id}
              className="skill-grid-item"
              {...(entering ? { "data-entering": "" } : {})}
            >
              <SkillCard
                skill={skill}
                rovingProps={{
                  ...itemProps,
                  onKeyDown: (e: React.KeyboardEvent) => {
                    // 先让 roving focus 处理 J/K
                    itemProps.onKeyDown(e);
                    // 再处理 Space/Enter/Delete
                    if (!e.defaultPrevented) {
                      keyDownHandler(e);
                    }
                  },
                }}
                onDelete={
                  skill.readonly
                    ? undefined
                    : () => requestDelete({ id: skill.id, name: skill.name })
                }
              />
            </div>
          );
        })}
      </div>

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
