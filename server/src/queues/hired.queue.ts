import { Queue, Worker, Job as BullJob } from 'bullmq';
import { redis } from '../config/redis.js';
import Application from '../models/Application.model.js';
import WorkExperience from '../models/WorkExperience.model.js';
import WorkerProfile from '../models/WorkerProfile.model.js';
import mongoose from 'mongoose';

export interface HiredJobData {
    applicationId: string;
    employerId: string;
}

export const hiredQueue = new Queue<HiredJobData>('hired-worker', {
    connection: redis as any,
})

export const hiredWorker = new Worker<HiredJobData>('hired-worker', async (job: BullJob<HiredJobData>) => {
    const { applicationId, employerId } = job.data;
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
        const jobDetails = application.job as any;

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
        console.log(`Successfully processed "hired" job for application ${applicationId}`);
    } catch (error) {
        await session.abortTransaction();
        console.error(`Error processing "hired" job ${job.id}:`, error);
        throw error;
    } finally {
        session.endSession();
    }
},
    { connection: redis as any}
);
hiredWorker.on('failed', (job, err) => {
    console.error(`Hired job ${job?.id} permanently failed after retries:`, err);
});