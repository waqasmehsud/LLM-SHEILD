import { test, expect } from "@playwright/test";

interface MockItem {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

test.describe("Items CRUD Operations", () => {
  test.beforeEach(async ({ page, context }) => {
    // Inject e2e session cookie to authenticate server side
    await context.addCookies([
      { name: "e2e-session", value: "user", domain: "localhost", path: "/" },
    ]);

    // Mock user session for browser client calls
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
  });

  test("user can create, edit, and delete an item", async ({ page }) => {
    // 1. Mock GET items list (initially empty) and POST creation
    let mockItems: MockItem[] = [];

    await page.route("**/api/v1/items", async (route) => {
      const method = route.request().method();
      if (method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockItems),
        });
      } else if (method === "POST") {
        const postData = route.request().postData() || "{}";
        const body = JSON.parse(postData) as { name: string; description?: string };
        const newItem: MockItem = {
          id: "item-789",
          name: body.name,
          description: body.description || null,
          created_at: new Date().toISOString(),
        };
        mockItems.push(newItem);
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify(newItem),
        });
      }
    });

    await page.goto("/");
    await expect(page.locator("body")).toContainText("No items found");

    // 2. Create item
    await page.click("text=Add Item");
    await page.fill('input[placeholder="Secret item name"]', "Secure Record");
    await page.fill('textarea[placeholder="Provide context..."]', "Record classification high");
    await page.click('button[type="submit"]:has-text("Save")');

    // UI should display the new item
    await expect(page.locator("h3")).toContainText("Secure Record");

    // 3. Edit item
    await page.route("**/api/v1/items/item-789", async (route) => {
      const method = route.request().method();
      if (method === "PATCH") {
        const postData = route.request().postData() || "{}";
        const body = JSON.parse(postData) as { name?: string; description?: string };
        if (mockItems[0]) {
          if (body.name) mockItems[0].name = body.name;
          if (body.description) mockItems[0].description = body.description;
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockItems[0]),
          });
        }
      } else if (method === "DELETE") {
        mockItems = [];
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
      }
    });

    await page.click("text=Edit");
    await page.fill('input[placeholder="Secret item name"]', "Updated Secure Record");
    await page.click('button[type="submit"]:has-text("Save")');

    // Should display updated name
    await expect(page.locator("h3")).toContainText("Updated Secure Record");

    // 4. Delete item
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });
    await page.click("text=Delete");

    // Should return to empty state
    await expect(page.locator("body")).toContainText("No items found");
  });
});
