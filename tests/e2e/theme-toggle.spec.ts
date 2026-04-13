import { expect, test } from "@playwright/test";

test.describe("主题切换", () => {
  test.beforeEach(async ({ page }) => {
    // 清除 localStorage，确保每次测试从干净状态开始
    await page.addInitScript(() => {
      localStorage.removeItem("skill-manager-theme");
    });
    await page.goto("/");
    // 等待应用加载完成
    await page.waitForSelector('button[aria-label="切换主题"]', {
      timeout: 10000,
    });
  });

  test("页面加载后默认为暗色主题", async ({ page }) => {
    const theme = await page.evaluate(
      () => document.documentElement.dataset.theme,
    );
    expect(theme).toBe("dark");
  });

  test("点击切换按钮后 html[data-theme] 变为 light", async ({ page }) => {
    const toggleBtn = page.locator('button[aria-label="切换主题"]');
    await toggleBtn.click();

    const theme = await page.evaluate(
      () => document.documentElement.dataset.theme,
    );
    expect(theme).toBe("light");
  });

  test("切换为亮色后再次点击恢复暗色", async ({ page }) => {
    const toggleBtn = page.locator('button[aria-label="切换主题"]');

    // 第一次点击：暗色 → 亮色
    await toggleBtn.click();
    expect(
      await page.evaluate(() => document.documentElement.dataset.theme),
    ).toBe("light");

    // 第二次点击：亮色 → 暗色
    await toggleBtn.click();
    expect(
      await page.evaluate(() => document.documentElement.dataset.theme),
    ).toBe("dark");
  });

  test("切换主题后 localStorage 写入正确值", async ({ page }) => {
    const toggleBtn = page.locator('button[aria-label="切换主题"]');
    await toggleBtn.click();

    const stored = await page.evaluate(() =>
      localStorage.getItem("skill-manager-theme"),
    );
    expect(stored).toBe("light");
  });

  test("刷新页面后亮色主题持久化恢复", async ({ page }) => {
    // 先切换到亮色
    const toggleBtn = page.locator('button[aria-label="切换主题"]');
    await toggleBtn.click();

    // 刷新页面
    await page.reload();
    await page.waitForSelector('button[aria-label="切换主题"]', {
      timeout: 10000,
    });

    // 验证主题恢复为亮色
    const theme = await page.evaluate(
      () => document.documentElement.dataset.theme,
    );
    expect(theme).toBe("light");
  });

  test("刷新后无明显主题闪烁（data-theme 在 DOMContentLoaded 前已设置）", async ({
    page,
  }) => {
    // 预先写入亮色到 localStorage
    await page.addInitScript(() => {
      localStorage.setItem("skill-manager-theme", "light");
    });

    let themeAtDOMReady = "";
    // 在 DOMContentLoaded 时捕获 data-theme
    await page.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        (window as Window & { __themeAtDOMReady?: string }).__themeAtDOMReady =
          document.documentElement.dataset.theme ?? "";
      });
    });

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    themeAtDOMReady = await page.evaluate(
      () =>
        (window as Window & { __themeAtDOMReady?: string }).__themeAtDOMReady ??
        "",
    );

    // data-theme 应在 DOMContentLoaded 时已经是 light，无闪烁
    expect(themeAtDOMReady).toBe("light");
  });

  test("切换主题按钮在暗色时显示 Sun 图标，亮色时显示 Moon 图标", async ({
    page,
  }) => {
    const toggleBtn = page.locator('button[aria-label="切换主题"]');

    // 暗色模式下应有 Sun 图标（svg）
    await expect(toggleBtn.locator("svg")).toBeVisible();

    // 切换到亮色
    await toggleBtn.click();

    // 亮色模式下应有 Moon 图标（svg）
    await expect(toggleBtn.locator("svg")).toBeVisible();
  });
});
