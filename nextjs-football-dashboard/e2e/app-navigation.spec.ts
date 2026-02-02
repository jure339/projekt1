import { test, expect, type Page } from "@playwright/test";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "test-secret";

const coachUser = {
  id: "coach-1",
  ime: "Test",
  priimek: "Coach",
  email: "coach@example.com",
  ekipa_id: "team-1",
  role: "trener" as const,
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

  await page.route("**/api/trenerji/moj-profil", async (route) => {
    const method = route.request().method();
    if (method === "PATCH") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          coach: {
            id: coachUser.id,
            ime: "Updated",
            priimek: coachUser.priimek,
            email: coachUser.email,
            starost: 40,
            ekipa_id: coachUser.ekipa_id,
          },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        coach: {
          id: coachUser.id,
          ime: coachUser.ime,
          priimek: coachUser.priimek,
          email: coachUser.email,
          starost: 40,
          ekipa_id: coachUser.ekipa_id,
        },
      }),
    });
  });

  await page.route("**/api/treningi?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        trainings: [
          {
            id: "t1",
            zacetek: "2026-02-02T10:00:00Z",
            konec: "2026-02-02T12:00:00Z",
            povrsina: "Grass",
            opis: "Morning session",
          },
        ],
      }),
    });
  });

  await page.route("**/api/game", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        games: [
          {
            id: "g1",
            cas_tekme: "2026-02-10T18:00:00Z",
            kraj: "Stadium",
            nasprotnik: "Rivals",
          },
        ],
      }),
    });
  });

  await page.route("**/api/igralci?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        players: [
          {
            id: "p1",
            ime: "Ana",
            priimek: "Novak",
            starost: 22,
            pozicija: "FW",
          },
        ],
      }),
    });
  });

  await page.route("**/api/treningi/*", async (route) => {
    const method = route.request().method();

    if (method === "GET") {
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
      return;
    }

    if (method === "PATCH") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          training: {
            id: "t1",
            zacetek: "2026-02-03T10:00:00Z",
            konec: "2026-02-03T12:00:00Z",
            povrsina: "Updated surface",
            opis: "Updated description",
          },
        }),
      });
      return;
    }

    if (method === "DELETE") {
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      return;
    }

    await route.fallback();
  });

  await page.route("**/api/game/*", async (route) => {
    if (route.request().method() !== "DELETE") return route.fallback();
    await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });

  await page.route("**/api/igralci/*", async (route) => {
    if (route.request().method() !== "DELETE") return route.fallback();
    await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });

  await page.route("**/api/ekipa/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ekipa: {
          id: coachUser.ekipa_id,
          ime: "Test FC",
        },
      }),
    });
  });
}

async function authenticateCoach(page: Page) {
  const token = jwt.sign(
    { sub: coachUser.id, role: coachUser.role, email: coachUser.email },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

  await page.goto("/");

  await page.context().addCookies([
    {
      name: "auth",
      value: token,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.addInitScript((user) => {
    localStorage.setItem("logged_user", JSON.stringify(user));
  }, coachUser);
}

test.describe("coach flow", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await authenticateCoach(page);
  });

  test("coach can navigate, edit, and delete rows", async ({ page }) => {
    page.on("dialog", (dialog) => dialog.accept());

    await page.goto("/treningi");
    await expect(page.getByRole("heading", { name: /trainings/i })).toBeVisible();

    await page.getByRole("link", { name: "Edit" }).first().click();
    await expect(page).toHaveURL(/\/edittrening\//);

    await page.locator('input[type="datetime-local"]').first().fill("2026-02-03T10:00");
    await page.locator('input[type="datetime-local"]').nth(1).fill("2026-02-03T12:00");
    await page.getByPlaceholder("e.g. grass / artificial / indoor").fill("Updated surface");
    await page.getByPlaceholder("Optional...").fill("Updated description");

    await Promise.all([
      page.waitForURL(/\/treningi/),
      page.getByRole("button", { name: "Save" }).click(),
    ]);

    await page.getByRole("button", { name: /delete/i }).first().click();
    await expect(page.getByText(/no trainings found/i)).toBeVisible();

    await page.getByRole("link", { name: "Players" }).click();
    await expect(page).toHaveURL(/\/igralci/);
    await expect(page.getByRole("heading", { name: /players/i })).toBeVisible();

    await page.getByRole("button", { name: /delete/i }).first().click();
    await expect(page.getByText(/no players found/i)).toBeVisible();

    await page.getByRole("link", { name: "Trainings" }).click();
    await expect(page).toHaveURL(/\/treningi/);
    await expect(page.getByRole("heading", { name: /trainings/i })).toBeVisible();

    await page.getByRole("link", { name: "Games" }).click();
    await expect(page).toHaveURL(/\/tekme/);
    await expect(page.getByRole("heading", { name: /games/i })).toBeVisible();

    await page.getByRole("button", { name: /delete/i }).first().click();
    await expect(page.getByText(/no games found/i)).toBeVisible();

    await page.getByRole("link", { name: "Profile" }).click();
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.getByRole("heading", { name: /coach profile/i })).toBeVisible();

    await expect(page.getByPlaceholder("First name")).toHaveValue("Test");
    await page.getByPlaceholder("First name").fill("Updated");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText(/saved/i)).toBeVisible();
  });
});
