// ============================================================
// stores/workflow-store.ts — 工作流编排状态
// ============================================================

import { create } from "zustand";
import type { WorkflowStep } from "../../shared/types";

const DRAFT_KEY = "workflow-draft";

/** 向后兼容：为缺少 type 字段的步骤补全 */
function normalizeSteps(steps: WorkflowStep[]): WorkflowStep[] {
  return steps.map((step) => ({
    ...step,
    type:
      step.type === "skill" || step.type === "custom"
        ? step.type
        : step.skillId
          ? ("skill" as const)
          : ("custom" as const),
  }));
}

interface WorkflowDraft {
  steps: WorkflowStep[];
  workflowName: string;
  workflowDescription: string;
  editingWorkflowId: string | null;
}

/** 从 localStorage 读取草稿（含归一化） */
function loadDraft(): Partial<WorkflowDraft> {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return {};
    const draft = JSON.parse(raw) as WorkflowDraft;
    // 归一化 steps，防止旧版草稿缺少 type 字段导致后端校验失败
    if (Array.isArray(draft.steps)) {
      draft.steps = normalizeSteps(draft.steps);
    }
    return draft;
  } catch {
    // 草稿损坏时静默丢弃
    localStorage.removeItem(DRAFT_KEY);
    return {};
  }
}

/** 将草稿写入 localStorage */
function saveDraft(draft: WorkflowDraft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // 忽略存储失败（如隐私模式）
  }
}

/** 清除 localStorage 草稿 */
function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

export interface WorkflowStore {
  steps: WorkflowStep[];
  workflowName: string;
  workflowDescription: string;
  /** 编辑模式：正在编辑的工作流 ID（null 表示新建模式） */
  editingWorkflowId: string | null;
  // actions
  addStep: (skillId: string, skillName: string) => void;
  /** 添加自定义步骤（type: 'custom'，skillId/skillName 为 null） */
  addCustomStep: () => void;
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

const draft = loadDraft();

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  steps: draft.steps ?? [],
  workflowName: draft.workflowName ?? "",
  workflowDescription: draft.workflowDescription ?? "",
  editingWorkflowId: draft.editingWorkflowId ?? null,

  addStep: (skillId, skillName) =>
    set((state) => {
      const steps = [
        ...state.steps,
        {
          order: state.steps.length + 1,
          skillId,
          skillName,
          description: "",
          type: "skill" as const,
        },
      ];
      saveDraft({
        steps,
        workflowName: state.workflowName,
        workflowDescription: state.workflowDescription,
        editingWorkflowId: state.editingWorkflowId,
      });
      return { steps };
    }),

  addCustomStep: () =>
    set((state) => {
      const steps = [
        ...state.steps,
        {
          order: state.steps.length + 1,
          skillId: null,
          skillName: null,
          description: "",
          type: "custom" as const,
        },
      ];
      saveDraft({
        steps,
        workflowName: state.workflowName,
        workflowDescription: state.workflowDescription,
        editingWorkflowId: state.editingWorkflowId,
      });
      return { steps };
    }),

  removeStep: (index) =>
    set((state) => {
      const steps = state.steps
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, order: i + 1 }));
      saveDraft({
        steps,
        workflowName: state.workflowName,
        workflowDescription: state.workflowDescription,
        editingWorkflowId: state.editingWorkflowId,
      });
      return { steps };
    }),

  reorderSteps: (from, to) =>
    set((state) => {
      const newSteps = [...state.steps];
      const [moved] = newSteps.splice(from, 1);
      newSteps.splice(to, 0, moved);
      const steps = newSteps.map((step, i) => ({ ...step, order: i + 1 }));
      saveDraft({
        steps,
        workflowName: state.workflowName,
        workflowDescription: state.workflowDescription,
        editingWorkflowId: state.editingWorkflowId,
      });
      return { steps };
    }),

  updateStepDescription: (index, desc) =>
    set((state) => {
      const steps = state.steps.map((step, i) =>
        i === index ? { ...step, description: desc } : step,
      );
      saveDraft({
        steps,
        workflowName: state.workflowName,
        workflowDescription: state.workflowDescription,
        editingWorkflowId: state.editingWorkflowId,
      });
      return { steps };
    }),

  setWorkflowName: (name) =>
    set((state) => {
      saveDraft({
        steps: state.steps,
        workflowName: name,
        workflowDescription: state.workflowDescription,
        editingWorkflowId: state.editingWorkflowId,
      });
      return { workflowName: name };
    }),

  setWorkflowDescription: (desc) =>
    set((state) => {
      saveDraft({
        steps: state.steps,
        workflowName: state.workflowName,
        workflowDescription: desc,
        editingWorkflowId: state.editingWorkflowId,
      });
      return { workflowDescription: desc };
    }),

  loadWorkflow: (id, name, description, steps) => {
    const normalizedSteps = normalizeSteps(steps);
    saveDraft({
      editingWorkflowId: id,
      workflowName: name,
      workflowDescription: description,
      steps: normalizedSteps,
    });
    set({
      editingWorkflowId: id,
      workflowName: name,
      workflowDescription: description,
      steps: normalizedSteps,
    });
  },

  reset: () => {
    clearDraft();
    set({
      steps: [],
      workflowName: "",
      workflowDescription: "",
      editingWorkflowId: null,
    });
  },
}));
