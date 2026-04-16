// ============================================================
// tests/unit/components/import/ScanPathInput.test.tsx — 扫描路径输入组件测试
// ============================================================

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { PathPreset } from "../../../../shared/types";
import { ScanPathInput } from "../../../../src/pages/import/ScanPathInput";

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

// Mock PathPresetSelect 组件（避免 shadcn Select 在 jsdom 中的兼容性问题）
vi.mock("../../../../src/components/shared/PathPresetSelect", () => ({
  PathPresetSelect: ({
    presets,
    onSelect,
  }: {
    presets: { id: string; path: string; label?: string }[];
    onSelect: (preset: { id: string; path: string; label?: string }) => void;
  }) => {
    if (presets.length === 0) return null;
    return (
      <select
        data-testid="preset-select"
        title="从预设选择"
        onChange={(e) => {
          if (e.target.value) {
            const selected = presets.find((p) => p.path === e.target.value);
            if (selected) onSelect(selected);
          }
        }}
      >
        <option value="">从预设选择</option>
        {presets.map((p) => (
          <option key={p.id} value={p.path}>
            {p.label ? `${p.label} (${p.path})` : p.path}
          </option>
        ))}
      </select>
    );
  },
}));

const mockPresets: PathPreset[] = [
  { id: "p1", path: "/Users/alex/projects", label: "我的项目" },
  { id: "p2", path: "/Users/alex/backup" },
];

const defaultProps = {
  scanPath: "",
  scanState: { status: "idle" as const },
  pathPresets: [],
  onScanPathChange: vi.fn(),
  onScan: vi.fn(),
};

describe("ScanPathInput", () => {
  // ----------------------------------------------------------------
  // 渲染
  // ----------------------------------------------------------------
  describe("渲染", () => {
    it("渲染路径输入框和扫描按钮", () => {
      render(<ScanPathInput {...defaultProps} />);

      expect(screen.getByLabelText("扫描路径")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /搜索/ })).toBeInTheDocument();
    });

    it("无预设时不渲染预设下拉", () => {
      render(<ScanPathInput {...defaultProps} pathPresets={[]} />);

      expect(screen.queryByTestId("preset-select")).not.toBeInTheDocument();
    });

    it("有预设时渲染预设下拉", () => {
      render(<ScanPathInput {...defaultProps} pathPresets={mockPresets} />);

      expect(screen.getByTestId("preset-select")).toBeInTheDocument();
    });

    it("预设下拉包含所有预设选项", () => {
      render(<ScanPathInput {...defaultProps} pathPresets={mockPresets} />);

      // 有备注的预设显示 "备注 (路径)" 格式
      expect(
        screen.getByText("我的项目 (/Users/alex/projects)"),
      ).toBeInTheDocument();
      // 无备注的预设直接显示路径
      expect(screen.getByText("/Users/alex/backup")).toBeInTheDocument();
    });

    it("显示当前 scanPath 值", () => {
      render(<ScanPathInput {...defaultProps} scanPath="/current/path" />);

      expect(screen.getByDisplayValue("/current/path")).toBeInTheDocument();
    });

    it("扫描中时按钮显示「加载中...」并禁用", () => {
      render(
        <ScanPathInput {...defaultProps} scanState={{ status: "loading" }} />,
      );

      expect(screen.getByText("加载中...")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /加载中/ })).toBeDisabled();
    });

    it("非扫描中时按钮显示「搜索」且可点击", () => {
      render(<ScanPathInput {...defaultProps} />);

      const btn = screen.getByRole("button", { name: /^搜索$/ });
      expect(btn).not.toBeDisabled();
    });
  });

  // ----------------------------------------------------------------
  // 交互
  // ----------------------------------------------------------------
  describe("交互", () => {
    it("修改路径输入框时调用 onScanPathChange", async () => {
      const user = userEvent.setup();
      const onScanPathChange = vi.fn();

      render(
        <ScanPathInput {...defaultProps} onScanPathChange={onScanPathChange} />,
      );

      await user.type(screen.getByLabelText("扫描路径"), "/new/path");

      expect(onScanPathChange).toHaveBeenCalled();
    });

    it("点击扫描按钮调用 onScan", async () => {
      const user = userEvent.setup();
      const onScan = vi.fn();

      render(<ScanPathInput {...defaultProps} onScan={onScan} />);

      await user.click(screen.getByRole("button", { name: /^搜索$/ }));

      expect(onScan).toHaveBeenCalledOnce();
    });

    it("从预设下拉选择路径后调用 onScanPathChange", async () => {
      const user = userEvent.setup();
      const onScanPathChange = vi.fn();

      render(
        <ScanPathInput
          {...defaultProps}
          pathPresets={mockPresets}
          onScanPathChange={onScanPathChange}
        />,
      );

      const select = screen.getByTestId("preset-select");
      await user.selectOptions(select, "/Users/alex/projects");

      expect(onScanPathChange).toHaveBeenCalledWith("/Users/alex/projects");
    });

    it("选择无备注的预设路径后调用 onScanPathChange", async () => {
      const user = userEvent.setup();
      const onScanPathChange = vi.fn();

      render(
        <ScanPathInput
          {...defaultProps}
          pathPresets={mockPresets}
          onScanPathChange={onScanPathChange}
        />,
      );

      const select = screen.getByTestId("preset-select");
      await user.selectOptions(select, "/Users/alex/backup");

      expect(onScanPathChange).toHaveBeenCalledWith("/Users/alex/backup");
    });

    it("扫描中时点击扫描按钮不触发 onScan（按钮禁用）", async () => {
      const user = userEvent.setup();
      const onScan = vi.fn();

      render(
        <ScanPathInput
          {...defaultProps}
          scanState={{ status: "loading" }}
          onScan={onScan}
        />,
      );

      const btn = screen.getByRole("button", { name: /加载中/ });
      await user.click(btn);

      expect(onScan).not.toHaveBeenCalled();
    });
  });
});
