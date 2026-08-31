import 'server-only';
import { ApiError } from '../http/response';

const API_URL = 'https://api.cloudflare.com/client/v4/graphql';

// Cloudflare free tier only allows querying data up to 365 days old.
// We set the start date to 364 days ago to be safe.
const PROJECT_START_DATE = new Date(Date.now() - 364 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

function buildYearlyRanges(startDateStr: string): { start: string; end: string }[] {
    const ranges: { start: string; end: string }[] = [];
    const today = new Date();
    let cursor = new Date(startDateStr);

    while (cursor < today) {
        const rangeEnd = new Date(cursor);
        // Chunk by 360 days to strictly stay under Cloudflare's 52w1d limit (even on leap years)
        rangeEnd.setDate(rangeEnd.getDate() + 360);
        const end = rangeEnd > today ? today : rangeEnd;

        ranges.push({ start: cursor.toISOString().split('T')[0], end: end.toISOString().split('T')[0] });

        cursor = new Date(end);
        cursor.setDate(cursor.getDate() + 1);
    }
    return ranges;
}

async function fetchRange(apiToken: string, zoneId: string, dateStart: string, dateEnd: string) {
    const query = `
      query {
        viewer {
          zones(filter: { zoneTag: "${zoneId}" }) {
            httpRequests1dGroups(limit: 10000, filter: { date_geq: "${dateStart}", date_leq: "${dateEnd}" }) {
              sum { requests pageViews }
              uniq { uniques }
            }
          }
        }
      }`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
        });
        if (!response.ok) throw new Error(`Cloudflare API error: ${response.statusText}`);

        const data = await response.json();
        if (data.errors) {
            console.error('Cloudflare GraphQL errors:', data.errors);
            return { requests: 0, pageViews: 0, uniques: 0 };
        }

        const groups = data?.data?.viewer?.zones?.[0]?.httpRequests1dGroups;
        if (!groups || groups.length === 0) return { requests: 0, pageViews: 0, uniques: 0 };

        return groups.reduce(
            (acc: { requests: number; pageViews: number; uniques: number }, day: { sum?: { requests?: number; pageViews?: number }; uniq?: { uniques?: number } }) => ({
                requests: acc.requests + (day.sum?.requests || 0),
                pageViews: acc.pageViews + (day.sum?.pageViews || 0),
                uniques: acc.uniques + (day.uniq?.uniques || 0),
            }),
            { requests: 0, pageViews: 0, uniques: 0 },
        );
    } catch (error) {
        console.error(`Error fetching Cloudflare analytics (${dateStart} - ${dateEnd}):`, error);
        return { requests: 0, pageViews: 0, uniques: 0 };
    }
}

export async function getCloudflareAnalytics() {
    const apiToken = process.env.CF_API_TOKEN;
    const zoneId = process.env.CF_ZONE_ID;
    if (!apiToken || !zoneId) {
        console.warn('Cloudflare API Token or Zone ID is missing in environment variables. Returning empty analytics.');
        return { totalRequests: 0, totalPageViews: 0, totalUniqueVisitors: 0 };
    }

    let totalRequests = 0;
    let totalPageViews = 0;
    let totalUniqueVisitors = 0;

    for (const range of buildYearlyRanges(PROJECT_START_DATE)) {
        const result = await fetchRange(apiToken, zoneId, range.start, range.end);
        totalRequests += result.requests;
        totalPageViews += result.pageViews;
        totalUniqueVisitors += result.uniques;
    }

    return { totalRequests, totalPageViews, totalUniqueVisitors };
}
