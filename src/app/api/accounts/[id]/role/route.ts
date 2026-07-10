import { z } from 'zod';
import { handle, ok } from '@/lib/http/response';
import { requireRole, Role } from '@/lib/auth/guard';
import { accountRepo } from '@/lib/repositories/accountRepo';

const schema = z.object({ role: z.enum(['user', 'admin', 'superadmin']) });

export const PATCH = handle(async (req, { params }) => {
    await requireRole(Role.SUPERADMIN);
    const { id } = await params;
    const { role } = schema.parse(await req.json());
    const account = await accountRepo.updateRole(id, role);
    return ok(account, 'Account role updated successfully');
});
