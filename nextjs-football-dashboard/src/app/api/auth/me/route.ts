import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const JWT_SECRET = process.env.JWT_SECRET!;

type AuthPayload = {
  sub: string;
  role: "igralec" | "trener";
  email: string;
};

export async function GET() {
  try {
    const token = cookies().get("auth")?.value; // ✅ auth (ne token)
    if (!token) {
      return NextResponse.json({ error: "Ni prijavljen." }, { status: 401 });
    }

    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;

    return NextResponse.json(
      { user: payload },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    return NextResponse.json({ error: "Neveljaven token." }, { status: 401 });
  }
}
