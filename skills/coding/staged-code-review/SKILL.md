---
name: staged-code-review
description: >
  Comprehensive pre-commit review of git staged changes. Reads git diff --staged, performs tech-stack-aware
  code quality checks, and generates a conventional commit message. Supports --story=, --task=, --fix=
  parameters to link requirement IDs. Use this skill whenever the user is about to commit code and wants
  a quality gate — it catches debug leftovers, sensitive data, missing error handling, and framework-specific
  issues before they enter the repository. Trigger on phrases like "review staged changes", "pre-commit review",
  "git review", "review before commit", "check staged code", "commit check", "审查暂存区", "提交前审查",
  "git review", "帮我审查代码再提交", "检查暂存代码", "commit前检查". Also use when the user says they're
  about to commit, push, or submit a PR — catching issues before they ship is always cheaper than fixing them after.
category: coding
---

# Git Staged Code Review

## Core Capability

Before `git commit`, review all staged changes for quality issues and generate a conventional commit message. This is the last quality gate — catching problems here is far cheaper than finding them in production or during PR review.

## When to Use

- The last quality checkpoint before `git commit`
- When linking requirement IDs, Story IDs to commit records
- Tech-stack-differentiated code checks in multi-stack projects
- Local checks before CI/CD pipeline

## Workflow

### Step 1: Read Staged Diff

```bash
git diff --staged
git diff --staged --name-only
```

**Pre-check**: If staging area is empty, prompt the user to run `git add` first.

### Step 2: Identify Tech Stack

Auto-detect based on changed file extensions and content:

| File signature                                     | Tech stack         | Applied rules                                 |
| -------------------------------------------------- | ------------------ | --------------------------------------------- |
| `*.tsx` / `*.jsx` / `*.ts` / `*.js` + React import | React / TypeScript | Stale closures, Hook deps, render performance |
| `*.vue`                                            | Vue                | Reactive traps, lifecycle side effects        |
| `*.go`                                             | Go                 | Error handling, goroutine leaks               |
| `*.py`                                             | Python             | Exception handling, type annotations          |
| `*.java` / `*.kt`                                  | Java / Kotlin      | Null pointers, resource release               |
| `*.rs`                                             | Rust               | Ownership, lifetimes                          |

### Step 3: Execute Code Review

#### Universal Checks

- **Debug code**: Leftover `console.log`, `debugger`, `print`, unhandled `TODO`
- **Sensitive data**: Hardcoded passwords, tokens, keys, internal addresses
- **Comment quality**: Remove meaningless comments; complex logic must have explanatory comments
- **Error handling**: New async/IO operations must have error handling
- **Boundary conditions**: Null, empty arrays, extreme inputs must be guarded

#### React/TypeScript Specific Checks

- Hook dependency arrays complete (exhaustive-deps)
- Objects/functions passed to children wrapped in useMemo / useCallback
- useEffect has corresponding cleanup function
- List rendering key uses stable unique ID
- New Props have TypeScript type definitions

### Step 4: Parse User Parameters

| Parameter format    | Meaning           | Message example                           |
| ------------------- | ----------------- | ----------------------------------------- |
| `--story=STORY-123` | Link Story ID     | `feat: xxx\n\nStory: STORY-123`           |
| `--task=TASK-456`   | Link Task ID      | `feat: xxx\n\nTask: TASK-456`             |
| `--fix=BUG-789`     | Link Bug ID       | `fix: xxx\n\nFixes: BUG-789`              |
| `--review`          | Force review mode | No auto-commit, only output review report |

### Step 5: Decide Next Steps Based on Review Results

| Conclusion                                  | Action                                              |
| ------------------------------------------- | --------------------------------------------------- |
| ✅ **Pass**: No blocking issues             | Generate commit message, ask user whether to commit |
| ⚠️ **Warning**: Suggestions but no blockers | List suggestions, ask user whether to proceed       |
| ❌ **Fail**: Blocking issues exist          | List must-fix issues, **do not commit**             |

**Blocking issues (must fix before commit):**

- Hardcoded passwords, tokens, private keys
- Leftover `debugger` statements
- Code that could cause security vulnerabilities (XSS, SQL injection, etc.)

---

## Commit Message Convention

Follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

[body]

[footer]
```

**Type options:**

| type       | Use case                           | Example                                        |
| ---------- | ---------------------------------- | ---------------------------------------------- |
| `feat`     | New feature                        | `feat(user): add avatar upload`                |
| `fix`      | Bug fix                            | `fix(cart): fix quantity calculation error`    |
| `refactor` | Refactoring                        | `refactor(utils): refactor utility functions`  |
| `perf`     | Performance optimization           | `perf(list): optimize list render performance` |
| `style`    | Code formatting                    | `style: unify code indentation`                |
| `test`     | Testing                            | `test(user): add login unit tests`             |
| `chore`    | Build/toolchain/dependency updates | `chore: upgrade dependencies`                  |
| `docs`     | Documentation changes              | `docs: update API docs`                        |

---

## Output Format

```markdown
## Staged Code Review Report

### Review Overview

- **Changed files**: X
- **Tech stack**: [detected]
- **Conclusion**: ✅ Pass / ⚠️ Warning / ❌ Fail

### Universal Checks

| Check               | Status            | Notes            |
| ------------------- | ----------------- | ---------------- |
| Debug code          | ✅ PASS / ❌ FAIL | [specific issue] |
| Sensitive data      | ✅ PASS / ❌ FAIL | [specific issue] |
| Error handling      | ✅ PASS / ⚠️ WARN | [specific issue] |
| Boundary conditions | ✅ PASS / ⚠️ WARN | [specific issue] |

### Issue List

#### ❌ Blocking Issues (must fix)

- `filename:line`: [issue] → [fix suggestion]

#### ⚠️ Suggestions (optional)

- `filename:line`: [issue] → [optimization suggestion]

### Commit Message
```

[type]([scope]): [subject]

[body (if any)]

[footer (if any, including linked parameters)]

```

### Next Steps

- [ ] Commit directly (review passed)
- [ ] Fix and re-review
- [ ] Abort this commit
```
