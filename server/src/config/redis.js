import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
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