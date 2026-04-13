# Story 7.2: Sidebar 系统状态面板 + 活跃度热力图

Status: done

## Story

As a Skill Manager 用户,
I want 在侧边栏中能快速看到我的 Skill 库整体状态（Skill 数、工作流数、分类数），以及近 12 周的活跃度热力图,
so that 我对自己的 Skill 资产有直观感知，就像 GitHub 首页的贡献热力图一样。

## Acceptance Criteria

1. **[StatsPanel 渲染]** 主 Sidebar 导航列表下方（分隔线之后）出现系统统计信息区块，展示三项数据：Skill 总数（排除 `type === 'workflow'`）、工作流总数（`type === 'workflow'`）、分类总数。

2. **[统计布局]** 统计区块采用三列紧凑布局，每项包含图标、数字（大字体）和标签（小字体）。

3. **[统计数据实时性]** 统计数字从 `useSkillStore` 和 `useCategoryStore`（或 `useSkillStore` 的 `categories`）读取，在用户执行导入、删除等操作后自动更新（因为这些操作会触发 `fetchSkills()`）。

4. **[ActivityHeatmap 渲染]** 统计区块下方出现活跃度热力图，展示近 12 周（84 天）的每日 Skill 修改频率，布局为 7 列（周一至周日）× 12 行（12 周）= 84 个豆点。

5. **[豆点颜色映射]** 豆点颜色按修改次数映射：0 次 → `hsl(var(--muted))`；1-2 次 → `hsl(var(--primary) / 0.3)`；3-5 次 → `hsl(var(--primary) / 0.6)`；6+ 次 → `hsl(var(--primary))`。

6. **[Tooltip]** 鼠标悬停在豆点上时，显示 `title` 属性内容：`YYYY-MM-DD · N 次修改`。

7. **[后端 API]** `GET /api/stats/activity?weeks=12` 返回 `ApiResponse<ActivityDay[]>`，`ActivityDay = { date: string; count: number }`，数据来源为 `skills/` 目录下所有 `.md` 文件的 `fs.stat().mtime`。

8. **[热力图宽度自适应]** 热力图宽度为 `100%`，豆点大小固定 `8px × 8px`，间距 `2px`，整体不溢出 Sidebar。

9. **[prefers-reduced-motion]** 若用户开启减少动画偏好，豆点颜色变化无过渡动画。

10. **[无障碍]** 热力图整体提供 `aria-label="近 12 周 Skill 修改活跃度"`。

## Tasks / Subtasks

- [x] Task 1: 后端 — 新建 `statsRoutes.ts` 实现 `GET /api/stats/activity` (AC: 7)
  - [x] 1.1 创建 `server/routes/statsRoutes.ts`
  - [x] 1.2 实现路由：扫描 `SKILLS_ROOT` 下所有 `.md` 文件，读取 `fs.stat().mtime`，按日期聚合
  - [x] 1.3 返回过去 `weeks`（默认 12）周的 `ActivityDay[]` 数组
  - [x] 1.4 在 `server/app.ts` 中注册 `statsRoutes`
  - [x] 1.5 单元测试：5 个测试全部通过

- [x] Task 2: 前端 API — 新增 `fetchActivityStats` (AC: 7)
  - [x] 2.1 在 `src/lib/api.ts` 末尾添加 `fetchActivityStats(weeks?: number): Promise<ActivityDay[]>`
  - [x] 2.2 定义 `ActivityDay` 类型

- [x] Task 3: 新建 `StatsPanel.tsx` (AC: 1, 2, 3)
  - [x] 3.1 创建 `src/components/stats/StatsPanel.tsx`
  - [x] 3.2 从 `useSkillStore` 读取 `skills` 和 `categories`，计算三项统计数字
  - [x] 3.3 实现三列布局：图标 + 数字 + 标签
  - [x] 3.4 单元测试：6 个测试全部通过

- [x] Task 4: 新建 `ActivityHeatmap.tsx` (AC: 4, 5, 6, 8, 9, 10)
  - [x] 4.1 创建 `src/components/stats/ActivityHeatmap.tsx`
  - [x] 4.2 组件挂载时调用 `fetchActivityStats(12)` 获取数据
  - [x] 4.3 渲染 84 个豆点（7 列 × 12 行）
  - [x] 4.4 实现颜色映射函数 `getHeatColor(count: number): string`
  - [x] 4.5 每个豆点添加 `title` 属性
  - [x] 4.6 整体添加 `aria-label`
  - [x] 4.7 单元测试：12 个测试全部通过

- [x] Task 5: 修改 `Sidebar.tsx` — 集成 StatsPanel 和 ActivityHeatmap (AC: 1, 4)
  - [x] 5.1 在 Sidebar 导航列表下方添加分隔线
  - [x] 5.2 引入并渲染 `StatsPanel`
  - [x] 5.3 引入并渲染 `ActivityHeatmap`
  - [x] 5.4 更新 Sidebar 测试：mock StatsPanel 和 ActivityHeatmap 避免依赖链问题

