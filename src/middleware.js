import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';

const protectedRoutes = ['/dashboard', '/api/members', '/api/analytics'];
const publicRoutes = ['/login'];

export default async function middleware(req) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  const session = await verifySession();

  if (isProtectedRoute && !session?.isAuth) {
    if (path.startsWith('/api/')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (isPublicRoute && session?.isAuth && !req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  if (path === '/' && session?.isAuth) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  } else if (path === '/' && !session?.isAuth) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
