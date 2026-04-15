// ============================================================
// components/skills/SkillPreview.tsx — Skill Markdown 预览内容
// ============================================================

import {
  Clock,
  Copy,
  ExternalLink,
  FileText,
  GitBranch,
  Lock,
  Package,
  Pencil,
  Tag,
  User,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import type { SkillFull } from "../../../shared/types";
import { fetchSkillById } from "../../lib/api";
import { useSkillStore } from "../../stores/skill-store";
import { toast } from "../shared/toast-store";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import MetadataEditor from "./MetadataEditor";

/**
 * Skill 预览面板内容 — 展示 Frontmatter 元数据 + Markdown 渲染
 * 外部 Skill（readonly: true）显示来源信息区域，元数据编辑和删除按钮禁用
 */
export default function SkillPreview() {
  const { selectedSkillId, fetchSkills } = useSkillStore();
  const { t } = useTranslation();
  const [skill, setSkill] = useState<SkillFull | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyPath = useCallback(async () => {
    if (!skill?.filePath) return;
    try {
      await navigator.clipboard.writeText(skill.filePath);
      setCopied(true);
      toast.success("路径已复制到剪贴板");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("复制失败，请手动复制");
    }
  }, [skill?.filePath]);

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
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Package
          size={48}
          className="text-[hsl(var(--muted-foreground))] mb-3 opacity-30"
        />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {t("skillBrowse.previewEmpty")}
        </p>
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

  const isReadonly = skill.readonly === true;

  return (
    <ScrollArea
      data-testid="preview-panel"
      className="h-full [&_[data-radix-scroll-area-viewport]>div]:!block"
    >
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
          {/* 只读锁图标 */}
          {isReadonly && (
            <span
              data-testid="preview-readonly-lock"
              className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]"
              title={t("skill.readonlyTooltip")}
            >
              <Lock size={14} />
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyPath}
            className="h-8 w-8"
            title={copied ? "已复制" : "复制文件路径"}
            aria-label="复制文件路径"
          >
            <Copy
              size={14}
              className={copied ? "text-[hsl(var(--primary))]" : ""}
            />
          </Button>
          {/* 编辑按钮：只读时禁用 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => !isReadonly && setShowEditor(!showEditor)}
            className="h-8 w-8"
            title={isReadonly ? t("skill.readonlyEditTooltip") : "编辑元数据"}
            aria-label="编辑元数据"
            disabled={isReadonly}
          >
            <Pencil size={14} />
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

        {/* 来源信息区域（仅外部 Skill 显示） */}
        {skill.source && (
          <div
            data-testid="preview-source-info"
            className="mt-3 pt-3 border-t border-[hsl(var(--border))] flex items-center gap-2 flex-wrap"
          >
            <ExternalLink
              size={14}
              className="text-[hsl(var(--muted-foreground))] shrink-0"
            />
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              {t("skill.sourceRepo")}:
            </span>
            {skill.sourceRepo && (
              <a
                href={skill.sourceRepo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[hsl(var(--primary))] hover:underline truncate max-w-[180px]"
              >
                {skill.source}
              </a>
            )}
            {(skill.sourceUrl || skill.sourceRepo) && (
              <a
                href={skill.sourceUrl ?? skill.sourceRepo}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                <ExternalLink size={12} />
                {t("skill.viewOnGithub")}
              </a>
            )}
          </div>
        )}
      </div>

      {/* 元数据编辑器（只读时不渲染） */}
      {showEditor && !isReadonly && (
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
      <div
        data-testid="skill-content"
        className="p-4 w-full min-w-0 prose prose-invert prose-sm max-w-none break-words prose-headings:font-[var(--font-code)] prose-headings:break-words prose-code:font-[var(--font-code)] prose-code:break-all prose-pre:bg-[hsl(var(--background))] prose-pre:border prose-pre:border-[hsl(var(--border))] prose-pre:overflow-x-auto prose-pre:max-w-full prose-table:block prose-table:overflow-x-auto prose-table:max-w-full prose-img:max-w-full"
      >
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
