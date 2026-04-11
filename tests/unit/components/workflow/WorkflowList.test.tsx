import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock API
vi.mock("../../../../src/lib/api", () => ({
  fetchWorkflows: vi.fn(() => Promise.resolve([])),
  fetchSkillById: vi.fn(),
  deleteWorkflow: vi.fn(),
}));

// Mock stores
const mockLoadWorkflow = vi.fn();
const mockFetchSkills = vi.fn();

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

  describe("交互", () => {
    it("点击删除按钮弹出确认对话框", async () => {
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

      expect(screen.getByText("确认删除工作流")).toBeInTheDocument();
      expect(
        screen.getByText("确定要删除工作流「测试工作流」吗？此操作不可撤销。"),
      ).toBeInTheDocument();
    });
  });
});
