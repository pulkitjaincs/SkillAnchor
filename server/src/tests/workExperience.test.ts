import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.model.js';
import WorkerProfile from '../models/WorkerProfile.model.js';
import WorkExperience from '../models/WorkExperience.model.js';
import Application from '../models/Application.model.js';
import { generateToken } from '../utils/generateToken.js';

describe('WorkExperience Integration Tests', () => {
    let workerToken: string;
    let workerId: string;
    let employerToken: string;
    let employerId: string;

    beforeEach(async () => {
        const worker = await User.create({
            name: 'Test Worker',
            email: `worker-${Date.now()}@test.com`,
            authType: 'email',
            role: 'worker',
            emailVerified: true
        });
        workerId = worker._id.toString();
        workerToken = generateToken(workerId);

        await WorkerProfile.create({
            user: workerId,
            bio: 'Integration Tester'
        });

        const employer = await User.create({
            name: 'Test Employer',
            email: `employer-${Date.now()}@test.com`,
            authType: 'email',
            role: 'employer',
            emailVerified: true
        });
        employerId = employer._id.toString();
        employerToken = generateToken(employerId);
    });

    describe('POST /api/v1/work-experience', () => {
        const validExperience = {
            companyName: 'Tech Corp',
            role: 'Software Engineer',
            startDate: '2022-01-01',
            isCurrent: true
        };

        it('should create new work experience if called by a worker', async () => {
            const res = await request(app)
                .post('/api/v1/work-experience')
                .set('Cookie', [`token=${workerToken}`])
                .send(validExperience);

            expect(res.status).toBe(201);
            expect(res.body.companyName).toBe('Tech Corp');
            expect(res.body.isVerified).toBe(false); // worker added

            const profile = await WorkerProfile.findOne({ user: workerId });
            expect(profile?.workHistory).toContainEqual(expect.anything());
        });

        it('should return 400 for invalid data', async () => {
            const res = await request(app)
                .post('/api/v1/work-experience')
                .set('Cookie', [`token=${workerToken}`])
                .send({ role: 'Only Role' });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/v1/work-experience/user/:userId', () => {
        it('should return visible experiences for a user', async () => {
            await WorkExperience.create({
                worker: workerId,
                companyName: 'Visible Corp',
                role: 'Developer',
                startDate: new Date('2021-01-01'),
                isVisible: true,
                addedBy: 'worker'
            });

            await WorkExperience.create({
                worker: workerId,
                companyName: 'Hidden Corp',
                role: 'Ninja',
                startDate: new Date('2020-01-01'),
                isVisible: false,
                addedBy: 'worker'
            });

            const res = await request(app).get(`/api/v1/work-experience/user/${workerId}`);
            
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].companyName).toBe('Visible Corp');
        });
    });

    describe('PUT /api/v1/work-experience/:id', () => {
        let expId: string;
        let employerExpId: string;

        beforeEach(async () => {
            const exp = await WorkExperience.create({
                worker: workerId,
                companyName: 'Update Corp',
                role: 'Dev',
                startDate: new Date('2020-01-01'),
                addedBy: 'worker'
            });
            expId = exp._id.toString();

            const eExp = await WorkExperience.create({
                worker: workerId,
                employer: employerId,
                companyName: 'Employer Verified Corp',
                role: 'Senior Dev',
                startDate: new Date('2022-01-01'),
                addedBy: 'employer',
                isVerified: true
            });
            employerExpId = eExp._id.toString();
        });

        it('should update unverified work experience', async () => {
            const res = await request(app)
                .put(`/api/v1/work-experience/${expId}`)
                .set('Cookie', [`token=${workerToken}`])
                .send({
                    companyName: 'Updated Corp',
                    role: 'Dev',
                    startDate: '2020-01-01'
                });

            expect(res.status).toBe(200);
            expect(res.body.companyName).toBe('Updated Corp');
        });

        it('should return 403 if trying to update employer verified experience', async () => {
            const res = await request(app)
                .put(`/api/v1/work-experience/${employerExpId}`)
                .set('Cookie', [`token=${workerToken}`])
                .send({
                    companyName: 'Hacked Corp',
                    role: 'Senior Dev',
                    startDate: '2022-01-01'
                });

            expect(res.status).toBe(403);
            expect(res.body.error).toContain('Verified experience cannot be edited');
        });
    });

    describe('DELETE /api/v1/work-experience/:id', () => {
        let expId: string;
        let employerExpId: string;

        beforeEach(async () => {
            const exp = await WorkExperience.create({
                worker: workerId,
                companyName: 'Delete Corp',
                role: 'Dev',
                startDate: new Date('2020-01-01'),
                addedBy: 'worker'
            });
            expId = exp._id.toString();

            const eExp = await WorkExperience.create({
                worker: workerId,
                employer: employerId,
                companyName: 'Employer Verified Corp',
                role: 'Senior Dev',
                startDate: new Date('2022-01-01'),
                addedBy: 'employer',
                isVerified: true
            });
            employerExpId = eExp._id.toString();
        });

        it('should delete unverified experience', async () => {
            const res = await request(app)
                .delete(`/api/v1/work-experience/${expId}`)
                .set('Cookie', [`token=${workerToken}`]);

            expect(res.status).toBe(200);
            
            const exp = await WorkExperience.findById(expId);
            expect(exp).toBeNull();
        });

        it('should return 403 if trying to delete verified experience', async () => {
            const res = await request(app)
                .delete(`/api/v1/work-experience/${employerExpId}`)
                .set('Cookie', [`token=${workerToken}`]);

            expect(res.status).toBe(403);
        });
    });

    describe('PATCH /api/v1/work-experience/:id/end', () => {
        let expId: string;
        
        beforeEach(async () => {
            const appDoc = await Application.create({
                job: new (await import('mongoose')).default.Types.ObjectId(),
                applicant: workerId,
                status: 'hired'
            });

            const exp = await WorkExperience.create({
                worker: workerId,
                employer: employerId,
                companyName: 'End Corp',
                role: 'Dev',
                startDate: new Date('2022-01-01'),
                isCurrent: true,
                isVerified: true,
                addedBy: 'employer',
                linkedApplication: appDoc._id
            });
            expId = exp._id.toString();

            await WorkerProfile.findOneAndUpdate(
                { user: workerId },
                { $set: { currentlyEmployed: true } }
            );
        });

        it('should allow employer to end employment', async () => {
            const res = await request(app)
                .patch(`/api/v1/work-experience/${expId}/end`)
                .set('Cookie', [`token=${employerToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.exp.isCurrent).toBe(false);
            expect(res.body.exp.endDate).toBeDefined();

            const profile = await WorkerProfile.findOne({ user: workerId });
            expect(profile?.currentlyEmployed).toBe(false);
        });

        it('should allow verified worker to end employment', async () => {
            const res = await request(app)
                .patch(`/api/v1/work-experience/${expId}/end`)
                .set('Cookie', [`token=${workerToken}`]);

            expect(res.status).toBe(200);
        });
    });

    describe('PATCH /api/v1/work-experience/:id/toggle-visibility', () => {
        let expId: string;

        beforeEach(async () => {
            const exp = await WorkExperience.create({
                worker: workerId,
                companyName: 'Visibility Corp',
                role: 'Dev',
                startDate: new Date('2022-01-01'),
                isVisible: true,
                addedBy: 'worker'
            });
            expId = exp._id.toString();
        });

        it('should toggle visibility of the experience', async () => {
            const res = await request(app)
                .patch(`/api/v1/work-experience/${expId}/toggle-visibility`)
                .set('Cookie', [`token=${workerToken}`]);

            expect(res.status).toBe(200);
            expect(res.body.isVisible).toBe(false);

            const exp = await WorkExperience.findById(expId);
            expect(exp?.isVisible).toBe(false);
        });
    });
});
