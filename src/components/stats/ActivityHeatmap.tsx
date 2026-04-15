// ============================================================
// components/stats/ActivityHeatmap.tsx — 活跃度热力图
// 展示近 12 周 Skill 文件修改频率（类 GitHub Contribution Graph）
// ============================================================

import { useEffect, useState } from "react";
import { type ActivityDay, fetchActivityStats } from "../../lib/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { getHeatColor } from "./heatmap-utils";

/**
 * 活跃度热力图 — 12 列（12 周）× 7 行（周一至周日）= 84 个豆点
 * 布局：CSS Grid 12 列，豆点自动撑满 Sidebar 宽度
 * 数据来源：GET /api/stats/activity?weeks=12
 */
export default function ActivityHeatmap() {
  const [data, setData] = useState<ActivityDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    setLoading(true);
    fetchActivityStats(12)
      .then((result) => {
        if (isMounted) setData(result);
      })
      .catch(() => {
        if (isMounted) setData([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // 将 84 天数据转置：原来是「按周分列」，现在改为「按行排列」
  // Grid 布局：12 列，每行 = 同一天（周一/周二/...），从左到右是时间轴
  // 数据顺序：[week0_day0, week0_day1, ..., week0_day6, week1_day0, ...]
  // Grid 填充顺序：row-major（先填第一行所有列，再填第二行）
  // 所以需要转置：先按行（天）排列，再按列（周）
  const WEEKS = 12;
  const DAYS = 7;
  // transposed[dayOfWeek][weekIndex] = ActivityDay
  const transposed: (ActivityDay | null)[][] = Array.from(
    { length: DAYS },
    () => Array(WEEKS).fill(null),
  );
  data.forEach((day, idx) => {
    const weekIdx = Math.floor(idx / DAYS);
    const dayIdx = idx % DAYS;
    if (weekIdx < WEEKS) transposed[dayIdx][weekIdx] = day;
  });

  // 按行展平：[row0_col0, row0_col1, ..., row0_col11, row1_col0, ...]
  const gridItems = transposed.flat();

  if (loading) {
    return (
      <div className="px-3 py-2" data-testid="activity-heatmap-loading">
        <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
          活跃度
        </p>
        <div className="h-[80px] flex items-center justify-center">
          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
            加载中...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="px-3 py-2"
      data-testid="activity-heatmap"
      aria-label="近 12 周 Skill 修改活跃度"
    >
      <p className="text-[10px] text-[hsl(var(--muted-foreground))] mb-2">
        活跃度
      </p>
      {/* CSS Grid 12 列自适应宽度，豆点撑满容器 */}
      <TooltipProvider delayDuration={200}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "2px",
          }}
        >
          {gridItems.map((day, idx) =>
            day ? (
              <Tooltip key={day.date}>
                <TooltipTrigger asChild>
                  <div
                    data-testid={`heatmap-dot-${day.date}`}
                    style={{
                      aspectRatio: "1",
                      borderRadius: 2,
                      backgroundColor: getHeatColor(day.count),
                      transition: "none",
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  <p className="font-bold text-xs">{day.date}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {day.count > 0 ? `${day.count} 次修改` : "无修改"}
                  </p>
                  {day.files.length > 0 && (
                    <>
                      <div className="my-1 border-t border-[hsl(var(--border))]" />
                      <ul className="space-y-0.5">
                        {day.files.slice(0, 10).map((f, i) => (
                          <li
                            key={i}
                            className="text-xs truncate text-[hsl(var(--muted-foreground))]"
                          >
                            • {f}
                          </li>
                        ))}
                        {day.files.length > 10 && (
                          <li className="text-xs text-[hsl(var(--muted-foreground))]">
                            +{day.files.length - 10} more
                          </li>
                        )}
                      </ul>
                    </>
                  )}
                </TooltipContent>
              </Tooltip>
            ) : (
              <div key={`empty-${idx}`} style={{ aspectRatio: "1" }} />
            ),
          )}
        </div>
      </TooltipProvider>
    </div>
  );
}
