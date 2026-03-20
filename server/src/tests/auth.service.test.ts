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
    await redis.flushall();
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
      const unrequestedConditions = [{ email: 'nobody@example.com'}];
      await expect(verifyAndConsumeOTP(unrequestedConditions, '123456')).rejects.toThrow('Invalid or expired OTP');
    });
  });
});
