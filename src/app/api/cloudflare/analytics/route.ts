import { handle, ok } from '@/lib/http/response';
import { getCloudflareAnalytics } from '@/lib/analytics/cloudflareAnalytics';

export const GET = handle(async () => {
    const analytics = await getCloudflareAnalytics();
    return ok(analytics, 'Fetched Cloudflare analytics');
});
