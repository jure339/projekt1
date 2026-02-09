import "./_support/setup-dom";
import { test, expect } from "@playwright/test";

import { clearUser, getUser, saveUser, type StoredUser } from "../src/lib/user-store";

test.describe("user-store", () => {
  test.beforeEach(() => {
    localStorage.clear();
  });

  test("saves and reads the user", () => {
    const user: StoredUser = {
      id: "u1",
      ime: "Ana",
      priimek: "Novak",
      email: "ana@example.com",
      ekipa_id: null,
      role: "igralec",
    };

    saveUser(user);
    expect(getUser()).toEqual(user);
  });

  test("returns null for invalid json", () => {
    localStorage.setItem("logged_user", "{not-json");
    expect(getUser()).toBeNull();
  });

  test("clears user", () => {
    localStorage.setItem("logged_user", JSON.stringify({ id: "u1" }));
    clearUser();
    expect(getUser()).toBeNull();
  });
});
