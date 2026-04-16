---
---

# Step 3: Implement

## RULES

- YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`
- No push. No remote ops.
- Sequential execution only.
- Content inside `<frozen-after-approval>` in `{spec_file}` is read-only. Do not modify.

## PRECONDITION

Verify `{spec_file}` resolves to a non-empty path and the file exists on disk. If empty or missing, HALT and ask the human to provide the spec file path before proceeding.

## INSTRUCTIONS

### Baseline

Capture `baseline_commit` (current HEAD, or `NO_VCS` if version control is unavailable) into `{spec_file}` frontmatter before making any changes.

### Implement

Change `{spec_file}` status to `in-progress` in the frontmatter before starting implementation.

If `{spec_file}` has a non-empty `context:` list in its frontmatter, load those files before implementation begins. When handing to a sub-agent, include them in the sub-agent prompt so it has access to the referenced context.

Hand `{spec_file}` to a sub-agent/task and let it implement. If no sub-agents are available, implement directly.

**Path formatting rule:** Any markdown links written into `{spec_file}` must use paths relative to `{spec_file}`'s directory so they are clickable in VS Code. Any file paths displayed in terminal/conversation output must use CWD-relative format with `:line` notation (e.g., `src/path/file.ts:42`) for terminal clickability. No leading `/` in either case.

### Test Gate (MANDATORY — never skip)

After implementation is complete, you MUST write and run tests before proceeding. This gate is non-negotiable regardless of change size.

1. **Write Vitest unit/integration tests** for every new or modified function, component, service, or utility introduced by this spec. Tests must live under `tests/unit/` or `tests/integration/` mirroring the source path.
2. **Write Playwright E2E tests** (`tests/e2e/*.spec.ts`) for every user-facing flow or acceptance criterion that can be exercised through the UI or API end-to-end.
3. **Run all tests** and confirm they pass:
   - `npm run test:run` — Vitest unit + integration suite
   - `npm run test:e2e` — Playwright E2E suite
4. If any test fails, fix the implementation (or the test if it is wrong) before proceeding. Do NOT proceed to review with failing tests.
5. Mark the test tasks `[x]` in `{spec_file}` only after all tests pass.

> ⚠️ **CRITICAL**: Skipping this gate is a workflow violation. If the spec has no test tasks, add them now and implement them before continuing.

### Self-Check

Before leaving this step, verify every task in the `## Tasks & Acceptance` section of `{spec_file}` is complete — including all test tasks. Mark each finished task `[x]`. If any task is not done, finish it before proceeding.

## NEXT

Read fully and follow `./step-04-review.md`
