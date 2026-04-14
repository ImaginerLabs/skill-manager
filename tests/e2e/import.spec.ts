import { expect, test } from "@playwright/test";

/**
 * Epic 2: IDE 导入与冷启动 — E2E 测试
 *
 * 覆盖范围：
 * - Story 2.1: IDE 目录扫描 API (AC-1 ~ AC-4)
 * - Story 2.2: 导入向导与分类选择 (AC-1 ~ AC-4)
 * - Story 2.3: 文件导入与 Frontmatter 补充 (AC-3)
 * - Story 2.4: 冷启动引导 (AC-2)
 */

/** 生成标准 mock 扫描结果 */
function mockScanResult(items: object[], scanPath = "/mock") {
  return JSON.stringify({
    success: true,
    data: { scanPath, totalFiles: items.length, items },
  });
}

/** 生成标准 mock 分类列表 */
function mockCategories(
  cats: { name: string; displayName: string }[] = [
    { name: "frontend", displayName: "前端开发" },
  ],
) {
  return JSON.stringify({
    success: true,
    data: cats.map((c) => ({ ...c, skillCount: 0 })),
  });
}

/** 标准 mock Skill 条目 */
function mockItem(
  id: string,
  name: string,
  opts: Partial<{
    description: string;
    parseStatus: string;
    fileSize: number;
  }> = {},
) {
  return {
    id,
    name,
    description: opts.description ?? "",
    filePath: `${id}.md`,
    absolutePath: `/mock/${id}.md`,
    parseStatus: opts.parseStatus ?? "success",
    fileSize: opts.fileSize ?? 512,
    lastModified: new Date().toISOString(),
  };
}

// =========================================================
// 不需要分类 mock 的测试 — 使用 beforeEach goto
// =========================================================
test.describe("Epic 2: 导入页面 — 基础功能", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/import");
  });

  // Story 2.1 AC-3: 页面加载
  test("导入页面正常加载 — 显示扫描路径输入框和扫描按钮", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("导入管理");

    const pathInput = page.locator("#scan-path");
    await expect(pathInput).toBeVisible();
    await expect(pathInput).toHaveValue("~/.codebuddy/skills");

    const scanBtn = page.getByRole("button", { name: "搜索", exact: true });
    await expect(scanBtn).toBeVisible();
    await expect(scanBtn).toBeEnabled();
  });

  test("初始状态显示空状态引导", async ({ page }) => {
    await expect(page.locator("text=开始扫描")).toBeVisible();
    await expect(
      page.locator("p", { hasText: /输入 CodeBuddy IDE 的 Skill 目录路径/ }),
    ).toBeVisible();
  });

  // Story 2.1 AC-4: 扫描路径配置
  test("用户可以修改扫描路径", async ({ page }) => {
    const pathInput = page.locator("#scan-path");
    await pathInput.clear();
    await pathInput.fill("/custom/path/to/skills");
    await expect(pathInput).toHaveValue("/custom/path/to/skills");
  });

  // Story 2.1 AC-2: 路径不存在错误
  test("扫描不存在的路径 — 显示错误提示", async ({ page }) => {
    const pathInput = page.locator("#scan-path");
    await pathInput.clear();
    await pathInput.fill("/non-existent-path-xyz-12345");

    await page.getByRole("button", { name: "搜索", exact: true }).click();

    await expect(page.locator("text=扫描失败")).toBeVisible({
      timeout: 10000,
    });
  });

  // Story 2.1 AC-3: loading 状态
  test("点击扫描按钮时显示 loading 状态", async ({ page }) => {
    const scanBtn = page.getByRole("button", { name: "搜索", exact: true });
    await scanBtn.click();
    // loading 时按钮文本变为 "加载中..." 且禁用
    await expect(page.getByRole("button", { name: /加载中/ })).toBeDisabled();
  });

  // Story 2.1 AC-2: 空目录提示
  test("扫描空目录 — 显示空目录提示", async ({ page }) => {
    await page.route("**/api/import/scan", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: mockScanResult([]),
      });
    });

    await page.getByRole("button", { name: "搜索", exact: true }).click();
    await expect(page.locator("text=目录为空")).toBeVisible({ timeout: 5000 });
  });

  // Story 2.1 AC-1: 解析失败文件标记
  test("解析失败的文件显示警告标记", async ({ page }) => {
    await page.route("**/api/import/scan", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: mockScanResult([
          mockItem("broken", "broken-skill", { parseStatus: "failed" }),
        ]),
      });
    });

    await page.getByRole("button", { name: "搜索", exact: true }).click();
    await expect(page.locator("text=broken-skill")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator("text=扫描失败")).toBeVisible();
  });
});

