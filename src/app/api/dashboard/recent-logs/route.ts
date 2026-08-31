import { handle, ok } from '@/lib/http/response';
import { requireRole, Role } from '@/lib/auth/guard';
import { systemLogRepo } from '@/lib/repositories/systemLogRepo';
import { parsePagination } from '@/lib/http/query';

export const GET = handle(async (req) => {
    await requireRole(Role.SUPERADMIN);
    const { page, limit } = parsePagination(new URL(req.url).searchParams, 10);
    const { rows, total } = await systemLogRepo.getRecentLogsPage(page, limit);
    return ok({
        rows,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }, 'Recent logs fetched successfully');
});
