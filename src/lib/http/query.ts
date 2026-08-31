import { z } from 'zod';
import { BadRequest } from './response';

const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).max(10_000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export function parsePagination(searchParams: URLSearchParams, defaultLimit = 20) {
    const parsed = paginationSchema.safeParse({
        page: searchParams.get('page') || undefined,
        limit: searchParams.get('limit') || defaultLimit,
    });
    if (!parsed.success) throw BadRequest('Invalid pagination parameters');
    return parsed.data;
}

export function parseOptionalDate(searchParams: URLSearchParams, name: string): string | undefined {
    const value = searchParams.get(name) || undefined;
    if (!value) return undefined;
    // Dashboard filters send ISO timestamps; keep supporting date-only values too.
    if (!/^\d{4}-\d{2}-\d{2}(?:$|T)/.test(value) || Number.isNaN(Date.parse(value))) {
        throw BadRequest(`Invalid ${name} parameter`);
    }
    return value;
}
