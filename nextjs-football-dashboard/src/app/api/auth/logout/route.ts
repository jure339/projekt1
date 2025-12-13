import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "OK" });
  res.cookies.set("auth", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}

