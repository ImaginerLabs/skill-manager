# Skill Manager

> A local tool for browsing, orchestrating, and syncing AI Skill files to your IDE

📖 [中文文档](./README.md)

---

## Introduction

**Skill Manager** is a locally-running full-stack web application for managing AI coding assistant Skill files (e.g., CodeBuddy). Browse, search, orchestrate workflows, and sync Skills to your IDE with one click.

---

## Features

| Feature             | Description                                                                                                                                                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 📚 Browse           | Category tree, grid/list view, Markdown preview; case-insensitive category matching; click row in list view to open detail                                                                                                         |
| 🔍 Search           | Fuse.js in-memory fuzzy search, < 200ms; Command Palette with description preview & type grouping                                                                                                                                  |
| 🔗 Workflow         | Drag-and-drop orchestration; supports adding natural language custom steps; generate workflow `.md`; Tab layout to manage existing workflows; draft auto-saved                                                                     |
| 🔄 Sync             | Three sync modes: Incremental (changed files only), Replace (full overwrite), Diff (preview changes); SplitButton for quick mode switching; workflow sync optimization (UX enhancement in progress)                                |
| 📥 Import           | Scan and import Skills from IDE directory                                                                                                                                                                                          |
| 🗂️ Category         | Tab-based settings page: category management + bundle management; batch remove Skills from category                                                                                                                                |
| 📦 Bundles          | Save category combinations as bundles; one-click activate to switch entire category config; broken-reference warning                                                                                                               |
| ⌨️ Hotkeys          | `⌘K` command palette (with description & type groups), `Alt+↑/↓` step reorder                                                                                                                                                      |
| 📋 Quick Actions    | Copy Skill path from detail panel; version number auto-synced with `package.json`                                                                                                                                                  |
| 🖼️ Secondary Nav    | Left-side secondary sidebar on home page; supports "By Category" and "By Source" view tabs; bottom shortcut to manage categories                                                                                                   |
| 🌐 External Hub     | Auto-pull Skills from GitHub repos (e.g. anthropics/skills); source badge with clickable link; readonly protection; GitHub Action for scheduled sync                                                                               |
| 🤖 Agent Skills     | 11 specialized AI Agent skills covering API design, cloud architecture, code implementation, data modeling, debugging, deployment, edge cases, performance optimization, quality analysis, security audit, and system architecture |
| 📊 Stats Panel      | Sidebar footer shows total Skills, categories, and sync count                                                                                                                                                                      |
| 🔥 Activity Heatmap | Visualize recent Skill file modification activity, GitHub contribution heatmap style; hover tooltip shows daily change count and file list                                                                                         |
| 🌓 Theme Toggle     | Light/dark theme switch via Sun/Moon button in Header; preference persisted to localStorage, initialized from system `prefers-color-scheme`                                                                                        |
| 🌍 i18n             | Supports Chinese (zh) and English (en); language follows browser settings; manual switch with persistence                                                                                                                          |

---

## Tech Stack

| Layer    | Tech                                 |
| -------- | ------------------------------------ |
| Frontend | React 19 + TypeScript                |
| Build    | Vite 8                               |
| Styling  | Tailwind CSS v4 + shadcn/ui          |
| State    | Zustand 5                            |
| Backend  | Node.js + Express 5                  |
| Storage  | File system (`.md` + `.yaml`, no DB) |
| Search   | Fuse.js                              |
| DnD      | @dnd-kit                             |
| Testing  | Vitest + Playwright                  |

---

## Quick Start

### Requirements

- Node.js >= 18
- npm >= 9

### Install & Run

```bash
# Clone the repo
git clone https://github.com/your-username/skill-package.git
cd skill-package

# Install dependencies
npm install

# Start dev server (client + server)
npm run dev
```

Open in browser: **http://localhost:5173**

### Production

```bash
# Build
npm run build

# Start (single process, port 3000)
npm start
```

### Global CLI

```bash
# After global install
npm link
skill-manager
```

---

## Project Structure

