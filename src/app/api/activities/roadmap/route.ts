import { handle, ok } from '@/lib/http/response';
import { activityRepo } from '@/lib/repositories/activityRepo';

export const GET = handle(async () => {
    const activities = await activityRepo.getRoadmap();
    return ok(activities, 'Roadmap activities retrieved successfully');
});
