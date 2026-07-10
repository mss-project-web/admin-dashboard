import { handle, ok } from '@/lib/http/response';
import { requireRole, Role } from '@/lib/auth/guard';
import { systemLogRepo } from '@/lib/repositories/systemLogRepo';

export const GET = handle(async (req) => {
    await requireRole(Role.ADMIN, Role.SUPERADMIN);
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 100;
    const logs = await systemLogRepo.findAll(limit);
    // Single envelope so the frontend reads the array at response.data.data.
    return ok(logs, 'Fetched system logs');
});
