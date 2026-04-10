/**
 * 测试辅助工具函数
 */

import { Page } from "@playwright/test";

/**
 * 等待元素出现
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout = 5000,
) {
  await page.waitForSelector(selector, { timeout });
}

/**
 * 点击元素（使用 data-testid）
 */
export async function clickByTestId(page: Page, testId: string) {
  await page.click(`[data-testid="${testId}"]`);
}

/**
 * 获取元素文本（使用 data-testid）
 */
export async function getTextByTestId(
  page: Page,
  testId: string,
): Promise<string> {
  return (await page.textContent(`[data-testid="${testId}"]`)) || "";
}

/**
 * 填写表单字段（使用 data-testid）
 */
export async function fillByTestId(page: Page, testId: string, value: string) {
  await page.fill(`[data-testid="${testId}"]`, value);
}

/**
 * 检查元素是否可见
 */
export async function isVisible(
  page: Page,
  selector: string,
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout: 1000, state: "visible" });
    return true;
  } catch {
    return false;
  }
}

/**
 * 截图辅助（带时间戳）
 */
export async function takeScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  await page.screenshot({
    path: `test-results/screenshots/${name}-${timestamp}.png`,
  });
}

/**
 * 模拟网络延迟
 */
export async function simulateNetworkDelay(page: Page, delayMs: number) {
  await page.route("**/*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    route.continue();
  });
}

/**
 * 拦截 API 请求
 */
export async function interceptApi(page: Page, url: string, response: any) {
  await page.route(url, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(response),
    });
  });
}

/**
 * 清除本地存储
 */
export async function clearLocalStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

/**
 * 设置本地存储
 */
export async function setLocalStorage(page: Page, key: string, value: any) {
  await page.evaluate(
    ({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    { key, value },
  );
}

/**
 * 获取本地存储
 */
export async function getLocalStorage(page: Page, key: string): Promise<any> {
  return await page.evaluate((key) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }, key);
}
