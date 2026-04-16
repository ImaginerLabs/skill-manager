# Diagram Comment Guide

When logic flows or UI structures are hard to express in words, ASCII diagrams embedded in comments are far more effective. This guide covers when to use them, how to draw them, and complete examples.

---

## When to Use Diagrams

Use ASCII diagrams instead of text descriptions when:

- **Multi-step async flows** — payment chains, auth flows, multi-step wizards
- **Component hierarchy / slot layouts** — nested UI structures, slot arrangements
- **State machines / decision trees** — order status transitions, approval flows
- **Nested data structures** — tree shapes, graph relationships

---

## Drawing Conventions

| Element              | Symbol                       | Purpose            |
| -------------------- | ---------------------------- | ------------------ |
| Flow arrows          | `──▶` `│` `▼`                | Direction of flow  |
| Conditional branches | `──condition──▶` `├──` `└──` | Branch direction   |
| Layout borders       | `┌ ┐ └ ┘ ─ │ ├ ┤ ┬ ┴ ┼`      | Component regions  |
| Annotations          | `← label`                    | Mark key areas     |
| Omission             | `...`                        | Non-critical parts |

Place diagram comments **directly above the function or component definition**, wrapped in `/* */` block comments, keeping indentation aligned.

---

## Example 1: Complex Async Flow

```typescript
/*
 * Payment flow (main path)
 *
 * User clicks pay
 *      │
 *      ▼
 * Validate inventory ──fail──▶ Show out-of-stock popup ──▶ End
 *      │ success
 *      ▼
 * Create pre-pay order
 *      │
 *      ├── WeChat Pay ──▶ wx.requestPayment ──▶ Poll order status
 *      │                                            │
 *      └── Balance Pay ──▶ Direct deduction ─────────────┘
 *                                                   │
 *                                          success ◀───┤
 *                                          failure ──▶ Retry / prompt
 */
const handlePay = async () => { ... };
```

---

## Example 2: Component Layout Structure

```tsx
/*
 * Product card layout
 *
 * ┌─────────────────────────────┐
 * │        Product image (cover) │  ← coverImage
 * ├─────────────────────────────┤
 * │ Product name (max 2 lines)   │  ← title
 * │ Tags    [New] [Hot]          │  ← tags
 * ├──────────────┬──────────────┤
 * │  ¥ Price     │   Original   │  ← price / originPrice
 * ├──────────────┴──────────────┤
 * │  [Add to cart]    [Buy now] │  ← ActionBar
 * └─────────────────────────────┘
 */
const GoodsCard: React.FC<Props> = () => { ... };
```

---

## Example 3: State Machine / Decision Tree

```typescript
/*
 * Order status transitions
 *
 * Pending ──timeout──▶ Cancelled
 *   │
 *   │ Payment success
 *   ▼
 * Processing ──refund──▶ Refunding ──▶ Refunded
 *   │
 *   │ Shipped
 *   ▼
 * Shipped ──confirm──▶ Completed
 */
```

---

## Example 4: Data Flow

```typescript
/*
 * User data flow
 *
 * LoginPage ──submit──▶ AuthAPI ──token──▶ LocalStorage
 *                                         │
 * AppEntry ──mount──▶ read token ──valid──▶ Dashboard
 *                                   └──expired──▶ LoginPage
 */
```
