"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getUser } from "@/lib/user-store";

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
  zacetek: string; // ISO string
  konec: string; // ISO string
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
  const [ekipaId, setEkipaId] = useState<string | null>(null);

  const [rows, setRows] = useState<TrainingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  // ✅ preberemo trenerja in njegovo ekipo
  useEffect(() => {
    const u = getUser();
    if (!u) {
      setMsg("Ni prijavljen.");
      setLoading(false);
      return;
    }
    if (u.role !== "trener") {
      setMsg("Nimaš dostopa (samo trener).");
      setLoading(false);
      return;
    }
    if (!u.ekipa_id) {
      setMsg("Trener nima ekipe.");
      setLoading(false);
      return;
    }

    setEkipaId(u.ekipa_id);
  }, []);

  async function load(currentEkipaId: string) {
    setLoading(true);
    setMsg(null);

    try {
      // ✅ tvoj endpoint očitno zahteva ekipaId
      const res = await fetch(`/api/treningi?ekipaId=${encodeURIComponent(currentEkipaId)}`, {
        cache: "no-store",
      });

      const data = await safeReadJson(res);

      if (!res.ok) {
        setMsg(data?.error ?? "Napaka pri nalaganju treningov.");
        setRows([]);
        return;
      }

      // pričakovano: { trainings: [...] }
      setRows(data?.trainings ?? []);
    } catch {
      setMsg("Napaka pri povezavi.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ekipaId) return;
    load(ekipaId);
  }, [ekipaId]);

  async function onDelete(id: string) {
    if (!confirm("Ali si prepričan, da želiš izbrisati trening?")) return;

    try {
      const res = await fetch(`/api/treningi/${id}`, { method: "DELETE" });
      const data = await safeReadJson(res);

      if (!res.ok) {
        alert(data?.error ?? "Napaka pri brisanju.");
        return;
      }

      setRows((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Napaka pri povezavi.");
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
          Tranings
        </h2>

        <Link
          href="/addtraning"
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
        >
          + Add training
        </Link>
      </div>

      {msg && <p className="mb-3 text-sm text-red">{msg}</p>}

      <Table>
        <TableHeader>
          <TableRow className="border-none uppercase [&>th]:text-center">
            <TableHead className="!text-left">Začetek</TableHead>
            <TableHead className="!text-left">Konec</TableHead>
            <TableHead>Površina</TableHead>
            <TableHead className="!text-left">Opis</TableHead>
            <TableHead>Akcije</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-dark dark:text-white">
                Nalagam...
              </TableCell>
            </TableRow>
          ) : (
            <>
              {rows.map((t) => (
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
                      {/* ✅ EDIT -> odpre /edittraning/[id] */}
                      <Link href={`/edittrening/${t.id}`} className={actionBtn}>
                        Edit
                      </Link>

                      {/* ✅ DELETE */}
                      <button onClick={() => onDelete(t.id)} className={deleteBtn}>
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-dark dark:text-white">
                    Ni treningov
                  </TableCell>
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
