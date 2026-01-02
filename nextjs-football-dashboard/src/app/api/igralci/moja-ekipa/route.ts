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
    // ✅ Next 15: cookies() je async
    const cookieStore = await cookies();
    const token = cookieStore.get("auth")?.value;

    if (!token) {
      return NextResponse.json({ error: "Ni prijavljen." }, { status: 401 });
    }

    let payload: TokenPayload;
    try {
      payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      return NextResponse.json({ error: "Neveljaven token." }, { status: 401 });
    }

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

    const ekipaId = rows[0]?.ekipa_id ?? null;

    if (!ekipaId) {
      return NextResponse.json(
        { error: "Igralec nima dodeljene ekipe." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ekipaId },
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
