---
name: react-component-refactor
description: >
  Analyzes React component structure, identifies reusable units, and refactors large or messy components
  into clean, well-organized code. Strictly maintains 1:1 logic equivalence — only structure changes,
  never behavior. Supports: large component splitting, duplicate logic extraction into Hooks, messy
  structure reorganization. Use this skill whenever the user wants to refactor a React component — whether
  it's splitting a monolith, reorganizing a messy file, or restructuring for better maintainability.
  Trigger on phrases like "refactor component", "refactor this file", "component refactor",
  "refactor component", "split and refactor", "restructure component", "重构组件", "帮我重构这个文件",
  "组件重构", "拆分重构", "整理组件结构". Also use when the user mentions a component is too large,
  hard to maintain, or needs restructuring — but note: if the goal is specifically to extract a reusable
  piece (not restructure the whole component), use `react-component-extraction` instead.
category: coding
---

# React Component Refactoring

## Core Capability

Analyze existing code structure, identify reusable logic, and refactor according to React best practices. **Strictly preserve original logic intent** — only optimize and split at the structure level.

The difference from `react-component-extraction`: extraction pulls out a specific piece for reuse; refactoring restructures the entire component for clarity and maintainability. Think of extraction as surgery, refactoring as renovation.

## Workflow

```
1. Confirm refactoring scope and output directory
2. Analyze code structure (identify reusable units)
3. Design refactoring plan (seek confirmation)
4. Execute refactoring
5. Verify logic equivalence
```

---

## 1. Pre-refactoring Preparation

### Confirm User Input

| Info                  | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| **Refactoring scope** | File path or code snippet specified by user                                 |
| **Output directory**  | Where refactored files go (do not change without permission)                |
| **Refactoring goal**  | Expected outcome (e.g., split sub-components, extract Hooks, full refactor) |

### Code Structure Analysis

```
Analysis dimensions:
├── Component scale: total lines, JSX nesting depth
├── Responsibility identification: what different responsibilities does this component handle
├── Duplicate logic: similar JSX structures or logic patterns
├── State distribution: is state distribution reasonable
├── Side effects: number and clarity of useEffect responsibilities
└── Reusable units: what can become independent components or Hooks
```

---

## 2. Reusable Unit Identification Rules

### Identify as independent component when:

| Condition                                                        | Example                                                     |
| ---------------------------------------------------------------- | ----------------------------------------------------------- |
| JSX structure exceeds 30 lines with relatively independent logic | Complex form sections, data display cards                   |
| Same structure appears 2+ times in the same file                 | Similar list items, repeated button groups                  |
| Has independent interaction state (expand/collapse)              | Collapsible panels, dropdown menus, modal triggers          |
| Can be used independently from current context                   | Generic Loading state, empty state placeholder, error block |

### Identify as custom Hook when:

| Condition                                                  | Example                                           |
| ---------------------------------------------------------- | ------------------------------------------------- |
| Contains 2+ related state values + useEffect               | Data fetching logic (loading + data + error)      |
| Same Hook combination used in multiple places              | Pagination logic, form validation logic           |
| Side effect logic not directly tied to UI rendering        | Event listeners, timers, WebSocket connections    |
| High complexity logic affecting main component readability | Complex filter/sort logic, permission check logic |

### Keep in original component when:

- Logic is simple (< 10 lines), splitting would increase cognitive overhead
- Highly coupled with parent state, splitting requires excessive props passing
- Used only once in current component with no reuse value

---

## 3. Refactoring Plan Design

**Present the plan to the user for confirmation before executing:**

```
Refactoring plan: [original filename]

Original file: src/pages/Order/index.tsx (320 lines)

Split plan:
├── 📦 OrderHeader.tsx        → Extract order header info display (original L12-L58)
├── 📦 OrderItemList.tsx      → Extract order item list (original L60-L130)
├── 🪝 useOrderDetail.ts      → Extract order data fetching logic
└── 📄 index.tsx              → Refactored main file (keep core orchestration logic)

Output directory: src/pages/Order/components/

Confirm execution?
```

---

## 4. Code Generation Standards

### TypeScript Type Standards

- Props interface must be explicitly defined, required/optional clearly distinguished
- Enums/unions prefer TypeScript native types

### Component Structure

Each component file organized in this order: `external imports → internal imports → type definitions → component implementation → exports`

### Custom Hook Standards

Hook returns use **object** format (when > 2 return values), including standard `data / loading / error / refetch` fields.

---

## 5. 1:1 Logic Preservation Guarantee

### Never change these:

| Prohibited change        | Why                                                               |
| ------------------------ | ----------------------------------------------------------------- |
| **Business logic**       | Conditions, calculations, data processing must remain identical   |
| **Side effect timing**   | useEffect trigger timing and dependencies must not change         |
| **State initial values** | All state initial values must match original code                 |
| **Event handling logic** | Event callback execution logic must not be simplified or modified |
| **Render conditions**    | All conditional rendering logic must remain consistent            |
| **Props interface**      | Exposed Props signature must not have breaking changes            |

### Logic Equivalence Verification Checklist

- [ ] Conditional rendering: all &&, ternary conditions match original
- [ ] List rendering: map data source, key values, render content match original
- [ ] Event binding: all handler trigger conditions and execution logic unchanged
- [ ] Side effect dependencies: useEffect dependency arrays and trigger timing unchanged
- [ ] State flow: state update logic completely identical to original

### Difference Annotation

If original code has **obvious bugs or anti-patterns**, **do not fix them** — annotate and inform the user:

```typescript
// ⚠️ Note: original code uses index as key here, consider changing to item.id later
{items.map((item, index) => <Item key={index} data={item} />)}
```

---

## 6. React Best Practices Check

- All components use function components + Hooks
- Props interface defined in TypeScript
- Functions passed to child components wrapped in `useCallback`
- Objects/arrays passed to child components wrapped in `useMemo`
- Pure display sub-components wrapped in `React.memo`
- Async operations in useEffect use AbortController for unmount scenarios
- List rendering uses stable, unique business IDs as keys

---

## Output Format

```markdown
## React Component Refactoring Report

### Refactoring Overview

- **Original file**: `[original file path]` (X lines)
- **Output directory**: `[user-specified directory]`
- **Split file count**: X

### Split Results

| File           | Type                 | Original lines | Description                |
| -------------- | -------------------- | -------------- | -------------------------- |
| ComponentA.tsx | Sub-component        | L12~L58        | Responsibility description |
| useXxx.ts      | Custom Hook          | L60~L90        | Responsibility description |
| index.tsx      | Refactored main file | —              | Core orchestration logic   |

### Logic Equivalence Verification

- [ ] Conditional rendering: ✅ Matches original
- [ ] List rendering: ✅ Key values and data source match
- [ ] Event binding: ✅ Trigger conditions and execution logic unchanged
- [ ] Side effect dependencies: ✅ useEffect dependency arrays unchanged
- [ ] State flow: ✅ State update logic completely identical

### Original Code Issues Found (annotated, not fixed)

- If none: ✅ No obvious bugs or anti-patterns found
```
