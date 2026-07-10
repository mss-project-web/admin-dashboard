import { z } from 'zod';
import { handle, ok } from '@/lib/http/response';
import { requireRole, Role } from '@/lib/auth/guard';
import { accountRepo } from '@/lib/repositories/accountRepo';

const createSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
    firstName: z.string(),
    lastName: z.string(),
    phoneNumber: z.string().optional(),
    role: z.enum(['user', 'admin', 'superadmin']).optional(),
});

export const GET = handle(async () => {
    await requireRole(Role.ADMIN, Role.SUPERADMIN);
    const accounts = await accountRepo.findAll();
    return ok(accounts, 'Get all accounts successfully');
});

export const POST = handle(async (req) => {
    const admin = await requireRole(Role.SUPERADMIN);
    const dto = createSchema.parse(await req.json());
    const account = await accountRepo.create({ ...dto, createdBy: admin.sub });
    return ok(account, 'Account created successfully', 201);
});
