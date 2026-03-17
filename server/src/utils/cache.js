import { redis } from "../config/redis.js";

export const cacheAside = async (key, ttl, fetchFn) => {
    const cached = await redis.get(key);
    if (cached) {
        return JSON.parse(cached);
    }

    const data = await fetchFn();
    if (data) {
        await redis.setex(key, ttl, JSON.stringify(data));
    }
    return data;
};
export const invalidateCache = async (pattern) => {
    const stream = redis.scanStream({
        match: pattern,
        count: 100,
    });

    stream.on("data", async (keys) => {
        if (keys.length > 0) {
            stream.pause();
            await redis.del(...keys);
            stream.resume();
        }
    });

    stream.on("end", () => {
        console.log(`Cache cleared for pattern: ${pattern}`);
    });
};
