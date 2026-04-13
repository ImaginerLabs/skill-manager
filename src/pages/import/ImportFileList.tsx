import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { Category, ScanResultItem } from "../../../shared/types";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";

interface ImportFileListProps {
  items: ScanResultItem[];
  selectedPaths: Set<string>;
  allSelected: boolean;
  categories: Category[];
  selectedCategory: string;
  importing: boolean;
  cleanupAfterImport: boolean;
  canImport: boolean;
  onToggleAll: () => void;
  onToggleItem: (absolutePath: string) => void;
  onCategoryChange: (category: string) => void;
  onImport: () => void;
  onCleanupAfterImportChange: (checked: boolean) => void;
}

/** 文件列表区域：全选工具栏 + 分类选择 + 导入按钮 + 文件列表 + 清理选项 */
export const ImportFileList = memo(function ImportFileList({
  items,
  selectedPaths,
  allSelected,
  categories,
  selectedCategory,
  importing,
  cleanupAfterImport,
  canImport,
  onToggleAll,
  onToggleItem,
  onCategoryChange,
  onImport,
  onCleanupAfterImportChange,
}: ImportFileListProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      {/* 工具栏：全选 + 已选统计 + 分类选择 + 导入按钮 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          {/* 全选 checkbox */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onToggleAll}
              className="h-4 w-4 rounded border border-[hsl(var(--border))] accent-[hsl(var(--primary))] cursor-pointer"
            />
            <span className="text-sm">{t("common.selectAll")}</span>
          </label>
          {/* 已选统计 */}
          <span className="text-sm text-[hsl(var(--muted-foreground))]">
            {selectedPaths.size} / {items.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* 分类选择器 — 使用原生 select 以兼容 e2e 测试 */}
          <select
            data-testid="category-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="h-9 w-[180px] rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm text-[hsl(var(--foreground))] cursor-pointer"
          >
            <option value="">{t("category.empty")}</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.displayName}
              </option>
            ))}
          </select>

          {/* 导入按钮 */}
          <Button
            onClick={onImport}
            disabled={!canImport || importing}
            size="sm"
          >
            {importing
              ? t("common.loading")
              : `${t("common.confirm")} (${selectedPaths.size})`}
          </Button>
        </div>
      </div>

      {/* 清理选项 */}
      <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-[hsl(var(--muted-foreground))]">
        <Checkbox
          checked={cleanupAfterImport}
          onCheckedChange={(checked) =>
            onCleanupAfterImportChange(checked === true)
          }
        />
        {t("import.subtitle").includes("扫描")
          ? "导入后删除源文件（不可撤销）"
          : t("import.subtitle")}
      </label>

      {/* 文件列表 */}
      <div className="rounded-md border border-[hsl(var(--border))] divide-y divide-[hsl(var(--border))]">
        {items.map((item: ScanResultItem) => (
          <label
            key={item.absolutePath}
            className="flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--accent))] transition-colors cursor-pointer"
          >
            {/* 使用原生 input[type="checkbox"] 以兼容 e2e 测试 */}
            <input
              type="checkbox"
              checked={selectedPaths.has(item.absolutePath)}
              onChange={() => onToggleItem(item.absolutePath)}
              className="h-4 w-4 rounded border border-[hsl(var(--border))] accent-[hsl(var(--primary))] cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{item.name}</span>
                {item.parseStatus === "failed" && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                    {t("import.scanFailed")}
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
  );
});
