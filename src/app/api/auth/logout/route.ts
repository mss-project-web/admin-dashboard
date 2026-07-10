import { handle, ok } from '@/lib/http/response';
import { getSessionCookie, clearSessionCookie } from '@/lib/auth/cookies';
import { verifySession } from '@/lib/auth/firebase';
import { getAdminAuth } from '@/lib/firebase/admin';

export const POST = handle(async () => {
    // Best-effort revoke so the session can't be reused elsewhere.
    const cookie = await getSessionCookie();
    if (cookie) {
        try {
            const { uid } = await verifySession(cookie);
            await getAdminAuth().revokeRefreshTokens(uid);
        } catch {
            /* already invalid */
        }
    }
    await clearSessionCookie();
    return ok(null, 'Logout successful');
});