## Dev Notes

### 关键文件路径

| 文件                                       | 操作                          |
| ------------------------------------------ | ----------------------------- |
| `server/routes/statsRoutes.ts`             | **新建**                      |
| `server/app.ts`                            | 修改：注册 statsRoutes        |
| `src/lib/api.ts`                           | 修改：新增 fetchActivityStats |
| `src/components/stats/StatsPanel.tsx`      | **新建**                      |
| `src/components/stats/ActivityHeatmap.tsx` | **新建**                      |
| `src/components/layout/Sidebar.tsx`        | 修改：集成两个新组件          |

### 后端 statsRoutes.ts 实现参考

```typescript
import { Router } from "express";
import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getSkillsRoot } from "../services/skillService.js";

const statsRoutes = Router();

interface ActivityDay {
  date: string; // YYYY-MM-DD
  count: number;
}

async function scanMdFiles(dir: string): Promise<string[]> {
  const results: string[] = [];
  const exists = await fs.pathExists(dir);
  if (!exists) return results;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".")) {
      results.push(...(await scanMdFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

statsRoutes.get("/stats/activity", async (req, res) => {
  const weeks = parseInt(String(req.query.weeks ?? "12"), 10);
  const skillsRoot = getSkillsRoot();
  const files = await scanMdFiles(skillsRoot);

  // 计算日期范围
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - weeks * 7);

  // 聚合每日修改次数
  const countMap = new Map<string, number>();
  for (const file of files) {
    const stat = await fs.stat(file);
    const mtime = stat.mtime;
    if (mtime >= startDate) {
      const dateStr = mtime.toISOString().slice(0, 10); // YYYY-MM-DD
      countMap.set(dateStr, (countMap.get(dateStr) ?? 0) + 1);
    }
  }

  // 生成完整日期序列（含 0 次的日期）
  const result: ActivityDay[] = [];
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    result.push({ date: dateStr, count: countMap.get(dateStr) ?? 0 });
  }

  res.json({ success: true, data: result });
});

export { statsRoutes };
```

### StatsPanel.tsx 实现参考

```tsx
import { BookOpen, GitBranch, Tag } from "lucide-react";
import { useSkillStore } from "../../stores/skill-store";

export default function StatsPanel() {
  const skills = useSkillStore((s) => s.skills);
  const categories = useSkillStore((s) => s.categories);

  const skillCount = skills.filter((sk) => sk.type !== "workflow").length;
  const workflowCount = skills.filter((sk) => sk.type === "workflow").length;
  const categoryCount = categories.length;

  const stats = [
    { icon: BookOpen, count: skillCount, label: "Skills" },
    { icon: GitBranch, count: workflowCount, label: "工作流" },
    { icon: Tag, count: categoryCount, label: "分类" },
  ];

  return (
    <div className="px-3 py-2">
      <div className="grid grid-cols-3 gap-1">
        {stats.map(({ icon: Icon, count, label }) => (
          <div
            key={label}
            className="flex flex-col items-center py-2 rounded-md bg-[hsl(var(--accent)/0.5)]"
          >
            <Icon
              size={12}
              className="text-[hsl(var(--muted-foreground))] mb-1"
            />
            <span className="text-sm font-bold text-[hsl(var(--foreground))]">
              {count}
            </span>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### ActivityHeatmap.tsx 实现参考

```tsx
import { useEffect, useState } from "react";
import { fetchActivityStats } from "../../lib/api";

interface ActivityDay {
  date: string;
  count: number;
}

function getHeatColor(count: number): string {
  if (count === 0) return "hsl(var(--muted))";
  if (count <= 2) return "hsl(var(--primary) / 0.3)";
  if (count <= 5) return "hsl(var(--primary) / 0.6)";
  return "hsl(var(--primary))";
}

