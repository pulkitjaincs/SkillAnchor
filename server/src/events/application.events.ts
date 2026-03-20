import EventEmitter from 'events';
import WorkExperience from '../models/WorkExperience.model.js';
import WorkerProfile from '../models/WorkerProfile.model.js';
import mongoose, { Types } from 'mongoose';

export const applicationEmitter = new EventEmitter();

interface HiredEventPayload {
    application: {
        _id: Types.ObjectId;
        applicant: Types.ObjectId;
        job: {
            title: string;
            company?: { _id: Types.ObjectId; name: string };
        };
    };
    employerId: Types.ObjectId;
}

applicationEmitter.on('hired', async ({ application, employerId }: HiredEventPayload) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const [workExp] = await WorkExperience.create([{
            worker: application.applicant,
            employer: employerId,
            linkedApplication: application._id,
            company: application.job.company?._id,
            companyName: application.job.company?.name,
            role: application.job.title,
            startDate: new Date(),
            isCurrent: true,
            addedBy: "employer",
            isVerified: true,
        }], { session });

        if (!workExp) {
            throw new Error("Failed to create WorkExperience during hire event");
        }

        await WorkerProfile.findOneAndUpdate(
            { user: application.applicant },
            {
                $push: { workHistory: workExp._id },
                $set: { currentlyEmployed: true }
            },
            { session }
        );

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        console.error("Error processing 'hired' event within transaction:", error);
    } finally {
        session.endSession();
    }
});
