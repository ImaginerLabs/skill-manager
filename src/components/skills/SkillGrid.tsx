// ============================================================
// components/skills/SkillGrid.tsx — Skill 卡片网格视图
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFilteredSkills } from "../../hooks/useFilteredSkills";
import { useRovingFocus } from "../../hooks/useRovingFocus";
import { useSkillSearch } from "../../hooks/useSkillSearch";
import { deleteSkill } from "../../lib/api";
import { useSkillStore } from "../../stores/skill-store";
import { useUIStore } from "../../stores/ui-store";
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
    fetchSkills,
  } = useSkillStore();
  const { setPreviewOpen } = useUIStore();
  const { t } = useTranslation();

  // 删除确认对话框状态
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // 按分类或来源筛选（互斥，AD-41；支持"未分类"虚拟分类）
  const filtered = useFilteredSkills(
    skills,
    categories,
    selectedCategory,
    selectedSource,
  );

  // 再用 Fuse.js 模糊搜索
  const filteredSkills = useSkillSearch(filtered, searchQuery);

  // 判断搜索框是否聚焦
  const isSearchFocused = useCallback(() => {
    const active = document.activeElement;
    return (
      active?.tagName === "INPUT" &&
      (active as HTMLInputElement).dataset.testid === "search-input"
    );
  }, []);

  // 键盘焦点导航
  const { focusedIndex: _focusedIndex, getItemProps } = useRovingFocus({
    itemCount: filteredSkills.length,
    isActive: filteredSkills.length > 0 && !isSearchFocused(),
  });

  // 处理键盘事件（Space 预览、Enter 选中、Delete 删除）
  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      // 先让 roving focus 处理 J/K
      const skill = filteredSkills[index];
      if (!skill) return;

      if (e.key === " ") {
        e.preventDefault();
        selectSkill(skill.id);
        setPreviewOpen(true);
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        selectSkill(skill.id);
        return;
      }

      if ((e.key === "Delete" || e.key === "Backspace") && !skill.readonly) {
        e.preventDefault();
        setDeleteTarget({ id: skill.id, name: skill.name });
        return;
      }
    },
    [filteredSkills, selectSkill, setPreviewOpen],
  );

  // 执行删除
  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteSkill(deleteTarget.id);
      toast.success(t("toast.workflowDeleted", { name: deleteTarget.name }));
      await fetchSkills();
    } catch {
      toast.error(t("metadata.deleteFailed"));
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, fetchSkills, t]);

  // 判断是否为"分类本身为空"（非搜索导致的空结果）
  const isCategoryEmpty =
    (selectedCategory !== null || selectedSource !== null) &&
    !searchQuery &&
    filtered.length === 0;

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
                      handleCardKeyDown(e, index);
                    }
                  },
                }}
                onDelete={
                  skill.readonly
                    ? undefined
                    : () => setDeleteTarget({ id: skill.id, name: skill.name })
                }
              />
            </div>
          );
        })}
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("metadata.deleteConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("metadata.deleteConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
