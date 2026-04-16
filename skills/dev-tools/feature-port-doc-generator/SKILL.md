---
name: feature-port-doc-generator
description: >
  Generates standardized porting documentation from completed feature changes. Analyzes commit diffs or
  file contents, extracts the change intent, and outputs a Markdown document that lets other teams understand
  what changed, why, and how to implement it in their own project. Use this skill whenever the user needs to
  document a change for cross-team or cross-project consumption — whether it's sharing a feature implementation,
  creating a migration guide, or writing a porting reference. Trigger on phrases like "generate porting doc",
  "write porting guide", "document this change for porting", "how to port this to other projects",
  "生成移植文档", "帮我写移植说明", "整理这个需求的移植指南", "这个改动怎么移植到其他项目",
  "porting documentation", "migration guide", "create port doc", "feature porting guide". Also use when
  the user mentions sharing implementation details across teams or projects — the goal is to communicate
  intent, not copy code, so the receiving team can implement the same feature in their own context.
category: dev-tools
---

# Feature Porting Document Generator

## Core Approach

Not copying code — transmitting intent. Let the receiving team understand "what changed, why it changed, and how to implement it in their own project."

## When to Use

- User provides a commit ID that needs to be documented as a porting guide
- User provides one or more changed files and needs to extract the change intent
- A feature implementation needs to be shared with other project teams

## Workflow

### Phase 1: Get Change Information

**Case A: User provided a commit ID**

```
1. Get commit basic info (message, author, time)
2. Get commit code diff
3. Count changed files, assess change scope
```

**Case B: User specified file paths (no commit ID)**

```
1. Read the user-specified file contents
2. Find recent related commit history for those files
3. Confirm the relevant commits and get their diffs
```

### Phase 2: Analyze Change Intent

```
1. [Change type] What kind of change is this? (New feature / Bug fix / Performance optimization / Refactoring)
2. [Problem/Goal] What problem does this change solve, or what goal does it achieve?
3. [Change scope] Which files are involved? What's the purpose of each file's change?
4. [Core logic] What's the key behavioral change (not code change)?
5. [External dependencies] Does the change introduce new dependencies (npm packages, utility functions, components, APIs)?
6. [Porting prerequisites] What baseline conditions must other projects meet before porting?
```

### Phase 3: Collect File Paths

```
1. For file paths in the commit diff, combine with project root to form absolute paths
2. Use git rev-parse --show-toplevel to get the project root
3. All file paths in the final document should use absolute path format
```

### Phase 4: Assess Porting Complexity

| Complexity  | Criteria                                                                      | Porting advice                             |
| ----------- | ----------------------------------------------------------------------------- | ------------------------------------------ |
| **Simple**  | Single file change, no new dependencies, independent logic                    | Can directly reference code implementation |
| **Medium**  | Multi-file change, few dependencies, related logic                            | Port file by file in order                 |
| **Complex** | Involves architectural changes, many dependencies, requires prerequisite work | Port in phases                             |

### Phase 5: Generate Porting Document

The document must include these sections:

- Change overview (type, goal, background)
- File scope (file list + change description)
- Core logic explanation (before/after behavior comparison)
- Dependency list (new dependencies, prerequisites)
- Porting steps (step-by-step instructions)
- Notes (common issues, risk points)

---

## Output Format

```markdown
## [Feature Name] Porting Document

### Change Overview

- **Type**: New feature / Bug fix / Performance optimization / Refactoring
- **Goal**: [One-sentence description]
- **Background**: [Why this change was needed]

### File Scope

| File path           | Change description  |
| ------------------- | ------------------- |
| /abs/path/file1.ts  | [Purpose of change] |
| /abs/path/file2.tsx | [Purpose of change] |

### Core Logic Explanation

**Before**: [Original behavior]

**After**: [New behavior]

### Dependency List

**New dependencies**:

- [Dependency package/utility function/component]

**Prerequisites**:

- [Baseline conditions the project must meet]

### Porting Steps

1. [Step 1: specific action]
2. [Step 2: specific action]
3. [Step 3: specific action]

### Notes

- [Risk point or common issue]
```

---

## Important Notes

- **Paths must be absolute** — All file paths in the document must use absolute paths
- **Intent over code** — The core of the document is communicating "why it changed"
- **Reader's perspective** — Write for someone who doesn't know the original project
- **Dependencies must be complete** — All newly introduced dependencies must be listed
- **Steps must be executable** — Porting steps must be specific enough to follow
