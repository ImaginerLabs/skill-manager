// ============================================================
// components/workflow/SkillSelector.tsx — 左侧 Skill 选择列表
// ============================================================

import { Plus, Search, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import type { SkillMeta } from "../../../shared/types";
import { useSkillSearch } from "../../hooks/useSkillSearch";
import { useSkillStore } from "../../stores/skill-store";
import { useWorkflowStore } from "../../stores/workflow-store";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";

/**
 * SkillSelector — 工作流编排器左侧 Skill 选择列表
 * 支持搜索筛选，点击添加到工作流步骤
 */
export default function SkillSelector() {
  const { skills, loading, fetchSkills } = useSkillStore();
  const { steps, addStep } = useWorkflowStore();
  const [query, setQuery] = useState("");

  const filteredSkills = useSkillSearch(skills, query);

  // 已添加的 Skill ID 集合（用于视觉标记）
  const addedSkillIds = new Set(steps.map((s) => s.skillId));

  useEffect(() => {
    if (skills.length === 0 && !loading) {
      fetchSkills();
    }
  }, [skills.length, loading, fetchSkills]);

  const handleAddSkill = (skill: SkillMeta) => {
    addStep(skill.id, skill.name);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 搜索框 */}
      <div className="p-3 border-b border-[hsl(var(--border))]">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
          />
          <Input
            placeholder="搜索 Skill..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Skill 列表 */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                加载中...
              </p>
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Search
                size={32}
                className="text-[hsl(var(--muted-foreground))] mb-2 opacity-40"
              />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {query ? "未找到匹配的 Skill" : "暂无可用 Skill"}
              </p>
            </div>
          ) : (
            filteredSkills.map((skill) => {
              const isAdded = addedSkillIds.has(skill.id);
              return (
                <button
                  key={skill.id}
                  onClick={() => handleAddSkill(skill)}
                  className={`w-full text-left rounded-md px-3 py-2.5 transition-colors group
                    ${
                      isAdded
                        ? "bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.3)]"
                        : "hover:bg-[hsl(var(--accent))] border border-transparent"
                    }`}
                  aria-label={`添加 ${skill.name} 到工作流`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {skill.type === "workflow" && (
                        <Zap
                          size={14}
                          className="text-[hsl(var(--primary))] shrink-0"
                        />
                      )}
                      <span className="text-sm font-medium font-[var(--font-code)] text-[hsl(var(--foreground))] truncate">
                        {skill.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isAdded && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          已添加
                        </Badge>
                      )}
                      <Plus
                        size={16}
                        className="text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 line-clamp-2">
                    {skill.description || "无描述"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0"
                    >
                      {skill.category}
                    </Badge>
                    {skill.type === "workflow" && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0"
                      >
                        workflow
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
