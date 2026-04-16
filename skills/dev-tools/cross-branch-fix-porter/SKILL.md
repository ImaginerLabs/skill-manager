---
name: cross-branch-fix-porter
description: >
  Cross-branch fix porting expert. When two projects have significantly different structures and direct
  cherry-pick isn't feasible, this skill understands the fix intent and re-implements the same fix goal
  in the current branch's code context. Use this skill whenever the user needs to apply a fix from one
  branch or project to another — especially when the codebases differ enough that a simple cherry-pick
  would fail or produce incorrect results. Trigger on phrases like "port this fix", "apply this commit's
  changes to current branch", "cross-branch apply fix", "cherry-pick this fix", "移植这个修复",
  "把这个 commit 的改动应用到当前分支", "跨分支应用修复", "移植修复", "应用这个改动",
  "port the fix", "apply fix from another branch". Also use when the user mentions a fix that was made
  in one project and needs to be applied to another, or when cherry-pick produces conflicts — the key
  signal is that the same logical fix needs to be expressed in different code.
category: dev-tools
---

# Cross-Branch Fix Porting

## Core Approach

**Don't copy code — copy intent.** First understand what problem the fix solves and why it was done that way, then re-implement the same fix goal within the current branch's code logic.

## When to Use

- User provides a commit ID that needs to be ported to the current branch
- Two projects have significantly different structures (different frameworks, different directory layouts)
- Direct cherry-pick would produce many conflicts or logical errors

## Workflow

### Phase 1: Get Fix Information

**Case A: User provided a commit ID**

```
1. Get commit basic info (message, author, time)
2. Get commit code diff
3. Analyze diff, extract fix intent
```

**Case B: From conversation context**

```
1. Search conversation history for fix-related content
2. Extract already-analyzed fix content and intent
```

### Phase 2: Analyze Fix Intent

After reading the diff, answer these questions:

```
1. [Root cause] What bug did this fix solve, or what requirement did it fulfill?
2. [Change scope] Which files are involved? What's the purpose of each file's change?
3. [Core logic] What's the key behavioral change (not code change)?
4. [Dependencies] Does the fix depend on specific utility functions, components, or type definitions?
```

### Phase 3: Locate Corresponding Files in Current Branch

```
1. Based on the functional modules involved in the fix, search for corresponding files in the current branch
2. Read candidate file contents to confirm they handle the same functionality
3. If no corresponding file is found, inform the user and explain why
```

### Phase 4: Determine if Direct Copy is Possible

Direct copy is only appropriate when **all** of these conditions are met:

1. The file in the original commit diff is marked as "new file" (entirely new creation)
2. No file at the same path or with the same functionality exists in the current branch
3. The file content doesn't depend on modules or types that don't exist in the current branch

If conditions are met: copy the file directly.
If not: proceed to Phase 5.

### Phase 5: Re-implement the Fix

**Use the current branch's logic as the source of truth.** Don't copy the original code:

```
1. Read the current branch's corresponding file's complete logic
2. Understand the current branch's code style, encapsulation patterns, utility functions
3. "Translate" the fix intent into the current branch's implementation style
4. If the current branch already has similar logic, modify it in place
```

**Porting principles:**

| Principle                 | Description                                                          |
| ------------------------- | -------------------------------------------------------------------- |
| **Intent first**          | Reproduce the behavioral effect of the fix, not the code             |
| **Respect current style** | Use the current branch's utility functions, types, and encapsulation |
| **Minimal change**        | Only modify what's necessary, don't introduce unrelated changes      |
| **Consistency**           | Match the current branch's code style and conventions                |

---

## Output Report

```markdown
## Cross-Branch Fix Porting Report

### Fix Intent Summary

[One-sentence description of the problem the fix solves]

### File Mapping

| Original fix file | Current branch file | Handling       |
| ----------------- | ------------------- | -------------- |
| src/a.ts          | src/b.ts            | Re-implemented |
| src/new.ts        | —                   | Direct copy    |

### Key Differences

[Structural differences, implementation differences]

### Applied Changes

- [Change 1]
- [Change 2]

### Items Requiring User Confirmation (if any)

- [Confirmation item]
```

---

## Important Notes

- **Don't blindly copy code** — Original code may depend on utility functions or types that don't exist in the current branch
- **Analyze before acting** — Complete intent analysis before modifying any files
- **Ask when uncertain** — If the intent of a change is ambiguous, confirm with the user
- **Go step by step for large structural differences** — Port core logic first, then handle edge cases
