import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public pages that don't need auth check in middleware
// Auth is handled client-side for dashboard pages
const publicPages = ['/', '/login', '/register', '/dashboard', '/profile', '/sessions'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all API routes - they handle their own authentication
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Allow public pages
  if (publicPages.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // For other protected pages, check for token presence
  const accessToken = request.cookies.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Let the page load - it will validate the token client-side
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
