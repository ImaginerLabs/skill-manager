import { useCallback, useEffect, useState } from "react";
import type { Category, PathPreset, ScanResult } from "../../../shared/types";
import { toast } from "../../components/shared/toast-store";
import {
  ApiError,
  cleanupSourceFiles,
  fetchCategories,
  fetchPathPresets,
  importFiles,
  scanDirectory,
} from "../../lib/api";

/** 扫描状态 */
export type ScanState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: ScanResult }
  | { status: "error"; message: string };

/** 清理确认弹窗状态 */
export interface CleanupDialogState {
  open: boolean;
  paths: string[];
  scanRoot?: string;
}

export function useImport() {
  const [scanPath, setScanPath] = useState("~/.codebuddy/skills");
  const [scanState, setScanState] = useState<ScanState>({ status: "idle" });

  // 勾选状态：存储已选中的 absolutePath 集合
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());

  // 分类相关
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // 导入状态
  const [importing, setImporting] = useState(false);

  // 清理选项
  const [cleanupAfterImport, setCleanupAfterImport] = useState(false);

  // 清理确认弹窗
  const [cleanupDialog, setCleanupDialog] = useState<CleanupDialogState>({
    open: false,
    paths: [],
  });

  // 路径预设
  const [pathPresets, setPathPresets] = useState<PathPreset[]>([]);

  // 加载分类列表和路径预设
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error("[ImportPage] 加载分类失败:", err));
    fetchPathPresets()
      .then(setPathPresets)
      .catch(() => {});
  }, []);

  const handleScan = useCallback(async () => {
    setScanState({ status: "loading" });
    setSelectedPaths(new Set());
    try {
      const pathToScan =
        scanPath.trim() === "" || scanPath.trim() === "~/.codebuddy/skills"
          ? undefined
          : scanPath.trim();
      const result = await scanDirectory(pathToScan);
      setScanState({ status: "success", data: result });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "扫描失败";
      setScanState({ status: "error", message });
    }
  }, [scanPath]);

  // 勾选/取消勾选单个文件
  const toggleItem = useCallback((absolutePath: string) => {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(absolutePath)) {
        next.delete(absolutePath);
      } else {
        next.add(absolutePath);
      }
      return next;
    });
  }, []);

  // 全选/取消全选
  const toggleAll = useCallback((items: ScanResult["items"]) => {
    const allPaths = items.map((i) => i.absolutePath);
    setSelectedPaths((prev) => {
      if (prev.size === allPaths.length) {
        return new Set();
      }
      return new Set(allPaths);
    });
  }, []);

  // 执行清理源文件
  const handleCleanup = useCallback(
    async (paths: string[], cleanupScanRoot?: string) => {
      try {
        const cleanResult = await cleanupSourceFiles(paths, cleanupScanRoot);
        if (cleanResult.failed === 0) {
          toast.success(`已清理 ${cleanResult.success} 个源文件`);
        } else {
          toast.error(
            `清理完成：${cleanResult.success} 成功，${cleanResult.failed} 失败`,
          );
        }
      } catch {
        toast.error("清理源文件失败");
      }
    },
    [],
  );

  // 执行导入
  const handleImport = useCallback(async () => {
    if (
      scanState.status !== "success" ||
      selectedPaths.size === 0 ||
      !selectedCategory
    )
      return;
    setImporting(true);
    try {
      const selectedItems = scanState.data.items
        .filter((i) => selectedPaths.has(i.absolutePath))
        .map((i) => ({ absolutePath: i.absolutePath, name: i.name }));
      // P1-fix: 传递当前扫描路径作为 scanRoot，确保后端路径安全校验正确
      const scanRootPath =
        scanPath.trim() === "" || scanPath.trim() === "~/.codebuddy/skills"
          ? undefined
          : scanPath.trim();
      const result = await importFiles(
        selectedItems,
        selectedCategory,
        scanRootPath,
      );
      if (result.failed === 0) {
        toast.success(`成功导入 ${result.success} 个文件`);
      } else {
        toast.error(`导入完成：${result.success} 成功，${result.failed} 失败`, {
          details: result.details
            .filter((d) => d.status === "failed")
            .map((d) => `${d.name}: ${d.error}`)
            .join("\n"),
        });
      }
      // 导入成功后清理源文件
      if (cleanupAfterImport && result.success > 0) {
        const successPaths = selectedItems
          .filter((_, i) => result.details[i]?.status === "success")
          .map((i) => i.absolutePath);
        if (successPaths.length > 0) {
          setCleanupDialog({
            open: true,
            paths: successPaths,
            scanRoot: scanRootPath,
          });
        }
      }
      // 导入成功后清空选择
      setSelectedPaths(new Set());
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "导入失败";
      toast.error(message);
    } finally {
      setImporting(false);
    }
  }, [
    scanState,
    selectedPaths,
    selectedCategory,
    cleanupAfterImport,
    scanPath,
  ]);

  const closeCleanupDialog = useCallback(() => {
    setCleanupDialog({ open: false, paths: [] });
  }, []);

  return {
    // 状态
    scanPath,
    setScanPath,
    scanState,
    selectedPaths,
    categories,
    selectedCategory,
    setSelectedCategory,
    importing,
    cleanupAfterImport,
    setCleanupAfterImport,
    cleanupDialog,
    pathPresets,
    // 操作
    handleScan,
    toggleItem,
    toggleAll,
    handleCleanup,
    handleImport,
    closeCleanupDialog,
  };
}
