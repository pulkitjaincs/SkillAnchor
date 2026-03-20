import "./config/env.js";
import app from "./app.js";
import connectDB from "./config/db.js";
import { connectRedis, redis } from "./config/redis.js";
import { hiredWorker } from "./queues/hired.queue.js";
import mongoose from "mongoose";
connectDB();
connectRedis();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`server is listening on port ${PORT}`);
});

const shutdown = async (signal: string) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
        try {
            await hiredWorker.close();
            await mongoose.connection.close();
            await redis.quit();
            console.log('Graceful shutdown complete. Goodbye!');
            process.exit(0);
        } catch (err) {
            console.error('Error during shutdown:', err);
            process.exit(1);
        }
    });
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));