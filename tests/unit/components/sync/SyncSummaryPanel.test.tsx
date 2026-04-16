// ============================================================
// tests/unit/components/sync/SyncSummaryPanel.test.tsx — SyncSummaryPanel 单元测试
// ============================================================

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SyncSummaryPanel from "../../../../src/components/sync/SyncSummaryPanel";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "sync.summaryTitle": "同步确认",
        "sync.summarySkillCount": "Skill 数量",
        "sync.summaryTargets": "目标路径",
        "sync.summaryMode": "同步模式",
        "sync.confirmSync": "确认同步",
        "sync.cancelSync": "取消",
        "sync.incrementalSync": "增量同步",
        "sync.replaceSync": "替换同步",
        "sync.startSync": "开始同步",
        "sync.replaceSyncWarning": "此操作不可撤销。",
      };
      return map[key] ?? key;
    },
    i18n: { language: "zh", changeLanguage: vi.fn() },
  }),
}));

const mockTargets = [
  { id: "t1", name: "Project A", path: "/path/to/a", enabled: true },
  { id: "t2", name: "Project B", path: "/path/to/b", enabled: true },
];

describe("SyncSummaryPanel", () => {
  it("渲染摘要面板标题", () => {
    render(
      <SyncSummaryPanel
        skillCount={5}
        targets={mockTargets}
        mode="incremental"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText("同步确认")).toBeInTheDocument();
  });

  it("显示 Skill 数量", () => {
    render(
      <SyncSummaryPanel
        skillCount={12}
        targets={mockTargets}
        mode="incremental"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("显示目标路径列表", () => {
    render(
      <SyncSummaryPanel
        skillCount={5}
        targets={mockTargets}
        mode="incremental"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText("Project A")).toBeInTheDocument();
    expect(screen.getByText("Project B")).toBeInTheDocument();
  });

  it("显示同步模式标签", () => {
    render(
      <SyncSummaryPanel
        skillCount={5}
        targets={mockTargets}
        mode="incremental"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText("增量同步")).toBeInTheDocument();
  });

  it("替换模式显示警告", () => {
    render(
      <SyncSummaryPanel
        skillCount={5}
        targets={mockTargets}
        mode="replace"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText("此操作不可撤销。")).toBeInTheDocument();
  });

  it("点击确认按钮触发 onConfirm", async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <SyncSummaryPanel
        skillCount={5}
        targets={mockTargets}
        mode="incremental"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );
    await user.click(screen.getByText("确认同步"));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("点击取消按钮触发 onCancel", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(
      <SyncSummaryPanel
        skillCount={5}
        targets={mockTargets}
        mode="incremental"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );
    await user.click(screen.getByText("取消"));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
