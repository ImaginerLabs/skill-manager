import { render, screen } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it } from "vitest";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../src/components/ui/select";

describe("Select", () => {
  it("渲染 SelectTrigger", async () => {
    await act(async () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );
    });
    expect(screen.getByTestId("trigger")).toBeInTheDocument();
  });

  it("显示 placeholder 文本", async () => {
    await act(async () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );
    });
    expect(screen.getByText("请选择")).toBeInTheDocument();
  });

  it("SelectTrigger 支持 className 扩展", async () => {
    await act(async () => {
      render(
        <Select>
          <SelectTrigger className="custom-trigger" data-testid="trigger">
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );
    });
    expect(screen.getByTestId("trigger").className).toContain("custom-trigger");
  });

  it("SelectTrigger 包含暗色主题样式", async () => {
    await act(async () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );
    });
    const trigger = screen.getByTestId("trigger");
    expect(trigger.className).toContain("rounded-md");
    expect(trigger.className).toContain("border");
  });

  it("disabled 状态下不可交互", async () => {
    await act(async () => {
      render(
        <Select disabled>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="请选择" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">选项 A</SelectItem>
          </SelectContent>
        </Select>,
      );
    });
    expect(screen.getByTestId("trigger")).toBeDisabled();
  });
});
