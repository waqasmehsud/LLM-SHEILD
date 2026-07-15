import { test, expect } from "@playwright/test";

test.describe("Authentication Flows", () => {
  test("unauthenticated user is redirected to login", async ({ page }) => {
    // Intercept Supabase Auth check using reliable wildcard patterns
    await page.route("**/auth/v1/user**", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        headers: {
          "access-control-allow-origin": "*",
        },
        body: JSON.stringify({ error: "Unauthorized" }),
      });
    });

    await page.goto("/");
    await expect(page).toHaveURL("/login");
  });

  test("user can log in successfully and see dashboard", async ({ page, context }) => {
    // Pipe browser runtime errors to terminal using allowed error console method
    page.on("pageerror", (err) => console.error("PAGE ERROR:", err.message));

    // Mock active session checks with preflight support and robust route wildcards
    await page.route("**/auth/v1/user**", async (route) => {
      if (route.request().method() === "OPTIONS") {
        await route.fulfill({
          status: 200,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
            "access-control-allow-methods": "GET, OPTIONS",
          },
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
          },
          body: JSON.stringify({
            id: "user-123",
            email: "user@example.com",
            user_metadata: { role: "user", full_name: "Jane Doe" },
            aud: "authenticated",
            role: "authenticated",
          }),
        });
      }
    });

    await page.route("**/auth/v1/token**", async (route) => {
      if (route.request().method() === "OPTIONS") {
        await route.fulfill({
          status: 200,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
            "access-control-allow-methods": "POST, OPTIONS",
          },
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
          },
          body: JSON.stringify({
            access_token: "mock-token",
            token_type: "bearer",
            expires_in: 3600,
            refresh_token: "mock-refresh",
            user: {
              id: "user-123",
              email: "user@example.com",
              user_metadata: { role: "user", full_name: "Jane Doe" },
              aud: "authenticated",
              role: "authenticated",
            },
          }),
        });
      }
    });

    // Mock dashboard items
    await page.route("**/api/v1/items", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    await page.goto("/login");

    await page.fill('input[type="email"]', "user@example.com");
    await page.fill('input[type="password"]', "Password123");

    // Inject e2e cookie session so server redirects accept the navigation
    await context.addCookies([
      { name: "e2e-session", value: "user", domain: "localhost", path: "/" },
    ]);

    await page.click('button[type="submit"]');

    // Sleep 2 seconds to let client-side route navigation resolve
    await page.waitForTimeout(2000);

    // Should redirect to dashboard home
    await expect(page).toHaveURL("/");
    await expect(page.locator("h1")).toContainText("Your Protected Items");
    await expect(page.locator("body")).toContainText("user@example.com");
  });
});
