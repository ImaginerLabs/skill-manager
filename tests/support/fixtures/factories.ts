/**
 * 测试数据工厂
 * 使用 Faker 生成随机测试数据
 */

import { faker } from "@faker-js/faker/locale/zh_CN";

/**
 * Skill 元数据工厂
 */
export const createSkillMeta = (overrides: Partial<any> = {}) => ({
  id: faker.helpers.slugify(faker.lorem.words(3)).toLowerCase(),
  name: faker.lorem.words(3),
  description: faker.lorem.paragraph(),
  category: faker.helpers.arrayElement([
    "coding",
    "writing",
    "devops",
    "testing",
  ]),
  tags: faker.helpers.arrayElements(
    ["ai", "automation", "workflow", "review"],
    2,
  ),
  type: faker.helpers.arrayElement(["workflow", undefined]),
  author: faker.person.fullName(),
  version: faker.system.semver(),
  filePath: `${faker.helpers.arrayElement(["coding", "writing", "devops"])}/${faker.helpers.slugify(faker.lorem.words(2))}.md`,
  fileSize: faker.number.int({ min: 1024, max: 10240 }),
  lastModified: faker.date.recent().toISOString(),
  ...overrides,
});

/**
 * Skill 完整内容工厂
 */
export const createSkillFull = (overrides: Partial<any> = {}) => {
  const meta = createSkillMeta(overrides);
  return {
    ...meta,
    content: `# ${meta.name}\n\n${faker.lorem.paragraphs(5)}`,
    rawContent: `---\nname: ${meta.name}\ndescription: ${meta.description}\ncategory: ${meta.category}\n---\n\n# ${meta.name}\n\n${faker.lorem.paragraphs(3)}`,
    ...overrides,
  };
};

/**
 * 分类工厂
 */
export const createCategory = (overrides: Partial<any> = {}) => ({
  name: faker.helpers.slugify(faker.lorem.word()).toLowerCase(),
  displayName: faker.lorem.word(),
  description: faker.lorem.sentence(),
  skillCount: faker.number.int({ min: 0, max: 20 }),
  ...overrides,
});

/**
 * 工作流步骤工厂
 */
export const createWorkflowStep = (overrides: Partial<any> = {}) => ({
  order: faker.number.int({ min: 1, max: 10 }),
  skillId: faker.helpers.slugify(faker.lorem.words(2)).toLowerCase(),
  skillName: faker.lorem.words(3),
  description: faker.lorem.sentence(),
  ...overrides,
});

/**
 * 工作流工厂
 */
export const createWorkflow = (overrides: Partial<any> = {}) => ({
  name: faker.lorem.words(3),
  description: faker.lorem.paragraph(),
  steps: faker.helpers.multiple(() => createWorkflowStep(), { count: 3 }),
  ...overrides,
});

/**
 * 同步目标工厂
 */
export const createSyncTarget = (overrides: Partial<any> = {}) => ({
  id: faker.string.uuid(),
  name: faker.helpers.arrayElement(["CodeBuddy", "VSCode", "Cursor"]),
  path: faker.system.directoryPath(),
  enabled: faker.datatype.boolean(),
  ...overrides,
});

/**
 * 应用配置工厂
 */
export const createAppConfig = (overrides: Partial<any> = {}) => ({
  version: faker.system.semver(),
  sync: {
    targets: faker.helpers.multiple(() => createSyncTarget(), { count: 2 }),
  },
  categories: faker.helpers.multiple(() => createCategory(), { count: 4 }),
  ui: {
    defaultView: faker.helpers.arrayElement(["grid", "list"]),
    sidebarWidth: faker.number.int({ min: 200, max: 400 }),
  },
  ...overrides,
});
