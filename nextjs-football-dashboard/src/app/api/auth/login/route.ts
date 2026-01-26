import { NextResponse } from 'next/server';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { signAuthToken, type Role } from '@/lib/auth';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function POST(req: Request) {
  try {
    const { email, password, role } = (await req.json()) as {
      email: string;
      password: string;
      role: Role;
    };

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Manjkajo podatki.' }, { status: 400 });
    }

    const table = role === 'igralec' ? 'igralci' : 'trenerji';

    const rows = await sql`
      SELECT id, ime, priimek, email, password, ekipa_id
      FROM ${sql(table)}
      WHERE email = ${email}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Napačen email ali geslo.' }, { status: 401 });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return NextResponse.json({ error: 'Napačen email ali geslo.' }, { status: 401 });
    }

    const token = await signAuthToken({
      sub: user.id,
      role,
      email: user.email,
    });

    const res = NextResponse.json({
      message: 'OK',
      user: {
        id: user.id,
        ime: user.ime,
        priimek: user.priimek,
        email: user.email,
        ekipa_id: user.ekipa_id,
        role,
      },
    });

    res.cookies.set('auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dni
    });

    return res;
  } catch (e: any) {
    console.error('LOGIN ERROR:', e);
    return NextResponse.json({ error: 'Napaka pri prijavi.' }, { status: 500 });
  }
}
