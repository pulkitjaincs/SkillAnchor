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
    const stream = redis.scanStream({
        match: pattern,
        count: 100,
    });

    return new Promise((resolve, reject) => {
        stream.on("data", async (keys: string[]) => {
            if (keys.length > 0) {
                stream.pause();
                try {
                    await redis.del(...keys);
                } catch (err) {
                    reject(err);
                }
                stream.resume();
            }
        });
        stream.on("end", () => resolve());
        stream.on("error", (err) => reject(err));
    });
};
