// ============================================================
// tests/unit/components/sync/SyncProgressBar.test.tsx — SyncProgressBar 单元测试
// ============================================================

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SyncProgressBar from "../../../../src/components/sync/SyncProgressBar";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, params?: Record<string, unknown>) => {
      if (params) {
        return `${params.completed}/${params.total} Skill 已同步`;
      }
      return _key;
    },
    i18n: { language: "zh", changeLanguage: vi.fn() },
  }),
}));

describe("SyncProgressBar", () => {
  it("渲染进度条", () => {
    render(<SyncProgressBar completed={5} total={10} />);
    expect(screen.getByTestId("sync-progress-bar")).toBeInTheDocument();
  });

  it("显示进度文字", () => {
    render(<SyncProgressBar completed={5} total={10} />);
    expect(screen.getByText("5/10 Skill 已同步")).toBeInTheDocument();
  });

  it("进度条有正确的 aria 属性", () => {
    render(<SyncProgressBar completed={3} total={10} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "3");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "10");
  });

  it("进度条宽度正确计算", () => {
    render(<SyncProgressBar completed={5} total={10} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar.style.width).toBe("50%");
  });

  it("total 为 0 时进度条宽度为 0%", () => {
    render(<SyncProgressBar completed={0} total={0} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar.style.width).toBe("0%");
  });

  it("completed 超过 total 时宽度不超过 100%", () => {
    render(<SyncProgressBar completed={15} total={10} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar.style.width).toBe("100%");
  });
});
