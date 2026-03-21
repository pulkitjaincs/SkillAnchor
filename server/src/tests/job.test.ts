import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.model.js';
import Job from '../models/Job.model.js';
import { generateToken } from '../utils/generateToken.js';

describe('Job CRUD Integration Tests', () => {
    let employerToken: string;
    let workerToken: string;
    let employerId: string;

    beforeEach(async () => {
        const employer = await User.create({
            name: 'Test Employer',
            email: `employer-${Date.now()}@test.com`,
            authType: 'email',
            role: 'employer',
            emailVerified: true
        });
        employerId = employer._id.toString();
        employerToken = generateToken(employerId);

        const worker = await User.create({
            name: 'Test Worker',
            email: `worker-${Date.now()}@test.com`,
            authType: 'email',
            role: 'worker',
            emailVerified: true
        });
        workerToken = generateToken(worker._id.toString());
    });
    describe('POST /api/v1/jobs', () => {
        const validJob = {
            title: 'Full Stack Developer',
            description: 'Minimum 10 characters long description for the job.',
            category: 'IT & Software',
            city: 'Bangalore',
            state: 'Karnataka',
            salaryMin: 50000,
            salaryType: 'monthly',
            jobType: 'full-time',
            vacancies: 2
        };
        it('should create a job when called by an employer', async () => {
            const res = await request(app)
                .post('/api/v1/jobs')
                .set('Cookie', [`token=${employerToken}`])
                .send(validJob);
            expect(res.status).toBe(201);
            expect(res.body.title).toBe(validJob.title);
            expect(res.body.employer).toBe(employerId);
        });
        it('should return 401 if not authenticated', async () => {
            const res = await request(app).post('/api/v1/jobs').send(validJob);
            expect(res.status).toBe(401);
        });
        it('should return 403 if called by a worker', async () => {
            const res = await request(app)
                .post('/api/v1/jobs')
                .set('Cookie', [`token=${workerToken}`])
                .send(validJob);
            expect(res.status).toBe(403);
        });
    });

    describe('GET /api/v1/jobs', () => {
        it('should list active jobs', async () => {
            // Create a job first to ensure list isn't empty
            await Job.create({
                employer: employerId,
                title: 'Listed Job',
                description: 'Description must be 10+ chars',
                category: 'IT',
                city: 'Bangalore',
                state: 'Karnataka',
                salaryMin: 30000,
                salaryType: 'monthly',
                jobType: 'full-time',
                status: 'active'
            });

            const res = await request(app).get('/api/v1/jobs');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.jobs)).toBe(true);
            expect(res.body.jobs.length).toBeGreaterThan(0);
        });
    });

    describe('PUT /api/v1/jobs/:id', () => {
        let jobId: string;

        beforeEach(async () => {
            const job = await Job.create({
                employer: employerId,
                title: 'Update Me',
                description: 'Description must be 10+ chars',
                category: 'IT',
                city: 'Bangalore',
                state: 'Karnataka',
                salaryMin: 30000,
                salaryType: 'monthly',
                jobType: 'full-time'
            });
            jobId = job._id.toString();
        });

        it('should update the job if called by the author', async () => {
            const res = await request(app)
                .put(`/api/v1/jobs/${jobId}`)
                .set('Cookie', [`token=${employerToken}`])
                .send({ title: 'Updated Title' });

            expect(res.status).toBe(200);
            expect(res.body.title).toBe('Updated Title');
        });

        it('should return 403 if another employer tries to update it', async () => {
            // Create another employer
            const otherEmployer = await User.create({
                name: 'Other Employer',
                email: 'other@test.com',
                authType: 'email',
                role: 'employer'
            });
            const otherToken = generateToken(otherEmployer._id.toString());

            const res = await request(app)
                .put(`/api/v1/jobs/${jobId}`)
                .set('Cookie', [`token=${otherToken}`])
                .send({ title: 'Hacked' });

            expect(res.status).toBe(403);
        });
    });

    describe('DELETE /api/v1/jobs/:id', () => {
        it('should delete the job if called by the author', async () => {
            const job = await Job.create({
                employer: employerId,
                title: 'Delete Me',
                description: 'Description must be 10+ chars',
                category: 'IT',
                city: 'Bangalore',
                state: 'Karnataka',
                salaryMin: 30000,
                salaryType: 'monthly',
                jobType: 'full-time'
            });

            const res = await request(app)
                .delete(`/api/v1/jobs/${job._id}`)
                .set('Cookie', [`token=${employerToken}`]);

            expect(res.status).toBe(200);
            const deletedJob = await Job.findById(job._id);
            expect(deletedJob).toBeNull();
        });
    });

});
