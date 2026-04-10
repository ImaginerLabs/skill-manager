/**
 * 技能浏览页页面对象
 * 封装技能浏览页相关的元素和操作
 */

import { Locator, Page } from "@playwright/test";

export class SkillBrowsePageObject {
  readonly page: Page;
  readonly skillGrid: Locator;
  readonly skillList: Locator;
  readonly searchInput: Locator;
  readonly categoryTree: Locator;
  readonly viewToggle: Locator;
  readonly emptyState: Locator;
  readonly previewPanel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.skillGrid = page.locator('[data-testid="skill-grid"]');
    this.skillList = page.locator('[data-testid="skill-list"]');
    this.searchInput = page.locator('[data-testid="search-input"]');
    this.categoryTree = page.locator('[data-testid="category-tree"]');
    this.viewToggle = page.locator('[data-testid="view-toggle"]');
    this.emptyState = page.locator('[data-testid="empty-state"]');
    this.previewPanel = page.locator('[data-testid="preview-panel"]');
  }

  async navigate() {
    await this.page.goto("/");
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500); // 等待防抖
  }

  async selectCategory(category: string) {
    await this.page.click(`[data-testid="category-${category}"]`);
    await this.page.waitForTimeout(300);
  }

  async toggleView() {
    await this.viewToggle.click();
  }

  async getSkillCardCount(): Promise<number> {
    const cards = this.page.locator('[data-testid="skill-card"]');
    return await cards.count();
  }

  async isGridView(): Promise<boolean> {
    return await this.skillGrid.isVisible();
  }

  async isListView(): Promise<boolean> {
    return await this.skillList.isVisible();
  }

  async isEmpty(): Promise<boolean> {
    return await this.emptyState.isVisible();
  }

  async isPreviewOpen(): Promise<boolean> {
    return await this.previewPanel.isVisible();
  }

  async closePreview() {
    const closeButton = this.previewPanel.locator(
      '[data-testid="close-preview"]',
    );
    await closeButton.click();
  }
}
