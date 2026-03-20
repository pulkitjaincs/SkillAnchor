import { redis } from "../config/redis.js";

export const cacheAside = async <T>(key: string, ttl: number, fetchFn: () => Promise<T>): Promise<T | null> => {
    const cached = await redis.get(key);
    if (cached) {
        return JSON.parse(cached) as T;
    }

    const data = await fetchFn();
    if (data) {
        await redis.setex(key, ttl, JSON.stringify(data));
    }
    return data;
};

export const invalidateCache = async (pattern: string): Promise<void> => {
    let cursor = "0";
    do {
        const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
        cursor = nextCursor;
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } while (cursor !== "0");
};
