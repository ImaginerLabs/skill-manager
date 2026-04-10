import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createPathValidator,
  validatePathParam,
} from "../../../../server/middleware/pathValidator";

// 辅助函数：创建 mock request
function createMockReq(
  params: Record<string, string> = {},
  body: Record<string, unknown> = {},
): Partial<Request> {
  return { params, body };
}

// 辅助函数：创建 mock response
function createMockRes(): Partial<Response> {
  return {};
}

describe("pathValidator", () => {
  describe("validatePathParam", () => {
    it("正常路径通过校验", () => {
      expect(
        validatePathParam("/project/skills/coding/test.md", [
          "/project/skills",
        ]),
      ).toBe(true);
    });

    it("../路径被拒绝", () => {
      expect(
        validatePathParam("../../../etc/passwd", ["/project/skills"]),
      ).toBe(false);
    });

    it("..\\路径被拒绝", () => {
      expect(
        validatePathParam("..\\..\\etc\\passwd", ["/project/skills"]),
      ).toBe(false);
    });

    it("URL 编码的 %2e%2e%2f 路径被拒绝", () => {
      expect(
        validatePathParam("%2e%2e%2f%2e%2e%2fetc%2fpasswd", [
          "/project/skills",
        ]),
      ).toBe(false);
    });

    it("白名单目录内的路径通过", () => {
      expect(
        validatePathParam("/project/skills/coding/test.md", [
          "/project/skills",
          "/project/config",
        ]),
      ).toBe(true);
    });

    it("白名单目录外的路径被拒绝", () => {
      expect(validatePathParam("/etc/passwd", ["/project/skills"])).toBe(false);
    });

    it("空白名单时只检查遍历模式", () => {
      expect(validatePathParam("/any/path/file.md", [])).toBe(true);
      expect(validatePathParam("../escape", [])).toBe(false);
    });

    it("无效 URL 编码被拒绝", () => {
      expect(validatePathParam("%ZZ%invalid", ["/project/skills"])).toBe(false);
    });

    it("路径中间包含 .. 段被拒绝", () => {
      expect(
        validatePathParam("/project/skills/../../../etc/passwd", [
          "/project/skills",
        ]),
      ).toBe(false);
    });
  });

  describe("createPathValidator", () => {
    let next: NextFunction;

    beforeEach(() => {
      next = vi.fn();
    });

    it("正常请求通过中间件", () => {
      const middleware = createPathValidator(["/project/skills"]);
      const req = createMockReq({ id: "my-skill" });
      const res = createMockRes();

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it("params 中包含 ../ 的请求被拒绝", () => {
      const middleware = createPathValidator(["/project/skills"]);
      const req = createMockReq({ id: "../../../etc/passwd" });
      const res = createMockRes();

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "PATH_TRAVERSAL",
        }),
      );
    });

    it("params 中包含 URL 编码遍历的请求被拒绝", () => {
      const middleware = createPathValidator(["/project/skills"]);
      const req = createMockReq({ id: "%2e%2e%2fetc%2fpasswd" });
      const res = createMockRes();

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "PATH_TRAVERSAL",
        }),
      );
    });

    it("body 中 path 字段包含遍历路径被拒绝", () => {
      const middleware = createPathValidator(["/project/skills"]);
      const req = createMockReq({}, { path: "../../../etc/passwd" });
      const res = createMockRes();

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "PATH_TRAVERSAL",
        }),
      );
    });

    it("body 中 filePath 字段包含遍历路径被拒绝", () => {
      const middleware = createPathValidator(["/project/skills"]);
      const req = createMockReq({}, { filePath: "/etc/passwd" });
      const res = createMockRes();

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "PATH_TRAVERSAL",
        }),
      );
    });

    it("body 中 targetPath 字段包含白名单外路径被拒绝", () => {
      const middleware = createPathValidator(["/project/skills"]);
      const req = createMockReq({}, { targetPath: "/other/directory/file.md" });
      const res = createMockRes();

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "PATH_TRAVERSAL",
        }),
      );
    });

    it("body 中合法路径通过", () => {
      const middleware = createPathValidator(["/project/skills"]);
      const req = createMockReq(
        {},
        { filePath: "/project/skills/coding/test.md" },
      );
      const res = createMockRes();

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it("无 body 的请求正常通过", () => {
      const middleware = createPathValidator(["/project/skills"]);
      const req = createMockReq({ id: "my-skill" });
      (req as Record<string, unknown>).body = undefined;
      const res = createMockRes();

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it("空 params 的请求正常通过", () => {
      const middleware = createPathValidator(["/project/skills"]);
      const req = createMockReq({}, {});
      const res = createMockRes();

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });

    it("多个白名单目录支持", () => {
      const middleware = createPathValidator([
        "/project/skills",
        "/project/config",
      ]);
      const req = createMockReq(
        {},
        { filePath: "/project/config/settings.yaml" },
      );
      const res = createMockRes();

      middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith();
    });
  });
});
