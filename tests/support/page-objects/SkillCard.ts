/**
 * Skill 卡片页面对象
 * 封装 Skill 卡片相关的元素和操作
 */

import { Locator, Page } from "@playwright/test";

export class SkillCardPageObject {
  readonly page: Page;
  readonly card: Locator;
  readonly name: Locator;
  readonly description: Locator;
  readonly category: Locator;
  readonly tags: Locator;
  readonly previewButton: Locator;

  constructor(page: Page, cardIndex = 0) {
    this.page = page;
    this.card = page.locator('[data-testid="skill-card"]').nth(cardIndex);
    this.name = this.card.locator('[data-testid="skill-name"]');
    this.description = this.card.locator('[data-testid="skill-description"]');
    this.category = this.card.locator('[data-testid="skill-category"]');
    this.tags = this.card.locator('[data-testid="skill-tag"]');
    this.previewButton = this.card.locator('[data-testid="preview-button"]');
  }

  async click() {
    await this.card.click();
  }

  async clickPreview() {
    await this.previewButton.click();
  }

  async getName(): Promise<string> {
    return (await this.name.textContent()) || "";
  }

  async getDescription(): Promise<string> {
    return (await this.description.textContent()) || "";
  }

  async getCategory(): Promise<string> {
    return (await this.category.textContent()) || "";
  }

  async getTags(): Promise<string[]> {
    const tagElements = await this.tags.all();
    const tags: string[] = [];
    for (const tag of tagElements) {
      tags.push((await tag.textContent()) || "");
    }
    return tags;
  }

  async isVisible(): Promise<boolean> {
    return await this.card.isVisible();
  }
}
