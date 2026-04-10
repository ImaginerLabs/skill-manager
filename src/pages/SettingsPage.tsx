import CategoryManager from "../components/settings/CategoryManager";

/**
 * 设置页 — 分类管理 + 其他配置
 */
export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold font-[var(--font-code)] mb-6">设置</h1>
      <CategoryManager />
    </div>
  );
}
