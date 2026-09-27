import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test("delayed order makes the missed window and next step clear", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Your order is running late" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Preview order state" })).toHaveCount(0);
  await expect(page.getByText("Tomorrow, 2:00–5:00 PM")).toBeVisible();
  await expect(page.getByText("Originally expected yesterday by 8:00 PM")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Shipped" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "test-results/delayed-390.png", fullPage: true });

  await page.getByRole("button", { name: "Get help with this delay" }).click();
  await expect(page.getByRole("dialog", { name: "Contact support" })).toBeVisible();
  await expect(page.getByLabel("What do you need help with?")).toHaveValue("Delivery delay");
  await page.getByLabel("Your message").pressSequentially("The updated delivery window does not work for me.");
  await expect(page.getByLabel("Your message")).toBeFocused();
  await page.getByRole("button", { name: "Save message" }).click();
  await expect(page.getByRole("heading", { name: "Message saved" })).toBeVisible();
  await expect(page.getByText("No message was sent to a support team.")).toBeVisible();
});

test("delivered but missing order supports a report and follow-up", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/?state=not-received");
  await expect(page.getByRole("heading", { name: "Marked delivered, but not there?" })).toBeVisible();
  await expect(page.getByText("Marked delivered today at 3:42 PM")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "test-results/not-received-360.png", fullPage: true });

  await page.getByRole("button", { name: "Report a missing package" }).click();
  await expect(page.getByRole("dialog", { name: "Can’t find your package?" })).toBeVisible();
  await expect(page.getByText("Building reception or parcel room")).toBeVisible();
  await page.getByRole("button", { name: "I still can’t find it" }).click();
  await expect(page.getByRole("heading", { name: "We’ve saved your report" })).toBeVisible();
  await page.getByRole("button", { name: "View your report" }).click();
  await expect(page.getByRole("dialog", { name: "Your delivery report" })).toBeVisible();
  await page.getByRole("dialog", { name: "Your delivery report" }).getByRole("button", { name: "Contact support" }).click();
  await expect(page.getByRole("dialog", { name: "Contact support" })).toBeVisible();
  await expect(page.getByLabel("What do you need help with?")).toHaveValue("Missing package");
});

test("pending tracking offers context, an ETA, and notifications", async ({ page }) => {
  await page.setViewportSize({ width: 430, height: 900 });
  await page.goto("/?state=pending");
  await expect(page.getByRole("heading", { name: "Tracking is on its way" })).toBeVisible();
  await expect(page.getByText("Waiting for the courier’s first scan")).toBeVisible();
  await expect(page.getByText("In 3 days, 9:00 AM–6:00 PM")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "test-results/pending-430.png", fullPage: true });

  await page.getByRole("button", { name: "Notify me when it ships" }).click();
  await expect(page.getByRole("button", { name: "Updates are on" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Updates are on" })).toBeVisible();
});

test("order details, copied ID, and refresh work", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "View details" }).click();
  await expect(page.getByRole("dialog", { name: "Order details" })).toBeVisible();
  await expect(page.getByText("120 Willow Street, Apt 4B")).toBeVisible();
  await page.getByRole("button", { name: "Copy order number" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Order number" })).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Refresh" }).click();
  await expect(page.getByRole("status", { name: "Loading tracking updates" })).toBeVisible();
  await expect(page.getByText("You’re all caught up")).toBeVisible();
  await page.getByRole("button", { name: "View your orders" }).click();
  await expect(page.getByRole("dialog", { name: "Your orders" })).toBeVisible();
  await page.getByRole("dialog", { name: "Your orders" }).getByRole("button", { name: /Order #MR-2048/ }).click();
  await page.getByRole("button", { name: "Contact support about your delivery" }).click();
  await expect(page.getByRole("dialog", { name: "Contact support" })).toBeVisible();
});

test("connection error recovers without losing order summary", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?state=error");
  await expect(page.getByRole("heading", { name: "We couldn’t load the latest update" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your order", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("status", { name: "Loading tracking updates" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Almost at your door" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("desktop shows the tracking page itself in a responsive two-column layout", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/?state=on-track");
  await expect(page.getByRole("heading", { name: "Track your order" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Almost at your door" })).toBeVisible();
  await expect(page.getByText("PREVIEW A SCENARIO")).toHaveCount(0);
  const statusBox = await page.getByRole("region", { name: "Current delivery status" }).boundingBox();
  const summaryBox = await page.getByRole("region", { name: "Your order" }).boundingBox();
  expect(statusBox).not.toBeNull();
  expect(summaryBox).not.toBeNull();
  expect(summaryBox!.x).toBeGreaterThan(statusBox!.x + statusBox!.width);
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "test-results/desktop-on-track.png", fullPage: true });
});
