import { handle, ok } from '@/lib/http/response';
import { requireRole, Role } from '@/lib/auth/guard';
import { prayerRoomRepo } from '@/lib/repositories/prayerRoomRepo';
import { parsePrayerRoom } from '@/lib/inputs/prayerRoomInput';

export const GET = handle(async () => {
    const rooms = await prayerRoomRepo.findAll();
    return ok(rooms, 'Fetched all prayer rooms');
});

export const POST = handle(async (req) => {
    await requireRole(Role.ADMIN, Role.SUPERADMIN);
    const { fields, newImages } = await parsePrayerRoom(req);
    const created = await prayerRoomRepo.create(fields, newImages);
    return ok(created, 'Prayer room created successfully', 201);
});
