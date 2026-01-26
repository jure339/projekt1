import { NextResponse } from 'next/server';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

type Role = 'igralec' | 'trener';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as any;

    const { role, ime, priimek, starost, email, password, ekipa_id } = body as {
      role: Role;
      ime: string;
      priimek: string;
      starost: number;
      email: string;
      password: string;
      ekipa_id?: string | null;
    };

    if (!role || !ime || !priimek || !starost || !email || !password) {
      return NextResponse.json({ error: 'Manjkajo podatki.' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    if (role === 'trener') {
      // trenerji: (id, ime, priimek, starost, email UNIQUE, password, ekipa_id)
      const id = uuidv4();

      try {
        await sql`
          INSERT INTO trenerji (id, ime, priimek, starost, email, password, ekipa_id)
          VALUES (${id}, ${ime}, ${priimek}, ${starost}, ${email}, ${hashed}, ${ekipa_id ?? null})
        `;
      } catch (err: any) {
        // UNIQUE email
        if (
          String(err?.message || '')
            .toLowerCase()
            .includes('duplicate')
        ) {
          return NextResponse.json({ error: 'Email je že v uporabi.' }, { status: 409 });
        }
        throw err;
      }

      return NextResponse.json({ message: 'Registracija uspešna', user: { id, role, email } });
    }

    // igralci: (id, ime, priimek, starost, visina, pozicija_id, stevilka_dresa, email UNIQUE, password, ekipa_id)
    const { visina, pozicija_id, stevilka_dresa } = body as {
      visina?: number | null;
      pozicija_id?: string | null;
      stevilka_dresa?: number | null;
    };

    const id = uuidv4();

    try {
      await sql`
        INSERT INTO igralci
          (id, ime, priimek, starost, visina, pozicija_id, stevilka_dresa, email, password, ekipa_id)
        VALUES
          (${id}, ${ime}, ${priimek}, ${starost}, ${visina ?? null}, ${pozicija_id ?? null}, ${stevilka_dresa ?? null},
           ${email}, ${hashed}, ${ekipa_id ?? null})
      `;
    } catch (err: any) {
      if (
        String(err?.message || '')
          .toLowerCase()
          .includes('duplicate')
      ) {
        return NextResponse.json({ error: 'Email je že v uporabi.' }, { status: 409 });
      }
      throw err;
    }

    return NextResponse.json({ message: 'Registracija uspešna', user: { id, role, email } });
  } catch (e: any) {
    console.error('REGISTER ERROR:', e);
    return NextResponse.json({ error: 'Napaka pri registraciji.' }, { status: 500 });
  }
}
