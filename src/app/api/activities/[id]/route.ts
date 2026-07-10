import { cookies } from 'next/headers';
import { handle, ok } from '@/lib/http/response';
import { requireRole, Role } from '@/lib/auth/guard';
import { activityRepo } from '@/lib/repositories/activityRepo';
import { parseActivity } from '@/lib/inputs/activityInput';

export const GET = handle(async (_req, { params }) => {
    const { id } = await params;
    const store = await cookies();
    const cookieName = `viewed_activity_${id}`;
    const hasViewed = store.has(cookieName);

    const activity = await activityRepo.findOne(id, !hasViewed);
    if (!hasViewed) {
        store.set(cookieName, 'true', { maxAge: 60 * 60, httpOnly: true, path: '/' });
    }
    // old controller returned the raw doc (single envelope)
    return ok(activity, 'Fetched activity by ID');
});

export const PATCH = handle(async (req, { params }) => {
    await requireRole(Role.ADMIN, Role.SUPERADMIN);
    const { id } = await params;
    const { fields, newImages, deleteImages } = await parseActivity(req);
    const updated = await activityRepo.update(id, fields, newImages, deleteImages);
    return ok(updated, 'Activity updated successfully');
});

export const DELETE = handle(async (_req, { params }) => {
    await requireRole(Role.ADMIN, Role.SUPERADMIN);
    const { id } = await params;
    await activityRepo.remove(id);
    return ok(null, 'Activity deleted successfully');
});
