import { handle, ok } from '@/lib/http/response';
import { activityRepo } from '@/lib/repositories/activityRepo';

export const GET = handle(async () => {
    const activities = await activityRepo.findActivitiesThisMonth();
    return ok(activities, 'Fetched activities starting this month');
});
