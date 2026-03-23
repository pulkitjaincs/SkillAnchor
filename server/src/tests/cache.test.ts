import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.model.js';
import Job from '../models/Job.model.js';
import { generateToken } from '../utils/auth.js';
import { redis } from '../config/redis.js';

describe('Cache Behavior Integration', () => {
    let employerToken: string, employerId: string;

    beforeEach(async () => {
        const employer = await User.create({
            name: 'Emp', email: `e${Date.now()}@t.com`, role: 'employer', authType: 'email', emailVerified: true
        });
        employerId = employer._id.toString();
        employerToken = generateToken(employerId);

        // Clear redis before each test to ensure a clean state
        await redis.flushdb();
    });

    it('should serve cached data on hit and fresh data after invalidation', async () => {
        // 1. Create a job so we have something to list
        const job = await Job.create({
            employer: employerId,
            title: 'Initial Title',
            description: 'Description must be 10+ chars',
            category: 'IT', city: 'City', state: 'State',
            salaryMin: 1000, salaryType: 'monthly', jobType: 'full-time',
            status: 'active'
        });

        // 2. First request: Should be a "miss" (fetches from DB and caches it)
        const res1 = await request(app).get('/api/v1/jobs?limit=10');
        expect(res1.status).toBe(200);
        expect(res1.body.jobs[0].title).toBe('Initial Title');

        // 3. "Cheat": Modify the job directly in MongoDB (bypassing the API/Cache)
        await Job.findByIdAndUpdate(job._id, { title: 'DANGER: Modified in DB' });

        // 4. Second request: Should be a "hit" (returns stale data from Redis)
        const res2 = await request(app).get('/api/v1/jobs?limit=10');
        expect(res2.status).toBe(200);
        expect(res2.body.jobs[0].title).toBe('Initial Title'); // Still the old title!

        // 5. Invalidate: Create a new job via the API
        await request(app)
            .post('/api/v1/jobs')
            .set('Cookie', [`token=${employerToken}`])
            .send({
                title: 'New Job Triggering Invalidation',
                description: 'Description must be 10+ chars',
                category: 'IT', city: 'City', state: 'State',
                salaryMin: 2000, salaryType: 'monthly', jobType: 'full-time'
            });

        // 6. Third request: Should be a fresh fetch (cache was invalidated)
        const res3 = await request(app).get('/api/v1/jobs?limit=10');
        expect(res3.status).toBe(200);
        // It should now show the "DANGER" title because it fetched from DB
        const modifiedJob = res3.body.jobs.find((j: { _id: string, title: string }) => j._id === job._id.toString());
        expect(modifiedJob.title).toBe('DANGER: Modified in DB');
    });
});
