interface CacheItem<T> {
    value: T;
    expiry: number;
    isError?: boolean;
}

const cacheStore = new Map<string, CacheItem<any>>();

/** Short TTL applied when a fetch fails – stops hammering the DB while quota is exhausted. */
const ERROR_BACKOFF_MS = 30 * 1000; // 30 seconds

/**
 * Executes a fetcher function and caches the result (or error) in memory.
 *
 * - On success: result is cached for `ttlMs`.
 * - On failure: the error is cached for 30 s (ERROR_BACKOFF_MS) so repeated
 *   retries cannot hammer Firestore while quota is exhausted.
 *
 * @param key     Unique cache key.
 * @param ttlMs   Time-to-live for a successful result (milliseconds).
 * @param fetcher The async function to invoke on a cache miss.
 */
export async function withCache<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const cached = cacheStore.get(key);

    if (cached && cached.expiry > now) {
        if (cached.isError) throw cached.value;   // re-throw cached error
        return cached.value;
    }

    try {
        const value = await fetcher();
        cacheStore.set(key, { value, expiry: now + ttlMs });
        return value;
    } catch (err) {
        // Cache the error with a short backoff so we don't retry immediately
        cacheStore.set(key, { value: err, expiry: now + ERROR_BACKOFF_MS, isError: true });
        throw err;
    }
}

export function clearCache(keyPrefix?: string) {
    if (keyPrefix) {
        for (const key of cacheStore.keys()) {
            if (key.startsWith(keyPrefix)) cacheStore.delete(key);
        }
    } else {
        cacheStore.clear();
    }
}
