---
name: react-performance
description: >
  Reviews and optimizes React component performance and correctness. Covers stale closures, unnecessary
  re-renders, useEffect cleanup, state design, debounce/throttle for high-frequency events, and race
  conditions. Use this skill whenever the user is concerned about React performance — whether they're
  seeing slow renders, suspect stale closure bugs, or want to optimize useMemo/useCallback usage.
  Trigger on phrases like "React performance", "stale closure", "useMemo", "useCallback", "avoid re-renders",
  "useEffect issues", "React 性能优化", "闭包陷阱", "避免重渲染", "渲染性能", "性能审查",
  "component re-rendering", "React slow", "optimize React". Also use when the user mentions React
  performance problems, unnecessary re-renders, or Hook-related bugs — these issues are subtle and
  often missed in regular code reviews, so this skill provides the focused deep dive they need.
category: coding
---

# React Performance & Common Pitfalls

## Core Capability

Audit React code for performance issues and prevent common runtime pitfalls. The problems this skill catches are subtle — stale closures silently read outdated values, missing cleanup silently leaks memory, and unnecessary re-renders silently degrade performance. They're easy to miss in regular code review but cause real user-facing bugs.

## Workflow

1. **Stale closure check** — Scan all Hook dependency arrays for missing dependencies
2. **Render analysis** — Identify unnecessary re-renders, add memo / useMemo / useCallback
3. **Side effect audit** — Confirm all useEffect have corresponding cleanup
4. **State rationality** — Check for redundant state or direct state mutation
5. **High-frequency events** — Confirm debounce/throttle is correctly applied

---

## 1. Stale Closure

### The Problem

Closures in function components capture a **snapshot** of variables at creation time. If dependencies aren't correctly declared, the closure reads stale values — and the bug is silent: no error, just wrong behavior.

### Rules

- useEffect / useCallback / useMemo dependency arrays must declare all external variables
- State updates that depend on the current value must use functional updates `setState(prev => ...)`
- When you need the latest value in a closure without triggering re-renders, use `useRef`
- Enable ESLint `react-hooks/exhaustive-deps` — don't casually `// eslint-disable`

---

## 2. Render Performance

### Avoid Unnecessary Re-renders

- Pure display sub-components should be wrapped in `React.memo`
- Object and function props passed to child components should be wrapped in `useMemo` / `useCallback`
- `useMemo` is for **computationally expensive** derived data; `useCallback` is for **callbacks passed to children**
- Don't overuse useMemo / useCallback — simple values or functions not passed to children don't need wrapping

### List Rendering

- List `key` must use **stable and unique** business identifiers (e.g., `id`), not array `index` (unless the list is static and never changes)

---

## 3. useEffect Standards

### Side Effect Cleanup

- Event listeners, timers, and subscriptions registered in useEffect must be unregistered in the returned cleanup function
- Async requests must handle component unmount (AbortController or `isMounted` flag)
- Avoid making the useEffect callback itself `async` — define an async function inside and call it

---

## 4. State Management

- Never directly mutate state objects or arrays — always return new references
- Data derivable from existing state should not be stored as separate state (use `useMemo` instead)
- Multiple related state updates should be merged into a single object or use `useReducer`

---

## 5. High-Frequency Events

- Search input, window resize, scroll listeners must use debounce or throttle
- Debounce/throttle function instances must be kept stable via `useMemo` or `useRef` — never create them directly in the render function

---

## 6. Race Conditions

- Async requests that depend on external parameters must handle races: when the component unmounts or parameters change, ignore the old request's result

---

## Output Format

```markdown
## React Performance & Standards Check Report

### 1. Stale Closure Check

- Status: ✅ PASS / ⚠️ WARN / ❌ FAIL
- Issue: [filename/line]: [description] -> [fix suggestion]

### 2. Render Performance

- **Unnecessary re-renders**: [component name] -> [optimization suggestion]
- **List key**: ✅ PASS / ❌ FAIL

### 3. useEffect Side Effects

- **Cleanup function**: ✅ Cleaned / ❌ Missing cleanup -> [specific location]
- **Race handling**: ✅ Handled / ❌ At risk

### 4. State Management

- **Direct mutation**: ✅ PASS / ❌ FAIL -> [specific location]
- **Redundant state**: [derived data suggestion: switch to useMemo]

### 5. High-Frequency Events

- [event name]: ✅ Debounced / ❌ Missing debounce

### Summary

- Score: 🟢 Excellent / 🟡 Good / 🔴 Needs improvement
- [ ] Safe to commit / [ ] Fix before commit
```
