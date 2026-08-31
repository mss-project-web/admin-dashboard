import { z } from 'zod';
import { cookies } from 'next/headers';
import { handle, ok } from '@/lib/http/response';
import { requireMenuPermission } from '@/lib/auth/guard';
import { blogRepo } from '@/lib/repositories/blogRepo';

const updateSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    content: z.array(z.object({ type: z.string(), data: z.any() })).optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),
    group: z.string().optional(),
    series: z.object({ name: z.string(), order: z.number() }).nullable().optional(),
    referenceUrl: z.string().optional(),
    deletedImages: z.array(z.string()).optional(),
    slug: z.string().optional(),
    status: z.enum(['draft', 'published']).optional(),
    coverImage: z.string().optional(),
});

export const GET = handle(async (_req, { params }) => {
    const { id } = await params;
    const store = await cookies();
    const cookieName = `viewed_blog_${id}`;
    const hasViewed = store.has(cookieName);

    const blog = await blogRepo.findOnePublic(id, !hasViewed);
    if (!hasViewed) {
        store.set(cookieName, 'true', { maxAge: 60 * 60, httpOnly: true, path: '/' });
    }
    return ok(blog, 'Fetched blog by ID');
});

export const PUT = handle(async (req, { params }) => {
    await requireMenuPermission('/admin/blog/content');
    const { id } = await params;
    const dto = updateSchema.parse(await req.json());
    const blog = await blogRepo.update(id, dto);
    return ok(blog, 'Blog updated successfully');
});

export const DELETE = handle(async (_req, { params }) => {
    await requireMenuPermission('/admin/blog/content');
    const { id } = await params;
    await blogRepo.delete(id);
    return ok(null, 'Blog deleted successfully');
});
