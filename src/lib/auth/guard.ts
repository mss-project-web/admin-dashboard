import 'server-only';
import { getSessionCookie } from './cookies';
import { verifySession, type SessionUser } from './firebase';
import { Unauthorized, Forbidden } from '../http/response';

// `sub` is kept as an alias of `uid` so existing call sites keep working.
export type AuthUser = SessionUser & { sub: string };

/** Resolve the authenticated user from the Firebase session cookie (401 if invalid). */
export async function requireAuth(): Promise<AuthUser> {
    const cookie = await getSessionCookie();
    if (!cookie) throw Unauthorized('Missing session');
    try {
        const user = await verifySession(cookie);
        return { ...user, sub: user.uid };
    } catch {
        throw Unauthorized('Invalid or expired session');
    }
}

/** Require auth AND one of the given roles (via the `role` custom claim). */
export async function requireRole(...roles: string[]): Promise<AuthUser> {
    const user = await requireAuth();
    if (roles.length && !roles.includes(user.role)) {
        throw Forbidden('Insufficient role permissions');
    }
    return user;
}

export const Role = {
    USER: 'user',
    ADMIN: 'admin',
    SUPERADMIN: 'superadmin',
} as const;
