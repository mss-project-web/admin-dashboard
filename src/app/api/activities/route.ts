import { handle, ok } from '@/lib/http/response';
import { requireMenuPermission } from '@/lib/auth/guard';
import { activityRepo } from '@/lib/repositories/activityRepo';
import { parseActivity } from '@/lib/inputs/activityInput';
import { withCache } from '@/lib/cache';

export const GET = handle(async () => {
    const activities = await withCache('api_activities_all', 120000, () => activityRepo.findAll());
    return ok(activities, 'Fetched all activities');
});

export const POST = handle(async (req) => {
    await requireMenuPermission('/admin/activity');
    const { fields, newImages } = await parseActivity(req);
    const created = await activityRepo.create(fields, newImages);
    return ok(created, 'Activity created successfully', 201);
});
