import { handle, ok, Unauthorized } from '@/lib/http/response';
import { getSessionCookie } from '@/lib/auth/cookies';
import { verifySession } from '@/lib/auth/firebase';

/**
 * Firebase session cookies are long-lived (SESSION_DAYS), so there is no token
 * to rotate. This endpoint just confirms the session is still valid — the admin
 * axios interceptor calls it on a 401 and redirects to login if it fails.
 */
export const POST = handle(async () => {
    const cookie = await getSessionCookie();
    if (!cookie) throw Unauthorized('Missing session');
    try {
        await verifySession(cookie);
    } catch {
        throw Unauthorized('Invalid or expired session');
    }
    return ok(null, 'Session valid');
});
