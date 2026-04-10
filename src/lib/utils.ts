import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 Tailwind CSS 类名的工具函数
 * 结合 clsx 的条件类名和 tailwind-merge 的冲突解决
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
