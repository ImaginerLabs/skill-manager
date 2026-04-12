import { FolderOpen, Search } from "lucide-react";
import { CleanupConfirmDialog } from "./CleanupConfirmDialog";
import { ImportFileList } from "./ImportFileList";
import { ScanPathInput } from "./ScanPathInput";
import { useImport } from "./useImport";

export default function ImportPage() {
  const {
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
    handleScan,
    toggleItem,
    toggleAll,
    handleCleanup,
    handleImport,
    closeCleanupDialog,
  } = useImport();

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
      <ScanPathInput
        scanPath={scanPath}
        scanState={scanState}
        pathPresets={pathPresets}
        onScanPathChange={setScanPath}
        onScan={handleScan}
      />

      {/* 错误状态 */}
      {scanState.status === "error" && (
        <div className="rounded-md border border-[hsl(var(--destructive))/0.3] bg-[hsl(var(--destructive))/0.1] p-4">
          <p className="text-[hsl(var(--destructive))] font-medium">扫描失败</p>
          <p className="text-[hsl(var(--destructive))] text-sm mt-1 opacity-80">
            {scanState.message}
          </p>
        </div>
      )}

      {/* 空目录提示 */}
      {scanState.status === "success" && items.length === 0 && (
        <div className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-8 text-center">
          <FolderOpen
            size={32}
            className="mx-auto text-[hsl(var(--muted-foreground))] mb-2 opacity-60"
          />
          <p className="text-[hsl(var(--muted-foreground))] text-lg">
            目录为空
          </p>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mt-2">
            在 <code className="text-xs">{scanState.data.scanPath}</code>{" "}
            中未发现 .md 文件
          </p>
        </div>
      )}

      {/* 扫描结果 + 导入向导 */}
      {scanState.status === "success" && items.length > 0 && (
        <ImportFileList
          items={items}
          selectedPaths={selectedPaths}
          allSelected={allSelected}
          categories={categories}
          selectedCategory={selectedCategory}
          importing={importing}
          cleanupAfterImport={cleanupAfterImport}
          canImport={canImport}
          onToggleAll={() => toggleAll(items)}
          onToggleItem={toggleItem}
          onCategoryChange={setSelectedCategory}
          onImport={handleImport}
          onCleanupAfterImportChange={setCleanupAfterImport}
        />
      )}

      {/* 空状态引导（未扫描时） */}
      {scanState.status === "idle" && (
        <div className="rounded-md border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))/50] p-8 text-center">
          <Search
            size={32}
            className="mx-auto text-[hsl(var(--muted-foreground))] mb-2 opacity-60"
          />
          <p className="text-[hsl(var(--muted-foreground))] text-lg">
            开始扫描
          </p>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mt-2">
            输入 CodeBuddy IDE 的 Skill
            目录路径，点击&quot;扫描&quot;按钮发现可导入的文件
          </p>
        </div>
      )}

      {/* 清理源文件确认弹窗 */}
      <CleanupConfirmDialog
        dialog={cleanupDialog}
        onConfirm={handleCleanup}
        onClose={closeCleanupDialog}
      />
    </div>
  );
}
