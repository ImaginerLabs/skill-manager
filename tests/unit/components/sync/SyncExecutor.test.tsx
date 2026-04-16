import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock react-i18next（使用 zh 翻译资源）
vi.mock("react-i18next", async () => {
  const { zh } = await import("../../../../src/i18n/locales/zh");
  function resolve(key: string, obj: Record<string, unknown>): string {
    const parts = key.split(".");
    let cur: unknown = obj;
    for (const p of parts) {
      if (cur && typeof cur === "object" && p in cur)
        cur = (cur as Record<string, unknown>)[p];
      else return key;
    }
    return typeof cur === "string" ? cur : key;
  }
  return {
    useTranslation: () => ({
      t: (key: string, params?: Record<string, unknown>) => {
        let text = resolve(key, zh as unknown as Record<string, unknown>);
        if (params) {
          for (const [k, v] of Object.entries(params)) {
            text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v));
          }
        }
        return text;
      },
      i18n: { language: "zh", changeLanguage: vi.fn() },
    }),
  };
});

// Mock stores
const mockExecutePush = vi.fn();
const mockExecuteDiff = vi.fn();
const mockSetSyncStatus = vi.fn();
const mockSetSyncResult = vi.fn();
const mockSetDiffReport = vi.fn();

vi.mock("../../../../src/stores/sync-store", () => ({
  useSyncStore: vi.fn(() => ({
    targets: [{ id: "t1", name: "项目A", path: "/tmp/a", enabled: true }],
    selectedSkillIds: ["s1", "s2"],
    syncStatus: "idle",
    syncResult: null,
    diffReport: null,
    executePush: mockExecutePush,
    executeDiff: mockExecuteDiff,
    setSyncStatus: mockSetSyncStatus,
    setSyncResult: mockSetSyncResult,
    setDiffReport: mockSetDiffReport,
  })),
}));

