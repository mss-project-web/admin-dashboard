import { handle, ok } from '@/lib/http/response';
import { blogRepo } from '@/lib/repositories/blogRepo';

export const GET = handle(async (req) => {
    const { searchParams } = new URL(req.url);
    const result = await blogRepo.findPublicPreview(
        searchParams.get('search') || undefined,
        Number(searchParams.get('page')) || 1,
        Number(searchParams.get('limit')) || 10,
    );
    return ok(result, 'Fetched blog preview');
});
