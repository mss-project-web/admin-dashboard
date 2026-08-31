import 'server-only';
import { XMLParser } from 'fast-xml-parser';

/**
 * Read a Facebook page's posts from an RSS feed (produced by a third-party
 * service such as RSS.app) and normalise them. We deliberately do NOT scrape
 * facebook.com directly — it is login-walled, anti-bot, and against their ToS.
 */
export type FacebookPost = {
    guid: string;
    title: string;
    text: string;
    link: string;
    image: string | null;
    date: Date;
};

const DEFAULT_FEED_URL = 'https://rss.app/feeds/v1.1/OD9nrTmGQtIDreCx.json';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

function stripHtml(html: string): string {
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div)>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function firstImage(html: string): string | null {
    const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    return m ? m[1] : null;
}

function asArray<T>(v: T | T[] | undefined): T[] {
    if (v === undefined || v === null) return [];
    return Array.isArray(v) ? v : [v];
}

/** JSON Feed 1.1 (what RSS.app's *.json feeds return or payload from GAS). */
export function parseJsonFeed(input: string | Record<string, unknown> | unknown[]): FacebookPost[] {
    let rawItems: Record<string, unknown>[] = [];
    if (typeof input === 'string') {
        try {
            const parsed = JSON.parse(input);
            rawItems = Array.isArray(parsed) ? parsed : (parsed.items ?? []);
        } catch {
            return [];
        }
    } else if (Array.isArray(input)) {
        rawItems = input as Record<string, unknown>[];
    } else if (input && typeof input === 'object') {
        rawItems = ((input as { items?: Record<string, unknown>[] }).items ?? []) as Record<string, unknown>[];
    }

    return rawItems.map((it): FacebookPost => {
        const link = String(it.url ?? it.external_url ?? '');
        const guid = String(it.id ?? link);
        const text = String(it.content_text ?? '') || stripHtml(String(it.content_html ?? ''));
        const attachments = asArray(it.attachments as { url?: string; mime_type?: string }[] | undefined);
        const image =
            (typeof it.image === 'string' ? it.image : null) ||
            attachments.find((a) => !a.mime_type || a.mime_type.startsWith('image'))?.url ||
            firstImage(String(it.content_html ?? '')) ||
            null;
        const dateStr = String(it.date_published ?? it.date_modified ?? '');
        const date = dateStr ? new Date(dateStr) : new Date();
        const rawTitle = String(it.title ?? '').trim();
        const title = rawTitle && rawTitle.length > 3 ? rawTitle : text.split('\n')[0].slice(0, 120) || 'โพสต์จาก Facebook';
        return { guid, title, text, link, image, date };
    });
}

/** Fetch and parse the configured Facebook feed (JSON Feed or RSS/XML). */
export async function fetchFacebookPosts(overrideUrl?: string): Promise<FacebookPost[]> {
    const url = overrideUrl || process.env.FB_RSS_URL || DEFAULT_FEED_URL;
    if (!url) throw new Error('FB_RSS_URL is not configured');

    const res = await fetch(url, { headers: { 'User-Agent': 'MSS-News-Sync/1.0' } });
    if (!res.ok) throw new Error(`Failed to fetch feed: ${res.status}`);
    const body = await res.text();

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('json') || body.trimStart().startsWith('{')) {
        return parseJsonFeed(body);
    }

    const doc = parser.parse(body);
    const items = asArray(doc?.rss?.channel?.item ?? doc?.feed?.entry);

    return items.map((it: Record<string, unknown>): FacebookPost => {
        const link =
            (typeof it.link === 'string' ? it.link : (it.link as { '@_href'?: string })?.['@_href']) || '';
        const guid = String((it.guid as { '#text'?: string })?.['#text'] ?? it.guid ?? it.id ?? link);
        const rawDesc = String(it.description ?? it['content:encoded'] ?? it.content ?? it.summary ?? '');
        const text = stripHtml(rawDesc);
        const rawTitle = stripHtml(String(it.title ?? ''));

        const enclosure = it.enclosure as { '@_url'?: string; '@_type'?: string } | undefined;
        const media = it['media:content'] as { '@_url'?: string } | undefined;
        const image =
            (enclosure?.['@_type']?.startsWith('image') ? enclosure['@_url'] : null) ||
            media?.['@_url'] ||
            firstImage(rawDesc) ||
            null;

        const dateStr = String(it.pubDate ?? it.published ?? it.updated ?? '');
        const date = dateStr ? new Date(dateStr) : new Date();

        // Title: use the post title if meaningful, else the first line of the text.
        const title = rawTitle && rawTitle.length > 3 ? rawTitle : text.split('\n')[0].slice(0, 120) || 'โพสต์จาก Facebook';

        return { guid, title, text, link, image, date };
    });
}

