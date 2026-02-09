import { NextResponse } from 'next/server';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { signAuthToken, type Role } from '@/lib/auth';

// DB povezava za login (preverjanje uporabnika in gesla).
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// Login endpoint: preveri uporabnika, izda JWT in nastavi cookie.
export async function POST(req: Request) {
  try {
    const { email, password, role } = (await req.json()) as {
      email: string;
      password: string;
      role: Role;
    };

    // Obvezna polja.
    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Manjkajo podatki.' }, { status: 400 });
    }

    // Uporabnike hranimo v dveh tabelah, odvisno od vloge.
    const table = role === 'igralec' ? 'igralci' : 'trenerji';

    const rows = await sql`
      SELECT id, ime, priimek, email, password, ekipa_id
      FROM ${sql(table)}
      WHERE email = ${email}
      LIMIT 1
    `;

    // Neveljaven email.
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Napačen email ali geslo.' }, { status: 401 });
    }

    const user = rows[0];
    // Preveri bcrypt hash.
    const ok = await bcrypt.compare(password, user.password);

    // Neveljavno geslo.
    if (!ok) {
      return NextResponse.json({ error: 'Napačen email ali geslo.' }, { status: 401 });
    }

    // JWT vsebuje minimalen nabor podatkov (sub, role, email).
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

    // HttpOnly cookie za avtentikacijo.
    res.cookies.set('auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dni
    });

    return res;
  } catch (e: any) {
    // Nepričakovane napake.
    console.error('LOGIN ERROR:', e);
    return NextResponse.json({ error: 'Napaka pri prijavi.' }, { status: 500 });
  }
}
