import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock toast-store — 使用 vi.hoisted 避免提升问题
const { mockUndoable, mockSuccess, mockError } = vi.hoisted(() => ({
  mockUndoable: vi.fn(),
  mockSuccess: vi.fn(),
  mockError: vi.fn(),
}));

vi.mock("../../../../src/components/shared/toast-store", () => {
  const toastFn = vi.fn();
  toastFn.success = mockSuccess;
  toastFn.error = mockError;
  toastFn.info = vi.fn();
  toastFn.undoable = mockUndoable;
  return {
    toast: toastFn,
    dismissToast: vi.fn(),
  };
});

// Mock API
vi.mock("../../../../src/lib/api", () => ({
  fetchWorkflows: vi.fn(() => Promise.resolve([])),
  fetchWorkflowDetail: vi.fn(),
  deleteWorkflow: vi.fn(),
}));

// Mock stores
const { mockLoadWorkflow, mockFetchSkills } = vi.hoisted(() => ({
  mockLoadWorkflow: vi.fn(),
  mockFetchSkills: vi.fn(),
}));

vi.mock("../../../../src/stores/workflow-store", () => ({
  useWorkflowStore: vi.fn(() => ({
    loadWorkflow: mockLoadWorkflow,
  })),
}));

vi.mock("../../../../src/stores/skill-store", () => ({
  useSkillStore: Object.assign(
    vi.fn(() => ({
      fetchSkills: mockFetchSkills,
    })),
    {
      getState: vi.fn(() => ({
        skills: [],
      })),
    },
  ),
}));

import WorkflowList from "../../../../src/components/workflow/WorkflowList";
import { fetchWorkflows } from "../../../../src/lib/api";

describe("WorkflowList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("渲染", () => {
    it("无工作流时不渲染列表内容", async () => {
      vi.mocked(fetchWorkflows).mockResolvedValue([]);
      render(<WorkflowList />);

      // 等待加载完成
      await vi.waitFor(() => {
        expect(fetchWorkflows).toHaveBeenCalled();
      });

      // 等待 loading 状态消失
      await vi.waitFor(() => {
        expect(screen.queryByText("加载中...")).not.toBeInTheDocument();
      });

      // 无工作流时不显示列表标题
      expect(screen.queryByText(/已有工作流/)).not.toBeInTheDocument();
    });

    it("有工作流时渲染列表", async () => {
      vi.mocked(fetchWorkflows).mockResolvedValue([
        {
          id: "wf-1",
          name: "代码审查工作流",
          description: "自动化审查",
          filePath: "workflows/code-review.md",
        },
      ]);

      render(<WorkflowList />);

      await vi.waitFor(() => {
        expect(screen.getByText("代码审查工作流")).toBeInTheDocument();
      });

      expect(screen.getByText("自动化审查")).toBeInTheDocument();
      expect(screen.getByText("已有工作流 (1)")).toBeInTheDocument();
    });
  });

  describe("删除（撤销功能）", () => {
    it("点击删除按钮后立即从列表中移除并显示撤销 Toast", async () => {
      const user = userEvent.setup();
      vi.mocked(fetchWorkflows).mockResolvedValue([
        {
          id: "wf-1",
          name: "测试工作流",
          description: "",
          filePath: "workflows/test.md",
        },
        {
          id: "wf-2",
          name: "另一个工作流",
          description: "",
          filePath: "workflows/another.md",
        },
      ]);

      render(<WorkflowList />);

      await vi.waitFor(() => {
        expect(screen.getByText("测试工作流")).toBeInTheDocument();
      });

      const deleteBtn = screen.getByLabelText("删除 测试工作流");
      await user.click(deleteBtn);

      // 工作流应立即从列表中消失（乐观删除）
      expect(screen.queryByText("测试工作流")).not.toBeInTheDocument();
      // 另一个工作流仍在
      expect(screen.getByText("另一个工作流")).toBeInTheDocument();

      // 应调用 toast.undoable
      expect(mockUndoable).toHaveBeenCalledWith(
        "工作流「测试工作流」已删除",
        expect.any(Function), // onConfirm
        expect.any(Function), // onUndo
        5000,
      );
    });

    it("撤销时恢复列表项", async () => {
      const user = userEvent.setup();
      vi.mocked(fetchWorkflows).mockResolvedValue([
        {
          id: "wf-1",
          name: "测试工作流",
          description: "描述",
          filePath: "workflows/test.md",
        },
        {
          id: "wf-2",
          name: "保留工作流",
          description: "",
          filePath: "workflows/keep.md",
        },
      ]);

      const { rerender } = render(<WorkflowList />);

      await vi.waitFor(() => {
        expect(screen.getByText("测试工作流")).toBeInTheDocument();
      });

      const deleteBtn = screen.getByLabelText("删除 测试工作流");
      await user.click(deleteBtn);

      // 乐观移除
      expect(screen.queryByText("测试工作流")).not.toBeInTheDocument();
      // 另一个仍在，组件未卸载
      expect(screen.getByText("保留工作流")).toBeInTheDocument();

      // 模拟撤销：调用 onUndo 回调
      const onUndo = mockUndoable.mock.calls[0][2];
      act(() => {
        onUndo();
      });

      // 工作流应恢复到列表中
      expect(screen.getByText("测试工作流")).toBeInTheDocument();
      expect(mockSuccess).toHaveBeenCalledWith(
        "已撤销删除工作流「测试工作流」",
      );
    });

    it("不显示 AlertDialog 确认对话框", async () => {
      const user = userEvent.setup();
      vi.mocked(fetchWorkflows).mockResolvedValue([
        {
          id: "wf-1",
          name: "测试工作流",
          description: "",
          filePath: "workflows/test.md",
        },
      ]);

      render(<WorkflowList />);

      await vi.waitFor(() => {
        expect(screen.getByText("测试工作流")).toBeInTheDocument();
      });

      const deleteBtn = screen.getByLabelText("删除 测试工作流");
      await user.click(deleteBtn);

      // 不应出现确认对话框
      expect(screen.queryByText("确认删除工作流")).not.toBeInTheDocument();
    });
  });
});
