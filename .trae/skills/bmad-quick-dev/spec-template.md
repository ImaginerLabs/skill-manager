---
title: "{title}"
type: "feature" # feature | bugfix | refactor | chore
created: "{date}"
status: "draft" # draft | ready-for-dev | in-progress | in-review | done
context: [] # optional: `{project-root}/`-prefixed paths to project-wide standards/docs the implementation agent should load. Keep short — only what isn't already distilled into the spec body.
---

<!-- Target: 900–1300 tokens. Above 1600 = high risk of context rot.
     Never over-specify "how" — use boundaries + examples instead.
     Cohesive cross-layer stories (DB+BE+UI) stay in ONE file.
     IMPORTANT: Remove all HTML comments when filling this template. -->

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

<!-- What is broken or missing, and why it matters. Then the high-level approach — the "what", not the "how". -->

**Problem:** ONE_TO_TWO_SENTENCES

**Approach:** ONE_TO_TWO_SENTENCES

## Boundaries & Constraints

<!-- Three tiers: Always = invariant rules. Ask First = human-gated decisions. Never = out of scope + forbidden approaches. -->

**Always:** INVARIANT_RULES

**Ask First:** DECISIONS_REQUIRING_HUMAN_APPROVAL

<!-- Agent: if any of these trigger during execution, HALT and ask the user before proceeding. -->

**Never:** NON_GOALS_AND_FORBIDDEN_APPROACHES

## I/O & Edge-Case Matrix

<!-- If no meaningful I/O scenarios exist, DELETE THIS ENTIRE SECTION. Do not write "N/A" or "None". -->

| Scenario   | Input / State | Expected Output / Behavior | Error Handling |
| ---------- | ------------- | -------------------------- | -------------- |
| HAPPY_PATH | INPUT         | OUTCOME                    | N/A            |
| ERROR_CASE | INPUT         | OUTCOME                    | ERROR_HANDLING |

</frozen-after-approval>

## Code Map

<!-- Agent-populated during planning. Annotated paths prevent blind codebase searching. -->

- `FILE` -- ROLE_OR_RELEVANCE
- `FILE` -- ROLE_OR_RELEVANCE

## Tasks & Acceptance

<!-- Tasks: backtick-quoted file path -- action -- rationale. Prefer one task per file; group tightly-coupled changes when splitting would be artificial. -->
<!-- AC covers system-level behaviors not captured by the I/O Matrix. Do not duplicate I/O scenarios here. -->

**Execution:**

- [ ] `FILE` -- ACTION -- RATIONALE

**Tests (MANDATORY — do NOT delete this section):**

<!-- REQUIRED: Every spec MUST include at least one Vitest unit/integration test task AND one Playwright E2E test task. -->
<!-- Unit/integration: cover the core logic change + I/O Matrix edge cases if present. -->
<!-- E2E: cover the critical user-facing flow introduced or modified by this change. -->

- [ ] `tests/unit/PATH_TO_TEST.test.ts` -- write Vitest unit/integration tests covering core logic and edge cases -- required by project testing standards
- [ ] `tests/e2e/PATH_TO_SPEC.spec.ts` -- write Playwright E2E test covering the critical user flow -- required by project testing standards

**Acceptance Criteria:**

- Given PRECONDITION, when ACTION, then EXPECTED_RESULT

## Spec Change Log

<!-- Append-only. Populated by step-04 during review loops. Do not modify or delete existing entries.
     Each entry records: what finding triggered the change, what was amended, what known-bad state
     the amendment avoids, and any KEEP instructions (what worked well and must survive re-derivation).
     Empty until the first bad_spec loopback. -->

## Design Notes

<!-- If the approach is straightforward, DELETE THIS ENTIRE SECTION. Do not write "N/A" or "None". -->
<!-- Design rationale and golden examples only when non-obvious. Keep examples to 5–10 lines. -->

DESIGN_RATIONALE_AND_EXAMPLES

## Verification

<!-- If no build, test, or lint commands apply, DELETE THIS ENTIRE SECTION. Do not write "N/A" or "None". -->
<!-- How the agent confirms its own work. Prefer CLI commands. When no CLI check applies, state what to inspect manually. -->

**Commands:**

- `COMMAND` -- expected: SUCCESS_CRITERIA

**Manual checks (if no CLI):**

- WHAT_TO_INSPECT_AND_EXPECTED_STATE
