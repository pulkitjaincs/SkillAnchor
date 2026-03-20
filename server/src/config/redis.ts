import Redis from "ioredis";
import { env } from "./env.js"

if (!env.REDIS_URL) {
    throw new Error("REDIS_URL is not defined in environment variables");
}
export const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    family: 0,
    retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
    },
});
export const connectRedis = async () => {
    redis.on("connect", () => {
        console.log("Redis Connected Successfully");
    });
    redis.on("error", (error) => {
        console.log("Redis Connection Error: ", error);
    });
}

export default redis;