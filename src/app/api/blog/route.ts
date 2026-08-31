import { z } from 'zod';
import { handle, ok } from '@/lib/http/response';
import { requireMenuPermission } from '@/lib/auth/guard';
import { blogRepo } from '@/lib/repositories/blogRepo';

const createSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    content: z.array(z.object({ type: z.string(), data: z.any() })),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),
    group: z.string(),
    series: z.object({ name: z.string(), order: z.number() }).nullable().optional(),
    referenceUrl: z.string().optional(),
    slug: z.string().optional(),
    status: z.enum(['draft', 'published']).optional(),
    coverImage: z.string().optional(),
});

export const POST = handle(async (req) => {
    await requireMenuPermission('/admin/blog/content');
    const dto = createSchema.parse(await req.json());
    const blog = await blogRepo.create(dto);
    return ok(blog, 'Blog created successfully', 201);
});
