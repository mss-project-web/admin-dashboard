import { handle, ok } from '@/lib/http/response';
import { requireRole, Role } from '@/lib/auth/guard';
import { blogRepo } from '@/lib/repositories/blogRepo';

export const GET = handle(async (req) => {
    await requireRole(Role.ADMIN, Role.SUPERADMIN);
    const { searchParams } = new URL(req.url);
    const result = await blogRepo.findAdminPreview(
        searchParams.get('search') || undefined,
        Number(searchParams.get('page')) || 1,
        Number(searchParams.get('limit')) || 10,
    );
    return ok(result, 'Fetched admin blog preview');
});
