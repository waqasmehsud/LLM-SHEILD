import { test, expect } from "@playwright/test";

test.describe("Admin Panel Role Gating", () => {
  test("non-admin standard user is blocked from admin route", async ({ page, context }) => {
    // Inject standard 'user' session cookie
    await context.addCookies([
      { name: "e2e-session", value: "user", domain: "localhost", path: "/" },
    ]);

    // Mock browser client session resolver
    await page.route("**/auth/v1/user**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-123",
          email: "user@example.com",
          user_metadata: { role: "user", full_name: "Jane Doe" },
        }),
      });
    });

    // Attempt to access /admin
    await page.goto("/admin");

    // Should redirect to dashboard home
    await expect(page).toHaveURL("/");
  });

  test("admin user can access admin route and see audit records", async ({ page, context }) => {
    // Inject admin session cookie
    await context.addCookies([
      { name: "e2e-session", value: "admin", domain: "localhost", path: "/" },
    ]);

    // Mock browser client session resolver
    await page.route("**/auth/v1/user**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "admin-123",
          email: "admin@example.com",
          user_metadata: { role: "admin", full_name: "System Administrator" },
        }),
      });
    });

    // Mock admin audit items list
    const mockAuditItems = [
      {
        id: "item-1",
        name: "User One Secret",
        description: "Confidential context",
        user_id: "user-1",
        created_at: new Date().toISOString(),
        profiles: { full_name: "User One", role: "user" },
      },
      {
        id: "item-2",
        name: "Admin Log record",
        description: "Admin metadata",
        user_id: "admin-123",
        created_at: new Date().toISOString(),
        profiles: { full_name: "System Administrator", role: "admin" },
      },
    ];

    await page.route("**/api/dashboard/admin/items", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockAuditItems),
      });
    });

    // Access /admin
    await page.goto("/admin");

    // URL should stay /admin
    await expect(page).toHaveURL("/admin");

    // Should display both items in the audit list
    await expect(page.locator("h1")).toContainText("Admin Security Audit");
    await expect(page.locator("body")).toContainText("User One Secret");
    await expect(page.locator("body")).toContainText("Admin Log record");
    await expect(page.locator("body")).toContainText("User One");
    await expect(page.locator("body")).toContainText("System Administrator");
  });
});
