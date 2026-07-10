import 'server-only';
import { cookies } from 'next/headers';

// Firebase session cookie. Named `session` (the old JWT `access_token` is gone).
const SESSION = 'session';

const isProd = process.env.NODE_ENV === 'production';
// Set COOKIE_DOMAIN=.msspsuhatyai.org to share the session across subdomains
// (manage.* / api.*). Leave empty for localhost.
const domain = process.env.COOKIE_DOMAIN || undefined;
// Cross-subdomain in prod needs SameSite=None + Secure; localhost keeps Lax.
const sameSite: 'lax' | 'none' = isProd && domain ? 'none' : 'lax';

function opts(maxAgeSeconds: number) {
    return {
        httpOnly: true as const,
        secure: isProd,
        sameSite,
        path: '/',
        domain,
        maxAge: maxAgeSeconds,
    };
}

export const SESSION_COOKIE = SESSION;

export async function setSessionCookie(cookie: string, expiresInMs: number) {
    const store = await cookies();
    store.set(SESSION, cookie, opts(Math.floor(expiresInMs / 1000)));
}

export async function clearSessionCookie() {
    const store = await cookies();
    store.set(SESSION, '', opts(0));
}

export async function getSessionCookie(): Promise<string | undefined> {
    return (await cookies()).get(SESSION)?.value;
}