vi.mock("../../../../src/components/shared/toast-store", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock SyncSplitButton 为简单按钮
vi.mock("../../../../src/components/sync/SyncSplitButton", () => ({
  default: ({
    onSync,
    onDiff,
    disabled,
    loading,
  }: {
    onSync: (mode: string) => void;
    onDiff: () => void;
    disabled: boolean;
    loading: boolean;
    loadingMode: string | null;
  }) => (
    <div data-testid="sync-split-button">
      <button
        onClick={() => onSync("incremental")}
        disabled={disabled || loading}
      >
        {loading ? "同步中..." : "开始同步"}
      </button>
      <button onClick={onDiff} disabled={disabled || loading}>
        查看差异
      </button>
    </div>
  ),
}));

// Mock DiffReportView
vi.mock("../../../../src/components/sync/DiffReportView", () => ({
  default: () => <div data-testid="diff-report-view">DiffReport</div>,
}));

// Mock ReplaceSyncConfirmDialog
vi.mock("../../../../src/components/sync/ReplaceSyncConfirmDialog", () => ({
  default: () => null,
}));

// Mock SyncSummaryPanel（Story 9.4）
vi.mock("../../../../src/components/sync/SyncSummaryPanel", () => ({
  default: ({
    onConfirm,
    onCancel,
  }: {
    skillCount: number;
    targets: unknown[];
    mode: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) => (
    <div data-testid="sync-summary-panel">
      <button onClick={onConfirm}>确认同步</button>
      <button onClick={onCancel}>取消</button>
    </div>
  ),
}));

// Mock SyncProgressBar（Story 9.4）
vi.mock("../../../../src/components/sync/SyncProgressBar", () => ({
  default: () => <div data-testid="sync-progress-bar">Progress</div>,
}));

// Mock pushSync API（Story 9.4 重试功能）
vi.mock("../../../../src/lib/api", () => ({
  pushSync: vi.fn(),
}));

import SyncExecutor from "../../../../src/components/sync/SyncExecutor";
import { useSyncStore } from "../../../../src/stores/sync-store";

describe("SyncExecutor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("渲染", () => {
    it("渲染同步按钮和信息摘要", () => {
      render(<SyncExecutor />);

      expect(screen.getByText("开始同步")).toBeInTheDocument();
      expect(screen.getByText("2 Skill → 1 targets")).toBeInTheDocument();
    });

    it("无选中 Skill 时显示提示", () => {
      vi.mocked(useSyncStore).mockReturnValue({
        targets: [{ id: "t1", name: "A", path: "/tmp", enabled: true }],
        selectedSkillIds: [],
        syncStatus: "idle",
        syncResult: null,
        diffReport: null,
        executePush: mockExecutePush,
        executeDiff: mockExecuteDiff,
        setSyncStatus: mockSetSyncStatus,
        setSyncResult: mockSetSyncResult,
        setDiffReport: mockSetDiffReport,
      } as unknown as ReturnType<typeof useSyncStore>);

      render(<SyncExecutor />);

      expect(screen.getByText("请先选择要同步的 Skill")).toBeInTheDocument();
      expect(screen.getByText("开始同步")).toBeDisabled();
    });

    it("无启用目标时显示提示", () => {
      vi.mocked(useSyncStore).mockReturnValue({
        targets: [{ id: "t1", name: "A", path: "/tmp", enabled: false }],
        selectedSkillIds: ["s1"],
        syncStatus: "idle",
        syncResult: null,
        diffReport: null,
        executePush: mockExecutePush,
        executeDiff: mockExecuteDiff,
        setSyncStatus: mockSetSyncStatus,
        setSyncResult: mockSetSyncResult,
        setDiffReport: mockSetDiffReport,
      } as unknown as ReturnType<typeof useSyncStore>);

      render(<SyncExecutor />);

      expect(screen.getByText("请先添加并启用同步目标")).toBeInTheDocument();
      expect(screen.getByText("开始同步")).toBeDisabled();
    });

    it("同步中显示 loading 状态", () => {
      vi.mocked(useSyncStore).mockReturnValue({
        targets: [{ id: "t1", name: "A", path: "/tmp", enabled: true }],
        selectedSkillIds: ["s1"],
        syncStatus: "syncing",
        syncResult: null,
        diffReport: null,
        executePush: mockExecutePush,
        executeDiff: mockExecuteDiff,
        setSyncStatus: mockSetSyncStatus,
        setSyncResult: mockSetSyncResult,
        setDiffReport: mockSetDiffReport,
      } as unknown as ReturnType<typeof useSyncStore>);

      render(<SyncExecutor />);

      // SyncSplitButton mock 中 loading=true 时显示 "同步中..."
      expect(screen.getByText("同步中...")).toBeInTheDocument();
      expect(screen.getByText("同步中...")).toBeDisabled();
    });
  });

  describe("交互", () => {
    it("点击同步按钮展示摘要面板，确认后调用 executePush", async () => {
      // 重置为默认 idle 状态（上一个测试可能设置了 syncing）
      vi.mocked(useSyncStore).mockReturnValue({
        targets: [{ id: "t1", name: "项目A", path: "/tmp/a", enabled: true }],
        selectedSkillIds: ["s1", "s2"],
        syncStatus: "idle",
        syncResult: null,
        diffReport: null,
        executePush: mockExecutePush,
        executeDiff: mockExecuteDiff,
        setSyncStatus: mockSetSyncStatus,
        setSyncResult: mockSetSyncResult,
        setDiffReport: mockSetDiffReport,
      } as unknown as ReturnType<typeof useSyncStore>);

      const user = userEvent.setup();
      mockExecutePush.mockResolvedValue({
        total: 1,
        success: 1,
        updated: 0,
        overwritten: 0,
        skipped: 0,
        failed: 0,
        details: [],
      });

      render(<SyncExecutor />);

      // Step 1: 点击同步按钮 → 展示摘要面板
      await user.click(screen.getByText("开始同步"));

      // Step 2: 摘要面板应该出现
      expect(screen.getByTestId("sync-summary-panel")).toBeInTheDocument();

      // Step 3: 点击确认同步 → 调用 executePush
      await user.click(screen.getByText("确认同步"));

      expect(mockExecutePush).toHaveBeenCalledOnce();
    });

    it("点击清除结果调用 setSyncStatus、setSyncResult 和 setDiffReport", async () => {
      const user = userEvent.setup();
      vi.mocked(useSyncStore).mockReturnValue({
        targets: [{ id: "t1", name: "A", path: "/tmp", enabled: true }],
        selectedSkillIds: ["s1"],
        syncStatus: "done",
        syncResult: {
          total: 1,
          success: 1,
          updated: 0,
          overwritten: 0,
          skipped: 0,
          failed: 0,
          details: [
            {
              skillId: "s1",
              skillName: "Skill A",
              targetPath: "/tmp/a.md",
              status: "success",
            },
          ],
        },
        diffReport: null,
        executePush: mockExecutePush,
        executeDiff: mockExecuteDiff,
        setSyncStatus: mockSetSyncStatus,
        setSyncResult: mockSetSyncResult,
        setDiffReport: mockSetDiffReport,
      } as unknown as ReturnType<typeof useSyncStore>);

      render(<SyncExecutor />);

      await user.click(screen.getByText("清除结果"));

      expect(mockSetSyncStatus).toHaveBeenCalledWith("idle");
      expect(mockSetSyncResult).toHaveBeenCalledWith(null);
      expect(mockSetDiffReport).toHaveBeenCalledWith(null);
    });
  });
});
