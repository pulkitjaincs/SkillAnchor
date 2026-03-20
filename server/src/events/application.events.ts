import EventEmitter from 'events';
import WorkExperience from '../models/WorkExperience.model.js';
import WorkerProfile from '../models/WorkerProfile.model.js';

import { Types } from 'mongoose';

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
    try {
        const workExp = await WorkExperience.create({
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
        });

        await WorkerProfile.findOneAndUpdate(
            { user: application.applicant },
            {
                $push: { workHistory: workExp._id },
                $set: { currentlyEmployed: true }
            }
        );
    } catch (error) {
        console.error("Error processing 'hired' event:", error);
    }
});
