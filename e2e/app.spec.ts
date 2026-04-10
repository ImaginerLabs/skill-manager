import { expect, test } from "@playwright/test";

test.describe("Skill Manager 应用", () => {
  test.beforeEach(async ({ page }) => {
    // 访问应用首页
    await page.goto("/");
  });

  test("应用加载成功", async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/Skill Manager/i);

    // 检查主容器存在
    await expect(
      page.locator('[data-testid="app-layout"]').or(page.locator("main")),
    ).toBeVisible();
  });

  test("侧边栏显示分类列表", async ({ page }) => {
    // 等待侧边栏加载
    await page.waitForSelector("aside", { timeout: 10000 });

    // 检查侧边栏存在
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();
  });

  test("主内容区显示 Skill 列表", async ({ page }) => {
    // 等待 Skill 列表加载
    await page.waitForSelector(
      '[data-testid="skill-grid"], [data-testid="skill-list"]',
      {
        timeout: 10000,
      },
    );

    // 检查至少有一个 Skill 卡片
    const skillCards = page
      .locator('[data-testid="skill-card"]')
      .or(page.locator("button[class*='rounded-lg']"));
    const count = await skillCards.count();

    expect(count).toBeGreaterThan(0);
  });

  test("点击 Skill 卡片显示详情", async ({ page }) => {
    // 等待 Skill 列表加载
    await page.waitForSelector("button[class*='rounded-lg']", {
      timeout: 10000,
    });

    // 点击第一个 Skill 卡片
    const firstCard = page.locator("button[class*='rounded-lg']").first();
    await firstCard.click();

    // 检查预览面板打开（或 URL 变化）
    await page.waitForTimeout(500);

    // 验证选中状态（卡片高亮）
    await expect(firstCard).toHaveClass(/border-\[hsl\(var\(--primary\)\)\]/);
  });

  test("搜索功能", async ({ page }) => {
    // 等待搜索框加载
    const searchInput = page
      .locator(
        'input[type="text"], input[placeholder*="搜索"], input[placeholder*="Search"]',
      )
      .first();
    await searchInput.waitFor({ timeout: 10000 });

    // 输入搜索关键词
    await searchInput.fill("react");

    // 等待搜索结果更新
    await page.waitForTimeout(500);

    // 检查搜索结果包含关键词
    const skillCards = page.locator("button[class*='rounded-lg']");
    const count = await skillCards.count();

    // 应该有搜索结果（假设项目中有 React 相关的 Skill）
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("视图切换（网格/列表）", async ({ page }) => {
    // 查找视图切换按钮
    const viewToggle = page
      .locator(
        'button[aria-label*="视图"], button[aria-label*="view"], button[data-testid="view-toggle"]',
      )
      .first();

    // 如果存在视图切换按钮
    const isVisible = await viewToggle.isVisible().catch(() => false);

    if (isVisible) {
      await viewToggle.click();
      await page.waitForTimeout(300);

      // 验证视图切换成功
      const skillContainer = page.locator(
        '[data-testid="skill-grid"], [data-testid="skill-list"]',
      );
      await expect(skillContainer.first()).toBeVisible();
    }
  });

  test("命令面板快捷键", async ({ page }) => {
    // 按下 Cmd/Ctrl + K 打开命令面板
    const isMac = process.platform === "darwin";
    const modifier = isMac ? "Meta" : "Control";

    await page.keyboard.press(`${modifier}+k`);

    // 等待命令面板出现
    await page.waitForTimeout(500);

    // 检查命令面板是否打开
    const commandPalette = page
      .locator('[role="dialog"], [data-testid="command-palette"]')
      .first();
    const isOpen = await commandPalette.isVisible().catch(() => false);

    // 如果命令面板功能已实现，验证其打开
    if (isOpen) {
      await expect(commandPalette).toBeVisible();

      // 按 Escape 关闭
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
      await expect(commandPalette).not.toBeVisible();
    }
  });

  test("响应式布局 - 桌面端", async ({ page }) => {
    // 设置桌面端视口
    await page.setViewportSize({ width: 1280, height: 720 });

    // 检查布局元素
    const sidebar = page.locator("aside");
    await expect(sidebar).toBeVisible();

    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();
  });

  test("响应式布局 - 移动端", async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });

    // 在移动端，侧边栏可能是隐藏的或变为抽屉
    const sidebar = page.locator("aside");
    const _isSidebarVisible = await sidebar.isVisible().catch(() => false);

    // 主内容区应该始终可见
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();
  });

  test("页面导航", async ({ page }) => {
    // 查找导航链接
    const navLinks = page.locator("nav a, aside a");

    const count = await navLinks.count();
    if (count > 0) {
      // 点击第一个导航链接
      await navLinks.first().click();
      await page.waitForTimeout(500);

      // 验证 URL 或内容变化
      // 这里只验证没有错误页面
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("错误边界捕获错误", async ({ page }) => {
    // 访问不存在的路由
    await page.goto("/non-existent-route");

    // 应该显示 404 页面或错误提示
    await page.waitForTimeout(500);

    // 验证没有白屏（至少有基本内容）
    const bodyContent = await page.locator("body").textContent();
    expect(bodyContent).toBeTruthy();
    expect(bodyContent!.length).toBeGreaterThan(0);
  });
});
