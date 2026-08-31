import { z } from 'zod';
import { handle, ok, TooManyRequests } from '@/lib/http/response';
import { sendPasswordResetEmail } from '@/lib/auth/firebase';
import { systemLogRepo } from '@/lib/repositories/systemLogRepo';
import { clientIp, userAgent } from '@/lib/http/request';
import { enforceRateLimit, rateLimitKey } from '@/lib/security/rateLimit';

const schema = z.object({
    email: z.string().email(),
});

export const POST = handle(async (req) => {
    const { email } = schema.parse(await req.json());
    try {
        enforceRateLimit(rateLimitKey(req, `password-reset:${email.toLowerCase()}`), 3, 60 * 60 * 1000);
    } catch (error) {
        if (error instanceof Error && error.message === 'RATE_LIMITED') throw TooManyRequests('ขอรีเซ็ตรหัสผ่านบ่อยเกินไป กรุณาลองใหม่ภายหลัง');
        throw error;
    }

    await sendPasswordResetEmail(email);

    await systemLogRepo.create({
        action: 'PASSWORD_RESET_REQUEST',
        resource: 'Auth',
        resourceId: email,
        userId: email,
        role: 'system',
        details: { email },
        ip: clientIp(req),
        userAgent: userAgent(req),
    });

    return ok(null, 'Password reset email sent successfully');
});
