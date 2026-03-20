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

const app = express();

app.set('etag', 'strong');
app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: "Too many requests, please try again later." },
    store: new RedisStore({
        sendCommand: (...args: any[]) => (redis as any).call(...args),
    }),
});

app.use("/api/", limiter);
app.use(nosqlSanitize);
app.use(compression());
app.use(cors({
    origin: env.CLIENT_URL,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req: Request, res: Response) => {
    res.json({ message: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/work-experience", workExperienceRoutes);
app.use("/api/upload", uploadRoutes);

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
    if (status >= 500) console.error(err.stack);
    res.status(status).json({ success: false, error: err.message || 'Internal Server Error' });
});

export default app;
