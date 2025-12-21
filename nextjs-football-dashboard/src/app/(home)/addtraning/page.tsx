"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InputGroup from "@/components/FormElements/InputGroup";
import { getUser, type StoredUser } from "@/lib/user-store";

type Payload = {
  ekipa_id: string;
  trener_id: string;
  zacetek: string; // ISO
  konec: string; // ISO
  povrsina: string;
  opis: string | null;
};

async function safeJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function AddTrainingPage() {
  const router = useRouter();

  const [teamId, setTeamId] = useState<string>("");
  const [teamName, setTeamName] = useState<string>("");

  const [coachId, setCoachId] = useState<string>("");

  // datetime-local format: YYYY-MM-DDTHH:mm
  const [startLocal, setStartLocal] = useState<string>("");
  const [endLocal, setEndLocal] = useState<string>("");

  const [surface, setSurface] = useState<string>("umetna");
  const [description, setDescription] = useState<string>("");

  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(false);

  // ✅ coach only + set teamId + coachId
  useEffect(() => {
    const u: StoredUser | null = getUser();

    if (!u) {
      router.push("/auth/login");
      return;
    }

    if (u.role !== "trener") {
      router.push("/dashboard");
      return;
    }

    if (!u.ekipa_id) {
      setMsg("Coach has no team assigned.");
      return;
    }

    setCoachId(u.id);
    setTeamId(u.ekipa_id);
  }, [router]);

  // ✅ load team name for display
  useEffect(() => {
    (async () => {
      if (!teamId) return;

      setLoadingTeam(true);
      try {
        // ⚠️ you said you have /api/ekipa/[id]
        const res = await fetch(`/api/ekipa/${teamId}`, { cache: "no-store" });
        const data = await safeJson(res);

        if (!res.ok) {
          setTeamName("Unknown team");
          return;
        }

        setTeamName(data?.ekipa?.ime ?? "Unknown team");
      } catch {
        setTeamName("Unknown team");
      } finally {
        setLoadingTeam(false);
      }
    })();
  }, [teamId]);

  function toISOFromLocal(local: string) {
    return new Date(local).toISOString();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!teamId || !coachId) {
      setMsg("Team or coach is missing.");
      return;
    }

    if (!startLocal || !endLocal) {
      setMsg("Start and end are required.");
      return;
    }

    const startISO = toISOFromLocal(startLocal);
    const endISO = toISOFromLocal(endLocal);

    if (new Date(endISO).getTime() <= new Date(startISO).getTime()) {
      setMsg("End time must be after start time.");
      return;
    }

    setLoading(true);

    const payload: Payload = {
      ekipa_id: teamId,
      trener_id: coachId,
      zacetek: startISO,
      konec: endISO,
      povrsina: surface,
      opis: description.trim() ? description.trim() : null,
    };

    try {
      const res = await fetch("/api/treningi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        setMsg(data?.error ?? "Failed to save training.");
        return;
      }

      router.push("/treningi"); // ✅ usually better than dashboard after creating
      router.refresh();
    } catch {
      setMsg("Connection error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 620, margin: "40px auto", padding: 16 }}>
      <h1>Add training</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
        {/* ✅ Team name locked (display only) */}
        <InputGroup
          label="Team (locked)"
          placeholder="Coach's team"
          type="text"
          required
          value={loadingTeam ? "Loading team..." : (teamName || "—")}
          handleChange={() => {}}
          disabled
          active={!!teamName}
          name="team_name"
        />

        <InputGroup
          label="Start"
          placeholder=""
          type="datetime-local"
          required
          value={startLocal}
          handleChange={(e) => setStartLocal(e.target.value)}
          disabled={loading}
          active={!!startLocal}
          name="zacetek"
        />

        <InputGroup
          label="End"
          placeholder=""
          type="datetime-local"
          required
          value={endLocal}
          handleChange={(e) => setEndLocal(e.target.value)}
          disabled={loading}
          active={!!endLocal}
          name="konec"
        />

        <label className="text-body-sm font-medium text-dark dark:text-white">
          Surface
          <select
            value={surface}
            onChange={(e) => setSurface(e.target.value)}
            disabled={loading}
            className="mt-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          >
            {/* Values stay the same as your DB expects */}
            <option value="umetna">Artificial turf</option>
            <option value="naravna">Grass</option>
            <option value="dvorana">Indoor</option>
            <option value="drugo">Other</option>
          </select>
        </label>

        <div>
          <label className="text-body-sm font-medium text-dark dark:text-white">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            placeholder="e.g. tactics, conditioning, finishing..."
            className="mt-3 w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            rows={4}
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="mt-2 w-full rounded-lg bg-primary px-5.5 py-3 font-medium text-white transition disabled:opacity-60"
        >
          {loading ? "Saving..." : "Add training"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 font-medium text-dark transition hover:border-primary hover:text-primary dark:border-dark-3 dark:text-white"
        >
          Cancel
        </button>

        {msg && <p style={{ color: "crimson" }}>{msg}</p>}
      </form>
    </div>
  );
}
