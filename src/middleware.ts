import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;


    const hasAccessToken = request.cookies.has('access_token');

    const isLoginPage = pathname === '/auth/login';
    const isExcludedPath = pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.startsWith('/favicon.ico');

    if (isExcludedPath) {
        return NextResponse.next();
    }

    if (!hasAccessToken) {
        if (!isLoginPage) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    if (hasAccessToken) {
        if (isLoginPage) {
            return NextResponse.redirect(new URL('/menu', request.url));
        }

        if (pathname === '/') {
            return NextResponse.redirect(new URL('/menu', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
