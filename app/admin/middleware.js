// /app/admin/middleware.js
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export function middleware(request) {
  const url = request.url;
  if (url.includes('/admin')) {
    const password = request.headers.get('Authorization');
    if (password !== 'motdepasse') {
      return NextResponse.redirect(new URL('/login', url));
    }
  }

  return NextResponse.next();
}