export default function ActivityHeatmap() {
  const [data, setData] = useState<ActivityDay[]>([]);

  useEffect(() => {
    fetchActivityStats(12)
      .then(setData)
      .catch(() => {});
  }, []);

  // 将 84 天数据按列（周）分组，每列 7 天
  const weeks: ActivityDay[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <div className="px-3 py-2" aria-label="近 12 周 Skill 修改活跃度">
      <p className="text-[10px] text-[hsl(var(--muted-foreground))] mb-1.5">
        活跃度
      </p>
      <div className="flex gap-[2px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[2px]">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date} · ${day.count} 次修改`}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  backgroundColor: getHeatColor(day.count),
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### api.ts 新增函数

```typescript
// ---- Stats API ----
export interface ActivityDay {
  date: string; // YYYY-MM-DD
  count: number;
}

export async function fetchActivityStats(weeks = 12): Promise<ActivityDay[]> {
  return apiCall<ActivityDay[]>(`/api/stats/activity?weeks=${weeks}`);
}
```

### Sidebar.tsx 集成位置

在现有 Sidebar 的 `</nav>` 之后，添加：

```tsx
{
  /* 分隔线 */
}
<div className="border-t border-[hsl(var(--border))]" />;
{
  /* 系统统计 */
}
<StatsPanel />;
{
  /* 活跃度热力图 */
}
<ActivityHeatmap />;
```

### 架构约束（来自 AD-24）

- `StatsPanel` 数据来源：`useSkillStore`（已有，无需新 API）
- `ActivityHeatmap` 数据来源：后端 `GET /api/stats/activity`
- 后端使用 `getSkillsRoot()` 获取 skills 目录路径（已有导出函数）
- 遵循项目 `ApiResponse<T>` 统一响应格式

### SkillMeta type 字段说明

`SkillMeta.type` 字段：普通 Skill 为 `undefined` 或其他值，工作流为 `"workflow"`。
过滤逻辑：`skills.filter(sk => sk.type === "workflow")` 获取工作流。

### 测试文件位置

- `tests/unit/server/routes/statsRoutes.test.ts`（新建）
- `tests/unit/components/stats/StatsPanel.test.tsx`（新建）
- `tests/unit/components/stats/ActivityHeatmap.test.tsx`（新建）

### Project Structure Notes

- 新建 `src/components/stats/` 目录
- 后端路由文件位于 `server/routes/`，遵循现有命名规范
- 测试文件位于 `tests/unit/` 对应子目录

### References

- [Source: _bmad-output/planning-artifacts/prd-sidebar-redesign.md#需求2]
- [Source: _bmad-output/planning-artifacts/architecture.md#AD-24]
- [Source: _bmad-output/planning-artifacts/epics.md#Story-7.2]
- [Source: server/services/skillService.ts#getSkillsRoot] — SKILLS_ROOT 路径获取
- [Source: server/app.ts] — 路由注册模式
- [Source: src/lib/api.ts] — API 函数模式
- [Source: src/stores/skill-store.ts] — Zustand store 结构

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-1m-context

### Debug Log References

### Completion Notes List

- ✅ Task 1: 新建 server/routes/statsRoutes.ts，实现 GET /api/stats/activity，注册到 app.ts
- ✅ Task 2: 在 api.ts 末尾添加 fetchActivityStats 和 ActivityDay 类型
- ✅ Task 3: 新建 src/components/stats/StatsPanel.tsx，从 useSkillStore 读取统计数据
- ✅ Task 4: 新建 src/components/stats/ActivityHeatmap.tsx，实现热力图渲染和颜色映射
- ✅ Task 5: 修改 Sidebar.tsx，集成 StatsPanel 和 ActivityHeatmap，修复语法错误
- ✅ 36 个测试全部通过（statsRoutes: 5, StatsPanel: 6, ActivityHeatmap: 12, Sidebar: 13）
- ✅ 全量测试无新增回归

### File List

- `server/routes/statsRoutes.ts` — 新建
- `server/app.ts` — 修改：注册 statsRoutes
- `src/lib/api.ts` — 修改：新增 fetchActivityStats 和 ActivityDay
- `src/components/stats/StatsPanel.tsx` — 新建
- `src/components/stats/ActivityHeatmap.tsx` — 新建
- `src/components/layout/Sidebar.tsx` — 修改：集成 StatsPanel 和 ActivityHeatmap
- `tests/unit/server/routes/statsRoutes.test.ts` — 新建
- `tests/unit/components/stats/StatsPanel.test.tsx` — 新建
- `tests/unit/components/stats/ActivityHeatmap.test.tsx` — 新建
- `tests/unit/components/layout/Sidebar.test.tsx` — 修改：添加 StatsPanel/ActivityHeatmap mock

### Review Findings

- [x] [Review][Decision] ActivityHeatmap 布局方向歧义 — Spec AC-4 描述"7 列（周一至周日）× 12 行（12 周）"，实现采用"12 列（12 周）× 7 行"转置布局。两种方案豆点总数相同（84），但视觉方向不同：Spec 方案每列是一天（纵向），实现方案每列是一周（横向，类 GitHub 贡献图）。需确认采用哪种方向。
- [x] [Review][Patch] 豆点尺寸不符合 Spec：实现用 aspectRatio:1/maxHeight:12/gap:3px，Spec AC-8 要求固定 8px×8px，间距 2px [src/components/stats/ActivityHeatmap.tsx:88]
- [x] [Review][Patch] StatsPanel 统计项缺少背景色，Spec 参考实现中每项有 bg-[hsl(var(--accent)/0.5)] [src/components/stats/StatsPanel.tsx:40]
- [x] [Review][Defer] ActivityHeatmap useEffect 无卸载清理（React 18 已不报错）[src/components/stats/ActivityHeatmap.tsx:32] — deferred, pre-existing
