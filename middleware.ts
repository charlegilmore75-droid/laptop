import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware(routing);

const publicPaths = [
  '/ar/auth/login',
  '/en/auth/login',
  '/ar/auth/register',
  '/en/auth/register',
  '/ar/auth/verify',
  '/en/auth/verify',
  '/ar/auth/forgot-password',
  '/en/auth/forgot-password',
  '/ar/auth/reset-password',
  '/en/auth/reset-password',
];

const adminPaths = ['/ar/admin', '/en/admin'];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));
  const isAdminPath = adminPaths.some((p) => pathname.startsWith(p));
  const isAuthPath = publicPaths.some((p) => pathname.startsWith(p));

  if (isAdminPath) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const locale = pathname.startsWith('/en') ? 'en' : 'ar';
      return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
    }
    if (token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
