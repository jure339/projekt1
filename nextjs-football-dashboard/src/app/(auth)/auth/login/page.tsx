"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveUser, type StoredUser } from "@/lib/user-store";

type Role = "igralec" | "trener";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();

  const [role, setRole] = useState<Role>("igralec");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, email, password }),
      });

      // ⚠️ prepreči "Unexpected end of JSON input"
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        setMsg(data?.error ?? "Napaka pri prijavi.");
        return;
      }

      // ✅ SHRANI UPORABNIKA
      const user = data.user as StoredUser;
      saveUser(user);

      const next = params.get("next");
      router.push(next || "/dashboard");
      router.refresh();
    } catch {
      setMsg("Napaka pri povezavi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1>Prijava</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <label>
          Vloga
          <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="igralec">Igralec</option>
            <option value="trener">Trener</option>
          </select>
        </label>

        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </label>

        <label>
          Geslo
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </label>

        <button disabled={loading} type="submit">
          {loading ? "Prijavljam..." : "Prijavi se"}
        </button>

        {msg && <p style={{ color: "crimson" }}>{msg}</p>}
      </form>
    </div>
  );
}
