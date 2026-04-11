import { render, screen } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it } from "vitest";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../src/components/ui/tooltip";

describe("Tooltip", () => {
  it("渲染 trigger 元素", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button>悬停我</button>
          </TooltipTrigger>
          <TooltipContent>
            <p>提示内容</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    expect(screen.getByText("悬停我")).toBeInTheDocument();
  });

  it("trigger 可聚焦", async () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button>悬停我</button>
          </TooltipTrigger>
          <TooltipContent>
            <p>提示内容</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    const trigger = screen.getByText("悬停我");
    await act(async () => {
      trigger.focus();
    });
    expect(trigger).toHaveFocus();
  });

  it("TooltipProvider 包裹不影响子元素渲染", () => {
    render(
      <TooltipProvider>
        <div data-testid="child">子元素</div>
      </TooltipProvider>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
