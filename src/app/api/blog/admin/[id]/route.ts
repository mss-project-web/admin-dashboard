import { handle, ok } from '@/lib/http/response';
import { requireMenuPermission } from '@/lib/auth/guard';
import { blogRepo } from '@/lib/repositories/blogRepo';

export const GET = handle(async (_req, { params }) => {
    await requireMenuPermission('/admin/blog/content');
    const { id } = await params;
    const blog = await blogRepo.findOneAdmin(id);
    return ok(blog, 'Fetched blog (admin)');
});
