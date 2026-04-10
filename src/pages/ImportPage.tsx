import { useCallback, useEffect, useState } from "react";
import type { Category, ScanResult, ScanResultItem } from "../../shared/types";
import { toast } from "../components/shared/Toast";
import {
  ApiError,
  cleanupSourceFiles,
  fetchCategories,
  importFiles,
  scanDirectory,
} from "../lib/api";

/** 扫描状态 */
type ScanState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: ScanResult }
  | { status: "error"; message: string };

export default function ImportPage() {
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

  // 加载分类列表
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error("[ImportPage] 加载分类失败:", err));
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
  const toggleAll = useCallback(() => {
    if (scanState.status !== "success") return;
    const allPaths = scanState.data.items.map((i) => i.absolutePath);
    setSelectedPaths((prev) => {
      if (prev.size === allPaths.length) {
        return new Set();
      }
      return new Set(allPaths);
    });
  }, [scanState]);

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
      const result = await importFiles(selectedItems, selectedCategory);
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
        if (
          successPaths.length > 0 &&
          window.confirm(
            `确认删除 ${successPaths.length} 个已导入的源文件？\n\n此操作不可撤销，将永久删除原始文件。`,
          )
        ) {
          try {
            const cleanResult = await cleanupSourceFiles(successPaths);
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
  }, [scanState, selectedPaths, selectedCategory, cleanupAfterImport]);

  const items = scanState.status === "success" ? scanState.data.items : [];
  const allSelected = items.length > 0 && selectedPaths.size === items.length;
  const canImport = selectedPaths.size > 0 && selectedCategory !== "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">导入管理</h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          从 CodeBuddy IDE 目录扫描并导入 Skill 文件
        </p>
      </div>

      {/* 扫描路径输入 + 扫描按钮 */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label
            htmlFor="scan-path"
            className="block text-sm font-medium mb-1.5 text-[hsl(var(--foreground))]"
          >
            扫描路径
          </label>
          <input
            id="scan-path"
            type="text"
            value={scanPath}
            onChange={(e) => setScanPath(e.target.value)}
            placeholder="~/.codebuddy/skills"
            className="w-full px-3 py-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
        <button
          onClick={handleScan}
          disabled={scanState.status === "loading"}
          className="px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {scanState.status === "loading" ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              扫描中...
            </span>
          ) : (
            "扫描"
          )}
        </button>
      </div>

      {/* 错误状态 */}
      {scanState.status === "error" && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-red-400 font-medium">扫描失败</p>
          <p className="text-red-300 text-sm mt-1">{scanState.message}</p>
        </div>
      )}

      {/* 空目录提示 */}
      {scanState.status === "success" && items.length === 0 && (
        <div className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-8 text-center">
          <p className="text-[hsl(var(--muted-foreground))] text-lg">
            📂 目录为空
          </p>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mt-2">
            在 <code className="text-xs">{scanState.data.scanPath}</code>{" "}
            中未发现 .md 文件
          </p>
        </div>
      )}

      {/* 扫描结果 + 导入向导 */}
      {scanState.status === "success" && items.length > 0 && (
        <div className="space-y-4">
          {/* 工具栏：全选 + 已选统计 + 分类选择 + 导入按钮 */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              {/* 全选 checkbox */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-[hsl(var(--border))] accent-[hsl(var(--primary))]"
                />
                <span className="text-sm">全选</span>
              </label>
              {/* 已选统计 */}
              <span className="text-sm text-[hsl(var(--muted-foreground))]">
                已选 {selectedPaths.size} / {items.length} 个文件
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* 分类选择器 */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              >
                <option value="">选择分类...</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.displayName}
                  </option>
                ))}
              </select>

              {/* 导入按钮 */}
              <button
                onClick={handleImport}
                disabled={!canImport || importing}
                className="px-4 py-1.5 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {importing ? "导入中..." : `导入选中 (${selectedPaths.size})`}
              </button>
            </div>
          </div>

          {/* 清理选项 */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-[hsl(var(--muted-foreground))]">
            <input
              type="checkbox"
              checked={cleanupAfterImport}
              onChange={(e) => setCleanupAfterImport(e.target.checked)}
              className="w-4 h-4 rounded border-[hsl(var(--border))] accent-[hsl(var(--primary))]"
            />
            导入后删除源文件（不可撤销）
          </label>
          <div className="rounded-md border border-[hsl(var(--border))] divide-y divide-[hsl(var(--border))]">
            {items.map((item: ScanResultItem) => (
              <label
                key={item.absolutePath}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--accent))] transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedPaths.has(item.absolutePath)}
                  onChange={() => toggleItem(item.absolutePath)}
                  className="w-4 h-4 shrink-0 rounded border-[hsl(var(--border))] accent-[hsl(var(--primary))]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{item.name}</span>
                    {item.parseStatus === "failed" && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                        解析失败
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-[hsl(var(--muted-foreground))] truncate mt-0.5">
                      {item.description}
                    </p>
                  )}
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                    {item.filePath}
                  </p>
                </div>
                <div className="text-xs text-[hsl(var(--muted-foreground))] ml-4 shrink-0">
                  {(item.fileSize / 1024).toFixed(1)} KB
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 空状态引导（未扫描时） */}
      {scanState.status === "idle" && (
        <div className="rounded-md border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))/50] p-8 text-center">
          <p className="text-[hsl(var(--muted-foreground))] text-lg">
            🔍 开始扫描
          </p>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mt-2">
            输入 CodeBuddy IDE 的 Skill 目录路径，点击"扫描"按钮发现可导入的文件
          </p>
        </div>
      )}
    </div>
  );
}
