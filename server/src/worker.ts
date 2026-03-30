import "./config/env.js";
import connectDB from "./config/db.js";
import { connectRedis, redis } from "./config/redis.js";
import mongoose from "mongoose";
import { logger } from "./utils/logger.js";
import { Worker, Job as BullJob, ConnectionOptions } from "bullmq";
import Application from "./models/Application.model.js";
import WorkExperience from "./models/WorkExperience.model.js";
import WorkerProfile from "./models/WorkerProfile.model.js";
import type { HiredJobData, PopulatedJobRef } from "./types/index.js";

const initializeWorker = async () => {
    logger.info("Initializing BullMQ Worker standalone process...");
    await connectDB();
    await connectRedis();

    const hiredWorker = new Worker<HiredJobData>('hired-worker', async (job: BullJob<HiredJobData>) => {
        const { applicationId, employerId, requestId } = job.data;
        const reqLogger = logger.child({ reqId: requestId, jobId: job.id });
        reqLogger.info(`Processing hire for application ${applicationId}`);
        const application = await Application.findById(applicationId)
            .populate({
                path: 'job',
                populate: { path: 'company', select: 'name _id' }
            });
        if (!application) {
            throw new Error(`Application ${applicationId} not found`);
        }
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const jobDetails = application.job as unknown as PopulatedJobRef;

            const [workExp] = await WorkExperience.create([{
                worker: application.applicant,
                employer: employerId,
                linkedApplication: application._id,
                company: jobDetails.company?._id,
                companyName: jobDetails.company?.name,
                role: jobDetails.title,
                startDate: new Date(),
                isCurrent: true,
                addedBy: 'employer',
                isVerified: true,
            }], { session });
            if (!workExp) throw new Error("Failed to create WorkExperience");
            await WorkerProfile.findOneAndUpdate(
                { user: application.applicant },
                {
                    $push: { workHistory: workExp._id },
                    $set: { currentlyEmployed: true },
                },
                { session }
            );
            await session.commitTransaction();
            reqLogger.info(`Successfully processed "hired" job for application ${applicationId}`);
        } catch (error) {
            await session.abortTransaction();
            reqLogger.error({ err: error }, `Error processing "hired" job`);
            throw error;
        } finally {
            session.endSession();
        }
    },
        { connection: redis as unknown as ConnectionOptions }
    );

    hiredWorker.on('failed', (job, err) => {
        logger.error({ err }, `Hired job ${job?.id} permanently failed after retries`);
    });

    logger.info("BullMQ Worker started successfully and is listening for jobs.");

    const shutdown = async (signal: string) => {
        logger.info(`${signal} received. Shutting down gracefully...`);
        try {
            await hiredWorker.close();
            await mongoose.connection.close();
            await redis.quit();
            logger.info('Worker shutdown complete. Goodbye!');
            process.exit(0);
        } catch (err) {
            logger.error({ err }, 'Error during shutdown:');
            process.exit(1);
        }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
};

initializeWorker();
