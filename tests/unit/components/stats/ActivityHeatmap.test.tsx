// ============================================================
// tests/unit/components/stats/ActivityHeatmap.test.tsx
// Story 7.2: 活跃度热力图
// 验收标准 AC-4/5/6/8/9/10
// ============================================================

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ActivityHeatmap from "../../../../src/components/stats/ActivityHeatmap";
import { getHeatColor } from "../../../../src/components/stats/heatmap-utils";

// ─────────────────────────────────────────────
// Mock api.fetchActivityStats
// ─────────────────────────────────────────────
const mockFetchActivityStats = vi.fn();

vi.mock("../../../../src/lib/api", () => ({
  fetchActivityStats: (...args: any[]) => mockFetchActivityStats(...args),
}));

// 生成 N 天的测试数据
function generateDays(count: number, baseCount = 0, files: string[] = []) {
  const days = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().slice(0, 10),
      count: baseCount,
      files: baseCount > 0 ? files : [],
    });
  }
  return days;
}

describe("ActivityHeatmap — Story 7.2", () => {
  // ─────────────────────────────────────────────
  // getHeatColor 颜色映射单元测试 (AC-5)
  // ─────────────────────────────────────────────
  describe("getHeatColor 颜色映射", () => {
    it("0 次 → muted 颜色", () => {
      expect(getHeatColor(0)).toBe("hsl(var(--muted))");
    });

    it("1 次 → primary 30% 透明度", () => {
      expect(getHeatColor(1)).toBe("hsl(var(--primary) / 0.3)");
    });

    it("2 次 → primary 30% 透明度", () => {
      expect(getHeatColor(2)).toBe("hsl(var(--primary) / 0.3)");
    });

    it("3 次 → primary 60% 透明度", () => {
      expect(getHeatColor(3)).toBe("hsl(var(--primary) / 0.6)");
    });

    it("5 次 → primary 60% 透明度", () => {
      expect(getHeatColor(5)).toBe("hsl(var(--primary) / 0.6)");
    });

    it("6 次 → primary 完整颜色", () => {
      expect(getHeatColor(6)).toBe("hsl(var(--primary))");
    });

    it("10 次 → primary 完整颜色", () => {
      expect(getHeatColor(10)).toBe("hsl(var(--primary))");
    });
  });

  // ─────────────────────────────────────────────
  // AC-4: 热力图渲染 84 个豆点
  // ─────────────────────────────────────────────
  it("加载完成后渲染热力图", async () => {
    const days = generateDays(84);
    mockFetchActivityStats.mockResolvedValue(days);

    render(<ActivityHeatmap />);

    // 等待加载完成
    const heatmap = await screen.findByTestId("activity-heatmap");
    expect(heatmap).toBeInTheDocument();
  });

  // ─────────────────────────────────────────────
  // AC-10: aria-label 无障碍
  // ─────────────────────────────────────────────
  it("热力图有正确的 aria-label", async () => {
    const days = generateDays(84);
    mockFetchActivityStats.mockResolvedValue(days);

    render(<ActivityHeatmap />);
    const heatmap = await screen.findByTestId("activity-heatmap");
    expect(heatmap).toHaveAttribute("aria-label", "近 12 周 Skill 修改活跃度");
  });

  // ─────────────────────────────────────────────
  // AC-6: Tooltip 内容格式（替换为 Radix Tooltip）
  // ─────────────────────────────────────────────
  it("豆点不再有 title 属性（已替换为 Radix Tooltip）", async () => {
    const days = generateDays(84, 3, ["skill-a", "skill-b", "skill-c"]);
    mockFetchActivityStats.mockResolvedValue(days);

    render(<ActivityHeatmap />);
    await screen.findByTestId("activity-heatmap");

    const firstDot = screen.getByTestId(`heatmap-dot-${days[0].date}`);
    // title 属性已被移除，替换为 Radix Tooltip
    expect(firstDot).not.toHaveAttribute("title");
  });

  // ─────────────────────────────────────────────
  // 加载状态
  // ─────────────────────────────────────────────
  it("加载中显示 loading 状态", () => {
    // 永不 resolve 的 promise
    mockFetchActivityStats.mockReturnValue(new Promise(() => {}));

    render(<ActivityHeatmap />);
    expect(screen.getByTestId("activity-heatmap-loading")).toBeInTheDocument();
  });

  // ─────────────────────────────────────────────
  // API 失败时优雅降级
  // ─────────────────────────────────────────────
  it("API 失败时渲染空热力图（无豆点）", async () => {
    mockFetchActivityStats.mockRejectedValue(new Error("Network error"));

    render(<ActivityHeatmap />);
    const heatmap = await screen.findByTestId("activity-heatmap");
    expect(heatmap).toBeInTheDocument();
    // 无数据时无豆点
    expect(screen.queryAllByTestId(/^heatmap-dot-/)).toHaveLength(0);
  });

  // ─────────────────────────────────────────────
  // HT.1: Tooltip 浮窗渲染测试
  // ─────────────────────────────────────────────
  it("hover 有修改的豆点时显示 Tooltip 浮窗（含日期、修改次数和文件列表）", async () => {
    const user = userEvent.setup();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const days = generateDays(84, 0);
    // 设置今天的数据
    const todayIdx = days.findIndex((d) => d.date === todayStr);
    if (todayIdx >= 0) {
      days[todayIdx] = {
        date: todayStr,
        count: 3,
        files: ["skill-alpha", "skill-beta", "skill-gamma"],
      };
    }
    mockFetchActivityStats.mockResolvedValue(days);

    render(<ActivityHeatmap />);
    await screen.findByTestId("activity-heatmap");

    const dot = screen.getByTestId(`heatmap-dot-${todayStr}`);
    await user.hover(dot);

    // Tooltip 内容应包含日期、修改次数和文件名
    // 使用 findAllByText 因为 Radix Tooltip Portal 可能导致多个元素
    const dateElements = await screen.findAllByText(todayStr);
    expect(dateElements.length).toBeGreaterThanOrEqual(1);
    const modElements = await screen.findAllByText("3 次修改");
    expect(modElements.length).toBeGreaterThanOrEqual(1);
    const alphaElements = screen.getAllByText("• skill-alpha");
    expect(alphaElements.length).toBeGreaterThanOrEqual(1);
    const betaElements = screen.getAllByText("• skill-beta");
    expect(betaElements.length).toBeGreaterThanOrEqual(1);
    const gammaElements = screen.getAllByText("• skill-gamma");
    expect(gammaElements.length).toBeGreaterThanOrEqual(1);
  });

  it("hover 无修改的豆点时 Tooltip 显示「无修改」", async () => {
    const user = userEvent.setup();
    const days = generateDays(84, 0);
    mockFetchActivityStats.mockResolvedValue(days);

    render(<ActivityHeatmap />);
    await screen.findByTestId("activity-heatmap");

    const firstDot = screen.getByTestId(`heatmap-dot-${days[0].date}`);
    await user.hover(firstDot);

    const dateElements = await screen.findAllByText(days[0].date);
    expect(dateElements.length).toBeGreaterThanOrEqual(1);
    const noModElements = await screen.findAllByText("无修改");
    expect(noModElements.length).toBeGreaterThanOrEqual(1);
  });

  it("文件超过 10 个时显示 +N more", async () => {
    const user = userEvent.setup();
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const manyFiles = Array.from({ length: 15 }, (_, i) => `skill-${i + 1}`);
    const days = generateDays(84, 0);
    const todayIdx = days.findIndex((d) => d.date === todayStr);
    if (todayIdx >= 0) {
      days[todayIdx] = { date: todayStr, count: 15, files: manyFiles };
    }
    mockFetchActivityStats.mockResolvedValue(days);

    render(<ActivityHeatmap />);
    await screen.findByTestId("activity-heatmap");

    const dot = screen.getByTestId(`heatmap-dot-${todayStr}`);
    await user.hover(dot);

    // 等待 Tooltip 出现
    const dateElements = await screen.findAllByText(todayStr);
    expect(dateElements.length).toBeGreaterThanOrEqual(1);
    // 前 10 个文件应显示
    const skill1Elements = screen.getAllByText("• skill-1");
    expect(skill1Elements.length).toBeGreaterThanOrEqual(1);
    const skill10Elements = screen.getAllByText("• skill-10");
    expect(skill10Elements.length).toBeGreaterThanOrEqual(1);
    // 第 11 个不应显示
    expect(screen.queryByText("• skill-11")).not.toBeInTheDocument();
    // 应显示 +5 more
    const moreElements = screen.getAllByText("+5 more");
    expect(moreElements.length).toBeGreaterThanOrEqual(1);
  });
});
