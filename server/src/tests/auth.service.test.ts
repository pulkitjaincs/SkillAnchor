import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateAndStoreOTP, verifyAndConsumeOTP } from '../services/auth.service.js';
import { redis } from '../config/redis.js';
import * as emailUtils from '../utils/email.js';

vi.mock('../utils/email.js', () => ({
  sendEmailOTP: vi.fn().mockResolvedValue(true)
}));

describe('Auth Service', () => {
  const testEmail = 'test@example.com';
  const testConditions = [{ email: testEmail }];

  beforeEach(async () => {
    await redis.flushdb();
    vi.clearAllMocks();
  });

  describe('generateAndStoreOTP', () => {
    it('should generate a 6-digit OTP and store it in Redis', async () => {
      const otp = await generateAndStoreOTP(testConditions);

      expect(otp).to.match(/^\d{6}$/);

      const storedData = await redis.get(`otp:${testEmail}`) as string;
      expect(JSON.parse(storedData).otp).toBe(otp);

      expect(emailUtils.sendEmailOTP).toHaveBeenCalledTimes(1);
    });
  });

  describe('verifyAndConsumeOTP', () => {
    it('should succeed for a valid OTP and then delete it', async () => {
      const otp = await generateAndStoreOTP(testConditions);

      await expect(verifyAndConsumeOTP(testConditions, otp)).resolves.not.toThrow();

      const storedData = await redis.get(`otp:${testEmail}`);
      expect(storedData).toBeNull();
    });

    it('should throw an error for an invalid OTP', async () => {
      await generateAndStoreOTP(testConditions);

      await expect(verifyAndConsumeOTP(testConditions, '000000')).rejects.toThrow('Invalid OTP');
    });

    it('should throw an error if OTP is expired/missing', async () => {
      const unrequestedConditions = [{ email: 'nobody@example.com' }];
      await expect(verifyAndConsumeOTP(unrequestedConditions, '123456')).rejects.toThrow('Invalid or expired OTP');
    });
    it('should lock out after 5 failed attempts', async () => {
      await generateAndStoreOTP(testConditions);

      // First 4 attempts: Should just throw "Invalid OTP" (400)
      for (let i = 0; i < 4; i++) {
        await expect(verifyAndConsumeOTP(testConditions, '000000')).rejects.toThrow('Invalid OTP');
      }

      // 5th attempt: Should throw "Too many failed attempts" (429) and delete the OTP
      const lastAttempt = verifyAndConsumeOTP(testConditions, '000000');
      await expect(lastAttempt).rejects.toThrow('Too many failed attempts');

      // Verify it was deleted from Redis
      const storedData = await redis.get(`otp:${testEmail}`);
      expect(storedData).toBeNull();
    });

    it('should preserve TTL on failed attempt', async () => {
      await generateAndStoreOTP(testConditions);

      const initialTtl = await redis.ttl(`otp:${testEmail}`);

      // Failed attempt
      try { await verifyAndConsumeOTP(testConditions, '000000'); } catch { /* expected error */ }

      const newTtl = await redis.ttl(`otp:${testEmail}`);

      // TTL should be roughly the same (allowing 1s for execution time)
      expect(newTtl).toBeGreaterThanOrEqual(initialTtl - 1);
      expect(newTtl).toBeLessThanOrEqual(initialTtl);
    });

  });
});
