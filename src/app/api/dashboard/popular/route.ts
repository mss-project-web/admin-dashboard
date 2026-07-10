import { handle, okNested } from '@/lib/http/response';
import { requireRole, Role } from '@/lib/auth/guard';
import { activityRepo } from '@/lib/repositories/activityRepo';
import { blogRepo } from '@/lib/repositories/blogRepo';
import { newsRepo } from '@/lib/repositories/newsRepo';

export const GET = handle(async () => {
    await requireRole(Role.ADMIN, Role.SUPERADMIN);
    const [activities, blogs, news] = await Promise.all([
        activityRepo.getMostViewed(5),
        blogRepo.getMostViewed(5),
        newsRepo.getMostViewed(5),
    ]);
    return okNested({ activities, blogs, news }, 'Fetched popular content');
});
