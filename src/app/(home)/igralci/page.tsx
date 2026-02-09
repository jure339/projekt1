'use client';

import { useEffect, useState } from 'react';
import { getUser } from '@/lib/user-store';

type Player = {
  id: string;
  ime: string;
  priimek: string;
  starost: number;
  pozicija: string | null;
};

export default function DeletePlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  // 🔹 naloži igralce trenerjeve ekipe
  useEffect(() => {
    const u = getUser();

    if (!u || u.role !== 'trener') {
      setMsg('Nimaš dostopa.');
      setLoading(false);
      return;
    }

    const ekipaId = u.ekipa_id;

    if (!ekipaId) {
      setMsg('Nimaš dostopa.');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/igralci?ekipaId=${encodeURIComponent(ekipaId)}`, {
          cache: 'no-store',
        });

        const text = await res.text();
        const data = text ? JSON.parse(text) : null;

        if (!res.ok) {
          setMsg(data?.error ?? 'Napaka pri nalaganju igralcev.');
          return;
        }

        setPlayers(data?.players ?? []);
      } catch {
        setMsg('Napaka pri povezavi.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onDelete(id: string) {
    if (!confirm('Ali si prepričan, da želiš izbrisati igralca?')) return;

    try {
      const res = await fetch(`/api/igralci/${id}`, {
        method: 'DELETE',
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        alert(data?.error ?? 'Napaka pri brisanju.');
        return;
      }

      // odstrani iz UI
      setPlayers((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Napaka pri povezavi.');
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-dark dark:text-white">Players</h1>

      {loading && <p>Loading...</p>}
      {msg && <p className="text-red">{msg}</p>}

      {!loading && players.length === 0 && <p>No players found.</p>}

      <div className="space-y-3">
        {players.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-lg border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-gray-dark"
          >
            <div>
              <div className="font-medium text-dark dark:text-white">
                {p.ime} {p.priimek}
              </div>
              <div className="text-sm text-dark-6 dark:text-white/70">
                Age: {p.starost}
                {p.pozicija ? ` · ${p.pozicija}` : ''}
              </div>
            </div>

            <button
              onClick={() => onDelete(p.id)}
              className="rounded-lg bg-red px-4 py-2 text-sm font-medium text-white hover:bg-red/90"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
