'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import InputGroup from '@/components/FormElements/InputGroup';
import { getUser, type StoredUser } from '@/lib/user-store';

type NasprotnaEkipa = {
  id: string;
  ime: string;
};

type Payload = {
  cas_tekme: string; // ISO
  kraj: string | null;
  nasprotnik_id: string | null;
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

export default function AddGamePage() {
  const router = useRouter();

  const [casTekme, setCasTekme] = useState<string>(''); // datetime-local
  const [kraj, setKraj] = useState<string>('');

  const [nasprotniki, setNasprotniki] = useState<NasprotnaEkipa[]>([]);
  const [nasprotnikId, setNasprotnikId] = useState<string>('');

  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingOpp, setLoadingOpp] = useState(false);

  // ✅ coach only
  useEffect(() => {
    const u: StoredUser | null = getUser();
    if (!u) {
      router.push('/auth/login');
      return;
    }
    if (u.role !== 'trener') {
      router.push('/dashboard');
      return;
    }
  }, [router]);

  async function loadOpponents() {
    setLoadingOpp(true);
    setMsg(null);

    try {
      const res = await fetch('/api/game/nasprotne-ekipe', { cache: 'no-store' });
      const data = await safeReadJson(res);

      if (!res.ok) {
        setMsg(data?.error ?? 'Failed to load opponents.');
        setNasprotniki([]);
        return;
      }

      setNasprotniki(data?.teams ?? []);
    } catch {
      setMsg('Connection error (opponents).');
      setNasprotniki([]);
    } finally {
      setLoadingOpp(false);
    }
  }

  // ✅ load opponents for dropdown
  useEffect(() => {
    loadOpponents();
  }, []);

  function toISOFromLocal(local: string) {
    return new Date(local).toISOString();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!casTekme) {
      setMsg('Date and time are required.');
      return;
    }

    setLoading(true);

    const payload: Payload = {
      cas_tekme: toISOFromLocal(casTekme),
      kraj: kraj.trim() ? kraj.trim() : null,
      nasprotnik_id: nasprotnikId || null,
    };

    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await safeReadJson(res);

      if (!res.ok) {
        setMsg(data?.error ?? 'Failed to save game.');
        return;
      }

      router.push('/tekme');
      router.refresh();
    } catch {
      setMsg('Connection error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 620, margin: '40px auto', padding: 16 }}>
      <h1>Add game</h1>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14 }}>
        <InputGroup
          label="Game date & time"
          placeholder=""
          type="datetime-local"
          required
          value={casTekme}
          handleChange={(e) => setCasTekme(e.target.value)}
          disabled={loading}
          active={!!casTekme}
          name="cas_tekme"
        />

        <InputGroup
          label="Location (optional)"
          placeholder="e.g. Velenje, Rudar Stadium"
          type="text"
          value={kraj}
          handleChange={(e) => setKraj(e.target.value)}
          disabled={loading}
          active={!!kraj}
          name="kraj"
        />

        {/* Opponent dropdown + Add opponent button */}
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <label className="text-body-sm font-medium text-dark dark:text-white">
              Opponent (optional)
            </label>

            <Link
              href="/addopponent"
              className="inline-flex items-center rounded-lg border border-stroke px-3 py-1.5 text-sm font-medium text-dark transition hover:border-primary hover:text-primary dark:border-dark-3 dark:text-white"
            >
              + Add opponent
            </Link>
          </div>

          <select
            value={nasprotnikId}
            onChange={(e) => setNasprotnikId(e.target.value)}
            disabled={loading || loadingOpp}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
          >
            <option value="">{loadingOpp ? 'Loading opponents...' : 'Select opponent'}</option>

            {nasprotniki.map((t) => (
              <option key={t.id} value={t.id}>
                {t.ime}
              </option>
            ))}
          </select>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="mt-2 w-full rounded-lg bg-primary px-5.5 py-3 font-medium text-white transition disabled:opacity-60"
        >
          {loading ? 'Saving...' : 'Add game'}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 font-medium text-dark transition hover:border-primary hover:text-primary dark:border-dark-3 dark:text-white"
        >
          Cancel
        </button>

        {msg && <p style={{ color: 'crimson' }}>{msg}</p>}
      </form>
    </div>
  );
}
