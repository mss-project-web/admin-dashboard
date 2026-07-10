import 'server-only';
import { getAdminAuth } from '../firebase/admin';
import { Unauthorized, Forbidden, ApiError } from '../http/response';

export type SessionUser = {
    uid: string;
    email?: string;
    role: string;
};

const SIGN_IN_URL = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword';

/**
 * Verify an email/password against Firebase Authentication via the Identity
 * Toolkit REST API (the Admin SDK can't check passwords). Returns the idToken
 * and uid on success; throws Unauthorized on bad credentials.
 */
export async function signInWithPassword(email: string, password: string): Promise<{ idToken: string; uid: string }> {
    const apiKey = process.env.FIREBASE_API_KEY;
    if (!apiKey) throw new Error('FIREBASE_API_KEY is not configured');

    const res = await fetch(`${SIGN_IN_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
    });
    const data = await res.json();

    if (!res.ok) {
        const code: string = data?.error?.message || '';
        if (code.startsWith('USER_DISABLED')) throw Forbidden('This account has been disabled');
        if (code.startsWith('TOO_MANY_ATTEMPTS_TRY_LATER')) {
            throw new ApiError('Too many attempts, please try again later', 429);
        }
        // EMAIL_NOT_FOUND / INVALID_PASSWORD / INVALID_LOGIN_CREDENTIALS
        throw Unauthorized('Invalid credentials');
    }
    return { idToken: data.idToken as string, uid: data.localId as string };
}

export async function createSessionCookie(idToken: string): Promise<{ cookie: string; expiresInMs: number }> {
    const days = Math.min(Number(process.env.SESSION_DAYS) || 5, 14);
    const expiresInMs = days * 24 * 60 * 60 * 1000;
    const cookie = await getAdminAuth().createSessionCookie(idToken, { expiresIn: expiresInMs });
    return { cookie, expiresInMs };
}

/** Verify a session cookie and return the user + role claim. */
export async function verifySession(cookie: string): Promise<SessionUser> {
    const decoded = await getAdminAuth().verifySessionCookie(cookie, true);
    return {
        uid: decoded.uid,
        email: decoded.email,
        role: (decoded.role as string) || 'user',
    };
}

/** Persist a user's role as a custom claim so it rides inside the session token. */
export async function setRoleClaim(uid: string, role: string): Promise<void> {
    await getAdminAuth().setCustomUserClaims(uid, { role });
}
