import { handle, ok } from '@/lib/http/response';
import { requireRole, Role } from '@/lib/auth/guard';
import { systemLogRepo } from '@/lib/repositories/systemLogRepo';
import { accountRepo } from '@/lib/repositories/accountRepo';

export const GET = handle(async (req) => {
    await requireRole(Role.ADMIN, Role.SUPERADMIN);
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 200;
    const logs = await systemLogRepo.findAll(limit);

    // Enrich logs with user info (email, name) from accounts
    const userIds = [...new Set(logs.map((l: any) => l.userId).filter(Boolean))];
    const userMap: Record<string, { email: string; firstName: string; lastName: string }> = {};
    await Promise.allSettled(
        userIds.map(async (uid) => {
            try {
                const acc = await accountRepo.findOne(uid as string);
                if (acc) userMap[uid as string] = { email: acc.email as string, firstName: acc.firstName as string, lastName: acc.lastName as string };
            } catch { /* skip deleted users */ }
        })
    );

    const enriched = logs.map((log: any) => ({
        ...log,
        _user: log.userId && userMap[log.userId] ? userMap[log.userId] : null,
    }));

    return ok(enriched, 'Fetched system logs');
});
