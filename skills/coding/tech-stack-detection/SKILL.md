---
name: tech-stack-detection
description: >
  Systematically scans project config files to identify tech stack composition, version info, and
  engineering tooling. Outputs a complete tech stack landscape report. Use this skill whenever the user
  needs to understand what technologies a project uses — whether they're onboarding to a new project,
  evaluating upgrade feasibility, or troubleshooting build issues. Trigger on phrases like "detect tech
  stack", "analyze project config", "what tech does this project use", "tech stack", "project tech choices",
  "tech stack analysis", "project architecture", "technology landscape", "检测技术栈", "分析项目配置",
  "这个项目用了什么技术", "技术栈分析", "项目技术选型", "技术体系". Also use when the user is about
  to do a code review, refactoring, or migration on a project they don't yet understand — knowing the tech
  stack first is the foundation for every other decision.
category: coding
---

# Frontend Project Tech Stack Detection

## Core Capability

Given a project path, systematically scan config files in a predefined order, identify tech stack composition, and output a clear tech stack report.

## When to Use

- Onboarding to a new project, quickly understand tech choices
- Evaluating project upgrade/migration feasibility
- Aligning team understanding of project tech stack
- Understanding toolchain config before troubleshooting build/runtime issues

---

## File Reading Order

Read files in this priority order. Skip files that don't exist.

### Layer 1: Project Basics

| Order | File                                                 | Extract                               |
| ----- | ---------------------------------------------------- | ------------------------------------- |
| 1     | `package.json`                                       | Framework, core dependencies, scripts |
| 2     | `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml` | Package manager type                  |

### Layer 2: Build Tool Config

| Order | File                                      | Extract                    |
| ----- | ----------------------------------------- | -------------------------- |
| 3     | `vite.config.ts` / `vite.config.js`       | Vite plugins, alias, proxy |
| 4     | `webpack.config.js` / `webpack.config.ts` | Webpack loader, plugin     |
| 5     | `next.config.js` / `next.config.ts`       | Next.js SSR/SSG mode       |
| 6     | `craco.config.js` / `react-scripts`       | CRA project identifier     |
| 7     | `rollup.config.js`                        | Rollup config              |

### Layer 3: Language & Type Config

| Order | File                                   | Extract                                  |
| ----- | -------------------------------------- | ---------------------------------------- |
| 8     | `tsconfig.json` / `tsconfig.base.json` | TypeScript, compile target, path aliases |
| 9     | `babel.config.js` / `.babelrc`         | Babel presets, plugins                   |

### Layer 4: Code Standards Config

| Order | File                                 | Extract                |
| ----- | ------------------------------------ | ---------------------- |
| 10    | `.eslintrc*` / `eslint.config.js`    | ESLint rule set        |
| 11    | `.prettierrc` / `prettier.config.js` | Code formatting config |
| 12    | `stylelint.config.js`                | CSS lint rules         |

### Layer 5: Git & Commit Standards

| Order | File                   | Extract              |
| ----- | ---------------------- | -------------------- |
| 13    | `.husky/` directory    | Git Hooks config     |
| 14    | `commitlint.config.js` | Commit message rules |

### Layer 6: Environment & Deployment

| Order | File                                | Extract                              |
| ----- | ----------------------------------- | ------------------------------------ |
| 15    | `.env*` files                       | Environment variables, API addresses |
| 16    | `Dockerfile` / `docker-compose.yml` | Containerized deployment             |
| 17    | `nginx.conf`                        | Deployment server config             |

---

## Tech Stack Identification Rules

### Framework

| Key package     | Conclusion                                  |
| --------------- | ------------------------------------------- |
| `react`         | React project                               |
| `vue`           | Vue project (check version for Vue2 / Vue3) |
| `next`          | Next.js (React SSR/SSG)                     |
| `nuxt`          | Nuxt.js (Vue SSR/SSG)                       |
| `@angular/core` | Angular project                             |
| `@tarojs/taro`  | Taro mini-program project                   |
| `remix`         | Remix (React full-stack)                    |

### Build Tool

| Key package/file        | Conclusion               |
| ----------------------- | ------------------------ |
| `vite` in devDeps       | Vite                     |
| `webpack` in devDeps    | Webpack                  |
| `react-scripts` in deps | CRA                      |
| `@vue/cli-service`      | Vue CLI                  |
| `turbo`                 | Turborepo (Monorepo)     |
| `rsbuild`               | Rspack (Rust build tool) |

### State Management

| Key package                  | Conclusion              |
| ---------------------------- | ----------------------- |
| `redux` / `@reduxjs/toolkit` | Redux                   |
| `zustand`                    | Zustand                 |
| `mobx`                       | MobX                    |
| `pinia`                      | Pinia (Vue)             |
| `jotai` / `recoil`           | Atomic state management |

### CSS Solution

| Key package                               | Conclusion           |
| ----------------------------------------- | -------------------- |
| `tailwindcss`                             | Tailwind CSS         |
| `styled-components` / `@emotion/react`    | CSS-in-JS            |
| `sass` / `less`                           | Preprocessor         |
| `@mui/material` / `antd` / `@arco-design` | UI component library |

### Testing Framework

| Key package              | Conclusion             |
| ------------------------ | ---------------------- |
| `jest` / `vitest`        | Unit testing framework |
| `@testing-library/react` | React testing utility  |
| `cypress` / `playwright` | E2E testing framework  |

---

## Output Format

```markdown
## Tech Stack Detection Report: `[project name/path]`

### Overview

- **Project type**: Web app / Mini-program / SSR app / Monorepo
- **Main framework**: [framework name] [version]
- **Build tool**: [tool name] [version]
- **Language**: TypeScript / JavaScript

### Core Tech Stack

| Category          | Choice                     | Version | Notes  |
| ----------------- | -------------------------- | ------- | ------ |
| Framework         | React / Vue / ...          | x.x.x   |        |
| Build tool        | Vite / Webpack / ...       | x.x.x   |        |
| Language          | TypeScript / JavaScript    | x.x     |        |
| Package manager   | pnpm / yarn / npm          | x.x.x   |        |
| State management  | Zustand / Redux / ...      | x.x.x   | If any |
| CSS solution      | Tailwind / CSS-in-JS / ... | —       |        |
| UI library        | Ant Design / MUI / ...     | x.x.x   | If any |
| Testing framework | Jest / Vitest / ...        | x.x.x   | If any |

### Engineering Config

| Tool       | Status                            | Notes              |
| ---------- | --------------------------------- | ------------------ |
| ESLint     | ✅ Configured / ❌ Not configured | Using xxx rule set |
| Prettier   | ✅ Configured / ❌ Not configured | —                  |
| Husky      | ✅ Configured / ❌ Not configured | —                  |
| TypeScript | ✅ Configured / ❌ Not configured | target: ESNext     |

### Key Scripts

| Command         | Description      |
| --------------- | ---------------- |
| `npm run dev`   | Start dev server |
| `npm run build` | Production build |

### Detection Basis

**Read**: package.json ✅, vite.config.ts ✅, tsconfig.json ✅

**Not found**: webpack.config.js ⚠️, .eslintrc ⚠️

### Next Steps

1. [Improvement suggestions based on detection results]
2. [Tech stack upgrade or optimization directions]
```

---

## Output Principles

- **Conclusions first** — Core tech stack table before details
- **Versions explicit** — Extract exact version numbers from package.json when possible
- **Missing means skip** — Don't error on missing files, don't guess, just skip
- **Actionable suggestions** — Include specific next-step recommendations
