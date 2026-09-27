# Morrow order tracking

A mobile-first order tracking screen built with Next.js App Router, React, Tailwind CSS, and TypeScript. The preview controls show how one screen responds to a delayed delivery, a delivered package the customer cannot find, and an order awaiting its first tracking scan. On-track, loading, and connection-error states are included.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Verify

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

The Playwright tests use an installed Google Chrome browser and cover 360 px, 390 px, and 430 px mobile widths.

## Interaction notes

- The status card explains the current stage, the delivery estimate, and the best next action.
- The timeline keeps the original Processing → Shipped → Out for delivery → Delivered sequence, with the current step highlighted.
- The pending-tracking state explains why scans are absent and lets the customer turn on a locally saved notification preference.
- Order details, support messaging, and missing-package reporting are interactive previews. Messages are **not sent** to a support service; the missing-package report and notification preference are saved only in this browser. Connect these actions to real order and support APIs before production use.
- Refresh displays a loading skeleton. The error preview has a retry action and keeps the order summary visible.

The sample order, product art, times, and address are illustrative data in `app/page.tsx` and `public/runner.svg`.
