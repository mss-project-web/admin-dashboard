import 'server-only';
import { getSessionCookie } from '../auth/cookies';
import { verifySession } from '../auth/firebase';
import { clientIp, userAgent } from './request';
import { systemLogRepo } from '../repositories/systemLogRepo';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Auto-log mutating requests, replacing the old global SystemLogInterceptor.
 * Body is not captured (already consumed by the handler); action/resource/user
 * are, which is what the logs view and dashboard aggregations rely on.
 */
export async function logMutation(
    req: Request,
    params: Record<string, string> | undefined,
    statusCode: number,
): Promise<void> {
    try {
        const method = req.method.toUpperCase();
        if (!MUTATING.has(method)) return;
        if (statusCode >= 400) return;

        const pathname = new URL(req.url).pathname;
        if (pathname.includes('/auth/')) return; // login/logout/refresh are noise

        let user: { uid?: string; role?: string } = {};
        const cookie = await getSessionCookie();
        if (cookie) {
            try {
                user = await verifySession(cookie);
            } catch {
                /* unauthenticated mutation (rare) */
            }
        }

        await systemLogRepo.create({
            action: method,
            resource: pathname,
            resourceId: params?.id,
            userId: user.uid || 'anonymous',
            role: user.role || 'guest',
            details: { method, url: pathname, statusCode },
            ip: clientIp(req),
            userAgent: userAgent(req),
        });
    } catch (err) {
        console.error('Failed to create system log', err);
    }
}
