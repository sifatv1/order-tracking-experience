# Morrow order tracking

A responsive order tracking page built with Next.js App Router, React, Tailwind CSS, and TypeScript. The page itself is the customer-facing screen at mobile and desktop widths. It responds to a delayed delivery, a delivered package the customer cannot find, and an order awaiting its first tracking scan. On-track, loading, and connection-error states are included.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## View each order state

The default page shows a delayed order. The same screen can be opened directly in each state:

- <http://localhost:3000/?state=delayed>
- <http://localhost:3000/?state=not-received>
- <http://localhost:3000/?state=pending>
- <http://localhost:3000/?state=on-track>
- <http://localhost:3000/?state=error>

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
