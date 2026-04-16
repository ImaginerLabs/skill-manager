// ============================================================
// components/skills/EmptyState.tsx — 增强版空状态组件
// ============================================================

import { Download, FolderOpen, Package, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export type EmptyStateVariant =
  | "noSkill"
  | "noResult"
  | "emptyCategory"
  | "custom";

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateBaseProps {
  /** 变体类型 */
  variant?: EmptyStateVariant;
  /** 自定义图标（variant="custom" 时使用） */
  icon?: React.ReactNode;
  /** 自定义标题（variant="custom" 时使用） */
  title?: string;
  /** 自定义描述（variant="custom" 时使用） */
  description?: string;
  /** 操作按钮（variant="custom" 或 "noSkill" 时使用） */
  action?: EmptyStateAction;
  /** data-testid */
  "data-testid"?: string;
}

/** 向后兼容的旧接口 */
interface EmptyStateLegacyProps {
  variant?: never;
  hasSkills: boolean;
  isCategoryEmpty?: boolean;
}

type EmptyStateProps = EmptyStateBaseProps | EmptyStateLegacyProps;

/**
 * EmptyState — 增强版空状态引导组件
 *
 * - `variant="noSkill"`：无 Skill 时显示引导性空状态
 * - `variant="noResult"`：搜索无结果时显示提示
 * - `variant="emptyCategory"`：分类为空时显示提示
 * - `variant="custom"`：自定义图标/标题/描述/操作
 *
 * 旧接口 `hasSkills + isCategoryEmpty` 保持向后兼容。
 */
export default function EmptyState(props: EmptyStateProps) {
  const { t } = useTranslation();

  // 向后兼容：旧接口自动映射到 variant
  let variant: EmptyStateVariant;
  let customIcon: React.ReactNode | undefined;
  let customTitle: string | undefined;
  let customDescription: string | undefined;
  let customAction: EmptyStateAction | undefined;
  let testId: string | undefined;

  if ("hasSkills" in props) {
    // 旧接口
    if (props.hasSkills && props.isCategoryEmpty) {
      variant = "emptyCategory";
    } else if (props.hasSkills) {
      variant = "noResult";
    } else {
      variant = "noSkill";
    }
  } else {
    variant = props.variant ?? "noSkill";
    customIcon = props.icon;
    customTitle = props.title;
    customDescription = props.description;
    customAction = props.action;
    testId = props["data-testid"];
  }

  // noSkill：完全无 Skill，显示引导
  if (variant === "noSkill") {
    return (
      <div
        data-testid={testId ?? "empty-state"}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <FolderOpen
          size={48}
          className="text-[hsl(var(--primary))] mb-4 opacity-60"
        />
        <h3 className="text-lg font-medium font-[var(--font-code)] text-[hsl(var(--foreground))] mb-2">
          {customTitle ?? t("skillBrowse.emptyTitle")}
        </h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-md mb-4">
          {customDescription ?? t("skillBrowse.emptyHint")}
        </p>
        {(customAction || !("hasSkills" in props)) && customAction ? (
          <Button onClick={customAction.onClick} className="gap-2">
            <Download size={16} />
            {customAction.label}
          </Button>
        ) : !("hasSkills" in props) ? null : (
          <Button asChild>
            <Link to="/import" className="gap-2">
              <Download size={16} />
              {t("skillBrowse.coldStartImport")}
            </Link>
          </Button>
        )}
      </div>
    );
  }

  // noResult：有 Skill 但搜索无结果
  if (variant === "noResult") {
    return (
      <div
        data-testid={testId ?? "empty-state"}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <Search
          size={48}
          className="text-[hsl(var(--muted-foreground))] mb-4 opacity-40"
        />
        <h3 className="text-lg font-medium font-[var(--font-code)] text-[hsl(var(--foreground))] mb-2">
          {customTitle ?? t("skillBrowse.emptyTitle")}
        </h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-md">
          {customDescription ?? t("skillBrowse.searchPlaceholder")}
        </p>
      </div>
    );
  }

  // emptyCategory：分类为空
  if (variant === "emptyCategory") {
    return (
      <div
        data-testid={testId ?? "empty-state-category"}
        className="flex flex-col items-center justify-center h-full min-h-[320px] text-center"
      >
        <Package
          size={48}
          className="text-[hsl(var(--muted-foreground))] mb-3 opacity-30"
        />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {customDescription ?? t("category.noSkills")}
        </p>
      </div>
    );
  }

  // custom：完全自定义
  return (
    <div
      data-testid={testId ?? "empty-state"}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      {customIcon && <div className="mb-4">{customIcon}</div>}
      {customTitle && (
        <h3 className="text-lg font-medium font-[var(--font-code)] text-[hsl(var(--foreground))] mb-2">
          {customTitle}
        </h3>
      )}
      {customDescription && (
        <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-md mb-4">
          {customDescription}
        </p>
      )}
      {customAction && (
        <Button onClick={customAction.onClick} className="gap-2">
          {customAction.label}
        </Button>
      )}
    </div>
  );
}
