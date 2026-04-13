import { useTranslation } from "react-i18next";
import PathPresetManager from "../components/settings/PathPresetManager";

/**
 * 路径配置页 — 管理预设路径（供同步和导入快捷选择）
 */
export default function PathsPage() {
  const { t } = useTranslation();
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold font-[var(--font-code)] mb-2">
        {t("paths.title")}
      </h1>
      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
        {t("paths.subtitle")}
      </p>
      <PathPresetManager />
    </div>
  );
}
