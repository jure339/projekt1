"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, saveUser, type StoredUser } from "@/lib/user-store";

async function safeReadJson(res: Response) {
  const t = await res.text();
  if (!t) return null;
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}

export default function CreateTeamPage() {
  const router = useRouter();

  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const u = getUser();
    if (!u) {
      setMsg("Not logged in.");
      return;
    }
    if (u.role !== "trener") {
      setMsg("Only a coach can create a team.");
      return;
    }

    if (!teamName.trim()) {
      setMsg("Team name is required.");
      return;
    }

    setLoading(true);

    try {
      // ✅ IMPORTANT: your API is /api/ekipa (not /api/ekipe)
      // ✅ IMPORTANT: credentials include, so cookie "auth" is sent
      const res = await fetch("/api/ekipa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ime: teamName.trim() }),
      });

      const data = await safeReadJson(res);

      if (!res.ok) {
        setMsg(data?.error ?? `Failed to create team (${res.status}).`);
        return;
      }

      // ✅ API returns { coach: { ... ekipa_id ... }, team: {...} }
      const updatedCoach = data?.coach;

      // ✅ Update localStorage user so ekipa_id is no longer null
      const updatedUser: StoredUser = {
        ...u,
        ekipa_id: updatedCoach?.ekipa_id ?? data?.team?.id ?? u.ekipa_id,
      };

      saveUser(updatedUser);

      router.push("/dashboard");
      router.refresh();
    } catch {
      setMsg("Connection error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-12 max-w-xl rounded-lg bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <h1 className="mb-4 text-2xl font-bold text-dark dark:text-white">
        Create Your Team
      </h1>

      <p className="mb-6 text-sm text-dark-6 dark:text-white/70">
        Before you can manage players, trainings and games, you must create your team.
      </p>

      <form onSubmit={onSubmit} className="grid gap-4">
        <label className="text-sm font-medium text-dark dark:text-white">
          Team Name
          <input
            className="mt-2 w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            placeholder="e.g. NK Rudar Velenje"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            disabled={loading}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg bg-primary px-5 py-3 font-medium text-white transition disabled:opacity-60"
        >
          {loading ? "Creating team..." : "Create team"}
        </button>

        {msg && <p className="text-sm text-red">{msg}</p>}
      </form>
    </div>
  );
}
