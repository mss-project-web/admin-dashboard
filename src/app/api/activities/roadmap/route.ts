import { handle, okNested } from '@/lib/http/response';
import { activityRepo } from '@/lib/repositories/activityRepo';

export const GET = handle(async () => {
    const activities = await activityRepo.getRoadmap();
    return okNested(activities, 'Roadmap activities retrieved successfully');
});