// =========================================================
// 需要分类 mock 的测试 — 自行注册 mock 后再 goto
// =========================================================
test.describe("Epic 2: 导入页面 — 勾选与分类", () => {
  // Story 2.2 AC-1: 文件列表和勾选功能
  test("扫描成功后显示文件列表和勾选功能", async ({ page }) => {
    // 分类 API 在页面加载时就会被调用，必须在 goto 之前注册
    await page.route("**/api/categories", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: mockCategories([
          { name: "frontend", displayName: "前端开发" },
          { name: "backend", displayName: "后端开发" },
        ]),
      });
    });

    await page.goto("/import");

    await page.route("**/api/import/scan", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: mockScanResult([
          mockItem("s1", "Mock Skill 1", { description: "第一个测试 Skill" }),
          mockItem("s2", "Mock Skill 2", { description: "第二个测试 Skill" }),
        ]),
      });
    });

    await page.getByRole("button", { name: "搜索", exact: true }).click();

    await expect(page.locator("text=Mock Skill 1")).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator("text=Mock Skill 2")).toBeVisible();

    // 已选统计显示（格式为 "0 / 2"）
    await expect(page.locator("span", { hasText: /^0 \/ 2$/ })).toBeVisible();
  });

  test("勾选单个文件 — 已选统计更新", async ({ page }) => {
    await page.route("**/api/categories", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: mockCategories([]),
      });
    });

    await page.goto("/import");

    await page.route("**/api/import/scan", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: mockScanResult([
          mockItem("s1", "Skill A"),
          mockItem("s2", "Skill B"),
        ]),
      });
    });

    await page.getByRole("button", { name: "搜索", exact: true }).click();
    await expect(page.locator("text=Skill A")).toBeVisible({ timeout: 5000 });

    // 用标签文本定位 Skill A 的 checkbox，避免索引错误
    await page
      .locator("label", { hasText: "Skill A" })
      .locator('input[type="checkbox"]')
      .click();

    // 已选统计更新为 "1 / 2"
    await expect(page.locator("span", { hasText: /^1 \/ 2$/ })).toBeVisible();
  });

  test("全选功能 — 勾选所有文件", async ({ page }) => {
    await page.route("**/api/categories", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: mockCategories([]),
      });
    });

    await page.goto("/import");

    await page.route("**/api/import/scan", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: mockScanResult([
          mockItem("s1", "Skill A"),
          mockItem("s2", "Skill B"),
        ]),
      });
    });

    await page.getByRole("button", { name: "搜索", exact: true }).click();
    await expect(page.locator("text=Skill A")).toBeVisible({ timeout: 5000 });

    // 点击全选 checkbox（第一个）
    await page.locator('input[type="checkbox"]').first().click();

    await expect(page.locator("span", { hasText: /^2 \/ 2$/ })).toBeVisible();
  });

  // Story 2.2 AC-4: 导入按钮状态
  test("未选文件时导入按钮禁用", async ({ page }) => {
    await page.route("**/api/categories", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: mockCategories(),
      });
    });

    await page.goto("/import");

    await page.route("**/api/import/scan", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: mockScanResult([mockItem("s1", "Skill A")]),
      });
    });

    await page.getByRole("button", { name: "搜索", exact: true }).click();
    await expect(page.locator("text=Skill A")).toBeVisible({ timeout: 5000 });

    // 未选文件时导入按钮禁用（按钮文本为 "确认 (0)"）
    await expect(page.locator("button", { hasText: /确认/ })).toBeDisabled();
  });

  test("选了文件但未选分类时导入按钮禁用", async ({ page }) => {
    await page.route("**/api/categories", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: mockCategories(),
      });
    });

    await page.goto("/import");

    await page.route("**/api/import/scan", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: mockScanResult([mockItem("s1", "Skill A")]),
      });
    });

    await page.getByRole("button", { name: "搜索", exact: true }).click();
    await expect(page.locator("text=Skill A")).toBeVisible({ timeout: 5000 });

    // 用标签文本定位 Skill A 的 checkbox
    await page
      .locator("label", { hasText: "Skill A" })
      .locator('input[type="checkbox"]')
      .click();
    await expect(page.locator("span", { hasText: /^1 \/ 1$/ })).toBeVisible();

    // 导入按钮仍然禁用（未选分类，按钮文本为 "确认 (1)"）
    await expect(page.locator("button", { hasText: /确认/ })).toBeDisabled();
  });

  test("选了文件且选了分类时导入按钮启用", async ({ page }) => {
    await page.route("**/api/categories", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: mockCategories(),
      });
    });

    await page.goto("/import");

    await page.route("**/api/import/scan", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: mockScanResult([mockItem("s1", "Skill A")]),
      });
    });

    await page.getByRole("button", { name: "搜索", exact: true }).click();
    await expect(page.locator("text=Skill A")).toBeVisible({ timeout: 5000 });

    // 用标签文本定位 Skill A 的 checkbox
    await page
      .locator("label", { hasText: "Skill A" })
      .locator('input[type="checkbox"]')
      .click();

    // 选择分类（等待 option 元素存在）
    await page
      .locator("[data-testid='category-select'] option[value='frontend']")
      .waitFor({
        state: "attached",
        timeout: 5000,
      });
    await page
      .locator("[data-testid='category-select']")
      .selectOption("frontend");

    // 导入按钮启用（按钮文本为 "确认 (1)"）
    await expect(page.locator("button", { hasText: /确认/ })).toBeEnabled();
  });

  // Story 2.3 AC-3: 导入执行与 Toast 通知
  test("导入成功 — 显示成功 Toast", async ({ page }) => {
    await page.route("**/api/categories", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: mockCategories(),
      });
    });

    await page.goto("/import");

    await page.route("**/api/import/scan", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: mockScanResult([mockItem("s1", "Skill A")]),
      });
    });

    await page.route("**/api/import/execute", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            success: 1,
            failed: 0,
            details: [
              {
                name: "Skill A",
                status: "success",
                targetPath: "/skills/frontend/s1.md",
              },
            ],
          },
        }),
      });
    });

    await page.getByRole("button", { name: "搜索", exact: true }).click();
    await expect(page.locator("text=Skill A")).toBeVisible({ timeout: 5000 });

    // 勾选 + 选分类（用标签文本定位 Skill A 的 checkbox）
    await page
      .locator("label", { hasText: "Skill A" })
      .locator('input[type="checkbox"]')
      .click();
    await page
      .locator("[data-testid='category-select'] option[value='frontend']")
      .waitFor({
        state: "attached",
        timeout: 5000,
      });
    await page
      .locator("[data-testid='category-select']")
      .selectOption("frontend");

    // 点击导入（按钮文本为 "确认 (1)"）
    await page.locator("button", { hasText: /确认/ }).click();

    // 验证 Toast 成功通知
    await expect(page.locator("text=成功导入 1 个文件")).toBeVisible({
      timeout: 5000,
    });
  });
});

