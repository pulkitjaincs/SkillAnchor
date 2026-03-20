import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import compression from "compression";
import jobRoutes from "./routes/job.routes.js";
import authRoutes from "./routes/auth.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import workExperienceRoutes from "./routes/workExperience.routes.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { nosqlSanitize } from "./middleware/sanitize.middleware.js";
import uploadRoutes from "./routes/upload.routes.js";
import { RedisStore } from "rate-limit-redis";
import { redis } from "./config/redis.js";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { apiLimiter, strictLimiter } from "./config/rateLimiter.js";
import { pinoHttp } from "pino-http";
import { logger } from "./utils/logger.js";
import { requestIdMiddleware } from "./middleware/requestId.js";
const app = express();

app.set('etag', 'strong');
app.use(helmet());

app.use("/api/", apiLimiter);
app.post("/api/jobs", strictLimiter);
app.post("/api/applications/apply/:jobId", strictLimiter);
app.use(nosqlSanitize);
app.use(compression());
app.use(cors({
    origin: env.CLIENT_URL,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/v1/health", (req: Request, res: Response) => {
    res.json({ message: "OK" });
});

app.get("/api/v1/logs", (req: Request, res: Response) => {
    logger.info("Sample log generated from /api/v1/logs endpoint");
    res.json({ success: true, message: "Check server logs for structured output" });
});

app.use(requestIdMiddleware);
app.use(pinoHttp({
    logger,
    genReqId: (req) => req.id
}));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/work-experience", workExperienceRoutes);
app.use("/api/v1/upload", uploadRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
        return res.status(400).json({ success: false, error: "Invalid JSON" });
    }

    if (err.name === 'ValidationError') {
        const messages = Object.values((err as any).errors).map((e: any) => e.message).join(', ');
        return res.status(400).json({ success: false, error: messages });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({ success: false, error: `Invalid ${err.path}: ${err.value}` });
    }

    if (err.code === 11000) {
        return res.status(400).json({ success: false, error: "Duplicate value detected" });
    }

    const status = err.status || 500;
    if (status >= 500) {
        logger.error({ err }, "Unhandled server error");
    }
    res.status(status).json({ success: false, error: err.message || 'Internal Server Error' });
});

export default app;
