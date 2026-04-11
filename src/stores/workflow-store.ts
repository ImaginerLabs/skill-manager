// ============================================================
// stores/workflow-store.ts — 工作流编排状态
// ============================================================

import { create } from "zustand";
import type { WorkflowStep } from "../../shared/types";

export interface WorkflowStore {
  steps: WorkflowStep[];
  workflowName: string;
  workflowDescription: string;
  /** 编辑模式：正在编辑的工作流 ID（null 表示新建模式） */
  editingWorkflowId: string | null;
  // actions
  addStep: (skillId: string, skillName: string) => void;
  removeStep: (index: number) => void;
  reorderSteps: (from: number, to: number) => void;
  updateStepDescription: (index: number, desc: string) => void;
  setWorkflowName: (name: string) => void;
  setWorkflowDescription: (desc: string) => void;
  /** 加载已有工作流到编排器（编辑模式） */
  loadWorkflow: (
    id: string,
    name: string,
    description: string,
    steps: WorkflowStep[],
  ) => void;
  reset: () => void;
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  steps: [],
  workflowName: "",
  workflowDescription: "",
  editingWorkflowId: null,

  addStep: (skillId, skillName) =>
    set((state) => ({
      steps: [
        ...state.steps,
        {
          order: state.steps.length + 1,
          skillId,
          skillName,
          description: "",
        },
      ],
    })),

  removeStep: (index) =>
    set((state) => ({
      steps: state.steps
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, order: i + 1 })),
    })),

  reorderSteps: (from, to) =>
    set((state) => {
      const newSteps = [...state.steps];
      const [moved] = newSteps.splice(from, 1);
      newSteps.splice(to, 0, moved);
      return {
        steps: newSteps.map((step, i) => ({ ...step, order: i + 1 })),
      };
    }),

  updateStepDescription: (index, desc) =>
    set((state) => ({
      steps: state.steps.map((step, i) =>
        i === index ? { ...step, description: desc } : step,
      ),
    })),

  setWorkflowName: (name) => set({ workflowName: name }),
  setWorkflowDescription: (desc) => set({ workflowDescription: desc }),

  loadWorkflow: (id, name, description, steps) =>
    set({
      editingWorkflowId: id,
      workflowName: name,
      workflowDescription: description,
      steps,
    }),

  reset: () =>
    set({
      steps: [],
      workflowName: "",
      workflowDescription: "",
      editingWorkflowId: null,
    }),
}));
