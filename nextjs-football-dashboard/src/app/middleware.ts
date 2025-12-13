import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // Dovoli auth strani brez prijave
  const isAuthRoute = pathname.startsWith("/auth");

  if (!token && !isAuthRoute) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname); // da po prijavi vrne nazaj
    return NextResponse.redirect(url);
  }

  // Če je že prijavljen, naj ne hodi na login/register
  if (token && isAuthRoute) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Zelo pomembno: matcher naj pokrije VSE route-e, razen statičnih
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets|public).*)"],
};
