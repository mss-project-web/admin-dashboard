import { z } from 'zod';
import { handle, ok } from '@/lib/http/response';
import { requireRole, Role } from '@/lib/auth/guard';
import { accountRepo } from '@/lib/repositories/accountRepo';

const updateSchema = z.object({
    email: z.string().email().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phoneNumber: z.string().optional(),
    password: z.string().min(1).optional(),
    role: z.enum(['user', 'admin', 'superadmin']).optional(),
    departments: z.array(z.string()).optional(),
});

export const GET = handle(async (_req, { params }) => {
    await requireRole(Role.ADMIN, Role.SUPERADMIN);
    const { id } = await params;
    const account = await accountRepo.findOne(id);
    return ok(account, 'Get accounts successfully');
});

export const PUT = handle(async (req, { params }) => {
    await requireRole(Role.SUPERADMIN);
    const { id } = await params;
    const dto = updateSchema.parse(await req.json());
    const account = await accountRepo.update(id, dto);
    return ok(account, 'Account updated successfully');
});

export const DELETE = handle(async (_req, { params }) => {
    const admin = await requireRole(Role.SUPERADMIN);
    const { id } = await params;
    const account = await accountRepo.softDelete(id, admin.sub);
    return ok(account, 'Account deleted successfully');
});
