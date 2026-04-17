// ============================================================
// src/i18n/locales/en.ts — 英文翻译资源（镜像 zh.ts 结构）
// ============================================================

export const en = {
  // ── Navigation ────────────────────────────────────────────
  nav: {
    skillLibrary: "Skill Library",
    workflow: "Workflow",
    sync: "Sync",
    import: "Import",
    pathConfig: "Path Config",
    settings: "Settings",
    categories: "Categories",
    manageCategories: "Manage Categories",
    byCategory: "By Category",
    bySource: "By Source",
    viewSwitcher: "View Switcher",
    sourceViewPlaceholder: "Source view coming soon",
    allSources: "All",
    mySkills: "My Skills",
    sourceListLabel: "Filter Skills by source",
  },

  // ── Common UI ─────────────────────────────────────────────
  common: {
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    confirm: "Confirm",
    edit: "Edit",
    create: "New",
    search: "Search",
    noDescription: "No description",
    saving: "Saving...",
    creating: "Creating...",
    close: "Close",
    unknown: "Unknown error",
    processing: "Processing...",
    selectAll: "Select All",
    collapse: "Collapse",
    expand: "Expand",
  },

  // ── Skill Browse Page ─────────────────────────────────────
  skillBrowse: {
    title: "Skill Library",
    skillCount: "{{count}} Skills",
    skillCountFiltered: "{{filtered}} / {{total}} Skills",
    searchPlaceholder: "Filter Skills...",
    searchMatchCount: "Found {{count}} matching Skills",
    cardView: "Card View",
    listView: "List View",
    refresh: "Refresh Skill List",
    emptyTitle: "No Skills Yet",
    emptyHint: "Import Skill files from IDE",
    emptyImportLink: "Import Page",
    coldStartDetected: "CodeBuddy IDE Skill files detected",
    coldStartFiles: "{{count}} files",
    coldStartLocation: "found in directory. Click the button below to import.",
    coldStartImport: "Start Import →",
    errorTitle: "Load Failed",
    loadingText: "Loading...",
    previewEmpty: "Select a Skill to preview",
    closePreview: "Close Preview",
    // Story 9.5: Filter breadcrumb
    breadcrumbAll: "All",
    breadcrumbSource: "Source: {{source}}",
    breadcrumbClearFilter: "Clear Filter",
    breadcrumbNavLabel: "Filter Path",
  },

  // ── Sync Page ─────────────────────────────────────────────
  sync: {
    title: "IDE Sync",
    subtitle:
      "Select Skills and configure sync targets to sync Skills to your IDE project directory",
    selectSkills: "Select Skills",
    selectedCount: "{{count}} selected",
    clearSelection: "Clear Selection",
    startSync: "Start Sync",
    syncing: "Syncing...",
    clearResults: "Clear Results",
    collapseResult: "Collapse",
    expandResult: "Expand",
    syncComplete: "Sync Complete",
    syncSuccess: "Sync complete! {{count}} files synced",
    syncPartialFail: "Sync complete, {{failed}} files failed",
    syncFailed: "Sync Failed",
    noSkillSelected: "Please select Skills to sync first",
    noTargetEnabled: "Please add and enable a sync target first",
    successCount: "Success {{count}}",
    overwrittenCount: "Overwritten {{count}}",
    failedCount: "Failed {{count}}",
    updatedCount: "Updated {{count}}",
    skippedCount: "Skipped {{count}}",
    deletedCount: "Deleted {{count}}",
    statusNew: "New",
    statusOverwritten: "Overwritten",
    statusFailed: "Failed",
    statusUpdated: "Updated",
    statusSkipped: "Skipped",
    statusDeleted: "Deleted",
    bundleSelect: "Select by Bundle",
    bundleNoMatch: 'No matching skills found in bundle "{{name}}"',
    // Sync multi-mode
    incrementalSync: "Incremental Sync",
    replaceSync: "Replace Sync",
    viewDiff: "Preview Changes",
    moreSyncOptions: "More sync options",
    incrementalSyncSuccess:
      "Incremental sync complete! Added {{added}}, updated {{updated}}, skipped {{skipped}}",
    replaceSyncSuccess:
      "Replace sync complete! Synced {{count}}, deleted {{deleted}}",
    replaceSyncConfirmTitle: "Confirm Replace Sync",
    replaceSyncConfirmDesc:
      "This will delete {{count}} Skill folders in the target directory, then re-sync.",
    replaceSyncWarning: "This action cannot be undone.",
    confirmReplaceSync: "Confirm Replace Sync",
    diffReport: "Change Preview",
    diffSummary: "Summary",
    diffAdded: "Added",
    diffModified: "Modified",
    diffDeleted: "Deleted",
    diffUnchanged: "Unchanged",
    diffNoChanges: "All files are unchanged",
    diffLoading: "Generating change preview...",
    diffFailed: "Change preview failed",
    diffTargetHint: "Comparing against: {{name}}",
    execIncremental: "Run Incremental Sync",
    execReplace: "Run Replace Sync",
    // Story 9.4: Sync flow progressive guidance
    summaryTitle: "Sync Confirmation",
    summarySkillCount: "Skill Count",
    summaryTargets: "Target Paths",
    summaryMode: "Sync Mode",
    confirmSync: "Confirm Sync",
    cancelSync: "Cancel",
    progressText: "{{completed}}/{{total}} Skills synced",
    retryButton: "Retry",
    retryLimitReached: "Max retries reached",
    retrySuccess: '"{{name}}" retry succeeded',
    retryFailed: '"{{name}}" retry failed',
    // Target selector
    selectDiffTarget: "Select Preview Target",
    selectSyncTargets: "Select Sync Targets",
    selectAll: "Select All",
    deselectAll: "Deselect All",
    noEnabledTargets: "No enabled sync targets",
  },

  // ── Sync Target Manager ───────────────────────────────────
  syncTarget: {
    title: "Sync Targets",
    addTarget: "Add Target",
    noTargets: "No Sync Targets",
    noTargetsHint: "Add an IDE project directory as a sync target",
    pathLabel: "Path",
    nameLabel: "Name",
    enabledLabel: "Enabled",
    namePlaceholder: "Target name (e.g. My Project)",
    pathPlaceholder: "/path/to/project/.codebuddy/skills",
    deleteConfirmTitle: "Confirm Delete",
    deleteConfirmDesc:
      'Are you sure you want to delete sync target "{{name}}"?',
    deleteAllSkillsTitle: "Delete All Skills",
    deleteAllSkillsDesc:
      'Are you sure you want to delete all Skills under "{{name}}"?\nThis action is irreversible and will permanently delete all synced Skill files in that directory.',
    validating: "Validating...",
    validatePath: "Validate Path",
    pathValid: "Path is valid",
    pathInvalid: "Path is invalid",
    createSuccess: "Sync target added",
    createFailed: "Failed to add sync target",
    updateSuccess: "Sync target updated",
    updateFailed: "Failed to update sync target",
    deleteSuccess: "Sync target deleted",
    deleteFailed: "Failed to delete sync target",
    deleteAllSkillsSuccess: "Deleted {{count}} Skill files",
    deleteAllSkillsFailed: "Failed to delete Skill files",
    enableAll: "Enable All",
    disableAll: "Disable All",
  },

  // ── Settings Page ─────────────────────────────────────────
  settings: {
    title: "Category Management",
    tabCategories: "Categories",
    tabBundles: "Bundles",
  },

  // ── Bundle Management ─────────────────────────────────────
  bundle: {
    title: "Bundle Management",
    createNew: "New Bundle",
    empty: "No Bundles",
    emptyHint:
      'Bundles are combinations of categories. Click "New Bundle" to create one.',
    namePlaceholder: "Bundle ID (e.g. frontend-dev)",
    displayNamePlaceholder: "Display Name (e.g. Frontend Dev)",
    descriptionPlaceholder: "Description (optional)",
    selectCategories: "Select Categories (at least 1)",
    searchCategories: "Search categories...",
    noMatchCategories: "No matching categories",
    selectedCount: "{{count}} categories selected",
    confirmCreate: "Confirm Create",
    nameError: "Name can only contain lowercase letters, numbers and hyphens",
    createSuccess: "Bundle created",
    createFailed: "Failed to create bundle",
    updateSuccess: "Bundle updated",
    updateFailed: "Failed to update bundle",
    deleteSuccess: "Bundle deleted",
    deleteFailed: "Failed to delete bundle",
    activateSuccess_withSkipped:
      "Activated {{applied}} categories, skipped {{skipped}} deleted",
    activateSuccess: "Activated {{applied}} categories",
    activateFailed: "Activation failed",
    loadFailed: "Failed to load bundles",
    activate: "Activate",
    activated: "Activated",
    edit: "Edit",
    delete: "Delete",
    displayNameLabel: "Display Name",
    descriptionLabel: "Description",
    brokenRef: "{{count}} category references broken",
    deselectAll: "Deselect All",
    categoryCount: "{{count}} categories",
    preview: "Preview",
    skills: "Skills",
    byCategory: "By Category",
    bySource: "By Source",
    bySkill: "Manual Select",
    selectSources: "Select Sources",
    searchSources: "Search sources...",
    selectSkills: "Select Skills",
    searchSkills: "Search skills...",
  },

  // ── Category Management ───────────────────────────────────
  category: {
    title: "Category Management",
    createNew: "New Category",
    empty: "No Categories",
    emptyHint: 'Click "New Category" to create one',
    namePlaceholder: "Category ID (e.g. coding)",
    displayNamePlaceholder: "Display Name (e.g. Programming)",
    descriptionPlaceholder: "Description (optional)",
    createButton: "Create",
    loadFailed: "Failed to load data",
    createFailed: "Failed to create category",
    updateFailed: "Failed to update category",
    deleteFailed: "Failed to delete category",
    batchRemoveSuccess: "Moved {{count}} Skills out of category",
    batchRemoveFailed: "Batch operation failed",
    batchRemoveButton: "Remove from category ({{count}})",
    processing: "Processing...",
    selectAllLabel: "Select All",
    selectedCount: "{{count}} selected",
    noSkills: "No Skills in this category",
    deleteConfirmTitle: "Confirm Delete",
    deleteConfirmDesc: 'Are you sure you want to delete category "{{name}}"?',
    descriptionLabel: "Description",
    skillCount: "{{count}} Skills",
    collapse: "Collapse",
    expand: "Expand",
  },

  // ── Metadata Editor ───────────────────────────────────────
  metadata: {
    title: "Edit Metadata",
    fieldName: "Name",
    fieldDescription: "Description",
    fieldTags: "Tags (comma separated)",
    fieldMoveCategory: "Move to Category",
    movePlaceholder: "Target category name",
    moveButton: "Move",
    deleteConfirmTitle: "Confirm Delete",
    deleteConfirmDesc:
      "Are you sure you want to delete this Skill? This action cannot be undone.",
    saveFailed: "Save failed",
    deleteFailed: "Delete failed",
    moveFailed: "Move failed",
    closePanel: "Close edit panel",
  },

  // ── Header ────────────────────────────────────────────────
  header: {
    searchPlaceholder: "⌘K Search Skills...",
    searchAriaLabel: "Global search",
    toggleTheme: "Toggle theme",
    switchLanguage: "Switch language",
    langZh: "中",
    langEn: "EN",
  },

  // ── Toast Messages ────────────────────────────────────────
  toast: {
    loadFailed: "Failed to load data",
    loadSkillsFailed: "Failed to load Skills",
    loadBundlesFailed: "Failed to load bundles",
    syncNoSkill: "Please select Skills to sync first",
    syncFailed: "Sync failed",
    workflowLoaded: 'Workflow "{{name}}" loaded to editor',
    workflowLoadFailed: "Failed to load workflow",
    workflowDeleted: 'Workflow "{{name}}" deleted',
    workflowDeleteFailed: "Failed to delete workflow",
    workflowUndoDelete: 'Undo delete workflow "{{name}}"',
  },

  // ── Workflow Page ─────────────────────────────────────────
  workflow: {
    tabList: "Workflows",
    tabNew: "New Workflow",
    empty: "No Workflows Yet",
    emptyHint: 'Click "New Workflow" to create one',
    createNew: "New Workflow",
    loading: "Loading...",
    editAriaLabel: "Edit {{name}}",
    deleteAriaLabel: "Delete {{name}}",
    addCustomStep: "Add Custom Step",
    customStep: "Custom Step",
    customStepPlaceholder:
      "Enter custom step description, e.g.: Check staged code and analyze intent",
    removeStep: "Remove this step",
    startEditing:
      "Select Skills from the left to add to workflow, or add custom steps to compose an automated workflow",
    reset: "Reset Workflow",
  },

  // ── Import Page ───────────────────────────────────────────
  import: {
    title: "Import Manager",
    subtitle: "Scan and import Skill files from CodeBuddy IDE directory",
    scanFailed: "Scan Failed",
    emptyDir: "Directory Empty",
    emptyDirHint: "No .md files found in",
    idleTitle: "Start Scanning",
    idleHint:
      'Enter the Skill directory path of CodeBuddy IDE and click "Scan" to discover importable files',
    importManage: "Import Manager",
    scanPath: "Scan Path",
  },

  // ── Paths Page ────────────────────────────────────────────
  paths: {
    title: "Path Configuration",
    subtitle: "Manage path presets for quick selection during sync and import",
  },

  // ── Path Preset Manager ───────────────────────────────────
  pathPreset: {
    title: "Path Presets",
    addPreset: "Add Preset",
    noPresets: "No Path Presets",
    noPresetsHint:
      "Add common paths for quick selection during sync and import",
    namePlaceholder: "Preset name (e.g. My Project)",
    pathPlaceholder: "/path/to/project",
    createSuccess: "Path preset added",
    createFailed: "Failed to add path preset",
    updateSuccess: "Path preset updated",
    updateFailed: "Failed to update path preset",
    deleteSuccess: "Path preset deleted",
    deleteFailed: "Failed to delete path preset",
    deleteConfirmTitle: "Confirm Delete",
    deleteConfirmDesc:
      'Are you sure you want to delete path preset "{{name}}"?',
  },

  // ── Command Palette ───────────────────────────────────────
  commandPalette: {
    placeholder: "Search Skills, pages...",
    noResults: "No results found",
    groupSkills: "Skills",
    groupWorkflows: "Workflows",
    groupPages: "Pages",
  },

  // ── Skill List ────────────────────────────────────────────
  skillList: {
    tagCount: "{{count}} tags",
    workflowBadge: "Workflow",
  },

  // ── External Skill Source Label ───────────────────────
  skill: {
    viewOnGithub: "View on GitHub",
    sourceInfo: "Source Info",
    sourceRepo: "Repository",
    readonlyTooltip: "External Skill (Read-only)",
    readonlyEditTooltip:
      "External Skills are read-only, managed by upstream repository",
    readonlyDeleteTooltip: "External Skills cannot be deleted",
    editMeta: "Edit Metadata",
    syncToIDE: "Sync to IDE",
    copyPath: "Copy Path",
    pathCopied: "Path copied to clipboard",
    confirmDelete: "Confirm Delete",
  },
  // ── Confirm Dialog ────────────────────────────────────────
  confirmDialog: {
    defaultTitle: "Confirm Action",
    defaultDesc: "Are you sure you want to proceed?",
  },

  // ── Import Cleanup Confirm ────────────────────────────────
  importCleanup: {
    confirmTitle: "Confirm Delete Source Files",
    confirmDesc:
      "Confirm deletion of {{count}} imported source files? This action cannot be undone.",
    confirmButton: "Confirm Delete",
  },

  // ── Error Code Mapping ────────────────────────────────────
  errors: {
    SKILL_NOT_FOUND: "Skill not found",
    VALIDATION_ERROR: "Invalid input data",
    BUNDLE_LIMIT_EXCEEDED: "Bundle limit reached (50)",
    BUNDLE_NAME_DUPLICATE: "Bundle name already exists",
    PATH_TRAVERSAL: "Path contains illegal characters",
    unknown: "Operation failed, please try again",
  },
} as const;
