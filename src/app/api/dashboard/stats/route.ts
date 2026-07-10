import { handle, okNested } from '@/lib/http/response';
import { requireRole, Role } from '@/lib/auth/guard';
import { accountRepo } from '@/lib/repositories/accountRepo';
import { activityRepo } from '@/lib/repositories/activityRepo';
import { blogRepo } from '@/lib/repositories/blogRepo';
import { newsRepo } from '@/lib/repositories/newsRepo';
import { prayerRoomRepo } from '@/lib/repositories/prayerRoomRepo';

export const GET = handle(async () => {
    await requireRole(Role.ADMIN, Role.SUPERADMIN);
    const [users, activities, blogs, news, prayerRooms] = await Promise.all([
        accountRepo.countAll(),
        activityRepo.countAll(),
        blogRepo.countAll(),
        newsRepo.countAll(),
        prayerRoomRepo.countAll(),
    ]);
    return okNested({ users, activities, blogs, news, prayerRooms }, 'Fetched dashboard stats');
});
