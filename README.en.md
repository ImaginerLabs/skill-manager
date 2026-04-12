# Skill Manager

> A local tool for browsing, orchestrating, and syncing AI Skill files to your IDE

📖 [中文文档](./README.md)

---

## Introduction

**Skill Manager** is a locally-running full-stack web application for managing AI coding assistant Skill files (e.g., CodeBuddy). Browse, search, orchestrate workflows, and sync Skills to your IDE with one click.

---

## Features

| Feature     | Description                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------- |
| 📚 Browse   | Category tree, grid/list view, Markdown preview; case-insensitive category matching               |
| 🔍 Search   | Fuse.js in-memory fuzzy search, < 200ms; Command Palette with description preview & type grouping |
| 🔗 Workflow | Drag-and-drop orchestration, generate workflow `.md`; Tab layout to manage existing workflows     |
| 🔄 Sync     | Push selected Skills to IDE directory (supports CodeBuddy); step-by-step onboarding guide         |
| 📥 Import   | Scan and import Skills from IDE directory                                                         |
| ⚙️ Settings | Manage IDE paths, category definitions, path presets                                              |
| ⌨️ Hotkeys  | `⌘K` command palette (with description & type groups), `Alt+↑/↓` step reorder                     |

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
│   │   ├── layout/         # Layout components
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
GET    /api/skills              # List all Skills
GET    /api/skills/:id          # Get Skill detail
PUT    /api/skills/:id/meta     # Update Skill metadata
DELETE /api/skills/:id          # Delete Skill
GET    /api/categories          # List categories
GET    /api/workflows           # List workflows
POST   /api/sync/push           # Push to IDE
POST   /api/sync/import         # Import from IDE
GET    /api/config              # Get config
POST   /api/refresh             # Refresh Skill cache
GET    /api/health              # Health check
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
