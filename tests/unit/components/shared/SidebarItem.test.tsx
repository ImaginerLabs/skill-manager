// ============================================================
// tests/unit/components/shared/SidebarItem.test.tsx — SidebarItem 组件测试
// ============================================================

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SidebarItem from "../../../../src/components/shared/SidebarItem";

describe("SidebarItem", () => {
  it("渲染 label 文本", () => {
    render(<SidebarItem label="全部" />);
    expect(screen.getByText("全部")).toBeInTheDocument();
  });

  it("渲染 icon", () => {
    render(
      <SidebarItem label="分类" icon={<span data-testid="icon">🔹</span>} />,
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("渲染 badge", () => {
    render(
      <SidebarItem label="编码" badge={<span data-testid="badge">12</span>} />,
    );
    expect(screen.getByTestId("badge")).toBeInTheDocument();
  });

  it("active=true 时应用 primary 色和 font-semibold", () => {
    render(<SidebarItem label="Active" active data-testid="item" />);
    const btn = screen.getByTestId("item");
    expect(btn.className).toContain("font-semibold");
    expect(btn.className).toContain("border-[hsl(var(--primary))]");
  });

  it("active=false 时应用 border-transparent", () => {
    render(<SidebarItem label="Inactive" active={false} data-testid="item" />);
    const btn = screen.getByTestId("item");
    expect(btn.className).toContain("border-transparent");
  });

  it("state=disabled 时应用 opacity-50 和 pointer-events-none", () => {
    render(
      <SidebarItem label="Disabled" state="disabled" data-testid="item" />,
    );
    const btn = screen.getByTestId("item");
    expect(btn.className).toContain("opacity-50");
    expect(btn.className).toContain("pointer-events-none");
  });

  it("点击时触发 onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SidebarItem label="Click me" onClick={onClick} />);

    await user.click(screen.getByText("Click me"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("支持 aria 属性", () => {
    render(
      <SidebarItem
        label="Accessible"
        role="option"
        aria-selected={true}
        aria-label="Accessible item"
        data-testid="item"
      />,
    );
    const btn = screen.getByTestId("item");
    expect(btn).toHaveAttribute("role", "option");
    expect(btn).toHaveAttribute("aria-selected", "true");
    expect(btn).toHaveAttribute("aria-label", "Accessible item");
  });

  it("合并额外 className", () => {
    render(
      <SidebarItem label="Custom" className="my-custom" data-testid="item" />,
    );
    const btn = screen.getByTestId("item");
    expect(btn.className).toContain("my-custom");
  });
});
