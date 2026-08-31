import { ok, failBody } from '@/lib/http/response';
import { fetchFacebookPosts, parseJsonFeed, FacebookPost } from '@/lib/integrations/facebookRss';
import { newsRepo } from '@/lib/repositories/newsRepo';
import { uploadImage } from '@/lib/storage/r2';
import { clearCache } from '@/lib/cache';
import { enforceRateLimit, rateLimitKey } from '@/lib/security/rateLimit';

// This route talks to Firestore/R2 — force Node.js runtime, never static.
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function authorized(req: Request): boolean {
    const secret = process.env.CRON_SECRET;
    if (!secret) return process.env.NODE_ENV === 'development'; // Require secret in production
    const header = req.headers.get('authorization');
    if (header === `Bearer ${secret}`) return true; // Vercel Cron or GAS sends this
    const url = new URL(req.url);
    return url.searchParams.get('secret') === secret; // manual trigger fallback
}


async function downloadToR2(imageUrl: string): Promise<string | null> {
    try {
        const res = await fetch(imageUrl);
        if (!res.ok) return null;
        const buf = Buffer.from(await res.arrayBuffer());
        return await uploadImage(buf);
    } catch {
        return null;
    }
}

async function processPosts(posts: FacebookPost[]) {
    // Oldest first so the newest post ends up with the latest createdAt.
    const sortedPosts = [...posts].reverse();

    let imported = 0;
    let skipped = 0;
    const created: string[] = [];

    for (const post of sortedPosts) {
        if (await newsRepo.existsBySourceId(post.guid)) {
            skipped++;
            continue;
        }
        const images: string[] = [];
        if (post.image) {
            const url = await downloadToR2(post.image);
            if (url) images.push(url);
        }
        await newsRepo.create(
            {
                name: post.title,
                description: post.text,
                link: post.link,
                date: post.date,
            },
            images,
            { source: 'facebook', sourceId: post.guid },
        );
        imported++;
        created.push(post.title);
    }

    if (imported > 0) {
        clearCache('api_news');
    }

    return { total: posts.length, imported, skipped, created };
}


export async function GET(req: Request) {
    if (!authorized(req)) {
        return failBody('Unauthorized', 401);
    }
    try { enforceRateLimit(rateLimitKey(req, 'facebook-sync'), 3, 60 * 60 * 1000); } catch {
        return failBody('Too many sync requests', 429);
    }

    try {
        const posts = await fetchFacebookPosts();
        const result = await processPosts(posts);

        return ok(result, `Imported ${result.imported}, skipped ${result.skipped}`);
    } catch (err) {
        console.error('[facebook-sync] failed:', err);
        const message = err instanceof Error ? err.message : 'Sync failed';
        return failBody(message, 500);
    }
}

export async function POST(req: Request) {
    if (!authorized(req)) {
        return failBody('Unauthorized', 401);
    }
    try { enforceRateLimit(rateLimitKey(req, 'facebook-sync'), 3, 60 * 60 * 1000); } catch {
        return failBody('Too many sync requests', 429);
    }

    try {
        let posts: FacebookPost[] = [];
        try {
            const body = await req.json();
            if (body && body.items && Array.isArray(body.items)) {
                posts = parseJsonFeed(body.items);
            }
        } catch {
            // If body reading/parsing fails, fallback to fetching direct feed
        }

        if (posts.length === 0) {
            posts = await fetchFacebookPosts();
        }

        const result = await processPosts(posts);

        return ok(result, `Imported ${result.imported}, skipped ${result.skipped}`);
    } catch (err) {
        console.error('[facebook-sync] POST failed:', err);
        const message = err instanceof Error ? err.message : 'Sync failed';
        return failBody(message, 500);
    }
}
