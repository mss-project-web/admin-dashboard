import { cookies } from 'next/headers';
import { handle, ok } from '@/lib/http/response';
import { requireRole, Role } from '@/lib/auth/guard';
import { prayerRoomRepo } from '@/lib/repositories/prayerRoomRepo';
import { parsePrayerRoom } from '@/lib/inputs/prayerRoomInput';

export const GET = handle(async (_req, { params }) => {
    const { id } = await params;
    const store = await cookies();
    const cookieName = `viewed_prayer_room_${id}`;
    const hasViewed = store.has(cookieName);

    const room = await prayerRoomRepo.findOne(id, !hasViewed);
    if (!hasViewed) {
        store.set(cookieName, 'true', { maxAge: 60 * 60, httpOnly: true, path: '/' });
    }
    return ok(room, 'Fetched prayer room by ID');
});

export const PUT = handle(async (req, { params }) => {
    await requireRole(Role.ADMIN, Role.SUPERADMIN);
    const { id } = await params;
    const { fields, newImages, deleteImages } = await parsePrayerRoom(req);
    const updated = await prayerRoomRepo.update(id, fields, newImages, deleteImages);
    return ok(updated, 'Prayer room updated successfully');
});

export const DELETE = handle(async (_req, { params }) => {
    await requireRole(Role.ADMIN, Role.SUPERADMIN);
    const { id } = await params;
    await prayerRoomRepo.remove(id);
    return ok(null, 'Prayer room deleted successfully');
});
