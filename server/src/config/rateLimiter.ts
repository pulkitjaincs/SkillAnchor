import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "./redis.js";

const store = new RedisStore({
    sendCommand: (...args: any[]) => (redis as any).call(...args),
});
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: "Too many requests from this IP. Please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
    store,
});

export const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, error: "Submission limit reached. Please wait a while before requesting again." },
    standardHeaders: true,
    legacyHeaders: false,
    store,
});
