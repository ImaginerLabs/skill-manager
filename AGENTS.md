# Skill Manager — Project Context

## Tech Stack

- **Frontend**: React 19 + TypeScript, Vite 8, Tailwind CSS v4, Zustand 5
- **Backend**: Express 5 (ESM), Node.js ≥18
- **Testing**: Vitest (unit/integration) + Playwright (E2E)
- **Shared**: `shared/types.ts`, `shared/schemas.ts`, `shared/constants.ts`

---

## Developer Commands

```bash
npm run dev        # Frontend (5173) + Backend (3001) in parallel
npm run build      # tsc --noEmit + vite build
npm run typecheck  # TypeScript check only
npm run lint        # ESLint (pre-commit enforces --max-warnings=0)
npm run lint:fix   # Auto-fix lint
npm run format     # Prettier write
npm run test        # Vitest watch mode
npm run test:run    # Vitest single run
npm run test:e2e    # Playwright E2E
npm run test:all    # vitest run + playwright test
```

---

## Dev Server Ports

- Frontend (Vite): `http://localhost:5173`
- Backend (Express): `http://localhost:3001` (proxied via Vite `/api`)
- Vite `server.watch.ignored` excludes `server/`, `config/`, `skills/`, `*.yaml` — changes there do not trigger HMR

---

## Critical Rules (LLM-frequent-mistakes)

### ESM Imports (Server)

- Server-side imports **must** include `.js` extension: `import { foo } from "./bar.js"` even when source is `.ts`
- This is required by NodeNext moduleResolution

### Shared Types

- All shared types in `shared/types.ts` — **never** define in `src/` or `server/`
- All Zod schemas in `shared/schemas.ts`
- All constants in `shared/constants.ts`

### Error Handling

- Use `AppError` class from `server/types/errors.ts` — **never** hardcode error codes
- Use `ErrorCode` constants from `shared/constants.ts`
- Routes must wrap in try/catch → `next(err)`

### File Operations

- Use `safeWrite()` (atomic + concurrent-safe) — **never** `fs.writeFile()`
- Use `fs-extra` — **never** native `fs` module
- All file ops must validate path with `isSubPath()` before proceeding

### API Layer (Frontend)

- All frontend fetch calls via `src/lib/api.ts` — **never** call `fetch` directly in components/stores

### Routing Order (Express)

- `POST /api/workflows/preview` must register **before** `GET /api/workflows/:id`
- `GET /api/skills/errors` must register **before** `GET /api/skills/:id`
- `GET /api/skill-bundles/export` must register **before** `GET /api/skill-bundles/:id`

---

## Architecture

```
skill-package/
├── src/                  # React frontend (Vite)
│   ├── components/       # By feature: skills/, sync/, workflow/, layout/, etc.
│   ├── stores/           # Zustand stores (skill-store, sync-store, ui-store...)
│   ├── lib/api.ts        # Frontend API client layer
│   └── hooks/            # Custom hooks (useSkillSearch, etc.)
├── server/               # Express backend
│   ├── routes/           # Thin route handlers (parse + validate → delegate)
│   ├── services/         # Business logic (functional exports, no classes)
│   └── utils/            # pathUtils, fileUtils, frontmatterParser, yamlUtils
├── shared/               # Shared types, schemas, constants (single source of truth)
├── skills/               # Skill files (.md with YAML frontmatter)
├── config/               # YAML config files (categories.yaml, settings.yaml)
└── tests/                # unit/, integration/, e2e/
```

---

## Testing Conventions

- Unit tests: `tests/unit/` mirrors `src/` and `server/` structure
- E2E tests: `tests/e2e/*.spec.ts`
- Each Story task requires corresponding unit test before marking `[x]`
- QA phase is **mandatory** before code review (generates integration/E2E tests)
- `tsc --noEmit` zero errors required before entering QA

---

## Git Workflow

### Pre-commit (lint-staged)

- `eslint --max-warnings=0` — zero tolerance for warnings
- Prettier check on all staged files

### Pre-push (main branch only)

- Conventional Commits based versioning
- `feat:` → patch only (not minor); `feat!:` or `fix!:` → minor
- Non-main branches: skipped entirely

### README Sync Rule

- Changes to `src/`, `server/`, `shared/`, `skills/`, `_bmad-output/` **must** update both `README.md` (Chinese) and `README.en.md` (English) before commit

---

## BMad Skills Location

BMad skills are in `.opencode/skills/` (68 skills installed):

- BMad Method: `bmad-create-prd`, `bmad-dev-story`, `bmad-code-review`, etc.
- TestArch: `bmad-testarch-atdd`, `bmad-testarch-automate`, etc.
- Project docs: `_bmad-output/project-context.md`

Full execution pipeline: `docs/execution-pipeline.md`
Full skills inventory: `docs/bmad-skills-inventory.md`
