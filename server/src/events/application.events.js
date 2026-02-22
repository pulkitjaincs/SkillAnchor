import EventEmitter from 'events';
import WorkExperience from '../models/WorkExperience.model.js';
import WorkerProfile from '../models/WorkerProfile.model.js';

export const applicationEmitter = new EventEmitter();

applicationEmitter.on('hired', async ({ application, employerId }) => {
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
