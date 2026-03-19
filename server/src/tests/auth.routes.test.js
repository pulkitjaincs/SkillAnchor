import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Auth Routes - Integration', () => {
  describe('POST /api/auth/send-otp', () => {
    it('should return 400 if email or phone is missing', async () => {
      const res = await request(app)
        .post('/api/auth/send-otp')
        .send({}); 

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Email or Phone is required');
    });
  });
});
