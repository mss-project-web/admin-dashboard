import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/** Attach CORS headers for the public API (landing + admin on other subdomains). */
function withCors(res: NextResponse, origin: string | null): NextResponse {
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.headers.set('Access-Control-Allow-Origin', origin);
        res.headers.set('Access-Control-Allow-Credentials', 'true');
        res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.headers.set('Vary', 'Origin');
    }
    return res;
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
    const isCron = pathname.startsWith('/api/cron/');
    const hasSession = request.cookies.has('session');

    // Cookie-authenticated browser mutations must carry a same-site/allowed
    // Origin. Server-to-server calls such as Vercel Cron have no Origin and
    // are handled by their own bearer-secret check.
    if (pathname.startsWith('/api') && isMutation && hasSession && !isCron) {
        const origin = request.headers.get('origin');
        const sameOrigin = origin === request.nextUrl.origin;
        const allowedOrigin = origin ? ALLOWED_ORIGINS.includes(origin) : false;
        if (!origin || (!sameOrigin && !allowedOrigin)) {
            return NextResponse.json({ status: 'fail', message: 'CSRF validation failed' }, { status: 403 });
        }
    }

    // ---- API: CORS + preflight (no auth redirects) ----
    if (pathname.startsWith('/api')) {
        const origin = request.headers.get('origin');
        if (request.method === 'OPTIONS') {
            return withCors(new NextResponse(null, { status: 204 }), origin);
        }
        return withCors(NextResponse.next(), origin);
    }

    // ---- Pages: cookie-based auth gate ----
    const isAuthPage = pathname.startsWith('/auth/');

    if (!hasSession && !isAuthPage) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (hasSession) {
        if (isAuthPage) return NextResponse.redirect(new URL('/menu', request.url));
        if (pathname === '/') return NextResponse.redirect(new URL('/menu', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Run on pages (auth gate) and API routes (CORS), skip static assets.
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
