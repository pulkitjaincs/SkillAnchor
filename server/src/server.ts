import "./config/env.js";
import app from "./app.js";
import connectDB from "./config/db.js";
import { connectRedis, redis } from "./config/redis.js";
import mongoose from "mongoose";
import { logger } from "./utils/logger.js";
connectDB();
connectRedis();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    logger.info(`server is listening on port ${PORT}`);
});

const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
        try {
            await mongoose.connection.close();
            await redis.quit();
            logger.info('Graceful shutdown complete. Goodbye!');
            process.exit(0);
        } catch (err) {
            logger.error({ err }, 'Error during shutdown:');
            process.exit(1);
        }
    });
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));