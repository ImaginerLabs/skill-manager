/**
 * Skill 浏览功能 E2E 测试
 * 验证用户可以浏览、搜索和查看 Skill 详情
 */

import { expect, test } from "../support/fixtures";

test.describe("Skill 浏览功能", () => {
  test.beforeEach(async ({ page }) => {
    // 导航到首页
    await page.goto("/");
  });

  test("应该显示 Skill 列表", async ({ page }) => {
    // Given: 用户访问首页
    // When: 页面加载完成
    await expect(page.locator('[data-testid="skill-grid"]')).toBeVisible();

    // Then: 应该显示 Skill 卡片
    const skillCards = page.locator('[data-testid="skill-card"]');
    await expect(skillCards.first()).toBeVisible();
  });

  test("应该能够搜索 Skill", async ({ page }) => {
    // Given: 用户在首页
    const searchQuery = "review";

    // When: 用户在搜索框输入关键词
    await page.fill('[data-testid="search-input"]', searchQuery);

    // Then: 应该显示匹配的 Skill
    await page.waitForTimeout(500); // 等待防抖
    const skillCards = page.locator('[data-testid="skill-card"]');
    await expect(skillCards.first()).toBeVisible();
  });

  test("应该能够按分类筛选 Skill", async ({ page }) => {
    // Given: 用户在首页
    const category = "coding";

    // When: 用户点击分类
    await page.click(`[data-testid="category-${category}"]`);

    // Then: 应该只显示该分类的 Skill
    await page.waitForTimeout(300);
    const activeCategory = await page.getAttribute(
      '[data-testid="category-tree"]',
      "data-active",
    );
    expect(activeCategory).toBe(category);
  });

  test("应该能够查看 Skill 详情", async ({ page }) => {
    // Given: 用户在首页
    await expect(
      page.locator('[data-testid="skill-card"]').first(),
    ).toBeVisible();

    // When: 用户点击 Skill 卡片
    await page.click('[data-testid="skill-card"] >> nth=0');

    // Then: 应该打开预览面板
    await expect(page.locator('[data-testid="preview-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="skill-content"]')).toBeVisible();
  });

  test("应该能够切换视图模式", async ({ page }) => {
    // Given: 用户在首页
    // When: 用户点击视图切换按钮
    await page.click('[data-testid="view-toggle"]');

    // Then: 应该切换到列表视图
    const listView = page.locator('[data-testid="skill-list"]');
    await expect(listView).toBeVisible();
  });

  test("应该显示空状态提示", async ({ page }) => {
    // Given: 用户在首页
    // When: 搜索不存在的 Skill
    await page.fill('[data-testid="search-input"]', "zzzzzzzzzzzz");

    // Then: 应该显示空状态
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
  });
});

test.describe("Skill 卡片交互", () => {
  test("应该显示 Skill 元数据", async ({ page }) => {
    await page.goto("/");

    const firstCard = page.locator('[data-testid="skill-card"]').first();
    await expect(firstCard.locator('[data-testid="skill-name"]')).toBeVisible();
    await expect(
      firstCard.locator('[data-testid="skill-description"]'),
    ).toBeVisible();
    await expect(
      firstCard.locator('[data-testid="skill-category"]'),
    ).toBeVisible();
  });

  test("应该显示 Skill 标签", async ({ page }) => {
    await page.goto("/");

    const firstCard = page.locator('[data-testid="skill-card"]').first();
    const tags = firstCard.locator('[data-testid="skill-tag"]');
    const tagCount = await tags.count();

    expect(tagCount).toBeGreaterThan(0);
  });
});
