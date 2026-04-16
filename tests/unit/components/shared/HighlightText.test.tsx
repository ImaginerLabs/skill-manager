// ============================================================
// tests/unit/components/shared/HighlightText.test.tsx
// Story 9.2: 搜索关键词高亮 — HighlightText 组件单元测试
// ============================================================

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HighlightText from "../../../../src/components/shared/HighlightText";

describe("HighlightText", () => {
  describe("空查询", () => {
    it("query 为空字符串时返回纯文本", () => {
      render(<HighlightText text="Hello World" query="" />);
      expect(screen.getByText("Hello World")).toBeInTheDocument();
      expect(screen.queryByRole("mark")).not.toBeInTheDocument();
    });

    it("query 为空格时返回纯文本", () => {
      render(<HighlightText text="Hello World" query="   " />);
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });
  });

  describe("单关键词高亮", () => {
    it("匹配的关键词被 mark 标签包裹", () => {
      const { container } = render(
        <HighlightText text="Hello World" query="World" />,
      );
      const marks = container.querySelectorAll("mark");
      expect(marks).toHaveLength(1);
      expect(marks[0].textContent).toBe("World");
    });

    it("高亮样式正确", () => {
      const { container } = render(
        <HighlightText text="Hello World" query="World" />,
      );
      const mark = container.querySelector("mark");
      expect(mark?.className).toContain("bg-green-500/20");
      expect(mark?.className).toContain("text-green-400");
    });

    it("部分匹配也高亮（如搜索 view 匹配 review）", () => {
      const { container } = render(
        <HighlightText text="code review tool" query="view" />,
      );
      const marks = container.querySelectorAll("mark");
      expect(marks).toHaveLength(1);
      expect(marks[0].textContent).toBe("view");
    });
  });

  describe("大小写不敏感", () => {
    it("大小写不同也能匹配", () => {
      const { container } = render(
        <HighlightText text="Hello WORLD" query="world" />,
      );
      const marks = container.querySelectorAll("mark");
      expect(marks).toHaveLength(1);
      expect(marks[0].textContent).toBe("WORLD");
    });

    it("混合大小写匹配", () => {
      const { container } = render(
        <HighlightText text="JavaScript is great" query="javascript" />,
      );
      const marks = container.querySelectorAll("mark");
      expect(marks).toHaveLength(1);
      expect(marks[0].textContent).toBe("JavaScript");
    });
  });

  describe("多关键词高亮", () => {
    it("空格分隔的多个关键词分别高亮", () => {
      const { container } = render(
        <HighlightText text="Hello World Foo" query="Hello Foo" />,
      );
      const marks = container.querySelectorAll("mark");
      expect(marks).toHaveLength(2);
      expect(marks[0].textContent).toBe("Hello");
      expect(marks[1].textContent).toBe("Foo");
    });

    it("多个关键词在同一文本中多次出现", () => {
      const { container } = render(
        <HighlightText text="abc def abc" query="abc" />,
      );
      const marks = container.querySelectorAll("mark");
      expect(marks).toHaveLength(2);
    });
  });

  describe("特殊字符安全", () => {
    it("正则特殊字符被正确转义", () => {
      const { container } = render(
        <HighlightText text="price is $100 (USD)" query="$100" />,
      );
      const marks = container.querySelectorAll("mark");
      expect(marks).toHaveLength(1);
      expect(marks[0].textContent).toBe("$100");
    });

    it("包含括号的关键词", () => {
      const { container } = render(
        <HighlightText text="call foo(bar)" query="foo(" />,
      );
      const marks = container.querySelectorAll("mark");
      expect(marks).toHaveLength(1);
      expect(marks[0].textContent).toBe("foo(");
    });

    it("包含点号的关键词", () => {
      const { container } = render(
        <HighlightText text="file.txt is here" query="file.txt" />,
      );
      const marks = container.querySelectorAll("mark");
      expect(marks).toHaveLength(1);
      expect(marks[0].textContent).toBe("file.txt");
    });
  });

  describe("超长关键词截断", () => {
    it("超过 50 字符的关键词被截断", () => {
      const longKeyword = "a".repeat(60);
      const text = "a".repeat(50) + "bbb";
      const { container } = render(
        <HighlightText text={text} query={longKeyword} />,
      );
      // 截断后的关键词（50个a）应该匹配文本开头的50个a
      const marks = container.querySelectorAll("mark");
      expect(marks).toHaveLength(1);
      expect(marks[0].textContent).toBe("a".repeat(50));
    });
  });

  describe("className 传递", () => {
    it("className 正确传递到容器 span", () => {
      const { container } = render(
        <HighlightText text="Hello" query="" className="custom-class" />,
      );
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  describe("无匹配", () => {
    it("关键词不在文本中时无 mark 标签", () => {
      const { container } = render(
        <HighlightText text="Hello World" query="xyz" />,
      );
      expect(container.querySelectorAll("mark")).toHaveLength(0);
      expect(container.textContent).toBe("Hello World");
    });
  });
});
