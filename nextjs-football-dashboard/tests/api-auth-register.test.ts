import { test, expect } from "@playwright/test";

import { createRegisterHandler } from "../src/app/api/auth/register/route";

test.describe("api auth register", () => {
  test("returns 400 when required data is missing", async () => {
    const sqlMock = async () => [];
    const POST = createRegisterHandler({
      sql: sqlMock,
      hashPassword: async () => "hashed-password",
      uuid: () => "fixed-uuid",
      json: (body, init) => ({ body, status: init?.status ?? 200 } as any),
    });

    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Manjkajo podatki." });
  });

  test("registers a coach", async () => {
    const sqlMock = async () => [];
    const POST = createRegisterHandler({
      sql: sqlMock,
      hashPassword: async () => "hashed-password",
      uuid: () => "fixed-uuid",
      json: (body, init) => ({ body, status: init?.status ?? 200 } as any),
    });

    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        role: "trener",
        ime: "Ana",
        priimek: "Novak",
        starost: 30,
        email: "ana@example.com",
        password: "pass",
        ekipa_id: null,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      message: "Registracija uspešna",
      user: { id: "fixed-uuid", role: "trener", email: "ana@example.com" },
    });
  });

  test("returns 409 on duplicate coach email", async () => {
    let nextError: Error | null = new Error("duplicate key value");
    const sqlMock = async () => {
      if (nextError) {
        const err = nextError;
        nextError = null;
        throw err;
      }
      return [];
    };

    const POST = createRegisterHandler({
      sql: sqlMock,
      hashPassword: async () => "hashed-password",
      uuid: () => "fixed-uuid",
      json: (body, init) => ({ body, status: init?.status ?? 200 } as any),
    });

    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        role: "trener",
        ime: "Ana",
        priimek: "Novak",
        starost: 30,
        email: "ana@example.com",
        password: "pass",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(req);
    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: "Email je že v uporabi." });
  });

  test("registers a player", async () => {
    const sqlMock = async () => [];
    const POST = createRegisterHandler({
      sql: sqlMock,
      hashPassword: async () => "hashed-password",
      uuid: () => "fixed-uuid",
      json: (body, init) => ({ body, status: init?.status ?? 200 } as any),
    });

    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        role: "igralec",
        ime: "Tim",
        priimek: "Kralj",
        starost: 21,
        email: "tim@example.com",
        password: "pass",
        visina: 180,
        pozicija_id: "p1",
        stevilka_dresa: 10,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      message: "Registracija uspešna",
      user: { id: "fixed-uuid", role: "igralec", email: "tim@example.com" },
    });
  });

  test("returns 409 on duplicate player email", async () => {
    let nextError: Error | null = new Error("duplicate entry");
    const sqlMock = async () => {
      if (nextError) {
        const err = nextError;
        nextError = null;
        throw err;
      }
      return [];
    };

    const POST = createRegisterHandler({
      sql: sqlMock,
      hashPassword: async () => "hashed-password",
      uuid: () => "fixed-uuid",
      json: (body, init) => ({ body, status: init?.status ?? 200 } as any),
    });

    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        role: "igralec",
        ime: "Tim",
        priimek: "Kralj",
        starost: 21,
        email: "tim@example.com",
        password: "pass",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(req);
    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: "Email je že v uporabi." });
  });

  test("returns 500 on unexpected errors", async () => {
    let nextError: Error | null = new Error("boom");
    const sqlMock = async () => {
      if (nextError) {
        const err = nextError;
        nextError = null;
        throw err;
      }
      return [];
    };

    const POST = createRegisterHandler({
      sql: sqlMock,
      hashPassword: async () => "hashed-password",
      uuid: () => "fixed-uuid",
      json: (body, init) => ({ body, status: init?.status ?? 200 } as any),
    });

    const req = new Request("http://localhost/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        role: "igralec",
        ime: "Tim",
        priimek: "Kralj",
        starost: 21,
        email: "tim@example.com",
        password: "pass",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(req);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Napaka pri registraciji." });
  });
});
