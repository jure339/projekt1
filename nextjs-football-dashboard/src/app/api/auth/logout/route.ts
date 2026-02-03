import { NextResponse } from 'next/server';

// Logout: izprazni auth cookie in vrne OK.
export async function POST() {
  const res = NextResponse.json({ message: 'OK' });
  res.cookies.set('auth', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return res;
}
