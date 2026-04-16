// ============================================================
// tests/unit/hooks/usePreviewMode.test.ts
// Story 9.1: 预览面板智能推拉式 — usePreviewMode Hook 单元测试
// ============================================================

import { describe, expect, it } from "vitest";
import { getPreviewMode } from "../../../src/hooks/usePreviewMode";

describe("getPreviewMode", () => {
  describe("Wide 断点（≥1440px）", () => {
    it("1440px 返回 always", () => {
      expect(getPreviewMode(1440)).toBe("always");
    });

    it("1920px 返回 always", () => {
      expect(getPreviewMode(1920)).toBe("always");
    });

    it("2560px 返回 always", () => {
      expect(getPreviewMode(2560)).toBe("always");
    });
  });

  describe("Standard 断点（1024-1439px）", () => {
    it("1024px 返回 push", () => {
      expect(getPreviewMode(1024)).toBe("push");
    });

    it("1200px 返回 push", () => {
      expect(getPreviewMode(1200)).toBe("push");
    });

    it("1439px 返回 push", () => {
      expect(getPreviewMode(1439)).toBe("push");
    });
  });

  describe("Compact 断点（<1024px）", () => {
    it("1023px 返回 overlay", () => {
      expect(getPreviewMode(1023)).toBe("overlay");
    });

    it("768px 返回 overlay", () => {
      expect(getPreviewMode(768)).toBe("overlay");
    });

    it("320px 返回 overlay", () => {
      expect(getPreviewMode(320)).toBe("overlay");
    });

    it("0px 返回 overlay", () => {
      expect(getPreviewMode(0)).toBe("overlay");
    });
  });

  describe("边界值", () => {
    it("1023 → overlay, 1024 → push 边界", () => {
      expect(getPreviewMode(1023)).toBe("overlay");
      expect(getPreviewMode(1024)).toBe("push");
    });

    it("1439 → push, 1440 → always 边界", () => {
      expect(getPreviewMode(1439)).toBe("push");
      expect(getPreviewMode(1440)).toBe("always");
    });
  });
});
