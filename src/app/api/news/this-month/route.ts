import { handle, okNested } from '@/lib/http/response';
import { newsRepo } from '@/lib/repositories/newsRepo';

export const GET = handle(async () => {
    const data = await newsRepo.getNewsInCurrentMonth();
    return okNested(data, 'Fetched news in current month');
});
