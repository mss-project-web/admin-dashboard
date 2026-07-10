import { handle, okNested } from '@/lib/http/response';
import { activityRepo } from '@/lib/repositories/activityRepo';

export const GET = handle(async () => {
    const activities = await activityRepo.getLatestFavorites();
    return okNested(activities, 'Fetched latest 3 favorite activities');
});
