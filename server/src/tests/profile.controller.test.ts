import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import User, { IUser } from '../models/User.model.js';
import WorkerProfile from '../models/WorkerProfile.model.js';
import EmployerProfile from '../models/EmployerProfile.model.js';
import { generateToken } from '../utils/generateToken.js';

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
});
