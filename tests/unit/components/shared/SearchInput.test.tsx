// ============================================================
// tests/unit/components/shared/SearchInput.test.tsx — SearchInput 组件测试
// ============================================================

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createI18nMock } from "../../../helpers/i18n-mock";

vi.mock("react-i18next", () => createI18nMock());

import SearchInput from "../../../../src/components/shared/SearchInput";

describe("SearchInput", () => {
  it("渲染输入框并使用默认 placeholder", () => {
    render(<SearchInput value="" onChange={vi.fn()} />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "搜索");
  });

  it("使用自定义 placeholder", () => {
    render(
      <SearchInput value="" onChange={vi.fn()} placeholder="查找 Skill" />,
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("placeholder", "查找 Skill");
  });

  it("传入 value 时显示清空按钮", () => {
    render(<SearchInput value="test" onChange={vi.fn()} />);
    const clearBtn = screen.getByRole("button", { name: "关闭" });
    expect(clearBtn).toBeInTheDocument();
  });

  it("空 value 时不显示清空按钮", () => {
    render(<SearchInput value="" onChange={vi.fn()} />);
    const clearBtn = screen.queryByRole("button", { name: "关闭" });
    expect(clearBtn).not.toBeInTheDocument();
  });

  it("点击清空按钮调用 onChange('')", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="test" onChange={onChange} />);

    const clearBtn = screen.getByRole("button", { name: "关闭" });
    await user.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("输入时调用 onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "a");
    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("支持 data-testid", () => {
    render(<SearchInput value="" onChange={vi.fn()} data-testid="my-search" />);
    expect(screen.getByTestId("my-search")).toBeInTheDocument();
  });
});
