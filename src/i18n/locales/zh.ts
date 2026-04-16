// ============================================================
// src/i18n/locales/zh.ts — 中文翻译资源（source of truth）
// ============================================================

export const zh = {
  // ── 导航 ──────────────────────────────────────────────────
  nav: {
    skillLibrary: "Skill 库",
    workflow: "工作流",
    sync: "同步",
    import: "导入",
    pathConfig: "路径配置",
    settings: "设置",
    categories: "分类",
    manageCategories: "管理分类",
    byCategory: "按分类",
    bySource: "按来源",
    viewSwitcher: "视图切换",
    sourceViewPlaceholder: "来源视图即将推出",
    allSources: "全部",
    mySkills: "我的 Skill",
    sourceListLabel: "按来源筛选 Skill",
  },

  // ── 通用 UI ───────────────────────────────────────────────
  common: {
    loading: "加载中...",
    save: "保存",
    cancel: "取消",
    delete: "删除",
    confirm: "确认",
    edit: "编辑",
    create: "新建",
    search: "搜索",
    noDescription: "暂无描述",
    saving: "保存中...",
    creating: "创建中...",
    close: "关闭",
    unknown: "未知错误",
    processing: "处理中...",
    selectAll: "全选",
    collapse: "折叠",
    expand: "展开",
  },

  // ── Skill 浏览页 ──────────────────────────────────────────
  skillBrowse: {
    title: "Skill 库",
    skillCount: "{{count}} 个 Skill",
    skillCountFiltered: "{{filtered}} / {{total}} 个 Skill",
    searchPlaceholder: "筛选 Skill...",
    searchMatchCount: "找到 {{count}} 个匹配的 Skill",
    cardView: "卡片视图",
    listView: "列表视图",
    refresh: "刷新 Skill 列表",
    emptyTitle: "暂无 Skill",
    emptyHint: "从 IDE 导入 Skill 文件",
    emptyImportLink: "导入页面",
    coldStartDetected: "检测到 CodeBuddy IDE Skill 文件",
    coldStartFiles: "{{count}} 个文件",
    coldStartLocation: "中发现 Skill 文件，点击下方按钮开始导入。",
    coldStartImport: "开始导入 →",
    errorTitle: "加载失败",
    loadingText: "加载中...",
    previewEmpty: "选择一个 Skill 查看预览",
    closePreview: "关闭预览",
    // Story 9.5: 面包屑导航
    breadcrumbAll: "全部",
    breadcrumbSource: "来源: {{source}}",
    breadcrumbClearFilter: "清除筛选",
    breadcrumbNavLabel: "筛选路径",
  },

  // ── 同步页 ────────────────────────────────────────────────
  sync: {
    title: "IDE 同步",
    subtitle: "选择 Skill 并配置同步目标路径，将 Skill 一键同步到 IDE 项目目录",
    selectSkills: "选择 Skill",
    selectedCount: "已选 {{count}}",
    clearSelection: "清除选择",
    startSync: "开始同步",
    syncing: "同步中...",
    clearResults: "清除结果",
    syncComplete: "同步完成",
    syncSuccess: "同步完成！{{count}} 个文件已同步",
    syncPartialFail: "同步完成，{{failed}} 个文件失败",
    syncFailed: "同步失败",
    noSkillSelected: "请先选择要同步的 Skill",
    noTargetEnabled: "请先添加并启用同步目标",
    successCount: "成功 {{count}}",
    overwrittenCount: "覆盖 {{count}}",
    failedCount: "失败 {{count}}",
    updatedCount: "更新 {{count}}",
    skippedCount: "跳过 {{count}}",
    statusNew: "新建",
    statusOverwritten: "覆盖",
    statusFailed: "失败",
    statusUpdated: "已更新",
    statusSkipped: "已跳过",
    bundleSelect: "按套件选择",
    bundleNoMatch: "套件「{{name}}」下没有匹配的 Skill",
    // 同步多模式
    incrementalSync: "增量同步",
    replaceSync: "替换同步",
    viewDiff: "预览变更",
    moreSyncOptions: "更多同步选项",
    incrementalSyncSuccess:
      "增量同步完成！新增 {{added}}、更新 {{updated}}、跳过 {{skipped}}",
    replaceSyncSuccess: "替换同步完成！{{count}} 个文件已同步",
    replaceSyncConfirmTitle: "替换同步确认",
    replaceSyncConfirmDesc:
      "此操作将删除目标目录中 {{count}} 个 Skill 文件夹，然后重新同步。",
    replaceSyncWarning: "此操作不可撤销。",
    confirmReplaceSync: "确认替换同步",
    diffReport: "变更预览",
    diffSummary: "摘要",
    diffAdded: "新增",
    diffModified: "修改",
    diffDeleted: "删除",
    diffUnchanged: "相同",
    diffNoChanges: "所有文件均无变化",
    diffLoading: "正在生成变更预览...",
    diffFailed: "变更预览失败",
    diffTargetHint: "对比目标：{{name}}",
    execIncremental: "执行增量同步",
    execReplace: "执行替换同步",
    // Story 9.4: 同步流程渐进引导
    summaryTitle: "同步确认",
    summarySkillCount: "Skill 数量",
    summaryTargets: "目标路径",
    summaryMode: "同步模式",
    confirmSync: "确认同步",
    cancelSync: "取消",
    progressText: "{{completed}}/{{total}} Skill 已同步",
    retryButton: "重试",
    retryLimitReached: "已达最大重试次数",
    retrySuccess: "「{{name}}」重试成功",
    retryFailed: "「{{name}}」重试失败",
  },

  // ── 同步目标管理 ──────────────────────────────────────────
  syncTarget: {
    title: "同步目标",
    addTarget: "添加目标",
    noTargets: "暂无同步目标",
    noTargetsHint: "添加 IDE 项目目录作为同步目标",
    pathLabel: "路径",
    nameLabel: "名称",
    enabledLabel: "启用",
    namePlaceholder: "目标名称（如 My Project）",
    pathPlaceholder: "/path/to/project/.codebuddy/skills",
    deleteConfirmTitle: "确认删除",
    deleteConfirmDesc: '确定要删除同步目标 "{{name}}" 吗？',
    validating: "验证中...",
    validatePath: "验证路径",
    pathValid: "路径有效",
    pathInvalid: "路径无效",
    createSuccess: "同步目标已添加",
    createFailed: "添加同步目标失败",
    updateSuccess: "同步目标已更新",
    updateFailed: "更新同步目标失败",
    deleteSuccess: "同步目标已删除",
    deleteFailed: "删除同步目标失败",
  },

  // ── 设置页 ────────────────────────────────────────────────
  settings: {
    title: "分类管理",
    tabCategories: "分类设置",
    tabBundles: "套件管理",
  },

  // ── 套件管理 ──────────────────────────────────────────────
  bundle: {
    title: "套件管理",
    createNew: "新建套件",
    empty: "暂无套件",
    emptyHint: "套件是分类的组合，点击「新建套件」开始创建",
    namePlaceholder: "套件标识（英文，如 frontend-dev）",
    displayNamePlaceholder: "显示名称（如 前端日常开发）",
    descriptionPlaceholder: "描述（可选）",
    selectCategories: "选择分类（至少 1 个）",
    searchCategories: "搜索分类...",
    noMatchCategories: "无匹配分类",
    selectedCount: "已选 {{count}} 个分类",
    confirmCreate: "确认创建",
    nameError: "名称只能包含小写字母、数字和连字符",
    createSuccess: "套件创建成功",
    createFailed: "创建套件失败",
    updateSuccess: "套件更新成功",
    updateFailed: "更新套件失败",
    deleteSuccess: "套件已删除",
    deleteFailed: "删除套件失败",
    activateSuccess_withSkipped:
      "已激活 {{applied}} 个分类，跳过 {{skipped}} 个已删除分类",
    activateSuccess: "已激活 {{applied}} 个分类",
    activateFailed: "激活失败",
    loadFailed: "加载套件失败",
    activate: "激活",
    activated: "已激活",
    edit: "编辑",
    delete: "删除",
    displayNameLabel: "显示名称",
    descriptionLabel: "描述",
    brokenRef: "{{count}} 个分类引用已失效",
    deselectAll: "取消全选",
  },

  // ── 分类管理 ──────────────────────────────────────────────
  category: {
    title: "分类管理",
    createNew: "新建分类",
    empty: "暂无分类",
    emptyHint: "点击「新建分类」开始创建",
    namePlaceholder: "分类标识（英文，如 coding）",
    displayNamePlaceholder: "显示名称（如 编程开发）",
    descriptionPlaceholder: "描述（可选）",
    createButton: "创建",
    loadFailed: "加载数据失败",
    createFailed: "创建分类失败",
    updateFailed: "更新分类失败",
    deleteFailed: "删除分类失败",
    batchRemoveSuccess: "已将 {{count}} 个 Skill 移出分类",
    batchRemoveFailed: "批量操作失败",
    batchRemoveButton: "移出此分类 ({{count}})",
    processing: "处理中...",
    selectAllLabel: "全选",
    selectedCount: "已选 {{count}} 个",
    noSkills: "该分类下暂无 Skill",
    deleteConfirmTitle: "确认删除",
    deleteConfirmDesc: '确定要删除分类 "{{name}}" 吗？',
    descriptionLabel: "描述",
    skillCount: "{{count}} Skill",
    collapse: "折叠",
    expand: "展开",
  },

  // ── 元数据编辑器 ──────────────────────────────────────────
  metadata: {
    title: "编辑元数据",
    fieldName: "名称",
    fieldDescription: "描述",
    fieldTags: "标签（逗号分隔）",
    fieldMoveCategory: "移动到分类",
    movePlaceholder: "目标分类名称",
    moveButton: "移动",
    deleteConfirmTitle: "确认删除",
    deleteConfirmDesc: "确定要删除这个 Skill 吗？此操作不可撤销。",
    saveFailed: "保存失败",
    deleteFailed: "删除失败",
    moveFailed: "移动失败",
    closePanel: "关闭编辑面板",
  },

  // ── Header ────────────────────────────────────────────────
  header: {
    searchPlaceholder: "⌘K 搜索 Skill...",
    searchAriaLabel: "全局搜索",
    toggleTheme: "切换主题",
    switchLanguage: "切换语言",
    langZh: "中",
    langEn: "EN",
  },

  // ── Toast 消息 ────────────────────────────────────────────
  toast: {
    loadFailed: "加载数据失败",
    loadSkillsFailed: "加载 Skill 列表失败",
    loadBundlesFailed: "加载套件失败",
    syncNoSkill: "请先选择要同步的 Skill",
    syncFailed: "同步失败",
    workflowLoaded: "已加载工作流「{{name}}」到编排器",
    workflowLoadFailed: "加载工作流失败",
    workflowDeleted: "工作流「{{name}}」已删除",
    workflowDeleteFailed: "删除工作流失败",
    workflowUndoDelete: "已撤销删除工作流「{{name}}」",
  },

  // ── 工作流页 ──────────────────────────────────────────────
  workflow: {
    tabList: "已有工作流",
    tabNew: "新建工作流",
    empty: "还没有工作流",
    emptyHint: "点击「新建工作流」开始创建",
    createNew: "新建工作流",
    loading: "加载中...",
    editAriaLabel: "编辑 {{name}}",
    deleteAriaLabel: "删除 {{name}}",
    addCustomStep: "添加自定义步骤",
    customStep: "自定义步骤",
    customStepPlaceholder:
      "输入自定义步骤描述，如：检查暂存区的代码，并分析意图",
    removeStep: "移除此步骤",
    startEditing:
      "从左侧选择 Skill 添加到工作流中，或添加自定义步骤，组合为一个自动化工作流",
    reset: "重置工作流",
  },

  // ── 导入页 ────────────────────────────────────────────────
  import: {
    title: "导入管理",
    subtitle: "从 CodeBuddy IDE 目录扫描并导入 Skill 文件",
    scanFailed: "扫描失败",
    emptyDir: "目录为空",
    emptyDirHint: "中未发现 .md 文件",
    idleTitle: "开始扫描",
    idleHint:
      '输入 CodeBuddy IDE 的 Skill 目录路径，点击"扫描"按钮发现可导入的文件',
    importManage: "导入管理",
    scanPath: "扫描路径",
  },

  // ── 路径配置页 ────────────────────────────────────────────
  paths: {
    title: "路径配置",
    subtitle: "管理常用路径预设，在同步和导入时快速选择",
  },

  // ── 路径预设管理 ──────────────────────────────────────────
  pathPreset: {
    title: "路径预设",
    addPreset: "添加预设",
    noPresets: "暂无路径预设",
    noPresetsHint: "添加常用路径，在同步和导入时快速选择",
    namePlaceholder: "预设名称（如 My Project）",
    pathPlaceholder: "/path/to/project",
    createSuccess: "路径预设已添加",
    createFailed: "添加路径预设失败",
    updateSuccess: "路径预设已更新",
    updateFailed: "更新路径预设失败",
    deleteSuccess: "路径预设已删除",
    deleteFailed: "删除路径预设失败",
    deleteConfirmTitle: "确认删除",
    deleteConfirmDesc: '确定要删除路径预设 "{{name}}" 吗？',
  },

  // ── Command Palette ───────────────────────────────────────
  commandPalette: {
    placeholder: "搜索 Skill、页面...",
    noResults: "未找到匹配结果",
    groupSkills: "Skills",
    groupWorkflows: "工作流",
    groupPages: "页面",
  },

  // ── Skill 列表 ────────────────────────────────────────────
  skillList: {
    tagCount: "{{count}} 标签",
    workflowBadge: "工作流",
  },

  // ── 外部 Skill 来源标签 ───────────────────────────────────
  skill: {
    viewOnGithub: "在 GitHub 上查看",
    sourceInfo: "来源信息",
    sourceRepo: "仓库",
    readonlyTooltip: "外部 Skill（只读）",
    readonlyEditTooltip: "外部 Skill 为只读，由上游仓库管理",
    readonlyDeleteTooltip: "外部 Skill 不可删除",
    editMeta: "编辑元数据",
    syncToIDE: "同步到 IDE",
    copyPath: "复制路径",
    pathCopied: "路径已复制到剪贴板",
    confirmDelete: "确认删除",
  },

  // ── 确认对话框 ────────────────────────────────────────────
  confirmDialog: {
    defaultTitle: "确认操作",
    defaultDesc: "确定要执行此操作吗？",
  },

  // ── 导入清理确认 ──────────────────────────────────────────
  importCleanup: {
    confirmTitle: "确认删除源文件",
    confirmDesc:
      "确认删除 {{count}} 个已导入的源文件？此操作不可撤销，将永久删除原始文件。",
    confirmButton: "确认删除",
  },

  // ── 错误码映射 ────────────────────────────────────────────
  errors: {
    SKILL_NOT_FOUND: "Skill 不存在",
    VALIDATION_ERROR: "输入数据格式有误",
    BUNDLE_LIMIT_EXCEEDED: "套件数量已达上限（50 个）",
    BUNDLE_NAME_DUPLICATE: "套件名称已存在",
    PATH_TRAVERSAL: "路径包含非法字符",
    unknown: "操作失败，请重试",
  },
} as const;
