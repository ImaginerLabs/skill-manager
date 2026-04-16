---
name: frontend-staged-bundle-review
description: >
  Reviews staged git changes from a bundle size perspective. Reads git diff --staged, analyzes the change
  intent, and provides high/medium/low priority optimization recommendations for React/Vue/Taro/Next.js projects.
  Use this skill whenever the user is concerned about code size, bundle bloat, or package weight — whether
  they're about to commit and worried about size, evaluating a new dependency, or doing a performance audit.
  Trigger on phrases like "check bundle size", "analyze bundle", "bundle optimization", "size review",
  "check staged size", "package size analysis", "size regression", "build optimization", "reduce bundle size",
  "slim down", "检查暂存区体积", "分析包体积", "bundle 优化", "体积审查", "检查体积", "包大小分析",
  "体积回归", "打包优化", "减少体积", "瘦身". Also use when the user mentions adding a new dependency,
  worrying about first-screen load performance, or mini-program package size limits — bundle size is often
  the hidden cost of feature development, and this skill catches it before it ships.
category: coding
---

# Frontend Staged Code Bundle Size Review

## Core Capability

Before committing, read staged changes, analyze the change intent in project context, and review from a **bundle size** perspective — outputting high/medium/low priority optimization recommendations.

## When to Use

- Worried about bundle size increase after feature iteration
- Pre-evaluation before introducing new dependencies
- Bundle size regression check after refactoring
- Performance optimization audit
- Mini-program main package size limit warning
- First-screen load performance optimization
- Taro mini-program, H5, React/Vue web, Next.js SSR projects

## Skill Collaboration

| Skill                    | How                                                                   | Use case                       |
| ------------------------ | --------------------------------------------------------------------- | ------------------------------ |
| **staged-code-review**   | Code quality review first, then bundle review                         | Comprehensive pre-commit check |
| **frontend-code-review** | Use alongside, covering both quality and size                         | Combined code review           |
| **tech-stack-detection** | Identify tech stack first, then targeted size analysis                | New project bundle review      |
| **context-learning**     | Understand context when size issues involve complex dependency chains | Complex refactoring            |

**Recommended workflow:**

```
git add . → staged-code-review → frontend-staged-bundle-review → commit
```

---

## Workflow

### Step 1: Read Staged Diff

```bash
git diff --staged
```

### Step 2: Analyze Change Intent

Understand the business context of this change:

- Read comments, variable names, function names in the diff to infer feature intent
- Check for new `import` statements to identify introduced dependencies
- Check existing project code (e.g., `package.json`, shared utilities) for duplicate imports
- Identify the change type: new feature / bug fix / refactoring / dependency upgrade

### Step 3: Bundle Impact Analysis

Evaluate impact across these dimensions:

#### 3.1 Dependency Imports

- Did new imports bring in large third-party libraries?
- Is tree-shaking friendly (on-demand import) being used?
- Can existing project utilities/components replace the new import?
- Are there duplicate-functionality libraries (e.g., both moment and dayjs)?

#### 3.2 Code Redundancy

- Duplicate logic that could be extracted into shared functions?
- Large copy-pasted code blocks?
- Dead code that's deprecated but not removed?
- Debug code (console.log, debugger) not cleaned up?

#### 3.3 Assets & Static Files

- Inline Base64 images or large SVGs?
- Hardcoded large JSON data that could be fetched dynamically?
- Fonts/icons loaded on demand?
- Images using appropriate formats (WebP/AVIF) and compression?

#### 3.4 Dynamic Loading Opportunities

- New pages/modules suitable for route-level lazy loading (`React.lazy` / dynamic `import()`)?
- Heavy components used infrequently that could be deferred?
- Large third-party libraries that could be dynamically imported (e.g., ECharts, Monaco Editor)?
- Next.js projects using `dynamic import` for first-screen optimization?

#### 3.5 Taro/Mini-program Specifics

- Web API polyfills that only work on H5?
- Reasonable subpackage strategy, new pages in correct subpackages?
- Heavy UI library full imports beyond `@tarojs/components`?
- Main package approaching the 2MB limit?

#### 3.6 Next.js/SSR Specifics

- Using `next/dynamic` for component lazy loading?
- Reasonably setting `ssr: false` for components that don't need SSR?
- Using `next/image` for image optimization?
- Client-only libraries being bundled into the server bundle?

### Step 4: Generate Prioritized Recommendations

| Level         | Criteria                                                                  | Typical scenario                                                    |
| ------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 🔴 **High**   | Significant size impact (est. > 10KB gzip), or avoidable large dependency | Full lodash/moment.js import; inline large images                   |
| 🟡 **Medium** | Moderate impact (est. 2–10KB gzip), or clear optimization path            | UI library not imported on-demand; new page not lazy-loaded         |
| 🟢 **Low**    | Small impact (est. < 2KB gzip), best practice improvement                 | Small function replaceable by native; extractable duplicate utility |

### Step 5: Output Optimization Report

---

## Output Format

```markdown
## 📦 Staged Code Bundle Size Review Report

### Change Overview

| Dimension     | Info                                                     |
| ------------- | -------------------------------------------------------- |
| File count    | X                                                        |
| Tech stack    | [detected]                                               |
| Change type   | New feature / Bug fix / Refactoring / Dependency upgrade |
| Change intent | [Inferred from diff]                                     |

---

### 🔴 High Priority (significant size impact, fix before commit)

| #   | File          | Issue   | Suggestion   | Est. savings | Scope                   |
| --- | ------------- | ------- | ------------ | ------------ | ----------------------- |
| 1   | `src/xxx.tsx` | [issue] | [suggestion] | ~XX KB       | First-screen/subpackage |

**Details:**

- [Detailed analysis and optimization plan]

---

### 🟡 Medium Priority (clear optimization path, fix this or next iteration)

| #   | File          | Issue   | Suggestion   | Est. savings | Scope            |
| --- | ------------- | ------- | ------------ | ------------ | ---------------- |
| 1   | `src/xxx.tsx` | [issue] | [suggestion] | ~XX KB       | Non-first-screen |

**Details:**

- [Detailed analysis and optimization plan]

---

### 🟢 Low Priority (best practice, fix as needed)

| #   | File          | Issue   | Suggestion   | Est. savings |
| --- | ------------- | ------- | ------------ | ------------ |
| 1   | `src/xxx.tsx` | [issue] | [suggestion] | ~XX KB       |

---

### 📊 Size Impact Estimate

| Category        | Current   | After optimization | Savings   |
| --------------- | --------- | ------------------ | --------- |
| High priority   | XX KB     | XX KB              | XX KB     |
| Medium priority | XX KB     | XX KB              | XX KB     |
| Low priority    | XX KB     | XX KB              | XX KB     |
| **Total**       | **XX KB** | **XX KB**          | **XX KB** |

---

### 📝 Summary

- High priority: X items (fix before commit)
- Medium priority: X items (fix in next iteration)
- Low priority: X items (best practice improvements)
- **Overall assessment**: 🟢 Size-friendly / 🟡 Room for optimization / 🔴 Fix before committing

---

### 🔄 Next Steps

- [ ] Fix high priority issues immediately
- [ ] Address medium priority in next iteration
- [ ] Monitor bundle size changes ongoing
- [ ] Consider configuring bundle size monitoring (e.g., bundlesize, webpack-bundle-analyzer)
```
