import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

type TokenPayload = {
  sub: string;
  role: 'igralec' | 'trener';
  email: string;
};

const JWT_SECRET = process.env.JWT_SECRET!;

// Kaj sme kdo gledat
const COACH_ONLY = ['/dashboard', '/treningi', '/tekme', '/players', '/createteam'];

const PLAYER_ONLY = ['/playerdashboard'];

function isPathMatch(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // dovoli auth strani in API auth
  if (pathname.startsWith('/auth') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // če ni zaščitena pot, pusti
  const isProtected = isPathMatch(pathname, [...COACH_ONLY, ...PLAYER_ONLY]);
  if (!isProtected) return NextResponse.next();

  // preveri cookie
  const token = req.cookies.get('auth')?.value;

  // če ni tokena -> login + next=
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  // preveri JWT + role
  let payload: TokenPayload | null = null;
  try {
    payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  // Role-based guard
  if (payload.role === 'igralec' && isPathMatch(pathname, COACH_ONLY)) {
    // igralec poskuša v coach-only
    const url = req.nextUrl.clone();
    url.pathname = '/playerdashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (payload.role === 'trener' && isPathMatch(pathname, PLAYER_ONLY)) {
    // trener poskuša v player-only
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// pomembno: middleware naj teče samo tam, kjer rabiš
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/treningi/:path*',
    '/tekme/:path*',
    '/players/:path*',
    '/createteam/:path*',
    '/playerdashboard/:path*',
  ],
};
