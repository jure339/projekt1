import postgres from "postgres";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });
const JWT_SECRET = process.env.JWT_SECRET!;

type TokenPayload = {
  sub: string;
  role: "igralec" | "trener";
  email: string;
};

export async function GET() {
  try {
    const token = cookies().get("auth")?.value; // ✅ auth
    if (!token) {
      return NextResponse.json({ error: "Ni prijavljen." }, { status: 401 });
    }

    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;

    if (payload.role !== "igralec") {
      return NextResponse.json(
        { error: "Dostop dovoljen samo igralcem." },
        { status: 403 }
      );
    }

    const rows = await sql`
      SELECT ekipa_id
      FROM igralci
      WHERE id = ${payload.sub}
      LIMIT 1;
    `;

    if (rows.length === 0 || !rows[0]?.ekipa_id) {
      return NextResponse.json(
        { error: "Igralec nima dodeljene ekipe." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ekipaId: rows[0].ekipa_id },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.error("GET /api/igralci/moja-ekipa error:", e);
    return NextResponse.json(
      { error: "Napaka pri pridobivanju ekipe." },
      { status: 500 }
    );
  }
}
