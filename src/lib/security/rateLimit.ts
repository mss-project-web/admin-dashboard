import 'server-only';

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Process-local limiter. Use a shared store when running multiple instances. */
export function enforceRateLimit(key: string, limit: number, windowMs: number): void {
    const now = Date.now();
    const current = buckets.get(key);
    if (!current || current.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return;
    }
    if (current.count >= limit) {
        throw new Error('RATE_LIMITED');
    }
    current.count += 1;
}

export function rateLimitKey(req: Request, suffix: string): string {
    const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const ip = forwarded || req.headers.get('x-real-ip') || 'unknown';
    return `${suffix}:${ip}`;
}
