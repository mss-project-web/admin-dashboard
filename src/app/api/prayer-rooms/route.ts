import { handle, ok } from '@/lib/http/response';
import { requireMenuPermission } from '@/lib/auth/guard';
import { prayerRoomRepo } from '@/lib/repositories/prayerRoomRepo';
import { parsePrayerRoom } from '@/lib/inputs/prayerRoomInput';
import { withCache } from '@/lib/cache';

export const GET = handle(async () => {
    const rooms = await withCache('api_prayer_rooms_all', 120000, () => prayerRoomRepo.findAll());
    return ok(rooms, 'Fetched all prayer rooms');
});

export const POST = handle(async (req) => {
    await requireMenuPermission('/admin/prayer-rooms');
    const { fields, newImages } = await parsePrayerRoom(req);
    const created = await prayerRoomRepo.create(fields, newImages);
    return ok(created, 'Prayer room created successfully', 201);
});
