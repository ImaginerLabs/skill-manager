import { useTranslation } from "react-i18next";
import BundleManager from "../components/settings/BundleManager";
import CategoryManager from "../components/settings/CategoryManager";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

/**
 * 分类管理页 — 分类设置 + 套件管理
 */
export default function SettingsPage() {
  const { t } = useTranslation();
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold font-[var(--font-code)] mb-6">
        {t("settings.title")}
      </h1>
      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">
            {t("settings.tabCategories")}
          </TabsTrigger>
          <TabsTrigger value="bundles">{t("settings.tabBundles")}</TabsTrigger>
        </TabsList>
        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>
        <TabsContent value="bundles">
          <BundleManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
