import { handle, ok } from '@/lib/http/response';
import { requireRole, Role } from '@/lib/auth/guard';
import { getCloudflareAnalytics } from '@/lib/analytics/cloudflareAnalytics';

export const GET = handle(async () => {
    await requireRole(Role.SUPERADMIN);
    const analytics = await getCloudflareAnalytics();
    return ok(analytics, 'Fetched Cloudflare analytics');
});
