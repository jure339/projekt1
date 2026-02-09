import { test, expect, type Page } from "@playwright/test";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "test-secret";

const playerUser = {
  id: "player-1",
  ime: "Test",
  priimek: "Player",
  email: "player@example.com",
  ekipa_id: "team-1",
  role: "igralec" as const,
};

async function mockApi(page: Page) {
  await page.route("**/api/treningi/recent-traning**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        training: {
          id: "t1",
          zacetek: "2026-02-02T10:00:00Z",
          konec: "2026-02-02T12:00:00Z",
          povrsina: "Grass",
          opis: "Morning session",
        },
      }),
    });
  });

  await page.route("**/api/game/upcoming-game**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        game: {
          id: "g1",
          cas_tekme: "2026-02-10T18:00:00Z",
          kraj: "Stadium",
          nasprotnik: "Rivals",
        },
      }),
    });
  });

  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          id: playerUser.id,
          role: playerUser.role,
          email: playerUser.email,
        },
      }),
    });
  });

  await page.route("**/api/igralci/moja-ekipa", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ekipaId: playerUser.ekipa_id,
      }),
    });
  });

  await page.route("**/api/auth/login", async (route) => {
    if (route.request().method() !== "POST") return route.fallback();

    const token = jwt.sign(
      { sub: playerUser.id, role: playerUser.role, email: playerUser.email },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: {
        "Set-Cookie": `auth=${token}; Path=/; HttpOnly; SameSite=Lax`,
      },
      body: JSON.stringify({
        message: "OK",
        user: {
          id: playerUser.id,
          ime: playerUser.ime,
          priimek: playerUser.priimek,
          email: playerUser.email,
          ekipa_id: playerUser.ekipa_id,
          role: playerUser.role,
        },
      }),
    });
  });
}

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("player can log in and see dashboard", async ({ page }) => {
  await page.goto("/auth/login");

  await page.getByLabel("Role").selectOption("igralec");
  await page.getByPlaceholder("Enter your email").fill("player@example.com");
  await page.getByPlaceholder("Enter your password").fill("password");

  await Promise.all([
    page.waitForURL(/\/playerdashboard/),
    page.getByRole("button", { name: /log in/i }).click(),
  ]);

  await expect(page.getByText(/next training/i)).toBeVisible();
  await expect(page.getByText(/next game/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /\+ add/i })).not.toBeVisible();

  const stored = await page.evaluate(() => localStorage.getItem("logged_user"));
  expect(stored).toContain("player@example.com");
});
