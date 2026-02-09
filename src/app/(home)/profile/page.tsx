'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import InputGroup from '@/components/FormElements/InputGroup';
import { cn } from '@/lib/utils';
import { getUser, saveUser, type StoredUser } from '@/lib/user-store';

type Coach = {
  id: string;
  ime: string;
  priimek: string;
  email: string;
  starost: number;
  ekipa_id: string | null;
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

export default function CoachProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [coach, setCoach] = useState<Coach | null>(null);

  // form
  const [ime, setIme] = useState('');
  const [priimek, setPriimek] = useState('');
  const [email, setEmail] = useState('');
  const [starost, setStarost] = useState<string>('');
  const [password, setPassword] = useState(''); // optional

  // team name
  const [teamName, setTeamName] = useState<string>('');
  const [loadingTeam, setLoadingTeam] = useState(false);

  async function load() {
    setLoading(true);
    setMsg(null);

    try {
      const u = getUser();
      if (!u) {
        router.push('/auth/login');
        return;
      }
      if (u.role !== 'trener') {
        router.push('/dashboard');
        return;
      }

      const res = await fetch('/api/trenerji/moj-profil', { cache: 'no-store' });
      const data = await safeReadJson(res);

      if (!res.ok) {
        setMsg(data?.error ?? 'Failed to load coach profile.');
        setCoach(null);
        return;
      }

      const c = data?.coach as Coach;
      setCoach(c);

      setIme(c.ime ?? '');
      setPriimek(c.priimek ?? '');
      setEmail(c.email ?? '');
      setStarost(String(c.starost ?? ''));
      setPassword('');

      if (c.ekipa_id) {
        setLoadingTeam(true);
        try {
          const tRes = await fetch(`/api/ekipa/${c.ekipa_id}`, { cache: 'no-store' });
          const tData = await safeReadJson(tRes);
          setTeamName(tRes.ok ? (tData?.ekipa?.ime ?? '') : '');
        } catch {
          setTeamName('');
        } finally {
          setLoadingTeam(false);
        }
      } else {
        setTeamName('');
      }
    } catch {
      setMsg('Connection error.');
      setCoach(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!ime.trim() || !priimek.trim() || !email.trim() || !starost.trim()) {
      setMsg('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        ime: ime.trim(),
        priimek: priimek.trim(),
        email: email.trim(),
        starost: Number(starost),
      };

      if (password.trim().length > 0) payload.password = password.trim();

      const res = await fetch('/api/trenerji/moj-profil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await safeReadJson(res);

      if (!res.ok) {
        // ✅ prikaži pravi server error
        setMsg(data?.error ?? 'Failed to save coach profile.');
        return;
      }

      const updated = data?.coach as Coach | undefined;
      if (updated) {
        setCoach(updated);

        // ✅ update localStorage user
        const u = getUser();
        if (u && u.role === 'trener') {
          const updatedStored: StoredUser = {
            ...u,
            ime: updated.ime,
            priimek: updated.priimek,
            email: updated.email,
            ekipa_id: updated.ekipa_id ?? null,
          };
          saveUser(updatedStored);
        }

        setPassword('');
      }

      setMsg('Saved ✅');
      router.refresh();
    } catch {
      setMsg('Connection error.');
    } finally {
      setSaving(false);
    }
  }

  const card =
    'rounded-[14px] border border-stroke bg-white p-6 shadow-1 dark:border-primary/30 dark:bg-gray-dark dark:shadow-card';

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-dark dark:text-white">Coach profile</h1>

        <button
          onClick={load}
          disabled={loading}
          className={cn(
            'rounded-lg border border-stroke px-4 py-2 text-sm font-medium transition dark:border-dark-3',
            loading
              ? 'cursor-not-allowed text-dark-6 opacity-50 dark:text-white/60'
              : 'text-dark hover:border-primary hover:text-primary dark:text-white',
          )}
        >
          Refresh
        </button>
      </div>

      <div className={card}>
        {msg && (
          <p className={cn('mb-4 text-sm', msg.includes('✅') ? 'text-green-600' : 'text-red')}>
            {msg}
          </p>
        )}

        {loading ? (
          <p className="text-dark-6 dark:text-white/70">Loading...</p>
        ) : !coach ? (
          <p className="text-dark-6 dark:text-white/70">Profile not available.</p>
        ) : (
          <>
            <div className="mb-5 text-sm text-dark-6 dark:text-white/70">
              <div>
                <span className="font-medium text-dark dark:text-white">Team: </span>
                {coach.ekipa_id ? (loadingTeam ? 'Loading...' : teamName || '—') : 'No team'}
              </div>
            </div>

            <form onSubmit={onSave} className="grid gap-4">
              <InputGroup
                label="First name"
                placeholder="First name"
                type="text"
                required
                value={ime}
                handleChange={(e) => setIme(e.target.value)}
                disabled={saving}
                active={!!ime}
                name="ime"
              />

              <InputGroup
                label="Last name"
                placeholder="Last name"
                type="text"
                required
                value={priimek}
                handleChange={(e) => setPriimek(e.target.value)}
                disabled={saving}
                active={!!priimek}
                name="priimek"
              />

              <InputGroup
                label="Email"
                placeholder="email@example.com"
                type="email"
                required
                value={email}
                handleChange={(e) => setEmail(e.target.value)}
                disabled={saving}
                active={!!email}
                name="email"
              />

              <InputGroup
                label="Age"
                placeholder="e.g. 38"
                type="number"
                required
                value={starost}
                handleChange={(e) => setStarost(e.target.value)}
                disabled={saving}
                active={!!starost}
                name="starost"
              />

              <InputGroup
                label="New password (optional)"
                placeholder="Leave empty to keep current"
                type="password"
                required={false as any}
                value={password}
                handleChange={(e) => setPassword(e.target.value)}
                disabled={saving}
                active={!!password}
                name="password"
              />

              <button
                disabled={saving}
                type="submit"
                className="mt-2 w-full rounded-lg bg-primary px-5.5 py-3 font-medium text-white transition disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                disabled={saving}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 font-medium text-dark transition hover:border-primary hover:text-primary dark:border-dark-3 dark:text-white"
              >
                Cancel
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
