// ============================================================
// components/skills/SkillPreview.tsx — Skill Markdown 预览内容
// ============================================================

import { Clock, FileText, GitBranch, Pencil, Tag, User } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import type { SkillFull } from "../../../shared/types";
import { fetchSkillById } from "../../lib/api";
import { useSkillStore } from "../../stores/skill-store";
import MetadataEditor from "./MetadataEditor";

/**
 * Skill 预览面板内容 — 展示 Frontmatter 元数据 + Markdown 渲染
 */
export default function SkillPreview() {
  const { selectedSkillId, fetchSkills } = useSkillStore();
  const [skill, setSkill] = useState<SkillFull | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if (!selectedSkillId) {
      setSkill(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchSkillById(selectedSkillId)
      .then((data) => {
        if (!cancelled) {
          setSkill(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "加载失败");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedSkillId]);

  // 未选中状态
  if (!selectedSkillId) {
    return (
      <div className="flex items-center justify-center h-full text-[hsl(var(--muted-foreground))]">
        <p className="text-sm">选择一个 Skill 查看预览</p>
      </div>
    );
  }

  // 加载中
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-[hsl(var(--muted-foreground))]">
          加载中...
        </div>
      </div>
    );
  }

  // 错误
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-[hsl(var(--destructive))]">{error}</div>
      </div>
    );
  }

  if (!skill) return null;

  return (
    <div className="h-full overflow-auto">
      {/* Frontmatter 元数据头部 */}
      <div className="p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        {/* 标题 */}
        <div className="flex items-center gap-2 mb-2">
          {skill.type === "workflow" ? (
            <GitBranch size={18} className="text-[hsl(var(--info))]" />
          ) : (
            <FileText size={18} className="text-[hsl(var(--primary))]" />
          )}
          <h2 className="text-lg font-bold font-[var(--font-code)] text-[hsl(var(--foreground))] flex-1">
            {skill.name}
          </h2>
          <button
            onClick={() => setShowEditor(!showEditor)}
            className="p-1.5 rounded text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]"
            title="编辑元数据"
          >
            <Pencil size={14} />
          </button>
        </div>

        {/* 描述 */}
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">
          {skill.description}
        </p>

        {/* 元数据标签 */}
        <div className="flex flex-wrap gap-2 text-xs">
          {/* 分类 */}
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[hsl(var(--primary))/0.12] text-[hsl(var(--primary))]">
            <Tag size={12} />
            {skill.category}
          </span>

          {/* 类型 */}
          {skill.type === "workflow" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[hsl(var(--info))/0.12] text-[hsl(var(--info))]">
              <GitBranch size={12} />
              工作流
            </span>
          )}

          {/* 作者 */}
          {skill.author && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[hsl(var(--surface-elevated))] text-[hsl(var(--muted-foreground))]">
              <User size={12} />
              {skill.author}
            </span>
          )}

          {/* 版本 */}
          {skill.version && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[hsl(var(--surface-elevated))] text-[hsl(var(--muted-foreground))]">
              v{skill.version}
            </span>
          )}

          {/* 修改时间 */}
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[hsl(var(--surface-elevated))] text-[hsl(var(--muted-foreground))]">
            <Clock size={12} />
            {new Date(skill.lastModified).toLocaleDateString("zh-CN")}
          </span>

          {/* 标签 */}
          {skill.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 rounded bg-[hsl(var(--surface-elevated))] text-[hsl(var(--muted-foreground))]"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* 元数据编辑器 */}
      {showEditor && (
        <MetadataEditor
          skill={skill}
          onClose={() => setShowEditor(false)}
          onUpdated={() => {
            fetchSkills();
            // 重新加载当前 Skill 详情
            if (selectedSkillId) {
              fetchSkillById(selectedSkillId)
                .then(setSkill)
                .catch(() => {});
            }
          }}
        />
      )}

      {/* Markdown 渲染内容 */}
      <div className="p-4 prose prose-invert prose-sm max-w-none prose-headings:font-[var(--font-code)] prose-code:font-[var(--font-code)] prose-pre:bg-[hsl(var(--background))] prose-pre:border prose-pre:border-[hsl(var(--border))]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {skill.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
