---
name: react-component-extraction
description: >
  Extracts reusable UI or stateful logic into independent components or custom Hooks. Analyzes context
  dependencies, evaluates extraction boundaries, designs interface structures, and ensures zero breakage
  for existing callers. Use this skill whenever the user wants to extract, split, or isolate a piece of
  React code — whether it's pulling out a reusable component, creating a custom Hook, or separating
  concerns within a large component. Trigger on phrases like "extract component", "extract to Hook",
  "split component", "pull out component", "make this reusable", "isolate this logic", "抽取组件",
  "提取为 Hook", "拆分组件", "组件抽离", "extract component", "拆分逻辑", "复用逻辑". Also use when
  the user mentions duplicate code patterns, wants to make something reusable across pages, or needs to
  break a large component into smaller pieces — extraction is the first step toward a maintainable codebase.
category: coding
---

# React Component & Logic Extraction

## Core Capability

Systematically analyze a target logic's external dependencies, evaluate extraction boundaries, design sensible component/Hook interfaces, and achieve zero-breakage extraction while keeping the code safe and robust.

The key insight: extraction isn't just moving code around. It's about finding the right boundary — the seam where responsibilities naturally separate — and designing an interface that preserves all existing behavior.

## Workflow

```
1. Context dependency analysis
2. Evaluate extraction boundary (minimization principle)
3. Design interface structure
4. Confirm file location
5. Execute extraction
6. Verify compatibility
```

---

## 1. Context Dependency Analysis

Identify every external dependency the target logic relies on:

| Dependency type    | What to check                                                                      |
| ------------------ | ---------------------------------------------------------------------------------- |
| Props              | Which parent props does the target logic use?                                      |
| State              | Which state values are used? Do they need to be lifted or passed in?               |
| Context            | Does it consume useContext? Will it still be within the Provider after extraction? |
| Ref                | Does it depend on DOM refs or component refs?                                      |
| External functions | Does it call parent callbacks, utility functions, or global methods?               |
| Side effects       | Does it contain useEffect? Are dependencies complete?                              |
| Styles             | Does it depend on parent CSS classes or style variables?                           |

---

## 2. Minimization Principle

Choose the lightest extraction that solves the problem:

| Scenario                                              | Recommended approach                            |
| ----------------------------------------------------- | ----------------------------------------------- |
| Complex logic but simple UI                           | Extract as custom Hook                          |
| Independent, reusable UI structure                    | Extract as child component                      |
| Logic + UI tightly coupled, reused in multiple places | Extract as full component (with internal state) |
| Only used in current component, just too long         | Extract as sub-component within the same file   |

---

## 3. Interface Design

- Props interface must be explicitly defined in TypeScript, with required/optional clearly distinguished
- Optional Props must have default values or null guards
- When a Hook returns more than 2 values, use an object return type for extensibility
- Don't expose internal implementation details through the interface

---

## 4. File Location Confirmation

Search the project's existing structure, then **present candidates to the user for confirmation**:

```
Suggested location for `UserCard` component:

  Option A: src/components/business/user/UserCard.tsx
            (Reason: same level as existing UserList, UserAvatar)

  Option B: src/pages/profile/components/UserCard.tsx
            (Reason: currently only used by Profile page)

Where would you like to place it?
```

---

## 5. Safety & Robustness

- Original callers must not break — extraction preserves existing behavior
- All optional Props have default values or `?.` guards
- All useEffect have cleanup functions
- Components with async operations handle loading/error states
- Context dependencies confirmed to be within Provider subtree

---

## Output Format

```markdown
## Component Extraction Report

### Extraction Overview

- **Extraction type**: [Child component / Custom Hook / Full component]
- **File location**: `[confirmed file path]`
- **Original caller**: `[original file path]` ([modified / unmodified])

### Dependency Analysis

| Dependency type | Item | Handling                        |
| --------------- | ---- | ------------------------------- |
| Props           | —    | Passed via props                |
| State           | —    | Extracted with logic            |
| Context         | —    | Confirmed within Provider scope |

### Generated Files

`[new file path]` - Complete component/Hook code

### Compatibility Verification

- [ ] Original caller interface preserved
- [ ] Optional Props have default values or null guards
- [ ] useEffect has cleanup functions
- [ ] Async operations handle loading/error states
```
