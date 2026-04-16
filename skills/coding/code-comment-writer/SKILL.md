---
name: code-comment-writer
description: >
  Writes precise, reader-oriented code comments tailored to the reading scenario — onboarding, refactoring,
  algorithm explanation, tech debt marking, or API integration. Comments explain "why" (intent, edge cases,
  pitfalls, migration context), never "what" (restating logic). Use this skill whenever the user asks to add
  comments, annotate code, write documentation comments, explain code for others, prepare code for handoff,
  or make code more readable. Also trigger when the user mentions onboarding, code handoff, migration notes,
  or any situation where someone else needs to understand the code. This includes phrases like "add comments",
  "write comments", "annotate code", "code documentation", "explain this code", "code readability",
  "help me understand this", "新人接手", "帮我写注释", "给这段代码加注释", "需求改造注释",
  "添加文档注释", "代码说明", "加文档". Even if the user just says "this code is hard to read" or
  "I need to hand this off", use this skill — good comments are the bridge between author and reader.
category: coding
---

# Code Comment Writer

## Core Philosophy

Code already tells you _what_ it does. Comments exist to tell you _why_ — the intent, constraints, and context that the code alone cannot express. A comment that restates the logic is noise; a comment that reveals the thinking behind it is gold.

Three principles guide every comment:

- **Concise** — One idea per comment. No `// increment` above `i++`.
- **Effective** — Focus on intent, boundaries, pitfalls, and migration context. Never restate logic.
- **Elegant** — Natural language that blends with the code style, never disrupting readability.

## When to Use

- **Onboarding / handoff** — Help newcomers quickly grasp module purpose, data flow, key dependencies
- **Refactoring / migration** — Record migration reasons, old vs. new logic differences
- **Complex algorithms** — Explain algorithmic thinking, key steps, edge conditions
- **Tech debt** — Mark temporary solutions, known issues, improvement directions
- **API integration** — Document third-party protocols, field meanings, error handling rules
- **Pre-refactor prep** — Annotate critical logic before refactoring to reduce risk

## When NOT to Use

- Code is self-explanatory with clear naming and simple logic
- Standard library or framework usage with no surprises
- You'd be restating what the code already says

---

## Workflow

### Step 1: Understand the Reading Scenario

The scenario determines what to emphasize. If the user doesn't specify, default to **maintainability** — add intent-level comments.

| Scenario                       | Focus                                                |
| ------------------------------ | ---------------------------------------------------- |
| Onboarding / handoff           | Module purpose, data flow, key dependencies          |
| Refactoring / migration        | Reason for change, impact scope, old vs. new logic   |
| Complex algorithm              | Algorithmic thinking, key steps, edge conditions     |
| Performance optimization       | Optimization method, original problem, caveats       |
| Temporary solution / tech debt | Why written this way, how to improve later           |
| API integration / third-party  | Field meanings, protocol conventions, error handling |

### Step 2: Read the Code Thoroughly

- Grasp overall structure: module purpose, data flow, call chain
- Identify key nodes: conditionals, async flows, side effects, boundary handling
- Understand old vs. new logic differences if the user described a migration context
- Mark positions that need comments (not every line)
- Identify scenarios where ASCII diagrams would be clearer than text — see [diagram-guide.md](references/diagram-guide.md) for conventions and examples

### Step 3: Write the Comments

#### Comment Types

**① File/Module-level** (file top) — Module purpose, business domain, key dependencies.

```typescript
/**
 * Cart checkout module
 * Aggregates price calculation, coupon redemption, and inventory validation.
 * Depends on: CartStore, CouponService, InventoryAPI
 */
```

**② Function/Method-level** (above function) — Intent, key params, return semantics, side effects. Simple, self-explaining functions need no comment.

```typescript
/**
 * Calculate actual payment amount
 * Applies coupon first, then points, finally rounds down (avoids precision issues).
 * @param couponId When empty, skips coupon deduction
 */
```

**③ Inline** (beside key logic) — Only for: non-intuitive boundary handling, special business rules, known pitfalls, temporary solutions.

```typescript
// Backend returns null meaning "no limit" — convert to Infinity for comparison
const maxQty = res.maxQty ?? Infinity;

// FIXME: API doesn't support batch yet — temporary serial processing,
// switch to parallel when backend supports it
for (const id of ids) {
  await api.delete(id);
}
```

**④ Migration marker** (refactoring scenario) — Label migration context for future maintainers.

```typescript
// [Migration] Old logic: navigate directly to payment page
// New logic: validate inventory first, show out-of-stock popup when insufficient (STORY-456)
const handleCheckout = async () => { ... };
```

**⑤ Diagram comments** (complex flows / component layout) — When text alone can't express it clearly, embed an ASCII diagram. See [diagram-guide.md](references/diagram-guide.md) for full examples and drawing conventions.

#### Comment Anti-patterns

| Never write                          | Why                                      |
| ------------------------------------ | ---------------------------------------- |
| `// Loop through array`              | Restates code, zero information          |
| `// This is important`               | Doesn't explain _why_ it's important     |
| Outdated comments (don't match code) | Misleads readers — worse than no comment |
| Commented-out dead code              | Delete it; use Git for history           |

### Step 4: Output Annotated Code

- Output the **complete code file** (or specified block) with comments embedded
- Briefly explain the **intent** of each new comment in a summary table
- If code has readability issues (unclear naming, deep nesting), add **readability suggestions** without modifying the code itself

---

## Output Format

```markdown
## Code Comment Report: `[filename]`

### Reading Scenario

[User-specified scenario, e.g., onboarding / refactoring / algorithm / ...]

---

### Annotated Code

[Complete code file or specified block with comments embedded]

---

### Comment Summary

| Location (line/function) | Comment type   | Intent                                  |
| ------------------------ | -------------- | --------------------------------------- |
| `funcName`               | Function-level | [What information this comment conveys] |
| L42                      | Inline         | [What information this comment conveys] |
| File top                 | Module-level   | [What information this comment conveys] |

---

### Readability Suggestions (if any)

- [Naming/logic-level improvement suggestions, no code modifications]
```

---

## Skill Collaboration

| Skill                  | Scenario                                  | How                                            |
| ---------------------- | ----------------------------------------- | ---------------------------------------------- |
| `context-learning`     | Understand code context before commenting | Run context analysis first, then add comments  |
| `frontend-code-review` | Discover readability issues during review | Add comments for problematic code after review |
| `staged-code-review`   | Check comment completeness before commit  | Review whether key logic has comments          |

**Recommended workflows:**

1. New project → `context-learning` → `code-comment-writer`
2. Pre-commit check → `staged-code-review` → `code-comment-writer` (fill missing comments)
