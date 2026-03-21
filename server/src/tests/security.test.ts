import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.model.js';
import { generateToken } from '../utils/generateToken.js';
import Job from '../models/Job.model.js';
import { redis } from '../config/redis.js';

describe('Security and Validation Integration', () => {
    let employerToken: string, workerToken: string;
    let employerId: string;

    beforeEach(async () => {
        const employer = await User.create({
            name: 'Emp', email: `e${Date.now()}@t.com`, role: 'employer', authType: 'email', emailVerified: true
        });
        const worker = await User.create({
            name: 'Wrk', email: `w${Date.now()}@t.com`, role: 'worker', authType: 'email', emailVerified: true
        });
        employerId = employer._id.toString();
        employerToken = generateToken(employerId);
        workerToken = generateToken(worker._id.toString());
    });

    describe('Authorization Guards', () => {
        it('should prevent employers from applying to jobs', async () => {
            const job = await Job.create({
                employer: employerId,
                title: 'No Employer Applies',
                description: 'Description must be 10+ chars',
                category: 'IT', city: 'City', state: 'State',
                salaryMin: 1000, salaryType: 'monthly', jobType: 'full-time'
            });

            const res = await request(app)
                .post(`/api/v1/applications/apply/${job._id}`)
                .set('Cookie', [`token=${employerToken}`])
                .send({});

            expect(res.status).toBe(403); // Access Denied
        });

        it('should prevent workers from posting jobs', async () => {
            const res = await request(app)
                .post('/api/v1/jobs')
                .set('Cookie', [`token=${workerToken}`])
                .send({ title: 'Worker Posting' });

            expect(res.status).toBe(403);
        });

        it('should return 401 for unauthenticated profile access', async () => {
            const res = await request(app).get('/api/v1/profile/my-profile');
            expect(res.status).toBe(401);
        });
    });

    describe('Zod Validation Errors', () => {
        it('should return 400 with descriptive error for invalid job title', async () => {
            const res = await request(app)
                .post('/api/v1/jobs')
                .set('Cookie', [`token=${employerToken}`])
                .send({
                    title: 'Ab', // Too short (min 3)
                    description: 'Too short',
                    category: 'IT',
                    city: 'Bangalore', state: 'Karnataka',
                    salaryMin: 1000, salaryType: 'monthly', jobType: 'full-time'
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('Title too short');
        });

        it('should return 400 for malformed email on OTP request', async () => {
            const res = await request(app)
                .post('/api/v1/auth/send-otp')
                .send({ email: 'not-an-email' });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('Invalid email');
        });
    });
});

describe('Rate Limiting', () => {
    beforeEach(async () => {
        await redis.flushdb(); // Reset rate limit counters
    });
    it('should return 429 when apiLimiter threshold (100) is exceeded', async () => {
        // Send 100 requests to a light endpoint
        for (let i = 0; i < 100; i++) {
            await request(app).get('/api/v1/health');
        }
        // The 101st request should be blocked
        const res = await request(app).get('/api/v1/health');
        expect(res.status).toBe(429);
        expect(res.body.error).toContain('Too many requests');
    }, 10000); // Increase timeout for the loop
});