// =========================================================
// Story 2.4 AC-2: 冷启动引导 UI
// =========================================================
test.describe("Epic 2: 冷启动引导", () => {
  test("skills 为空且检测到 CodeBuddy 时显示引导卡片", async ({ page }) => {
    await page.route("**/api/skills", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    await page.route("**/api/import/detect-codebuddy", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            detected: true,
            path: "/mock/.codebuddy/skills",
            fileCount: 5,
          },
        }),
      });
    });

    await page.goto("/");

    await expect(
      page.locator("text=检测到 CodeBuddy IDE Skill 文件"),
    ).toBeVisible({ timeout: 10000 });

    await expect(page.getByText("5 个文件")).toBeVisible();

    await page.locator("button", { hasText: /开始导入/ }).click();
    await expect(page).toHaveURL(/\/import/);
  });

  test("skills 为空且未检测到 CodeBuddy 时显示空状态", async ({ page }) => {
    await page.route("**/api/skills", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      });
    });

    await page.route("**/api/import/detect-codebuddy", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { detected: false, path: "", fileCount: 0 },
        }),
      });
    });

    await page.goto("/");

    await expect(page.getByRole("heading", { name: "暂无 Skill" })).toBeVisible(
      {
        timeout: 10000,
      },
    );
  });
});
