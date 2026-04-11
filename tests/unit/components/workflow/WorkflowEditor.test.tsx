import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock stores
const mockSetWorkflowName = vi.fn();
const mockSetWorkflowDescription = vi.fn();
const mockReset = vi.fn();

vi.mock("../../../../src/stores/workflow-store", () => ({
  useWorkflowStore: vi.fn(() => ({
    workflowName: "",
    workflowDescription: "",
    steps: [],
    setWorkflowName: mockSetWorkflowName,
    setWorkflowDescription: mockSetWorkflowDescription,
    reset: mockReset,
  })),
}));

vi.mock("../../../../src/stores/skill-store", () => ({
  useSkillStore: vi.fn(() => ({
    skills: [],
    loading: false,
    fetchSkills: vi.fn(),
  })),
}));

import WorkflowEditor from "../../../../src/components/workflow/WorkflowEditor";
import { useWorkflowStore } from "../../../../src/stores/workflow-store";

describe("WorkflowEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("渲染", () => {
    it("渲染工作流名称和描述输入框", () => {
      render(<WorkflowEditor />);

      expect(screen.getByLabelText("工作流名称")).toBeInTheDocument();
      expect(screen.getByLabelText("工作流描述")).toBeInTheDocument();
    });

    it("渲染搜索框（SkillSelector）", () => {
      render(<WorkflowEditor />);

      expect(screen.getByPlaceholderText("搜索 Skill...")).toBeInTheDocument();
    });

    it("渲染空状态引导（StepList）", () => {
      render(<WorkflowEditor />);

      expect(screen.getByText("开始编排工作流")).toBeInTheDocument();
    });

    it("无步骤时不显示重置按钮", () => {
      render(<WorkflowEditor />);

      expect(screen.queryByLabelText("重置工作流")).not.toBeInTheDocument();
    });
  });

  describe("交互", () => {
    it("输入工作流名称", async () => {
      const user = userEvent.setup();
      render(<WorkflowEditor />);

      const nameInput = screen.getByLabelText("工作流名称");
      await user.type(nameInput, "测试工作流");

      expect(mockSetWorkflowName).toHaveBeenCalled();
    });

    it("输入工作流描述", async () => {
      const user = userEvent.setup();
      render(<WorkflowEditor />);

      const descInput = screen.getByLabelText("工作流描述");
      await user.type(descInput, "这是一个测试");

      expect(mockSetWorkflowDescription).toHaveBeenCalled();
    });

    it("有步骤时显示步骤计数和重置按钮", () => {
      vi.mocked(useWorkflowStore).mockReturnValue({
        workflowName: "测试",
        workflowDescription: "",
        steps: [
          {
            order: 1,
            skillId: "s1",
            skillName: "Skill 1",
            description: "",
          },
        ],
        setWorkflowName: mockSetWorkflowName,
        setWorkflowDescription: mockSetWorkflowDescription,
        reset: mockReset,
      } as ReturnType<typeof useWorkflowStore>);

      render(<WorkflowEditor />);

      expect(screen.getByText("已添加 1 个步骤")).toBeInTheDocument();
      expect(screen.getByLabelText("重置工作流")).toBeInTheDocument();
    });

    it("点击重置按钮调用 reset", async () => {
      const user = userEvent.setup();
      vi.mocked(useWorkflowStore).mockReturnValue({
        workflowName: "测试",
        workflowDescription: "",
        steps: [
          {
            order: 1,
            skillId: "s1",
            skillName: "Skill 1",
            description: "",
          },
        ],
        setWorkflowName: mockSetWorkflowName,
        setWorkflowDescription: mockSetWorkflowDescription,
        reset: mockReset,
      } as ReturnType<typeof useWorkflowStore>);

      render(<WorkflowEditor />);

      const resetButton = screen.getByLabelText("重置工作流");
      await user.click(resetButton);

      expect(mockReset).toHaveBeenCalled();
    });
  });
});