```
skill-package/
├── src/                    # Frontend source
│   ├── components/         # React components (feature-based)
│   │   ├── ui/             # Base UI components (shadcn/ui)
│   │   ├── layout/         # Layout components (AppLayout, Sidebar, SecondarySidebar)
│   │   ├── stats/          # Stats components (StatsPanel, ActivityHeatmap)
│   │   ├── skills/         # Skill browsing
│   │   ├── workflow/       # Workflow orchestration
│   │   ├── sync/           # IDE sync
│   │   ├── import/         # Import management
│   │   ├── settings/       # Settings
│   │   └── shared/         # Shared components
│   ├── stores/             # Zustand state management
│   ├── hooks/              # Custom hooks
│   └── lib/                # Utilities
├── server/                 # Backend source
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   └── middleware/         # Express middleware
├── shared/                 # Shared types & schemas
├── skills/                 # Skill files
│   ├── agent/             # AI Agent skills (api-designer, cloud-architect, etc.)
│   ├── coding/
│   ├── writing/
│   ├── devops/
│   └── workflows/
├── config/                 # User config (YAML)
├── tests/                  # Integration & E2E tests
└── bin/                    # CLI entry
```

---

## Development

### Scripts

```bash
npm run dev           # Start dev server
npm run build         # Build for production
npm run typecheck     # TypeScript type check
npm run lint          # ESLint check
npm run lint:fix      # Auto-fix lint issues
npm run format        # Format code with Prettier
npm run test          # Run unit tests (watch mode)
npm run test:run      # Run unit tests (once)
npm run test:coverage # Coverage report
npm run test:e2e      # Run E2E tests
npm run test:all      # Run all tests
```

### Code Quality

The project enforces strict code quality standards:

- **ESLint**: Full React Hooks rules configuration ensuring proper dependency declarations
- **TypeScript**: Strict mode enabled with complete Node.js type definitions support
- **Prettier**: Unified code formatting standards
- **Husky**: Pre-commit checks to ensure code quality

### Git Hooks

The project uses **Husky** to manage Git hooks, ensuring code quality and documentation sync:

| Hook         | Trigger                         | Actions                                                          |
| ------------ | ------------------------------- | ---------------------------------------------------------------- |
| `pre-commit` | Before `git commit`             | lint-staged (ESLint + Prettier) + unit tests + README sync check |
| `commit-msg` | After commit message is written | commitlint validation (Conventional Commits)                     |
| `pre-push`   | Before `git push`               | E2E tests + auto semantic versioning on main branch              |

**README Sync Check Rule:**

When files under `src/`, `server/`, `shared/`, `skills/`, or `_bmad-output/` are changed, **both `README.md` (Chinese) and `README.en.md` (English) must be updated**, otherwise the commit will be blocked.

**Project Context Update Reminder:**

When business files change, the hook also reminds you to consider updating `_bmad-output/project-context.md` (AI agent project context). If the change involves tech stack, architecture patterns, directory structure, or development conventions, it is recommended to regenerate it using the `bmad-generate-project-context` skill or update the relevant sections manually. This check is **non-blocking** and will not prevent the commit.

```bash
# Skip the check if you're sure no doc update is needed
git commit --no-verify
```

---

### API Overview

```
GET    /api/skills                        # List all Skills
GET    /api/skills/:id                    # Get Skill detail
PUT    /api/skills/:id/meta               # Update Skill metadata
DELETE /api/skills/:id                    # Delete Skill
GET    /api/categories                    # List categories
GET    /api/workflows                     # List workflows
POST   /api/sync/push                     # Push to IDE (supports mode: full/incremental/replace)
POST   /api/sync/diff                     # Get sync diff report
POST   /api/sync/import                   # Import from IDE
GET    /api/config                        # Get config
POST   /api/refresh                       # Refresh Skill cache
GET    /api/health                        # Health check
GET    /api/skill-bundles                 # List all bundles
POST   /api/skill-bundles                 # Create bundle
PUT    /api/skill-bundles/:id             # Update bundle
DELETE /api/skill-bundles/:id             # Delete bundle
PUT    /api/skill-bundles/:id/apply       # Activate bundle (set activeCategories)
GET    /api/stats/activity                # Get recent activity data (supports ?weeks= param)
```

---

## Skill File Format

Each Skill is a Markdown file with YAML Frontmatter:

```markdown
---
name: my-skill
description: Description of what this Skill does
category: coding
tags: [review, typescript]
author: Alex
version: 1.0.0
---

# Skill Content

Write the specific instructions and details for this Skill here...
```

---

## License

MIT © Alex
