// ============================================================
// tests/unit/components/skills/SkillContextMenu.test.tsx — SkillContextMenu 单元测试
// ============================================================

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SkillContextMenu from "../../../../src/components/skills/SkillContextMenu";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "skill.editMeta": "编辑元数据",
        "skill.syncToIDE": "同步到 IDE",
        "skill.copyPath": "复制路径",
        "skill.pathCopied": "路径已复制",
        "common.delete": "删除",
      };
      return map[key] ?? key;
    },
    i18n: { language: "zh", changeLanguage: vi.fn() },
  }),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock sync-store
const mockToggleSkillSelection = vi.fn();
vi.mock("../../../../src/stores/sync-store", () => ({
  useSyncStore: vi.fn(() => ({
    toggleSkillSelection: mockToggleSkillSelection,
  })),
}));

// Mock toast-store
vi.mock("../../../../src/components/shared/toast-store", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("SkillContextMenu", () => {
  const defaultProps = {
    skillId: "skill-1",
    skillName: "Test Skill",
    skillPath: "coding/skill-1.md",
    isReadonly: false,
    onEditMeta: vi.fn(),
    onDelete: vi.fn(),
  };

  it("渲染 children 内容", () => {
    render(
      <SkillContextMenu {...defaultProps}>
        <button>Test Button</button>
      </SkillContextMenu>,
    );
    expect(screen.getByText("Test Button")).toBeInTheDocument();
  });

  it("右键点击后显示上下文菜单", async () => {
    const user = userEvent.setup();
    render(
      <SkillContextMenu {...defaultProps}>
        <button>Test Button</button>
      </SkillContextMenu>,
    );

    await user.pointer({
      keys: "[MouseRight]",
      target: screen.getByText("Test Button"),
    });

    expect(screen.getByText("编辑元数据")).toBeInTheDocument();
    expect(screen.getByText("同步到 IDE")).toBeInTheDocument();
    expect(screen.getByText("复制路径")).toBeInTheDocument();
    expect(screen.getByText("删除")).toBeInTheDocument();
  });

  it("只读 Skill 隐藏编辑和删除菜单项", async () => {
    const user = userEvent.setup();
    render(
      <SkillContextMenu {...defaultProps} isReadonly={true}>
        <button>Test Button</button>
      </SkillContextMenu>,
    );

    await user.pointer({
      keys: "[MouseRight]",
      target: screen.getByText("Test Button"),
    });

    expect(screen.queryByText("编辑元数据")).not.toBeInTheDocument();
    expect(screen.queryByText("删除")).not.toBeInTheDocument();
    expect(screen.getByText("同步到 IDE")).toBeInTheDocument();
    expect(screen.getByText("复制路径")).toBeInTheDocument();
  });

  it("无 onEditMeta 回调时隐藏编辑菜单项", async () => {
    const user = userEvent.setup();
    render(
      <SkillContextMenu {...defaultProps} onEditMeta={undefined}>
        <button>Test Button</button>
      </SkillContextMenu>,
    );

    await user.pointer({
      keys: "[MouseRight]",
      target: screen.getByText("Test Button"),
    });

    expect(screen.queryByText("编辑元数据")).not.toBeInTheDocument();
  });
});
