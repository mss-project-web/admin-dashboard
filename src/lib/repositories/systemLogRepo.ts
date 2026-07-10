import 'server-only';
import { col, mapQuery, Timestamp, FieldValue } from '../firebase/firestore';

const COLLECTION = 'systemLogs';

/** Group logs by YYYY-MM-DD, returning [{ _id: date, count }] sorted ascending. */
function groupByDay(rows: { createdAt?: string }[]): { _id: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const r of rows) {
        if (!r.createdAt) continue;
        const day = new Date(r.createdAt).toISOString().slice(0, 10);
        counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    return [...counts.entries()].map(([_id, count]) => ({ _id, count })).sort((a, b) => a._id.localeCompare(b._id));
}

export type CreateSystemLog = {
    action: string;
    resource: string;
    resourceId?: string;
    userId?: string;
    role?: string;
    details?: Record<string, unknown>;
    ip?: string;
    userAgent?: string;
};

export const systemLogRepo = {
    async create(dto: CreateSystemLog) {
        // createdAt is a real field so a Firestore TTL policy (180d) can target it.
        await col(COLLECTION).add({ ...dto, createdAt: FieldValue.serverTimestamp() });
    },

    async findAll(limit = 100) {
        return mapQuery(col(COLLECTION).orderBy('createdAt', 'desc').limit(limit));
    },

    async getRecentLogs(limit = 10) {
        return mapQuery(col(COLLECTION).orderBy('createdAt', 'desc').limit(limit));
    },

    // Firestore allows an inequality on only one field, so we range-filter on
    // createdAt and filter the action in memory before grouping by day.
    async getSystemActivity(days = 14) {
        const limit = new Date();
        limit.setDate(limit.getDate() - days);
        const rows = await mapQuery<{ createdAt?: string; action?: string }>(
            col(COLLECTION).where('createdAt', '>=', Timestamp.fromDate(limit)),
        );
        return groupByDay(rows.filter((r) => r.action !== 'LOGIN'));
    },

    async getLoginActivity(days = 7) {
        const limit = new Date();
        limit.setDate(limit.getDate() - days);
        const rows = await mapQuery<{ createdAt?: string; action?: string }>(
            col(COLLECTION).where('createdAt', '>=', Timestamp.fromDate(limit)),
        );
        return groupByDay(rows.filter((r) => r.action === 'LOGIN'));
    },
};
