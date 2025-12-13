import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthToken } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // zaščitimo vse pod /dashboard (in po želji še več)
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/trener") ||
    pathname.startsWith("/igralec");

  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("auth")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  try {
    verifyAuthToken(token);
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/trener/:path*", "/igralec/:path*"],
};
