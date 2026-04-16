// ============================================================
// tests/unit/components/skills/EmptyState.test.tsx — EmptyState 组件测试
// ============================================================

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createI18nMock } from "../../../helpers/i18n-mock";

vi.mock("react-i18next", () => createI18nMock());

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  Link: ({
    children,
    to,
    ...rest
  }: {
    children: React.ReactNode;
    to: string;
    className?: string;
  }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

import EmptyState from "../../../../src/components/skills/EmptyState";

describe("EmptyState", () => {
  describe("向后兼容（旧接口）", () => {
    it("hasSkills=false 显示引导性空状态（noSkill）", () => {
      render(<EmptyState hasSkills={false} />);
      expect(screen.getByText("暂无 Skill")).toBeInTheDocument();
      expect(screen.getByText("从 IDE 导入 Skill 文件")).toBeInTheDocument();
    });

    it("hasSkills=true + isCategoryEmpty=false 显示无搜索结果（noResult）", () => {
      render(<EmptyState hasSkills={true} isCategoryEmpty={false} />);
      expect(screen.getByText("暂无 Skill")).toBeInTheDocument();
    });

    it("hasSkills=true + isCategoryEmpty=true 显示分类为空（emptyCategory）", () => {
      render(<EmptyState hasSkills={true} isCategoryEmpty={true} />);
      expect(screen.getByText("该分类下暂无 Skill")).toBeInTheDocument();
    });
  });

  describe("variant 接口", () => {
    it("variant=noSkill 渲染引导性空状态", () => {
      render(<EmptyState variant="noSkill" data-testid="empty" />);
      expect(screen.getByTestId("empty")).toBeInTheDocument();
      expect(screen.getByText("暂无 Skill")).toBeInTheDocument();
    });

    it("variant=noResult 渲染无结果提示", () => {
      render(<EmptyState variant="noResult" />);
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });

    it("variant=emptyCategory 渲染分类为空", () => {
      render(<EmptyState variant="emptyCategory" />);
      expect(screen.getByTestId("empty-state-category")).toBeInTheDocument();
      expect(screen.getByText("该分类下暂无 Skill")).toBeInTheDocument();
    });

    it("variant=custom 渲染自定义内容", () => {
      render(
        <EmptyState
          variant="custom"
          title="No Data"
          description="Nothing here"
          data-testid="custom-empty"
        />,
      );
      expect(screen.getByTestId("custom-empty")).toBeInTheDocument();
      expect(screen.getByText("No Data")).toBeInTheDocument();
      expect(screen.getByText("Nothing here")).toBeInTheDocument();
    });

    it("variant=custom 支持 action 按钮", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <EmptyState
          variant="custom"
          title="Empty"
          action={{ label: "Add Item", onClick }}
        />,
      );

      await user.click(screen.getByText("Add Item"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("variant=custom 无 title/description/action 时渲染空容器", () => {
      render(<EmptyState variant="custom" data-testid="minimal" />);
      expect(screen.getByTestId("minimal")).toBeInTheDocument();
    });

    it("variant=custom 支持自定义 icon", () => {
      render(
        <EmptyState
          variant="custom"
          icon={<span data-testid="custom-icon">🎯</span>}
        />,
      );
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });
  });
});
