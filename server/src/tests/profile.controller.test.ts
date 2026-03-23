import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import User, { IUser } from '../models/User.model.js';
import WorkerProfile from '../models/WorkerProfile.model.js';
import EmployerProfile from '../models/EmployerProfile.model.js';
import WorkExperience from '../models/WorkExperience.model.js';
import { generateToken } from '../utils/auth.js';

vi.mock('../config/s3.js', () => ({
  generateReadSignedUrl: vi.fn().mockResolvedValue('https://mock-s3-url.com/avatar.jpg'),
  deleteFromS3: vi.fn().mockResolvedValue(true)
}));

describe('Profile Controller Integration', () => {
    let workerToken: string, workerId: string;
    let employerToken: string, employerId: string;

    beforeEach(async () => {
        // Create Worker
        const worker = (await User.create({
            name: 'Worker User',
            email: `w${String(Date.now())}@test.com`,
            role: 'worker',
            authType: 'email',
            emailVerified: true
        })) as unknown as IUser;
        workerId = String(worker._id);
        workerToken = generateToken(workerId);

        // Create Employer
        const employer = (await User.create({
            name: 'Employer User',
            email: `e${String(Date.now())}@test.com`,
            role: 'employer',
            authType: 'email',
            emailVerified: true
        })) as unknown as IUser;
        employerId = String(employer._id);
        employerToken = generateToken(employerId);
    });

    it('should update worker profile fields (bio, city, skills)', async () => {
        const updates = {
            bio: 'Experienced plumber',
            city: 'Bangalore',
            state: 'Karnataka',
            skills: ['Plumbing', 'Pipe fitting'],
            gender: 'male'
        };

        const res = await request(app)
            .put('/api/v1/profile/my-profile')
            .set('Cookie', [`token=${workerToken}`])
            .send(updates);

        expect(res.status).toBe(200);
        expect(res.body.bio).toBe(updates.bio);
        expect(res.body.skills).toContain('Plumbing');

        // Verify in Database
        const profile = await WorkerProfile.findOne({ user: workerId });
        expect(profile?.city).toBe('Bangalore');
    });

    it('should update employer profile (designation, isHiringManager)', async () => {
        const updates = {
            designation: 'HR Manager',
            whatsapp: '1234567890',
            isHiringManager: true
        };

        const res = await request(app)
            .put('/api/v1/profile/my-profile')
            .set('Cookie', [`token=${employerToken}`])
            .send(updates);

        expect(res.status).toBe(200);
        expect(res.body.designation).toBe(updates.designation);
        expect(res.body.whatsapp).toBe(updates.whatsapp);

        // Verify in Database
        const profile = await EmployerProfile.findOne({ user: employerId });
        expect(profile?.designation).toBe('HR Manager');
    });

    it('should retrieve the worker profile via /my-profile', async () => {
        await WorkerProfile.create({
            user: workerId,
            bio: 'Initial Bio'
        });

        const res = await request(app)
            .get('/api/v1/profile/my-profile')
            .set('Cookie', [`token=${workerToken}`]);

        expect(res.status).toBe(200);
        // assembleProfileResponse flattens the profile into the root
        expect(res.body.bio).toBe('Initial Bio');
        expect(res.body.role).toBe('worker');
    });

    it('should retrieve employer profile via /my-profile', async () => {
        await EmployerProfile.create({
            user: employerId,
            designation: 'CEO',
            isAvatarHidden: false
        });

        const res = await request(app)
            .get('/api/v1/profile/my-profile')
            .set('Cookie', [`token=${employerToken}`]);

        expect(res.status).toBe(200);
        expect(res.body.designation).toBe('CEO');
        expect(res.body.role).toBe('employer');
    });

    it('should update avatar for a user', async () => {
        const expectedKey = `avatars/${workerId}-test.jpg`;
        const res = await request(app)
            .patch('/api/v1/profile/update-avatar-url')
            .set('Cookie', [`token=${workerToken}`])
            .send({ avatarKey: expectedKey });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.avatarKey).toBe(expectedKey);

        const profile = await WorkerProfile.findOne({ user: workerId });
        expect(profile?.avatar).toBe(expectedKey);
    });

    it('should remove avatar when passed empty avatarKey', async () => {
        await WorkerProfile.findOneAndUpdate(
            { user: workerId },
            { $set: { avatar: 'avatars/random.jpg' } },
            { upsert: true }
        );

        const res = await request(app)
            .patch('/api/v1/profile/update-avatar-url')
            .set('Cookie', [`token=${workerToken}`])
            .send({ avatarKey: null });

        expect(res.status).toBe(200);
        expect(res.body.avatarKey).toBeNull();
        
        const profile = await WorkerProfile.findOne({ user: workerId });
        expect(profile?.avatar).toBeNull();
    });

    it('should reject invalid avatar keys', async () => {
        const res = await request(app)
            .patch('/api/v1/profile/update-avatar-url')
            .set('Cookie', [`token=${workerToken}`])
            .send({ avatarKey: 'some-random-key' });

        expect(res.status).toBe(400);
    });

    it('should return my team for employer', async () => {
        await WorkExperience.create({
            worker: workerId,
            employer: employerId,
            companyName: 'Test Corp',
            role: 'Worker',
            startDate: new Date(),
            isCurrent: true,
            addedBy: 'employer'
        });

        const res = await request(app)
            .get('/api/v1/profile/my-team')
            .set('Cookie', [`token=${employerToken}`]);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.team)).toBe(true);
    });

    it('should get a profile by User ID', async () => {
        await WorkerProfile.create({
            user: workerId,
            bio: 'Searchable Bio'
        });

        const res = await request(app)
            .get(`/api/v1/profile/user/${workerId}`)
            .set('Cookie', [`token=${employerToken}`]);

        expect(res.status).toBe(200);
        expect(res.body.bio).toBe('Searchable Bio');
    });

    it('should return 404 for missing User ID', async () => {
        const fakeId = new (await import('mongoose')).default.Types.ObjectId().toString();
        const res = await request(app)
            .get(`/api/v1/profile/user/${fakeId}`)
            .set('Cookie', [`token=${employerToken}`]);

        expect(res.status).toBe(404);
    });
});
