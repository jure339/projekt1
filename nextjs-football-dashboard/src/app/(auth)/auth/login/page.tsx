"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveUser, type StoredUser } from "@/lib/user-store";

import InputGroup from "../../../../components/FormElements/InputGroup";

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

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        setMsg(data?.error ?? "Napaka pri prijavi.");
        return;
      }

      const user = data.user as StoredUser;
      saveUser(user);

      const next = params.get("next");

      // ✅ REDIRECT GLEDE NA VLOGO
      if (user.role === "igralec") {
        router.push("/playerdashboard");
      } else {
        router.push(next || "/dashboard");
      }

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

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
        {/* Vloga */}
        <label className="text-body-sm font-medium text-dark dark:text-white">
          Vloga
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="mt-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            disabled={loading}
          >
            <option value="igralec">Igralec</option>
            <option value="trener">Trener</option>
          </select>
        </label>

        <InputGroup
          label="Email"
          placeholder="Vpiši email"
          type="email"
          required
          value={email}
          handleChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          active={!!email}
          name="email"
        />

        <InputGroup
          label="Geslo"
          placeholder="Vpiši geslo"
          type="password"
          required
          value={password}
          handleChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          active={!!password}
          name="password"
        />

        <button
          disabled={loading}
          type="submit"
          className="mt-2 w-full rounded-lg bg-primary px-5.5 py-3 font-medium text-white transition disabled:opacity-60"
        >
          {loading ? "Prijavljam..." : "Prijavi se"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/auth/register")}
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 font-medium text-dark transition hover:border-primary hover:text-primary dark:border-dark-3 dark:text-white"
        >
          Ustvari račun
        </button>

        {msg && <p style={{ color: "crimson" }}>{msg}</p>}
      </form>
    </div>
  );
}
