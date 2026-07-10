import { handle, ok } from '@/lib/http/response';
import { blogRepo } from '@/lib/repositories/blogRepo';

export const GET = handle(async () => {
    const groups = await blogRepo.getGroups();
    return ok(groups, 'Fetched blog groups');
});
