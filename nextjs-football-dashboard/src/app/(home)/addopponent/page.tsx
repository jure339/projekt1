'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import InputGroup from '@/components/FormElements/InputGroup';
import { getUser, type StoredUser } from '@/lib/user-store';

async function safeReadJson(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function AddOpponentPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!name.trim()) {
      setMsg('Opponent name is required.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/game/nasprotne-ekipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ime: name.trim() }),
      });

      const data = await safeReadJson(res);

      if (!res.ok) {
        setMsg(data?.error ?? 'Failed to create opponent.');
        return;
      }

      // ✅ after create -> go back to add game (or game list)
      router.push('/addgame');
      router.refresh();
    } catch {
      setMsg('Connection error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 620, margin: '40px auto', padding: 16 }}>
      <h1>Add Opponent</h1>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14 }}>
        <InputGroup
          label="Opponent name"
          placeholder="e.g. NK Maribor"
          type="text"
          required
          value={name}
          handleChange={(e) => setName(e.target.value)}
          disabled={loading}
          active={!!name}
          name="ime"
        />

        <button
          disabled={loading}
          type="submit"
          className="mt-2 w-full rounded-lg bg-primary px-5.5 py-3 font-medium text-white transition disabled:opacity-60"
        >
          {loading ? 'Saving...' : 'Add opponent'}
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
