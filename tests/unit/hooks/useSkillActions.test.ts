// ============================================================
// tests/unit/hooks/useSkillActions.test.ts — useSkillActions Hook 测试
// ============================================================

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createI18nMock } from "../../helpers/i18n-mock";

// ── 使用 vi.hoisted ──
const { mockDeleteSkill, mockFetchSkills, mockToastSuccess, mockToastError } =
  vi.hoisted(() => ({
    mockDeleteSkill: vi.fn(),
    mockFetchSkills: vi.fn(),
    mockToastSuccess: vi.fn(),
    mockToastError: vi.fn(),
  }));

// ── Mock 依赖 ──
vi.mock("react-i18next", () => createI18nMock());

vi.mock("../../../src/lib/api", () => ({
  deleteSkill: mockDeleteSkill,
}));

vi.mock("../../../src/stores/skill-store", () => ({
  useSkillStore: () => ({
    fetchSkills: mockFetchSkills,
  }),
}));

vi.mock("../../../src/components/shared/toast-store", () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

import { useSkillActions } from "../../../src/hooks/useSkillActions";

describe("useSkillActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteSkill.mockResolvedValue(undefined);
    mockFetchSkills.mockResolvedValue(undefined);
  });

  it("初始状态：open=false, target=null", () => {
    const { result } = renderHook(() => useSkillActions());
    expect(result.current.confirmState.open).toBe(false);
    expect(result.current.confirmState.target).toBeNull();
  });

  it("requestDelete 设置 open=true 和 target", () => {
    const { result } = renderHook(() => useSkillActions());

    act(() => {
      result.current.requestDelete({ id: "1", name: "Test Skill" });
    });

    expect(result.current.confirmState.open).toBe(true);
    expect(result.current.confirmState.target).toEqual({
      id: "1",
      name: "Test Skill",
    });
  });

  it("handleConfirmDelete 调用 deleteSkill 并刷新列表", async () => {
    const { result } = renderHook(() => useSkillActions());

    act(() => {
      result.current.requestDelete({ id: "1", name: "Test Skill" });
    });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(mockDeleteSkill).toHaveBeenCalledWith("1");
    expect(mockFetchSkills).toHaveBeenCalled();
    expect(mockToastSuccess).toHaveBeenCalled();
    expect(result.current.confirmState.open).toBe(false);
  });

  it("handleConfirmDelete 失败时显示错误 toast", async () => {
    mockDeleteSkill.mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useSkillActions());

    act(() => {
      result.current.requestDelete({ id: "1", name: "Test Skill" });
    });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(mockToastError).toHaveBeenCalled();
    expect(result.current.confirmState.open).toBe(false);
  });

  it("handleCancelDelete 关闭对话框不调用 API", () => {
    const { result } = renderHook(() => useSkillActions());

    act(() => {
      result.current.requestDelete({ id: "1", name: "Test Skill" });
    });

    act(() => {
      result.current.handleCancelDelete();
    });

    expect(mockDeleteSkill).not.toHaveBeenCalled();
    expect(result.current.confirmState.open).toBe(false);
  });
});
