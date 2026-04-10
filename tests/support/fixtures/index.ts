/**
 * 测试夹具索引文件
 * 使用 mergeTests 组合所有夹具，提供统一的测试环境设置
 */

import { test as base } from "@playwright/test";

/**
 * 基础测试夹具
 * 提供所有测试共用的环境设置
 */
export const test = base.extend({
  // 自动清理：每个测试后重置状态
  page: async ({ page }, use) => {
    // 测试前设置
    await page.goto("/");

    // 执行测试
    await use(page);

    // 测试后清理（可选的截图或日志）
  },

  // API 客户端夹具（用于 API 测试）
  apiClient: async ({ request }, use) => {
    const baseUrl = process.env.API_URL || "http://localhost:3001";
    await use({
      get: (path: string) => request.get(`${baseUrl}${path}`),
      post: (path: string, data: any) =>
        request.post(`${baseUrl}${path}`, { data }),
      put: (path: string, data: any) =>
        request.put(`${baseUrl}${path}`, { data }),
      delete: (path: string) => request.delete(`${baseUrl}${path}`),
    });
  },
});

/**
 * 导出标准断言
 */
export { expect } from "@playwright/test";

/**
 * 导出合并函数（用于组合多个夹具）
 */
export const mergeTests = (...tests: any[]) => {
  return tests.reduce((acc, test) => {
    return Object.assign(acc, test);
  }, test);
};
