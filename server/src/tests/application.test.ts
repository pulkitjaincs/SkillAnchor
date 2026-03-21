import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.model.js';
import Job from '../models/Job.model.js';
import Application from '../models/Application.model.js';
import WorkExperience from '../models/WorkExperience.model.js';
import { generateToken } from '../utils/generateToken.js';

describe('Application Lifecycle Integration', () => {
    let employerToken: string, workerToken: string;
    let employerId: string, workerId: string, jobId: string;

    beforeEach(async () => {
        // Setup Employer (with unique email)
        const employer = await User.create({
            name: 'Emp',
            email: `e-${Date.now()}@test.com`,
            role: 'employer',
            authType: 'email',
            emailVerified: true
        });
        // Setup Worker (with unique email)
        const worker = await User.create({
            name: 'Wrk',
            email: `w-${Date.now()}@test.com`,
            role: 'worker',
            authType: 'email',
            emailVerified: true
        });

        employerId = employer._id.toString();
        workerId = worker._id.toString();
        employerToken = generateToken(employerId);
        workerToken = generateToken(workerId);

        const job = await Job.create({
            employer: employerId,
            title: 'Test Job',
            description: 'Needs 10+ characters here too.',
            category: 'IT',
            city: 'Bangalore', state: 'Karnataka',
            salaryMin: 10000, salaryType: 'monthly', jobType: 'full-time',
            status: 'active'
        });
        jobId = job._id.toString();
    });

    it('should complete the full hire flow and create WorkExperience', async () => {
        // 1. Worker applies to the job
        const applyRes = await request(app)
            .post(`/api/v1/applications/apply/${jobId}`)
            .set('Cookie', [`token=${workerToken}`])
            .send({ coverNote: 'Hire me please!' });

        // If this fails, applyRes.body will tell us why (e.g., error message)
        expect(applyRes.status).toBe(201);
        const applicationId = applyRes.body._id;

        // Verify count incremented
        const updatedJob = await Job.findById(jobId);
        expect(updatedJob?.applicationsCount).toBe(1);

        // 2. Employer shortlists the applicant (using PATCH /:id/status)
        const shortlistRes = await request(app)
            .patch(`/api/v1/applications/${applicationId}/status`)
            .set('Cookie', [`token=${employerToken}`])
            .send({ status: 'shortlisted' });

        expect(shortlistRes.status).toBe(200);
        expect(shortlistRes.body.status).toBe('shortlisted');

        // 3. Employer hires the applicant
        const hireRes = await request(app)
            .patch(`/api/v1/applications/${applicationId}/status`)
            .set('Cookie', [`token=${employerToken}`])
            .send({ status: 'hired' });

        expect(hireRes.status).toBe(200);

        // 4. Verify WorkExperience creation (wait for BullMQ worker)
        let experience = null;
        for (let i = 0; i < 5; i++) {
            experience = await WorkExperience.findOne({ worker: workerId, linkedApplication: applicationId });
            if (experience) break;
            await new Promise(r => setTimeout(r, 1000));
        }

        expect(experience).not.toBeNull();
        expect(experience?.role).toBe('Test Job');
        expect(experience?.isVerified).toBe(true);
    });

    it('should correctly decrement counter on withdrawal', async () => {
        // Apply
        const applyRes = await request(app)
            .post(`/api/v1/applications/apply/${jobId}`)
            .set('Cookie', [`token=${workerToken}`])
            .send({});
        expect(applyRes.status).toBe(201);
        
        const applicationId = applyRes.body._id;

        // Withdraw (using DELETE /:id)
        const withdrawRes = await request(app)
            .delete(`/api/v1/applications/${applicationId}`)
            .set('Cookie', [`token=${workerToken}`]);

        expect(withdrawRes.status).toBe(200);

        // Verify atomicity
        const job = await Job.findById(jobId);
        expect(job?.applicationsCount).toBe(0);
        const application = await Application.findById(applicationId);
        expect(application).toBeNull();
    });
});
