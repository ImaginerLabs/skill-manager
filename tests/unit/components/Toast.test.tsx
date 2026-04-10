import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ToastContainer, { toast } from "../../../src/components/shared/Toast";

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    // 先推进所有定时器让 toast 自动消失
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    cleanup();
    vi.useRealTimers();
  });

  describe("toast 函数", () => {
    it("创建 success toast", () => {
      render(<ToastContainer />);

      act(() => {
        toast.success("操作成功");
      });

      expect(screen.getByText("操作成功")).toBeInTheDocument();
    });

    it("创建 error toast", () => {
      render(<ToastContainer />);

      act(() => {
        toast.error("操作失败");
      });

      expect(screen.getByText("操作失败")).toBeInTheDocument();
    });

    it("创建 info toast", () => {
      render(<ToastContainer />);

      act(() => {
        toast.info("提示信息");
      });

      expect(screen.getByText("提示信息")).toBeInTheDocument();
    });

    it("最大堆叠 3 个 toast", () => {
      render(<ToastContainer />);

      act(() => {
        toast.success("消息 1");
        toast.success("消息 2");
        toast.success("消息 3");
        toast.success("消息 4");
      });

      // 最多显示 3 个（最新的 3 个）
      const alerts = screen.getAllByRole("alert");
      expect(alerts.length).toBeLessThanOrEqual(3);
    });

    it("自动消失（success 默认 4000ms）", () => {
      render(<ToastContainer />);

      act(() => {
        toast.success("自动消失");
      });

      expect(screen.getByText("自动消失")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(4100);
      });

      expect(screen.queryByText("自动消失")).not.toBeInTheDocument();
    });

    it("error toast 持续更长时间（8000ms）", () => {
      render(<ToastContainer />);

      act(() => {
        toast.error("错误消息");
      });

      act(() => {
        vi.advanceTimersByTime(4100);
      });

      // 4 秒后 error toast 仍然存在
      expect(screen.getByText("错误消息")).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(4100);
      });

      // 8 秒后消失
      expect(screen.queryByText("错误消息")).not.toBeInTheDocument();
    });
  });

  describe("dismissToast", () => {
    it("手动关闭 toast", () => {
      render(<ToastContainer />);

      act(() => {
        toast.success("可关闭的消息");
      });

      expect(screen.getByText("可关闭的消息")).toBeInTheDocument();

      // 点击关闭按钮（可能有多个 toast 残留，取第一个）
      const closeButtons = screen.getAllByLabelText("关闭通知");
      fireEvent.click(closeButtons[0]);

      expect(screen.queryByText("可关闭的消息")).not.toBeInTheDocument();
    });
  });

  describe("Toast 详情", () => {
    it("显示「查看详情」按钮", () => {
      render(<ToastContainer />);

      act(() => {
        toast.error("错误", { details: "详细错误信息" });
      });

      expect(screen.getByText("查看详情")).toBeInTheDocument();
    });

    it("点击「查看详情」展开详情", () => {
      render(<ToastContainer />);

      act(() => {
        toast.error("错误详情测试", { details: "详细错误信息内容" });
      });

      const detailButtons = screen.getAllByText("查看详情");
      fireEvent.click(detailButtons[detailButtons.length - 1]);

      expect(screen.getByText("详细错误信息内容")).toBeInTheDocument();
    });
  });

  describe("无障碍", () => {
    it("容器有正确的 ARIA 属性", () => {
      render(<ToastContainer />);

      act(() => {
        toast.success("测试");
      });

      const region = screen.getByRole("region");
      expect(region).toHaveAttribute("aria-label", "通知");
      expect(region).toHaveAttribute("aria-live", "polite");
    });

    it("每个 toast 有 alert role", () => {
      render(<ToastContainer />);

      act(() => {
        toast.success("alert角色测试");
      });

      const alerts = screen.getAllByRole("alert");
      expect(alerts.length).toBeGreaterThanOrEqual(1);
    });

    it("关闭按钮有 aria-label", () => {
      render(<ToastContainer />);

      act(() => {
        toast.success("aria测试");
      });

      const closeButtons = screen.getAllByLabelText("关闭通知");
      expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("空状态", () => {
    it("无 toast 时不渲染任何内容", () => {
      const { container } = render(<ToastContainer />);
      expect(container.innerHTML).toBe("");
    });
  });
});
