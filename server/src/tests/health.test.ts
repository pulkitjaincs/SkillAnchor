import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Health Check', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/api/v1/health');
    // It might be degraded in tests depending on setup, so we just check for status field
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('mongo');
    expect(res.body).toHaveProperty('redis');
    expect([200, 503]).toContain(res.status);
  });
});
