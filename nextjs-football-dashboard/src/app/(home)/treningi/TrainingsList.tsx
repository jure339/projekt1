"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getUser, saveUser } from "@/lib/user-store";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TrainingRow = {
  id: string;
  zacetek: string;
  konec: string;
  povrsina: string;
  opis: string | null;
};

async function safeReadJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function TrainingsList({ className }: { className?: string }) {
  const [teamId, setTeamId] = useState<string | null>(null);

  const [rows, setRows] = useState<TrainingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  // ✅ always read coach ekipa_id from API (cookie), not from localStorage
  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg(null);

      try {
        const res = await fetch("/api/trenerji/moj-profil", { cache: "no-store" });
        const data = await safeReadJson(res);

        if (!res.ok) {
          setMsg(data?.error ?? "Not logged in.");
          setLoading(false);
          return;
        }

        const coach = data?.coach as { ekipa_id: string | null } | undefined;
        const ekipaId = coach?.ekipa_id ?? null;

        // 🔁 update localStorage so other UI parts stay correct
        const u = getUser();
        if (u && u.role === "trener") {
          saveUser({ ...u, ekipa_id: ekipaId });
        }

        if (!ekipaId) {
          setMsg("Coach has no team assigned.");
          setLoading(false);
          return;
        }

        setTeamId(ekipaId);
      } catch {
        setMsg("Connection error.");
        setLoading(false);
      }
    })();
  }, []);

  async function load(currentTeamId: string) {
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch(
        `/api/treningi?ekipaId=${encodeURIComponent(currentTeamId)}`,
        { cache: "no-store" }
      );

      const data = await safeReadJson(res);

      if (!res.ok) {
        setMsg(data?.error ?? "Failed to load trainings.");
        setRows([]);
        return;
      }

      setRows(data?.trainings ?? []);
    } catch {
      setMsg("Connection error.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!teamId) return;
    load(teamId);
  }, [teamId]);

  async function onDelete(id: string) {
    if (!confirm("Are you sure you want to delete this training?")) return;

    try {
      const res = await fetch(`/api/treningi/${id}`, { method: "DELETE" });
      const data = await safeReadJson(res);

      if (!res.ok) {
        alert(data?.error ?? "Delete failed.");
        return;
      }

      setRows((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Connection error.");
    }
  }

  const container =
    "grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card";
  const actionBtn =
    "inline-flex items-center rounded-lg border border-stroke px-3 py-1.5 text-sm font-medium text-dark transition hover:border-primary hover:text-primary dark:border-dark-3 dark:text-white";
  const deleteBtn =
    "inline-flex items-center rounded-lg bg-red px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red/90";

  return (
    <div className={cn(container, className)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Trainings
        </h2>

        <div className="flex gap-2">
          <Link
            href="/addtraning"
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
          >
            + Add training
          </Link>

          <button
            onClick={() => teamId && load(teamId)}
            disabled={!teamId || loading}
            className={cn(
              "inline-flex items-center rounded-lg border border-stroke px-4 py-2 text-sm font-medium transition dark:border-dark-3",
              loading
                ? "cursor-not-allowed opacity-50 text-dark-6 dark:text-white/60"
                : "text-dark hover:border-primary hover:text-primary dark:text-white"
            )}
          >
            Refresh
          </button>
        </div>
      </div>

      {msg && <p className="mb-3 text-sm text-red">{msg}</p>}

      <Table>
        <TableHeader>
          <TableRow className="border-none uppercase [&>th]:text-center">
            <TableHead className="!text-left">Start</TableHead>
            <TableHead className="!text-left">End</TableHead>
            <TableHead>Surface</TableHead>
            <TableHead className="!text-left">Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-dark dark:text-white">
                Loading...
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-dark dark:text-white">
                No trainings found
              </TableCell>
            </TableRow>
          ) : (
            rows.map((t) => (
              <TableRow
                key={t.id}
                className="text-center text-base font-medium text-dark dark:text-white"
              >
                <TableCell className="!text-left">
                  {new Date(t.zacetek).toLocaleString()}
                </TableCell>
                <TableCell className="!text-left">
                  {new Date(t.konec).toLocaleString()}
                </TableCell>
                <TableCell>{t.povrsina}</TableCell>
                <TableCell className="!text-left">{t.opis ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Link href={`/edittrening/${t.id}`} className={actionBtn}>
                      Edit
                    </Link>
                    <button onClick={() => onDelete(t.id)} className={deleteBtn}>
                      Delete
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
