'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputGroup from '@/components/FormElements/InputGroup';

export default function RegisterCoachPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState<number>(30);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const payload = {
      role: 'trener', // ✅ ALWAYS COACH
      ime: firstName.trim(),
      priimek: lastName.trim(),
      starost: Number(age),
      email: email.trim(),
      password,
      ekipa_id: null, // ✅ team will be created next
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data?.error ?? 'Registration failed.');
        return;
      }

      // ✅ after register → create team
      router.push('/auth/login');
    } catch {
      setMsg('Connection error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: 16 }}>
      <h1 className="mb-4 text-2xl font-bold">Coach Registration</h1>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14 }}>
        <InputGroup
          label="First Name"
          placeholder="Enter first name"
          type="text"
          required
          value={firstName}
          handleChange={(e) => setFirstName(e.target.value)}
          disabled={loading}
          active={!!firstName}
        />

        <InputGroup
          label="Last Name"
          placeholder="Enter last name"
          type="text"
          required
          value={lastName}
          handleChange={(e) => setLastName(e.target.value)}
          disabled={loading}
          active={!!lastName}
        />

        <InputGroup
          label="Age"
          placeholder="e.g. 35"
          type="number"
          required
          value={String(age)}
          handleChange={(e) => setAge(Number(e.target.value))}
          disabled={loading}
          active
        />

        <InputGroup
          label="Email"
          placeholder="email@example.com"
          type="email"
          required
          value={email}
          handleChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          active={!!email}
        />

        <InputGroup
          label="Password"
          placeholder="Enter password"
          type="password"
          required
          value={password}
          handleChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          active={!!password}
        />

        <button
          disabled={loading}
          type="submit"
          className="mt-2 w-full rounded-lg bg-primary px-5.5 py-3 font-medium text-white transition disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Create coach account'}
        </button>

        {msg && <p style={{ color: 'crimson' }}>{msg}</p>}

        <button
          type="button"
          onClick={() => router.push('/auth/login')}
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5.5 py-3 font-medium text-dark transition hover:border-primary hover:text-primary dark:border-dark-3 dark:text-white"
        >
          Back to login
        </button>
      </form>
    </div>
  );
}
