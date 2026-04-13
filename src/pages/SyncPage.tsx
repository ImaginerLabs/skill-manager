// ============================================================
// pages/SyncPage.tsx — IDE 同步管理页面
// ============================================================

import { useTranslation } from "react-i18next";
import SyncExecutor from "../components/sync/SyncExecutor";
import SyncSkillSelector from "../components/sync/SyncSkillSelector";
import SyncTargetManager from "../components/sync/SyncTargetManager";

/**
 * SyncPage — IDE 同步页面
 * 双栏布局：左侧 Skill 选择列表 + 右侧同步目标配置
 * 底部：同步执行与结果日志
 */
export default function SyncPage() {
  const { t } = useTranslation();
  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 p-6 pb-4">
        <h1 className="text-2xl font-bold font-[var(--font-code)] text-[hsl(var(--foreground))] mb-1">
          {t("sync.title")}
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {t("sync.subtitle")}
        </p>
      </div>
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 px-6 gap-6">
        {/* 左侧：Skill 选择 */}
        <div className="lg:w-[420px] lg:shrink-0 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 overflow-auto">
          <SyncSkillSelector />
        </div>
        {/* 右侧：同步目标配置 */}
        <div className="flex-1 min-w-0 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 overflow-auto">
          <SyncTargetManager />
        </div>
      </div>
      {/* 底部：同步执行与结果日志 */}
      <div className="shrink-0 px-6 py-4">
        <SyncExecutor />
      </div>
    </div>
  );
}
