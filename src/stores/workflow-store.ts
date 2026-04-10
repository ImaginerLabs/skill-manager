// ============================================================
// stores/workflow-store.ts — 工作流编排状态
// ============================================================

import { create } from "zustand";
import type { WorkflowStep } from "../../shared/types";

export interface WorkflowStore {
  steps: WorkflowStep[];
  workflowName: string;
  workflowDescription: string;
  // actions
  addStep: (skillId: string, skillName: string) => void;
  removeStep: (index: number) => void;
  reorderSteps: (from: number, to: number) => void;
  updateStepDescription: (index: number, desc: string) => void;
  setWorkflowName: (name: string) => void;
  setWorkflowDescription: (desc: string) => void;
  reset: () => void;
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  steps: [],
  workflowName: "",
  workflowDescription: "",

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

  reset: () => set({ steps: [], workflowName: "", workflowDescription: "" }),
}));
