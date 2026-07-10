import { z } from 'zod';
import { handle, ok } from '@/lib/http/response';
import { clientIp, userAgent } from '@/lib/http/request';
import { accountRepo } from '@/lib/repositories/accountRepo';
import { systemLogRepo } from '@/lib/repositories/systemLogRepo';
import { signInWithPassword, createSessionCookie } from '@/lib/auth/firebase';
import { setSessionCookie } from '@/lib/auth/cookies';

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const POST = handle(async (req) => {
    const { email, password } = schema.parse(await req.json());

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
