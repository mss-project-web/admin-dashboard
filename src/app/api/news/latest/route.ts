import { handle, ok } from '@/lib/http/response';
import { newsRepo } from '@/lib/repositories/newsRepo';

export const GET = handle(async () => {
    const data = await newsRepo.getLatest();
    return ok(data, 'Fetched latest news');
});
