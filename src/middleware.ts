import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for the access_token in cookies
    // Note: The actual validation logic is done by the backend.
    // We just check existence here to decide navigation flow.
    const hasAccessToken = request.cookies.has('access_token');

    // Define protected and public paths
    const isLoginPage = pathname === '/auth/login';
    const isExcludedPath = pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.startsWith('/favicon.ico');

    // Ignore internal Next.js paths
    if (isExcludedPath) {
        return NextResponse.next();
    }

    // CASE 1: User is NOT logged in
    if (!hasAccessToken) {
        // If trying to access any page other than login, redirect to login
        if (!isLoginPage) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    // CASE 2: User IS logged in
    if (hasAccessToken) {
        // If trying to access login page, redirect to menu
        if (isLoginPage) {
            return NextResponse.redirect(new URL('/menu', request.url));
        }

        // If accessing root /, redirect to menu
        if (pathname === '/') {
            return NextResponse.redirect(new URL('/menu', request.url));
        }
    }

    return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
