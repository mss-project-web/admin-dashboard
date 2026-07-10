import { handle, ok } from '@/lib/http/response';
import { requireRole, Role } from '@/lib/auth/guard';
import { blogRepo } from '@/lib/repositories/blogRepo';

export const GET = handle(async (_req, { params }) => {
    await requireRole(Role.ADMIN, Role.SUPERADMIN);
    const { id } = await params;
    const blog = await blogRepo.findOneAdmin(id);
    return ok(blog, 'Fetched blog (admin)');
});
