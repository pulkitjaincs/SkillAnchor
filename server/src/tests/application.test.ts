import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { createHiredWorker } from '../queues/hired.queue.js';
import User from '../models/User.model.js';
import Job from '../models/Job.model.js';
import WorkExperience from '../models/WorkExperience.model.js';
import WorkerProfile from '../models/WorkerProfile.model.js';
import { generateToken } from '../utils/auth.js';
import mongoose from 'mongoose';

vi.mock('../config/s3.js', () => ({
    generateReadSignedUrl: vi.fn().mockResolvedValue('https://mock-s3-avatar.com')
}));

describe('Application Lifecycle Integration', () => {
    let employerToken: string, workerToken: string, otherEmployerToken: string, otherWorkerToken: string;
    let employerId: string, workerId: string, jobId: string;
    let testWorker: ReturnType<typeof createHiredWorker>;

    beforeEach(async () => {
        testWorker = createHiredWorker();
        const employer = await User.create({ name: 'Emp', email: `e-${Date.now()}@test.com`, role: 'employer', authType: 'email', emailVerified: true });
        const worker = await User.create({ name: 'Wrk', email: `w-${Date.now()}@test.com`, role: 'worker', authType: 'email', emailVerified: true });
        const otherEmployer = await User.create({ name: 'Other Emp', email: `oe-${Date.now()}@test.com`, role: 'employer', authType: 'email', emailVerified: true });
        const otherWorker = await User.create({ name: 'Other Wrk', email: `ow-${Date.now()}@test.com`, role: 'worker', authType: 'email', emailVerified: true });

        employerId = employer._id.toString();
        workerId = worker._id.toString();
        employerToken = generateToken(employerId);
        workerToken = generateToken(workerId);
        otherEmployerToken = generateToken(otherEmployer._id.toString());
        otherWorkerToken = generateToken(otherWorker._id.toString());

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

    describe('POST /api/v1/applications/apply/:jobId', () => {
        it('should return 404 if job not found', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            const res = await request(app)
                .post(`/api/v1/applications/apply/${fakeId}`)
                .set('Cookie', `token=${workerToken}`)
                .send({});
            expect(res.status).toBe(404);
        });

        it('should return 400 if job is not active', async () => {
            await Job.findByIdAndUpdate(jobId, { status: 'closed' });
            const res = await request(app)
                .post(`/api/v1/applications/apply/${jobId}`)
                .set('Cookie', `token=${workerToken}`)
                .send({});
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('This job is no longer accepting applications');
        });

        it('should return 201 on success', async () => {
            const res = await request(app)
                .post(`/api/v1/applications/apply/${jobId}`)
                .set('Cookie', `token=${workerToken}`)
                .send({});
            expect(res.status).toBe(201);
            expect(res.body.data.application.applicant.toString()).toBe(workerId);
        });

        it('should return 400 if already applied', async () => {
            await request(app).post(`/api/v1/applications/apply/${jobId}`).set('Cookie', `token=${workerToken}`).send({});
            const res = await request(app).post(`/api/v1/applications/apply/${jobId}`).set('Cookie', `token=${workerToken}`).send({});
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('You have already applied to this job');
        });
    });

    describe('GET /api/v1/applications/my-applications', () => {
        it('should fetch own applications', async () => {
            await request(app).post(`/api/v1/applications/apply/${jobId}`).set('Cookie', `token=${workerToken}`).send({});
            const res = await request(app).get('/api/v1/applications/my-applications?limit=5').set('Cookie', `token=${workerToken}`);
            expect(res.status).toBe(200);
            expect(res.body.applications.length).toBe(1);
            expect(res.body.applications[0].job._id.toString()).toBe(jobId);
        });

        describe('Pagination Edge Cases', () => {
            beforeEach(async () => {
                for (let i = 0; i < 4; i++) {
                    const newJob = await Job.create({
                        employer: employerId,
                        title: `Pagi Job ${i}`,
                        description: 'Needs 10+ characters here too.',
                        category: 'IT', city: 'Bangalore', state: 'Karnataka',
                        salaryMin: 10000, salaryType: 'monthly', jobType: 'full-time',
                        status: 'active'
                    });
                    await request(app).post(`/api/v1/applications/apply/${newJob._id}`).set('Cookie', `token=${workerToken}`).send({});
                }
            });

            it('should return hasMore true with a correct cursor for first page', async () => {
                const res = await request(app).get('/api/v1/applications/my-applications?limit=2').set('Cookie', `token=${workerToken}`);
                expect(res.status).toBe(200);
                expect(res.body.applications.length).toBe(2);
                expect(res.body.hasMore).toBe(true);
                expect(res.body.nextCursor).toBeDefined();
            });

            it('should return hasMore false on the last page', async () => {
                const page1 = await request(app).get('/api/v1/applications/my-applications?limit=3').set('Cookie', `token=${workerToken}`);
                const res = await request(app).get(`/api/v1/applications/my-applications?limit=3&cursor=${page1.body.nextCursor}`).set('Cookie', `token=${workerToken}`);
                expect(res.status).toBe(200);
                expect(res.body.applications.length).toBeLessThanOrEqual(3);
                expect(res.body.hasMore).toBe(false);
                expect(res.body.nextCursor).toBeNull();
            });

            it('should gracefully return default first page on invalid cursor', async () => {
                const res = await request(app).get('/api/v1/applications/my-applications?limit=2&cursor=invalid_cursor').set('Cookie', `token=${workerToken}`);
                expect(res.status).toBe(200);
                expect(res.body.applications.length).toBe(2);
            });
        });
    });

    describe('GET /api/v1/applications/job/:jobId', () => {
        it('should return 404 if job not found', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            const res = await request(app).get(`/api/v1/applications/job/${fakeId}`).set('Cookie', `token=${employerToken}`);
            expect(res.status).toBe(404);
        });

        it('should return 403 if not employer of the job', async () => {
            const res = await request(app).get(`/api/v1/applications/job/${jobId}`).set('Cookie', `token=${otherEmployerToken}`);
            expect(res.status).toBe(403);
            expect(res.body.error).toBe('Not authorized');
        });

        it('should fetch applicants successfully with avatars', async () => {
            await request(app).post(`/api/v1/applications/apply/${jobId}`).set('Cookie', `token=${workerToken}`).send({});
            await WorkerProfile.create({ user: workerId, avatar: 'hidden-avatar.png', isAvatarHidden: false });
            
            const res = await request(app).get(`/api/v1/applications/job/${jobId}?limit=5`).set('Cookie', `token=${employerToken}`);
            expect(res.status).toBe(200);
            expect(res.body.applications.length).toBe(1);
            expect(res.body.applications[0].applicant.avatarUrl).toBe('https://mock-s3-avatar.com');
        });

        describe('Pagination Edge Cases', () => {
            beforeEach(async () => {
                for (let i = 0; i < 3; i++) {
                    const extraWorker = await User.create({ name: `W${i}`, email: `w${i}-${Date.now()}@test.com`, role: 'worker', authType: 'email', emailVerified: true });
                    const extraWorkerToken = generateToken(extraWorker._id.toString());
                    await request(app).post(`/api/v1/applications/apply/${jobId}`).set('Cookie', `token=${extraWorkerToken}`).send({});
                }
            });

            it('should paginate correctly and indicate hasMore', async () => {
                const res = await request(app).get(`/api/v1/applications/job/${jobId}?limit=2`).set('Cookie', `token=${employerToken}`);
                expect(res.status).toBe(200);
                expect(res.body.applications.length).toBe(2);
                expect(res.body.hasMore).toBe(true);
            });
            it('should return hasMore false when reaching end', async () => {
                const page1 = await request(app).get(`/api/v1/applications/job/${jobId}?limit=2`).set('Cookie', `token=${employerToken}`);
                const res = await request(app).get(`/api/v1/applications/job/${jobId}?limit=3&cursor=${page1.body.nextCursor}`).set('Cookie', `token=${employerToken}`);
                expect(res.status).toBe(200);
                expect(res.body.hasMore).toBe(false);
            });
        });
    });

    describe('PATCH /api/v1/applications/:id/status', () => {
        let appId: string;
        beforeEach(async () => {
            const applyRes = await request(app).post(`/api/v1/applications/apply/${jobId}`).set('Cookie', `token=${workerToken}`).send({});
            appId = applyRes.body.data.application._id;
        });

        it('should return 404 if application not found', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            const res = await request(app).patch(`/api/v1/applications/${fakeId}/status`).set('Cookie', `token=${employerToken}`).send({ status: 'shortlisted' });
            expect(res.status).toBe(404);
        });

        it('should return 403 if not the job employer', async () => {
            const res = await request(app).patch(`/api/v1/applications/${appId}/status`).set('Cookie', `token=${otherEmployerToken}`).send({ status: 'shortlisted' });
            expect(res.status).toBe(403);
        });

        it('should be able to hire and process WorkExperience creation', async () => {
            const hireRes = await request(app).patch(`/api/v1/applications/${appId}/status`).set('Cookie', `token=${employerToken}`).send({ status: 'hired' });
            expect(hireRes.status).toBe(200);

            let experience = null;
            for (let i = 0; i < 5; i++) {
                experience = await WorkExperience.findOne({ worker: workerId, linkedApplication: appId });
                if (experience) break;
                await new Promise(r => setTimeout(r, 1000));
            }

            expect(experience).not.toBeNull();
            expect(experience?.role).toBe('Test Job');
            expect(experience?.isVerified).toBe(true);
        });

        afterEach(async () => {
            if (testWorker) {
                testWorker.removeAllListeners();
                await testWorker.close();
            }
        });
    });

    describe('DELETE /api/v1/applications/:id', () => {
        let appId: string;
        beforeEach(async () => {
            const applyRes = await request(app).post(`/api/v1/applications/apply/${jobId}`).set('Cookie', `token=${workerToken}`).send({});
            appId = applyRes.body.data.application._id;
        });

        it('should return 404 if application not found', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            const res = await request(app).delete(`/api/v1/applications/${fakeId}`).set('Cookie', `token=${workerToken}`);
            expect(res.status).toBe(404);
        });

        it('should return 403 if not applicant', async () => {
            const res = await request(app).delete(`/api/v1/applications/${appId}`).set('Cookie', `token=${otherWorkerToken}`);
            expect(res.status).toBe(403);
        });

        it('should successfully withdraw an application', async () => {
            const withdrawRes = await request(app).delete(`/api/v1/applications/${appId}`).set('Cookie', `token=${workerToken}`);
            expect(withdrawRes.status).toBe(200);

            const job = await Job.findById(jobId);
            expect(job?.applicationsCount).toBe(0);
        });
    });
});
