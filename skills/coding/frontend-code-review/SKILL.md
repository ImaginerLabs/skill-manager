---
name: frontend-code-review
description: >
  Comprehensive frontend code quality audit covering ESLint, robustness, side effects, and performance.
  Auto-detects and fixes ESLint errors, analyzes defensive coding, boundary conditions, race conditions,
  and performance anti-patterns for React/Vue/Taro projects. Use this skill whenever the user needs a
  thorough code quality check — before committing, during a PR review, after refactoring, or when inheriting
  someone else's code. Trigger on phrases like "code review", "check this code", "review my code",
  "code quality", "pre-commit check", "审查代码", "检查这段代码", "代码体检", "质量检查", "帮我看看这段代码",
  "代码有没有问题", "检查一下代码", "帮我做代码审查", "提交前检查". Also use when the user is about to
  commit code, doing a PR review, or inheriting code — even if they don't say "code review", any request to
  verify code quality or check for issues before shipping is a good fit.
category: coding
---

# Frontend Code Quality Review

## Core Capability

Full-spectrum code health check for frontend code, ensuring production-grade quality. Works with React, Vue, Taro, and other modern frontend frameworks.

The goal isn't just to find problems — it's to give the user a clear verdict: is this code safe to ship, and if not, what exactly needs fixing?

## When to Use

- Pre-commit self-check
- Pre-PR-review preparation
- Post-refactoring regression check
- Quality assessment when inheriting code
- Post-bug-fix verification

## Related Skills

| Skill                           | Relationship | Use case                                        |
| ------------------------------- | ------------ | ----------------------------------------------- |
| `staged-code-review`            | Upstream     | When reviewing staged changes before commit     |
| `frontend-staged-bundle-review` | Parallel     | When also concerned about bundle size           |
| `code-comment-writer`           | Downstream   | When review finds readability issues            |
| `tech-stack-detection`          | Prerequisite | When project tech stack is unknown              |
| `react-performance`             | Deeper dive  | When performance issues are found during review |

---

## Checklist

For the full detailed checklist with code examples, see [checklist.md](references/checklist.md).

### 1. Static Analysis (Lint & Fix)

Run lint checks, prioritize fixing `no-unused-vars`, `no-undef`, `exhaustive-deps`. Only fix errors introduced by the current change — don't expand the diff.

### 2. Robustness & Defensive Programming

Key areas:

- **TypeScript**: Complete interfaces, proper optional marking, default values
- **Null safety**: Optional chaining `?.` and nullish coalescing `??`
- **Boundary handling**: Empty arrays, division by zero, negative indices
- **Async safety**: try-catch around awaits, loading/error states
- **Race conditions**: AbortController, cancellation flags, disabled buttons during loading

### 3. Context & Side Effects

- **Upstream impact**: When modifying shared components, check all consumers
- **Effect cleanup**: Every `useEffect` subscription must have a cleanup function
- **State pollution**: Never mutate props or global state objects directly
- **Closure traps**: Ensure event callbacks reference the latest state values

### 4. Performance

- Render control: `React.memo`, `useMemo`, `useCallback` where needed
- Frequency control: debounce/throttle for search, scroll, resize
- List rendering: stable, unique `key`
- Code splitting: `React.lazy` for heavy components

### 5. Framework-Specific Checks

- **Vue**: Reactive traps, lifecycle cleanup, computed side effects, v-for + v-if
- **Taro**: API compatibility, subpackage config, setData optimization, lifecycle hooks

---

## Workflow

```
1. Receive code (specified file or current context)
       ↓
2. Run ESLint check → auto-fix basic errors
       ↓
3. Deep analysis: robustness → side effects → performance
       ↓
4. Generate report with scoring
       ↓
5. Action recommendation: pass / warn / block
```

---

## Output Format

```markdown
## Code Quality Review Report

### Overview

- **File**: `[filename]`
- **Tech stack**: React / Vue / Taro
- **Overall score**: 🟢 Excellent (90+) / 🟡 Good (70-89) / 🔴 Needs work (<70)

---

### 1. ESLint Check

| Status  | Rule | Location | Description |
| ------- | ---- | -------- | ----------- |
| ✅ PASS | -    | -        | No errors   |

**Fixes applied:**

- [List auto-fixed issues]

---

### 2. Robustness Assessment

#### Risk Items

| Severity  | Location    | Issue   | Fix suggestion |
| --------- | ----------- | ------- | -------------- |
| 🔴 High   | `file:line` | [issue] | [suggestion]   |
| 🟡 Medium | `file:line` | [issue] | [suggestion]   |

---

### 3. Side Effects & Context

- **Upstream impact**: [analysis]
- **Downstream impact**: [analysis]
- **Global impact**: [analysis]

---

### 4. Performance Suggestions

| Priority | Location    | Issue   | Suggestion   | Expected gain |
| -------- | ----------- | ------- | ------------ | ------------- |
| 🔴 High  | `file:line` | [issue] | [suggestion] | [gain]        |

---

### Summary

- **Blockers**: X (must fix)
- **Warnings**: X (should fix)
- **Suggestions**: X (nice to have)

#### Action

- [ ] ✅ Safe to commit (no blockers)
- [ ] ⚠️ Fix warnings before commit
- [ ] ❌ Must fix blockers before commit
```

---

## Quick Reference

| Problem         | Typical scenario                         | Solution                           |
| --------------- | ---------------------------------------- | ---------------------------------- |
| Null error      | `Cannot read property of undefined`      | Use `?.` optional chaining         |
| Race condition  | Fast page switching causes data mismatch | AbortController to cancel requests |
| Memory leak     | setState after unmount                   | useEffect cleanup function         |
| Infinite render | useEffect dependency array error         | Check dependency completeness      |
| Performance     | List rendering lag                       | Use key + React.memo               |

### React/Vue Comparison

| Check            | React                       | Vue                              |
| ---------------- | --------------------------- | -------------------------------- |
| Effect cleanup   | `useEffect` return function | `onUnmounted`                    |
| Computed caching | `useMemo`                   | `computed`                       |
| Callback caching | `useCallback`               | Not needed manually              |
| State update     | `setState` / `useState`     | `ref` / `reactive`               |
| Props validation | TypeScript interface        | `props` definition + `validator` |
