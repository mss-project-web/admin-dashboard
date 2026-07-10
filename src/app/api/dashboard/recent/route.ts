import { handle, okNested } from '@/lib/http/response';
import { requireRole, Role } from '@/lib/auth/guard';
import { systemLogRepo } from '@/lib/repositories/systemLogRepo';

export const GET = handle(async () => {
    await requireRole(Role.ADMIN, Role.SUPERADMIN);
    const logs = await systemLogRepo.getRecentLogs(10);
    return okNested(logs, 'Fetched recent activity');
});
