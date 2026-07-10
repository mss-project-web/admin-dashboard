import 'server-only';

/** Best-effort client IP from proxy headers. */
export function clientIp(req: Request): string {
    const xff = req.headers.get('x-forwarded-for');
    if (xff) return xff.split(',')[0].trim();
    return req.headers.get('x-real-ip') || '';
}

export function userAgent(req: Request): string {
    return req.headers.get('user-agent') || '';
}
