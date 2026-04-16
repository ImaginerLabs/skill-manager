import { Loader2 } from "lucide-react";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { PathPreset } from "../../../shared/types";
import { PathPresetSelect } from "../../components/shared/PathPresetSelect";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import type { ScanState } from "./useImport";

interface ScanPathInputProps {
  scanPath: string;
  scanState: ScanState;
  pathPresets: PathPreset[];
  onScanPathChange: (path: string | PathPreset) => void;
  onScan: () => void;
}

/** 扫描路径输入区域：路径输入框 + 预设下拉 + 扫描按钮 */
export const ScanPathInput = memo(function ScanPathInput({
  scanPath,
  scanState,
  pathPresets,
  onScanPathChange,
  onScan,
}: ScanPathInputProps) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-3 items-end">
      <div className="flex-1">
        <label
          htmlFor="scan-path"
          className="block text-sm font-medium mb-1.5 text-[hsl(var(--foreground))]"
        >
          {t("import.scanPath")}
        </label>
        <div className="flex gap-2">
          <Input
            id="scan-path"
            type="text"
            value={scanPath}
            onChange={(e) => onScanPathChange(e.target.value)}
            placeholder="~/.codebuddy/skills"
          />
          <PathPresetSelect
            presets={pathPresets}
            onSelect={(preset) => onScanPathChange(preset.path)}
          />
        </div>
      </div>
      <Button onClick={onScan} disabled={scanState.status === "loading"}>
        {scanState.status === "loading" ? (
          <span className="flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            {t("common.loading")}
          </span>
        ) : (
          t("common.search")
        )}
      </Button>
    </div>
  );
});
