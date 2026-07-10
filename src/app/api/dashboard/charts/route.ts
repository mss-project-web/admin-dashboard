import { handle, okNested } from '@/lib/http/response';
import { requireRole, Role } from '@/lib/auth/guard';
import { activityRepo } from '@/lib/repositories/activityRepo';
import { blogRepo } from '@/lib/repositories/blogRepo';
import { newsRepo } from '@/lib/repositories/newsRepo';
import { systemLogRepo } from '@/lib/repositories/systemLogRepo';

export const GET = handle(async () => {
    await requireRole(Role.ADMIN, Role.SUPERADMIN);
    const [systemActivity, loginActivity, activitiesCount, blogsCount, newsCount] = await Promise.all([
        systemLogRepo.getSystemActivity(14),
        systemLogRepo.getLoginActivity(7),
        activityRepo.countAll(),
        blogRepo.countAll(),
        newsRepo.countAll(),
    ]);
    return okNested(
        {
            systemActivity,
            loginActivity,
            contentDistribution: [
                { name: 'Activities', value: activitiesCount },
                { name: 'Blogs', value: blogsCount },
                { name: 'News', value: newsCount },
            ],
        },
        'Fetched dashboard charts',
    );
});
