// ============================================================
// components/skills/SkillPreview.tsx — Skill Markdown 预览内容
// ============================================================

import { Clock, FileText, GitBranch, Pencil, Tag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import type { SkillFull } from "../../../shared/types";
import { fetchSkillById } from "../../lib/api";
import { useSkillStore } from "../../stores/skill-store";
import { useUIStore } from "../../stores/ui-store";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import MetadataEditor from "./MetadataEditor";

/**
 * Skill 预览面板内容 — 展示 Frontmatter 元数据 + Markdown 渲染
 */
export default function SkillPreview() {
  const { selectedSkillId, fetchSkills, selectSkill } = useSkillStore();
  const { setPreviewOpen } = useUIStore();
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
    <ScrollArea className="h-full">
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowEditor(!showEditor)}
            className="h-8 w-8"
            title="编辑元数据"
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              selectSkill(null);
              setPreviewOpen(false);
            }}
            title="关闭预览"
          >
            <X size={14} />
          </Button>
        </div>

        {/* 描述 */}
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">
          {skill.description}
        </p>

        {/* 元数据标签 */}
        <div className="flex flex-wrap gap-1.5">
          {/* 分类 */}
          <Badge variant="default" className="gap-1">
            <Tag size={12} />
            {skill.category}
          </Badge>

          {/* 类型 */}
          {skill.type === "workflow" && (
            <Badge variant="secondary" className="gap-1">
              <GitBranch size={12} />
              工作流
            </Badge>
          )}

          {/* 作者 */}
          {skill.author && (
            <Badge variant="outline" className="gap-1">
              <User size={12} />
              {skill.author}
            </Badge>
          )}

          {/* 版本 */}
          {skill.version && <Badge variant="outline">v{skill.version}</Badge>}

          {/* 修改时间 */}
          <Badge variant="outline" className="gap-1">
            <Clock size={12} />
            {new Date(skill.lastModified).toLocaleDateString("zh-CN")}
          </Badge>

          {/* 标签 */}
          {skill.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              #{tag}
            </Badge>
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
    </ScrollArea>
  );
}
