import User, { IUser } from '../models/User.model.js';
import Job, { IJob } from '../models/Job.model.js';
import Application, { IApplication } from '../models/Application.model.js';
import WorkerProfile from '../models/WorkerProfile.model.js';
import WorkExperience, { IWorkExperience } from '../models/WorkExperience.model.js';
import Company, { ICompany } from '../models/Company.model.js';
import { describe, it, expect, beforeEach } from 'vitest';
import { hiredQueue, createHiredWorker } from '../queues/hired.queue.js';


describe('BullMQ Worker - Hired Flow', () => {
    let employerId: string, workerId: string, applicationId: string;
    let hiredWorker: ReturnType<typeof createHiredWorker>;

    beforeEach(async () => {
        hiredWorker = createHiredWorker();
        // 1. Setup Data
        const employer = (await User.create({
            name: 'Emp', email: `e${Date.now()}@t.com`, role: 'employer', authType: 'email', emailVerified: true
        })) as unknown as IUser;

        const worker = (await User.create({
            name: 'Wrk', email: `w${Date.now()}@t.com`, role: 'worker', authType: 'email', emailVerified: true
        })) as unknown as IUser;
        employerId = String(employer._id);
        workerId = String(worker._id);
        // Create Company
        const company = (await Company.create({
            name: 'Test Corp',
            industry: 'IT',
            createdBy: employerId,
            locations: [{ city: 'City', state: 'State' }]
        })) as unknown as ICompany;
        // Create Worker Profile
        await WorkerProfile.create({ user: workerId, bio: 'Test Bio' });
        // Create Job linked to company
        const job = (await Job.create({
            employer: employerId,
            company: company._id,
            title: 'Test Role',
            description: 'This is a test description longer than 10 chars',
            category: 'IT', city: 'City', state: 'State',
            salaryMin: 1000, salaryType: 'monthly', jobType: 'full-time'
        })) as unknown as IJob;
        // Create Application
        const app = (await Application.create({
            job: job._id,
            applicant: workerId,
            status: 'shortlisted'
        })) as unknown as IApplication;

        applicationId = String(app._id);
    });
    it('should create WorkExperience and update WorkerProfile on hire', async () => {
        // 2. Add job to queue
        const job = await hiredQueue.add('process-hire', {
            applicationId,
            employerId
        });

        // 3. Wait for worker to complete
        await new Promise((resolve, reject) => {
            hiredWorker.on('completed', (bullJob: { id?: string }) => {
                if (bullJob.id === job.id) resolve(true);
            });
            hiredWorker.on('failed', (bullJob: { id?: string } | undefined, err: Error) => {
                if (bullJob?.id === job.id) reject(err);
            });
        });

        // 4. Verify DB Updates
        const profile = await WorkerProfile.findOne({ user: workerId });
        expect(profile?.currentlyEmployed).toBe(true);
        expect(profile?.workHistory).toHaveLength(1);

        const experience = (await WorkExperience.findById(profile?.workHistory[0])) as unknown as IWorkExperience;
        expect(experience?.role).toBe('Test Role');
        expect(experience?.companyName).toBe('Test Corp');
        expect(experience?.worker.toString()).toBe(workerId);
        expect(experience?.isVerified).toBe(true);

        hiredWorker.removeAllListeners();
        await hiredWorker.close();
    }, 15000);
});
