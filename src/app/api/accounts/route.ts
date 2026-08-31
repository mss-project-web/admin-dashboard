import { z } from 'zod';
import { handle, ok } from '@/lib/http/response';
import { requireRole, Role } from '@/lib/auth/guard';
import { accountRepo } from '@/lib/repositories/accountRepo';
import { parsePagination } from '@/lib/http/query';
import { BadRequest } from '@/lib/http/response';

const createSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phoneNumber: z.string().optional(),
    role: z.enum(['user', 'admin', 'superadmin']).optional(),
    departments: z.array(z.string()).optional(),
});

const updateSchema = z.object({
    email: z.string().email().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phoneNumber: z.string().optional(),
    role: z.enum(['user', 'admin', 'superadmin']).optional(),
    departments: z.array(z.string()).optional(),
});

export const GET = handle(async (req) => {
    await requireRole(Role.ADMIN, Role.SUPERADMIN);
    
    const url = new URL(req.url);
    const searchValue = url.searchParams.get('search')?.trim() || undefined;
    if (searchValue && searchValue.length > 100) throw BadRequest('Search query is too long');
    const search = searchValue;
    const { page, limit } = parsePagination(url.searchParams);

    const result = await accountRepo.findPaginated(search, page, limit);
    return ok(result, 'Get accounts successfully');
});

export const POST = handle(async (req) => {
    const admin = await requireRole(Role.SUPERADMIN);
    const dto = createSchema.parse(await req.json());
    const account = await accountRepo.create({ ...dto, createdBy: admin.sub, mustChangePassword: true });
    return ok(account, 'Account created successfully', 201);
});
