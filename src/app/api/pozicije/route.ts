import postgres from 'postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET() {
  try {
    const rows = await sql`
      SELECT id, naziv, kratica
      FROM pozicije
      ORDER BY naziv ASC;
    `;

    return NextResponse.json(
      { positions: rows },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (e: any) {
    console.error('GET /api/pozicije error:', e);
    return NextResponse.json(
      { error: e?.message ?? 'Napaka pri nalaganju pozicij.', positions: [] },
      { status: 500 },
    );
  }
}
