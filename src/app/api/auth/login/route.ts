import { z } from 'zod';
import { handle, ok, TooManyRequests } from '@/lib/http/response';
import { clientIp, userAgent } from '@/lib/http/request';
import { accountRepo } from '@/lib/repositories/accountRepo';
import { systemLogRepo } from '@/lib/repositories/systemLogRepo';
import { signInWithPassword, createSessionCookie } from '@/lib/auth/firebase';
import { setSessionCookie } from '@/lib/auth/cookies';
import { enforceRateLimit, rateLimitKey } from '@/lib/security/rateLimit';

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const POST = handle(async (req) => {
    const { email, password } = schema.parse(await req.json());
    try {
        enforceRateLimit(rateLimitKey(req, `login:${email.toLowerCase()}`), 10, 15 * 60 * 1000);
    } catch (error) {
        if (error instanceof Error && error.message === 'RATE_LIMITED') throw TooManyRequests('เข้าสู่ระบบบ่อยเกินไป กรุณาลองใหม่ภายหลัง');
        throw error;
    }

    // Verify credentials against Firebase Auth, then mint a session cookie.
    const { idToken, uid } = await signInWithPassword(email, password);
    const { cookie, expiresInMs } = await createSessionCookie(idToken);
    await setSessionCookie(cookie, expiresInMs);

    const account = await accountRepo.findByEmail(email);
    await accountRepo.updateLastLogin(uid);

    await systemLogRepo.create({
        action: 'LOGIN',
        resource: 'Auth',
        resourceId: uid,
        userId: uid,
        role: account?.role || 'user',
        details: { email },
        ip: clientIp(req),
        userAgent: userAgent(req),
    });

    return ok(null, 'Login successful');
});
