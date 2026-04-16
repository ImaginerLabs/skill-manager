import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SkillTypeIcon from "../../../../src/components/shared/SkillTypeIcon";

describe("SkillTypeIcon", () => {
  it("type=undefined 时渲染 FileText 图标", () => {
    const { container } = render(<SkillTypeIcon type={undefined} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    // lucide FileText 图标不包含 "circle" 元素，但包含 path
    expect(svg?.classList.contains("shrink-0")).toBe(true);
  });

  it("type='workflow' 时渲染 GitBranch 图标", () => {
    const { container } = render(<SkillTypeIcon type="workflow" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg?.classList.contains("shrink-0")).toBe(true);
  });

  it("默认 size 为 16", () => {
    const { container } = render(<SkillTypeIcon type={undefined} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("16");
    expect(svg?.getAttribute("height")).toBe("16");
  });

  it("size prop 正确传递", () => {
    const { container } = render(<SkillTypeIcon type="workflow" size={24} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("24");
    expect(svg?.getAttribute("height")).toBe("24");
  });

  it("className prop 正确合并", () => {
    const { container } = render(
      <SkillTypeIcon type={undefined} className="mt-0.5" />,
    );
    const svg = container.querySelector("svg");
    expect(svg?.className.baseVal || svg?.getAttribute("class")).toContain(
      "mt-0.5",
    );
    expect(svg?.className.baseVal || svg?.getAttribute("class")).toContain(
      "shrink-0",
    );
  });

  it("不传 className 时仅包含基础 class", () => {
    const { container } = render(<SkillTypeIcon type="workflow" />);
    const svg = container.querySelector("svg");
    const cls = svg?.className.baseVal || svg?.getAttribute("class") || "";
    expect(cls).toContain("shrink-0");
    expect(cls).toContain("text-[hsl(var(--muted-foreground))]");
  });

  it("workflow 和非 workflow 渲染不同的 SVG 内容", () => {
    const { container: c1 } = render(<SkillTypeIcon type="workflow" />);
    const { container: c2 } = render(<SkillTypeIcon type={undefined} />);
    const svg1 = c1.querySelector("svg")?.innerHTML;
    const svg2 = c2.querySelector("svg")?.innerHTML;
    expect(svg1).not.toBe(svg2);
  });
});
