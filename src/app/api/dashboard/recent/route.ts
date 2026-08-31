import { handle, ok } from '@/lib/http/response';
import { requireRole, Role } from '@/lib/auth/guard';
import { systemLogRepo } from '@/lib/repositories/systemLogRepo';
import { withCache } from '@/lib/cache';

const RECENT_TTL = 2 * 60 * 1000; // 2 minutes

export const GET = handle(async () => {
    await requireRole(Role.SUPERADMIN);

    const logs = await withCache('dashboard:recent', RECENT_TTL, () =>
        systemLogRepo.getRecentLogs(10)
    );

    return ok(logs, 'Fetched recent activity');
});
