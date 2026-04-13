// ============================================================
// components/skills/CategoryTree.tsx — 分类目录树组件
// ============================================================

import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronRight, Folder, FolderOpen } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSkillStore } from "../../stores/skill-store";
import { Badge } from "../ui/badge";

/**
 * 分类目录树 — 显示在侧边栏中，支持点击筛选、折叠/展开
 */
export default function CategoryTree() {
  const { categories, selectedCategory, setCategory, skills } = useSkillStore();
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
            分类
          </button>
        </Collapsible.Trigger>

        <Collapsible.Content>
          {/* "全部" 选项 */}
          <button
            data-testid="category-all"
            onClick={() => handleSelectCategory(null)}
            className={`flex items-center gap-2 w-full px-4 py-1.5 text-sm transition-colors duration-200 cursor-pointer ${
              selectedCategory === null
                ? "border-l-2 border-[hsl(var(--primary))] bg-[hsl(var(--accent))] text-[hsl(var(--primary))] font-medium pl-[14px]"
                : "border-l-2 border-transparent text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] pl-[14px]"
            }`}
          >
            <FolderOpen size={16} />
            <span className="flex-1 text-left">全部</span>
            <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
              {totalCount}
            </Badge>
          </button>

          {/* 分类列表 */}
          <div
            data-testid="category-tree"
            data-active={selectedCategory ?? undefined}
          >
            {categories.map((cat) => (
              <button
                key={cat.name}
                data-testid={`category-${cat.name}`}
                onClick={() => handleSelectCategory(cat.name)}
                className={`flex items-center gap-2 w-full px-4 py-1.5 text-sm transition-colors duration-200 cursor-pointer ${
                  selectedCategory === cat.name
                    ? "border-l-2 border-[hsl(var(--primary))] bg-[hsl(var(--accent))] text-[hsl(var(--primary))] font-medium pl-[14px]"
                    : "border-l-2 border-transparent text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] pl-[14px]"
                }`}
              >
                <Folder size={16} />
                <span className="flex-1 text-left">{cat.displayName}</span>
                <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                  {cat.skillCount}
                </Badge>
              </button>
            ))}
          </div>

          {/* 无分类时的提示 */}
          {categories.length === 0 && (
            <div className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
              暂无分类，请先导入 Skill
            </div>
          )}
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  );
}
