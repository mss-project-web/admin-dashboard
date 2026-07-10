import { handle, ok, okNested } from '@/lib/http/response';
import { requireRole, Role } from '@/lib/auth/guard';
import { activityRepo } from '@/lib/repositories/activityRepo';
import { parseActivity } from '@/lib/inputs/activityInput';

export const GET = handle(async () => {
    const activities = await activityRepo.findAll();
    return okNested(activities, 'Fetched all activities');
});

export const POST = handle(async (req) => {
    await requireRole(Role.ADMIN, Role.SUPERADMIN);
    const { fields, newImages } = await parseActivity(req);
    const created = await activityRepo.create(fields, newImages);
    return ok(created, 'Activity created successfully', 201);
});
