// ============================================================
// hooks/usePreviewMode.ts — 响应式预览面板模式 Hook
// Story 9.1: 预览面板智能推拉式
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";

/** 预览面板显示模式 */
export type PreviewMode = "always" | "push" | "overlay";

/**
 * 根据容器宽度计算预览面板模式（纯函数，便于测试）
 * - ≥1440px → always（三栏常驻）
 * - 1024-1439px → push（推挤式）
 * - <1024px → overlay（覆盖式）
 */
export function getPreviewMode(width: number): PreviewMode {
  if (width >= 1440) return "always";
  if (width >= 1024) return "push";
  return "overlay";
}

interface UsePreviewModeReturn {
  /** 当前预览模式 */
  previewMode: PreviewMode;
  /** 绑定到需要监听宽度的容器元素 */
  containerRef: React.RefCallback<HTMLElement>;
}

/**
 * 响应式预览面板模式 Hook
 * 使用 ResizeObserver 监听容器宽度变化，自动计算预览模式
 */
export function usePreviewMode(): UsePreviewModeReturn {
  const [previewMode, setPreviewMode] = useState<PreviewMode>(() => {
    // 初始值基于 window 宽度（SSR 安全降级）
    if (typeof window !== "undefined") {
      return getPreviewMode(window.innerWidth);
    }
    return "always";
  });

  const observerRef = useRef<ResizeObserver | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  // 清理 observer
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  // ref callback：元素挂载/卸载时自动管理 observer
  const containerRef = useCallback((node: HTMLElement | null) => {
    // 清理旧 observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    elementRef.current = node;

    if (node) {
      observerRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const width = entry.contentRect.width;
          setPreviewMode(getPreviewMode(width));
        }
      });
      observerRef.current.observe(node);

      // 立即计算一次
      setPreviewMode(getPreviewMode(node.getBoundingClientRect().width));
    }
  }, []);

  return { previewMode, containerRef };
}
