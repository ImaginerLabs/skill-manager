// ============================================================
// tests/integration/skill-grid-refactor.test.tsx — 重构后集成测试
// 不 mock 新提取的共享组件和 Hook，验证完整交互流程
// ============================================================

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SkillMeta } from "../../shared/types";
import { createI18nMock } from "../helpers/i18n-mock";

// ── Mock scrollIntoView (jsdom 不支持) ──
Element.prototype.scrollIntoView = vi.fn();

// ── 使用 vi.hoisted 确保 mock 函数在 vi.mock 提升时可访问 ──
const { mockFetchSkills, mockSelectSkill, mockDeleteSkill } = vi.hoisted(
  () => ({
    mockFetchSkills: vi.fn(),
    mockSelectSkill: vi.fn(),
    mockDeleteSkill: vi.fn(),
  }),
);

// ── Mock react-i18next ──
vi.mock("react-i18next", () => createI18nMock());

// ── Mock skill-store ──
const sampleSkills: SkillMeta[] = [
  {
    id: "skill-1",
    name: "Code Review",
    description: "AI 代码审查",
    category: "coding",
    type: "workflow",
    tags: ["review"],
    author: "Alice",
    version: "1.0.0",
    filePath: "coding/code-review.md",
    fileSize: 2048,
    lastModified: "2025-01-01T00:00:00Z",
    readonly: false,
  },
  {
    id: "skill-2",
    name: "Write Docs",
    description: "文档生成",
    category: "writing",
    type: "skill",
    tags: ["docs"],
    author: "Bob",
    version: "1.0.0",
    filePath: "writing/write-docs.md",
    fileSize: 1024,
    lastModified: "2025-01-01T00:00:00Z",
    readonly: false,
  },
  {
    id: "skill-3",
    name: "Deploy Helper",
    description: "部署助手",
    category: "devops",
    tags: ["deploy"],
    author: "Charlie",
    version: "1.0.0",
    filePath: "devops/deploy-helper.md",
    fileSize: 3072,
    lastModified: "2025-01-01T00:00:00Z",
    readonly: true,
  },
];

vi.mock("../../src/stores/skill-store", () => ({
  useSkillStore: () => ({
    skills: sampleSkills,
    categories: [
      { name: "coding", displayName: "编程" },
      { name: "writing", displayName: "写作" },
      { name: "devops", displayName: "运维" },
    ],
    selectedCategory: null,
    selectedSource: null,
    searchQuery: "",
    selectedSkillId: null,
    fetchSkills: mockFetchSkills,
    selectSkill: mockSelectSkill,
    setCategory: vi.fn(),
    setSource: vi.fn(),
    setSearchQuery: vi.fn(),
  }),
}));

// ── Mock ui-store ──
vi.mock("../../src/stores/ui-store", () => ({
  useUIStore: () => ({
    viewMode: "grid",
    previewOpen: false,
    setViewMode: vi.fn(),
    setPreviewOpen: vi.fn(),
  }),
}));

// ── Mock api ──
vi.mock("../../src/lib/api", () => ({
  deleteSkill: mockDeleteSkill,
  fetchSkillById: vi.fn().mockResolvedValue({}),
}));

// ── Import after mocks ──
import ConfirmDialog from "../../src/components/shared/ConfirmDialog";
import SkillGrid from "../../src/components/skills/SkillGrid";
import SkillListView from "../../src/components/skills/SkillListView";

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("集成测试：SkillGrid 重构后完整流程", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteSkill.mockResolvedValue(undefined);
    mockFetchSkills.mockResolvedValue(undefined);
  });

  it("渲染 SkillGrid 并显示所有 Skill 卡片", async () => {
    renderWithRouter(<SkillGrid />);

    await waitFor(() => {
      expect(screen.getByText("Code Review")).toBeInTheDocument();
    });
    expect(screen.getByText("Write Docs")).toBeInTheDocument();
    expect(screen.getByText("Deploy Helper")).toBeInTheDocument();
  });

  it("SkillListView 渲染并列出所有 Skill", async () => {
    renderWithRouter(<SkillListView />);

    await waitFor(() => {
      expect(screen.getByText("Code Review")).toBeInTheDocument();
    });
    expect(screen.getByText("Write Docs")).toBeInTheDocument();
  });

  it("SkillGrid 键盘 Delete 触发 ConfirmDialog", async () => {
    const user = userEvent.setup();
    renderWithRouter(<SkillGrid />);

    await waitFor(() => {
      expect(screen.getByText("Code Review")).toBeInTheDocument();
    });

    // 聚焦到第一个 Skill 卡片并按 Delete
    const card = screen.getByText("Code Review").closest("[tabindex]");
    if (card) {
      await user.click(card);
      await user.keyboard("{Delete}");
    }

    // 应弹出 ConfirmDialog
    await waitFor(() => {
      expect(screen.getByText("确认删除")).toBeInTheDocument();
    });
  });
});

describe("集成测试：ConfirmDialog 组件", () => {
  it("danger variant 渲染确认和取消按钮", () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        variant="danger"
        title="确认删除"
        description="确定要删除吗？"
        confirmLabel="删除"
        cancelLabel="取消"
        onConfirm={onConfirm}
      />,
    );

    // 取消按钮存在
    const cancelBtn = screen.getByRole("button", { name: "取消" });
    expect(cancelBtn).toBeInTheDocument();

    // 确认按钮存在
    const confirmBtn = screen.getByRole("button", { name: "删除" });
    expect(confirmBtn).toBeInTheDocument();
  });

  it("点击确认按钮触发 onConfirm 回调", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        variant="danger"
        title="确认删除"
        description="确定要删除吗？"
        confirmLabel="删除"
        onConfirm={onConfirm}
      />,
    );

    const confirmBtn = screen.getByRole("button", { name: "删除" });
    await user.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalled();
  });

  it("点击取消按钮触发 onOpenChange(false)", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        variant="danger"
        title="确认删除"
        description="确定要删除吗？"
        confirmLabel="删除"
        cancelLabel="取消"
        onConfirm={() => {}}
      />,
    );

    const cancelBtn = screen.getByRole("button", { name: "取消" });
    await user.click(cancelBtn);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
