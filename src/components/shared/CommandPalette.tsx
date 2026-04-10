// ============================================================
// components/shared/CommandPalette.tsx — ⌘K 全局搜索 Command Palette
// ============================================================

import { Command } from "cmdk";
import {
  BookOpen,
  Download,
  FileText,
  GitBranch,
  RefreshCw,
  Search,
  Settings,
} from "lucide-react";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSkillStore } from "../../stores/skill-store";
import { useUIStore } from "../../stores/ui-store";

/** 页面跳转项 */
const PAGE_ITEMS = [
  { path: "/", label: "Skill 库", icon: BookOpen },
  { path: "/workflow", label: "工作流", icon: GitBranch },
  { path: "/sync", label: "同步", icon: RefreshCw },
  { path: "/import", label: "导入", icon: Download },
  { path: "/settings", label: "设置", icon: Settings },
];

/**
 * Command Palette — ⌘K 全局搜索
 * 支持 Skill 搜索、页面跳转、快速操作
 */
export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const { skills, selectSkill } = useSkillStore();
  const navigate = useNavigate();

  // ⌘K 快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === "Escape" && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const handleSelectSkill = useCallback(
    (skillId: string) => {
      selectSkill(skillId);
      setCommandPaletteOpen(false);
      navigate("/");
    },
    [selectSkill, setCommandPaletteOpen, navigate],
  );

  const handleSelectPage = useCallback(
    (path: string) => {
      navigate(path);
      setCommandPaletteOpen(false);
    },
    [navigate, setCommandPaletteOpen],
  );

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Command 面板 */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg">
        <Command
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl overflow-hidden"
          label="Command Palette"
        >
          {/* 搜索输入 */}
          <div className="flex items-center gap-2 px-3 border-b border-[hsl(var(--border))]">
            <Search size={16} className="text-[hsl(var(--muted-foreground))]" />
            <Command.Input
              placeholder="搜索 Skill、页面..."
              className="flex-1 py-3 bg-transparent text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none"
            />
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--surface-elevated))] text-[hsl(var(--muted-foreground))] font-[var(--font-code)]">
              ESC
            </kbd>
          </div>

          {/* 搜索结果 */}
          <Command.List className="max-h-[300px] overflow-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
              未找到匹配结果
            </Command.Empty>

            {/* Skill 搜索结果 */}
            <Command.Group
              heading="Skills"
              className="text-xs text-[hsl(var(--muted-foreground))] px-2 py-1"
            >
              {skills.map((skill) => (
                <Command.Item
                  key={skill.id}
                  value={`${skill.name} ${skill.description} ${skill.tags.join(" ")}`}
                  onSelect={() => handleSelectSkill(skill.id)}
                  className="flex items-center gap-2 px-2 py-2 rounded text-sm cursor-pointer data-[selected=true]:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"
                >
                  {skill.type === "workflow" ? (
                    <GitBranch
                      size={14}
                      className="shrink-0 text-[hsl(var(--info))]"
                    />
                  ) : (
                    <FileText
                      size={14}
                      className="shrink-0 text-[hsl(var(--primary))]"
                    />
                  )}
                  <span className="flex-1 truncate">{skill.name}</span>
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    {skill.category}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* 页面跳转 */}
            <Command.Group
              heading="页面"
              className="text-xs text-[hsl(var(--muted-foreground))] px-2 py-1"
            >
              {PAGE_ITEMS.map(({ path, label, icon: Icon }) => (
                <Command.Item
                  key={path}
                  value={label}
                  onSelect={() => handleSelectPage(path)}
                  className="flex items-center gap-2 px-2 py-2 rounded text-sm cursor-pointer data-[selected=true]:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"
                >
                  <Icon
                    size={14}
                    className="shrink-0 text-[hsl(var(--muted-foreground))]"
                  />
                  <span>{label}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
