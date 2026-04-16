// ============================================================
// components/skills/CategoryTree.tsx — 分类目录树组件
// ============================================================

import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronRight, Folder, FolderOpen } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useSkillStore } from "../../stores/skill-store";
import SidebarItem from "../shared/SidebarItem";
import { Badge } from "../ui/badge";

/**
 * 分类目录树 — 显示在侧边栏中，支持点击筛选、折叠/展开
 */
export default function CategoryTree() {
  const { categories, selectedCategory, setCategory, skills } = useSkillStore();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const totalCount = skills.length;

  // 点击分类时：更新筛选状态，若不在 Skill 库页面则自动导航过去
  const handleSelectCategory = (category: string | null) => {
    setCategory(category);
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  return (
    <div className="py-2">
      <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
        <Collapsible.Trigger asChild>
          <button className="flex items-center gap-1 w-full px-4 py-1 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider hover:text-[hsl(var(--foreground))] transition-colors duration-200 cursor-pointer">
            <ChevronRight
              size={12}
              className={`transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
            />
            {t("nav.categories")}
          </button>
        </Collapsible.Trigger>

        <Collapsible.Content>
          {/* "全部" 选项 */}
          <SidebarItem
            data-testid="category-all"
            active={selectedCategory === null}
            icon={<FolderOpen size={16} />}
            label={t("nav.byCategory")}
            badge={
              <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                {totalCount}
              </Badge>
            }
            onClick={() => handleSelectCategory(null)}
          />

          {/* 分类列表 */}
          <div
            data-testid="category-tree"
            data-active={selectedCategory ?? undefined}
          >
            {categories.map((cat) => (
              <SidebarItem
                key={cat.name}
                data-testid={`category-${cat.name}`}
                active={selectedCategory === cat.name}
                icon={<Folder size={16} />}
                label={cat.displayName}
                badge={
                  <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                    {cat.skillCount}
                  </Badge>
                }
                onClick={() => handleSelectCategory(cat.name)}
              />
            ))}
          </div>

          {/* 无分类时的提示 */}
          {categories.length === 0 && (
            <div className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
              {t("category.empty")}
            </div>
          )}
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  );
}
