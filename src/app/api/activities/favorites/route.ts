import { handle, ok } from '@/lib/http/response';
import { activityRepo } from '@/lib/repositories/activityRepo';

export const GET = handle(async () => {
    const activities = await activityRepo.getLatestFavorites();
    return ok(activities, 'Fetched latest 3 favorite activities');
});
