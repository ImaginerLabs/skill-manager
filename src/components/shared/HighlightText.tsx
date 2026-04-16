// ============================================================
// components/shared/HighlightText.tsx — 搜索关键词高亮组件
// Story 9.2: 搜索关键词高亮 + Command Palette 联动
// AD-42: 自行实现轻量级高亮组件，不引入第三方库
// ============================================================

import { useMemo } from "react";

interface HighlightTextProps {
  /** 原始文本 */
  text: string;
  /** 搜索关键词（空格分隔多关键词） */
  query: string;
  /** 容器样式 */
  className?: string;
}

/**
 * 搜索关键词高亮组件
 * - 不区分大小写
 * - 支持多关键词（空格分隔）
 * - 正则特殊字符安全转义
 * - 超长关键词（>50 字符）截断
 */
export default function HighlightText({
  text,
  query,
  className,
}: HighlightTextProps) {
  // 使用 useMemo 缓存正则和 split 结果，避免每次渲染重新创建
  const { parts, pattern } = useMemo(() => {
    if (!query.trim()) {
      return { parts: [text], pattern: "" };
    }
    // 按空格拆分关键词，转义特殊字符，截断超长关键词
    const keywords = query
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((kw) => (kw.length > 50 ? kw.slice(0, 50) : kw))
      .map((kw) => kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    if (keywords.length === 0) {
      return { parts: [text], pattern: "" };
    }

    const pat = keywords.join("|");
    const regex = new RegExp(`(${pat})`, "gi");
    const splitParts = text.split(regex);

    return { parts: splitParts, pattern: pat };
  }, [text, query]);

  if (!query.trim() || !pattern) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {parts.map((part, i) => {
        // 使用独立的正则测试避免 lastIndex 问题
        const isMatch = new RegExp(`^(${pattern})$`, "i").test(part);
        return isMatch ? (
          <mark
            key={i}
            className="bg-green-500/20 text-green-400 rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </span>
  );
}
