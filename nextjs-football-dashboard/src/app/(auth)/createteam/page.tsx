"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, saveUser } from "@/lib/user-store";

async function safeReadJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
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

    if (!teamName.trim()) {
      setMsg("Team name is required.");
      return;
    }

    setLoading(true);

    try {
      // ✅ pravilna pot pri tebi je /api/ekipa
      const res = await fetch("/api/ekipa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ime: teamName.trim() }),
      });

      const data = await safeReadJson(res);

      if (!res.ok) {
        setMsg(`Failed to create team (${res.status}). ${data?.error ?? ""}`.trim());
        return;
      }

      // ✅ POSODOBI localStorage userja (da ekipa_id ni več null)
      const logged = getUser();
      const newTeamId = data?.coach?.ekipa_id ?? data?.team?.id ?? null;

      if (logged && newTeamId) {
        saveUser({ ...logged, ekipa_id: newTeamId });
      }

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
