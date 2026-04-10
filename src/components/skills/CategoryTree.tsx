// ============================================================
// components/skills/CategoryTree.tsx — 分类目录树组件
// ============================================================

import { Folder, FolderOpen } from "lucide-react";
import { useSkillStore } from "../../stores/skill-store";

/**
 * 分类目录树 — 显示在侧边栏中，支持点击筛选
 */
export default function CategoryTree() {
  const { categories, selectedCategory, setCategory, skills } = useSkillStore();

  const totalCount = skills.length;

  return (
    <div className="py-2">
      <div className="px-4 py-1 text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
        分类
      </div>

      {/* "全部" 选项 */}
      <button
        onClick={() => setCategory(null)}
        className={`flex items-center gap-2 w-full px-4 py-1.5 text-sm transition-colors ${
          selectedCategory === null
            ? "bg-[hsl(var(--accent))] text-[hsl(var(--primary))] font-medium"
            : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
        }`}
      >
        <FolderOpen size={16} />
        <span className="flex-1 text-left">全部</span>
        <span className="text-xs opacity-60">{totalCount}</span>
      </button>

      {/* 分类列表 */}
      {categories.map((cat) => (
        <button
          key={cat.name}
          onClick={() => setCategory(cat.name)}
          className={`flex items-center gap-2 w-full px-4 py-1.5 text-sm transition-colors ${
            selectedCategory === cat.name
              ? "bg-[hsl(var(--accent))] text-[hsl(var(--primary))] font-medium"
              : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
          }`}
        >
          <Folder size={16} />
          <span className="flex-1 text-left">{cat.displayName}</span>
          <span className="text-xs opacity-60">{cat.skillCount}</span>
        </button>
      ))}

      {/* 无分类时的提示 */}
      {categories.length === 0 && (
        <div className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
          暂无分类，请先导入 Skill
        </div>
      )}
    </div>
  );
}
