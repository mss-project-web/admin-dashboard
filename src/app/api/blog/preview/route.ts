import { handle, ok } from '@/lib/http/response';
import { blogRepo } from '@/lib/repositories/blogRepo';
import { parsePagination } from '@/lib/http/query';

export const GET = handle(async (req) => {
    const { searchParams } = new URL(req.url);
    const { page, limit } = parsePagination(searchParams, 10);
    const result = await blogRepo.findPublicPreview(
        searchParams.get('search') || undefined,
        page,
        limit,
    );
    return ok(result, 'Fetched blog preview');
});
