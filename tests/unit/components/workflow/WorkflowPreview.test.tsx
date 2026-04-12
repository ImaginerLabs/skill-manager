import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock API
const mockPreviewWorkflow = vi.fn();
const mockCreateWorkflow = vi.fn();
const mockUpdateWorkflow = vi.fn();

vi.mock("../../../../src/lib/api", () => ({
  previewWorkflow: (...args: unknown[]) => mockPreviewWorkflow(...args),
  createWorkflow: (...args: unknown[]) => mockCreateWorkflow(...args),
  updateWorkflow: (...args: unknown[]) => mockUpdateWorkflow(...args),
}));

// Mock toast
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock("../../../../src/components/shared/toast-store", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

// Mock stores
const mockReset = vi.fn();
const mockFetchSkills = vi.fn();

const defaultWorkflowStore = {
  workflowName: "",
  workflowDescription: "",
  steps: [],
  editingWorkflowId: null,
  reset: mockReset,
};

let currentWorkflowStore = { ...defaultWorkflowStore };

vi.mock("../../../../src/stores/workflow-store", () => ({
  useWorkflowStore: vi.fn(() => currentWorkflowStore),
}));

vi.mock("../../../../src/stores/skill-store", () => ({
  useSkillStore: vi.fn(() => ({
    fetchSkills: mockFetchSkills,
  })),
}));

import WorkflowPreview from "../../../../src/components/workflow/WorkflowPreview";

const sampleSteps = [
  { order: 1, skillId: "s1", skillName: "代码审查", description: "执行审查" },
  { order: 2, skillId: "s2", skillName: "测试覆盖", description: "" },
];

describe("WorkflowPreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentWorkflowStore = { ...defaultWorkflowStore };
    mockFetchSkills.mockResolvedValue(undefined);
  });

  describe("渲染", () => {
    it("渲染预览和生成按钮", () => {
      render(<WorkflowPreview />);

      expect(screen.getByText("预览")).toBeInTheDocument();
      expect(screen.getByText("生成工作流")).toBeInTheDocument();
    });

    it("无名称和步骤时按钮禁用", () => {
      render(<WorkflowPreview />);

      const previewBtn = screen.getByText("预览").closest("button")!;
      const saveBtn = screen.getByText("生成工作流").closest("button")!;

      expect(previewBtn).toBeDisabled();
      expect(saveBtn).toBeDisabled();
    });

    it("有名称但无步骤时按钮禁用", () => {
      currentWorkflowStore = {
        ...defaultWorkflowStore,
        workflowName: "测试工作流",
      };

      render(<WorkflowPreview />);

      const previewBtn = screen.getByText("预览").closest("button")!;
      expect(previewBtn).toBeDisabled();
    });

    it("有步骤但无名称时按钮禁用", () => {
      currentWorkflowStore = {
        ...defaultWorkflowStore,
        steps: sampleSteps,
      };

      render(<WorkflowPreview />);

      const previewBtn = screen.getByText("预览").closest("button")!;
      expect(previewBtn).toBeDisabled();
    });

    it("有名称和步骤时按钮启用", () => {
      currentWorkflowStore = {
        ...defaultWorkflowStore,
        workflowName: "测试工作流",
        steps: sampleSteps,
      };

      render(<WorkflowPreview />);

      const previewBtn = screen.getByText("预览").closest("button")!;
      const saveBtn = screen.getByText("生成工作流").closest("button")!;

      expect(previewBtn).not.toBeDisabled();
      expect(saveBtn).not.toBeDisabled();
    });

    it("编辑模式下显示更新按钮和编辑提示", () => {
      currentWorkflowStore = {
        ...defaultWorkflowStore,
        workflowName: "已有工作流",
        steps: sampleSteps,
        editingWorkflowId: "wf-1",
      };

      render(<WorkflowPreview />);

      expect(screen.getByText("更新工作流")).toBeInTheDocument();
      expect(screen.getByText("正在编辑：已有工作流")).toBeInTheDocument();
    });

    it("新建模式下不显示编辑提示", () => {
      currentWorkflowStore = {
        ...defaultWorkflowStore,
        workflowName: "新工作流",
        steps: sampleSteps,
      };

      render(<WorkflowPreview />);

      expect(screen.getByText("生成工作流")).toBeInTheDocument();
      expect(screen.queryByText(/正在编辑/)).not.toBeInTheDocument();
    });
  });

  describe("预览功能", () => {
    it("点击预览按钮调用 API 并显示预览内容", async () => {
      const user = userEvent.setup();
      currentWorkflowStore = {
        ...defaultWorkflowStore,
        workflowName: "测试工作流",
        workflowDescription: "描述",
        steps: sampleSteps,
      };
      mockPreviewWorkflow.mockResolvedValue({
        content: "---\nname: 测试工作流\n---\n## Step 1",
      });

      render(<WorkflowPreview />);

      const previewBtn = screen.getByText("预览").closest("button")!;
      await user.click(previewBtn);

      expect(mockPreviewWorkflow).toHaveBeenCalledWith({
        name: "测试工作流",
        description: "描述",
        steps: sampleSteps,
      });

      await vi.waitFor(() => {
        // 验证预览区域中包含预览内容
        expect(document.querySelector("pre")?.textContent).toContain(
          "测试工作流",
        );
      });

      // 预览标题栏显示文件名
      expect(screen.getByText(/预览：/)).toBeInTheDocument();
    });

    it("预览失败时显示错误 Toast", async () => {
      const user = userEvent.setup();
      currentWorkflowStore = {
        ...defaultWorkflowStore,
        workflowName: "测试",
        steps: sampleSteps,
      };
      mockPreviewWorkflow.mockRejectedValue(new Error("网络错误"));

      render(<WorkflowPreview />);

      const previewBtn = screen.getByText("预览").closest("button")!;
      await user.click(previewBtn);

      await vi.waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("网络错误");
      });
    });

    it("预览失败（非 Error 对象）时显示默认错误消息", async () => {
      const user = userEvent.setup();
      currentWorkflowStore = {
        ...defaultWorkflowStore,
        workflowName: "测试",
        steps: sampleSteps,
      };
      mockPreviewWorkflow.mockRejectedValue("unknown error");

      render(<WorkflowPreview />);

      const previewBtn = screen.getByText("预览").closest("button")!;
      await user.click(previewBtn);

      await vi.waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("预览生成失败");
      });
    });

    it("点击关闭按钮隐藏预览内容", async () => {
      const user = userEvent.setup();
      currentWorkflowStore = {
        ...defaultWorkflowStore,
        workflowName: "测试",
        steps: sampleSteps,
      };
      mockPreviewWorkflow.mockResolvedValue({ content: "预览内容" });

      render(<WorkflowPreview />);

      // 先打开预览
      const previewBtn = screen.getByText("预览").closest("button")!;
      await user.click(previewBtn);

      await vi.waitFor(() => {
        expect(screen.getByText("预览内容")).toBeInTheDocument();
      });

      // 点击关闭
      const closeBtn = screen.getByText("关闭");
      await user.click(closeBtn);

      expect(screen.queryByText("预览内容")).not.toBeInTheDocument();
    });
  });

  describe("保存功能 — 新建模式", () => {
    it("点击生成按钮调用 createWorkflow 并显示成功 Toast", async () => {
      const user = userEvent.setup();
      currentWorkflowStore = {
        ...defaultWorkflowStore,
        workflowName: "新工作流",
        workflowDescription: "新描述",
        steps: sampleSteps,
      };
      mockCreateWorkflow.mockResolvedValue({
        id: "new-wf",
        filePath: "workflows/new.md",
      });

      render(<WorkflowPreview />);

      const saveBtn = screen.getByText("生成工作流").closest("button")!;
      await user.click(saveBtn);

      expect(mockCreateWorkflow).toHaveBeenCalledWith({
        name: "新工作流",
        description: "新描述",
        steps: sampleSteps,
      });

      await vi.waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith("工作流创建成功！");
      });

      expect(mockFetchSkills).toHaveBeenCalled();
      expect(mockReset).toHaveBeenCalled();
    });

    it("新建失败时显示错误 Toast", async () => {
      const user = userEvent.setup();
      currentWorkflowStore = {
        ...defaultWorkflowStore,
        workflowName: "新工作流",
        steps: sampleSteps,
      };
      mockCreateWorkflow.mockRejectedValue(new Error("创建失败"));

      render(<WorkflowPreview />);

      const saveBtn = screen.getByText("生成工作流").closest("button")!;
      await user.click(saveBtn);

      await vi.waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("创建失败");
      });

      // 失败时不应调用 reset
      expect(mockReset).not.toHaveBeenCalled();
    });
  });

  describe("保存功能 — 编辑模式", () => {
    it("点击更新按钮调用 updateWorkflow 并显示成功 Toast", async () => {
      const user = userEvent.setup();
      currentWorkflowStore = {
        ...defaultWorkflowStore,
        workflowName: "已有工作流",
        workflowDescription: "更新描述",
        steps: sampleSteps,
        editingWorkflowId: "wf-existing",
      };
      mockUpdateWorkflow.mockResolvedValue({
        id: "wf-existing",
        filePath: "workflows/existing.md",
      });

      render(<WorkflowPreview />);

      const saveBtn = screen.getByText("更新工作流").closest("button")!;
      await user.click(saveBtn);

      expect(mockUpdateWorkflow).toHaveBeenCalledWith("wf-existing", {
        name: "已有工作流",
        description: "更新描述",
        steps: sampleSteps,
      });

      await vi.waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith("工作流更新成功！");
      });

      expect(mockFetchSkills).toHaveBeenCalled();
      expect(mockReset).toHaveBeenCalled();
    });

    it("更新失败时显示错误 Toast", async () => {
      const user = userEvent.setup();
      currentWorkflowStore = {
        ...defaultWorkflowStore,
        workflowName: "已有工作流",
        steps: sampleSteps,
        editingWorkflowId: "wf-existing",
      };
      mockUpdateWorkflow.mockRejectedValue(new Error("更新失败"));

      render(<WorkflowPreview />);

      const saveBtn = screen.getByText("更新工作流").closest("button")!;
      await user.click(saveBtn);

      await vi.waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("更新失败");
      });

      expect(mockReset).not.toHaveBeenCalled();
    });

    it("保存失败（非 Error 对象）时显示默认错误消息", async () => {
      const user = userEvent.setup();
      currentWorkflowStore = {
        ...defaultWorkflowStore,
        workflowName: "工作流",
        steps: sampleSteps,
      };
      mockCreateWorkflow.mockRejectedValue(42);

      render(<WorkflowPreview />);

      const saveBtn = screen.getByText("生成工作流").closest("button")!;
      await user.click(saveBtn);

      await vi.waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("工作流保存失败");
      });
    });
  });
});
