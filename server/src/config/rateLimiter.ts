import rateLimit from "express-rate-limit";
import { RedisStore, SendCommandFn } from "rate-limit-redis";
import { redis } from "./redis.js";

const sendCommand: SendCommandFn = (...args: string[]) =>
    redis.call(...args as [string, ...string[]]) as ReturnType<SendCommandFn>;

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: "Too many requests from this IP. Please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand,
        prefix: 'rl:api:',
    }),
});

export const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, error: "Submission limit reached. Please wait a while before requesting again." },
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand,
        prefix: 'rl:strict:',
    }),
});
