import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.model.js';
import { redis } from '../config/redis.js';
import { generateToken } from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

vi.mock('../utils/email.js', () => ({
  sendEmailOTP: vi.fn().mockResolvedValue(true)
}));

describe('Auth Routes - Integration', () => {

  describe('POST /api/v1/auth/send-otp', () => {
    it('should return 400 if email or phone is missing', async () => {
      const res = await request(app).post('/api/v1/auth/send-otp').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should successfully send OTP to email for a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/send-otp')
        .send({ email: 'newuser@test.com' });
      expect(res.status).toBe(200);
      expect(res.body.isNewUser).toBe(true);
      expect(res.body.message).toBe('OTP Sent');
      
      const emailUtils = await import('../utils/email.js');
      expect(emailUtils.sendEmailOTP).toHaveBeenCalledWith('newuser@test.com', expect.any(String));
    });

    it('should successfully send OTP to phone for an existing user', async () => {
      await User.create({ phone: '1234567890', authType: 'phone', role: 'worker', name: 'Existing' });
      const res = await request(app)
        .post('/api/v1/auth/send-otp')
        .send({ phone: '1234567890' });
      expect(res.status).toBe(200);
      expect(res.body.isNewUser).toBe(false);
    });
  });

  describe('POST /api/v1/auth/verify-otp', () => {
    it('should create new email user on valid OTP', async () => {
      await redis.set('otp:verify@test.com', JSON.stringify({ otp: '123456' }), 'EX', 300);
      
      const res = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({ email: 'verify@test.com', otp: '123456', name: 'Verify Me', role: 'worker' });
      
      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.emailVerified).toBe(true);

      const cookies = res.get('Set-Cookie');
      expect(cookies).toBeDefined();
      expect(cookies![0]).toContain('token=');
    });

    it('should update existing user phone verification on valid OTP', async () => {
      await User.create({ phone: '0987654321', authType: 'phone', role: 'worker', name: 'Existing Phone' });
      await redis.set('otp:0987654321', JSON.stringify({ otp: '123456' }), 'EX', 300);

      const res = await request(app)
        .post('/api/v1/auth/verify-otp')
        .send({ phone: '0987654321', otp: '123456' });
      
      expect(res.status).toBe(200);
      expect(res.body.user.phoneVerified).toBe(true);
    });
    
    it('should return 400 for invalid OTP', async () => {
      await redis.set('otp:verify@test.com', JSON.stringify({ otp: '123456' }), 'EX', 300);
      const res = await request(app).post('/api/v1/auth/verify-otp').send({ email: 'verify@test.com', otp: '654321' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'reg@test.com',
        password: 'Password123!',
        name: 'Register Name',
        role: 'employer'
      });
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('reg@test.com');
      const cookies = res.get('Set-Cookie');
      expect(cookies).toBeDefined();
      expect(cookies![0]).toContain('token=');
    });

    it('should fail if email already exists', async () => {
      await User.create({ email: 'reg@test.com', password: 'abc', role: 'worker', name: 'A', authType: 'email' });
      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'reg@test.com',
        password: 'Password123!',
        name: 'Register Name',
        role: 'worker'
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login an existing user with valid password', async () => {
      const hashed = await bcrypt.hash('Password123!', 10);
      await User.create({ email: 'login@test.com', password: hashed, authType: 'email', name: 'Login', role: 'worker' });

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'login@test.com',
        password: 'Password123!'
      });
      expect(res.status).toBe(200);
      const cookies = res.get('Set-Cookie');
      expect(cookies).toBeDefined();
      expect(cookies![0]).toContain('token=');
    });

    it('should return 400 if user does not exist', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({ email: 'nope@test.com', password: 'Password123!' });
      expect(res.status).toBe(400);
    });

    it('should return 400 if user has no password', async () => {
      await User.create({ email: 'nopass@test.com', authType: 'email', name: 'Nopass', role: 'worker' });
      const res = await request(app).post('/api/v1/auth/login').send({ email: 'nopass@test.com', password: 'Password123!' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Please login with OTP');
    });

    it('should return 400 for incorrect password', async () => {
      const hashed = await bcrypt.hash('Password123!', 10);
      await User.create({ email: 'login2@test.com', password: hashed, authType: 'email', name: 'Login2', role: 'worker' });
      const res = await request(app).post('/api/v1/auth/login').send({ email: 'login2@test.com', password: 'WrongPassword!' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should clear token cookie on logout', async () => {
      const res = await request(app).post('/api/v1/auth/logout');
      expect(res.status).toBe(200);
      expect(res.get('Set-Cookie')).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/forgot-password & reset-password', () => {
    it('forgot-password should return 400 if user missing', async () => {
      const res = await request(app).post('/api/v1/auth/forgot-password').send({ email: 'a@b.com' });
      expect(res.status).toBe(400);
    });

    it('forgot-password should generate OTP for existing user', async () => {
      await User.create({ email: 'forgot@test.com', authType: 'email', name: 'Forgot', role: 'worker' });
      const res = await request(app).post('/api/v1/auth/forgot-password').send({ email: 'forgot@test.com' });
      expect(res.status).toBe(200);
      expect(await redis.get('otp:forgot@test.com')).toBeTruthy();
    });

    it('reset-password should work if OTP is correct', async () => {
      await User.create({ email: 'reset@test.com', authType: 'email', name: 'Reset', role: 'worker' });
      await redis.set('otp:reset@test.com', JSON.stringify({ otp: '123456' }), 'EX', 300);

      const res = await request(app).post('/api/v1/auth/reset-password').send({
        email: 'reset@test.com',
        otp: '123456',
        newPassword: 'NewPassword123!'
      });
      expect(res.status).toBe(200);

      const user = await User.findOne({ email: 'reset@test.com' });
      expect(user?.password).toBeTruthy();
    });
  });

  describe('Protected Routes', () => {
    let token: string;
    let userId: string;

    beforeEach(async () => {
      const user = await User.create({ email: 'prot@test.com', password: await bcrypt.hash('Pass123!', 10), role: 'worker', name: 'P', authType: 'email' });
      userId = user._id.toString();
      token = generateToken(userId);
    });

    it('GET /api/v1/auth/get-me should return user details', async () => {
      const res = await request(app).get('/api/v1/auth/get-me').set('Cookie', `token=${token}`);
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('prot@test.com');
    });

    it('POST /api/v1/auth/update-password should update with correct current password', async () => {
      const res = await request(app).post('/api/v1/auth/update-password').set('Cookie', `token=${token}`).send({
        currentPassword: 'Pass123!',
        newPassword: 'NewPassword321!'
      });
      expect(res.status).toBe(200);
    });

    it('POST /api/v1/auth/update-password should fail if incorrect current password', async () => {
      const res = await request(app).post('/api/v1/auth/update-password').set('Cookie', `token=${token}`).send({
        currentPassword: 'Wrong!',
        newPassword: 'NewPassword321!'
      });
      expect(res.status).toBe(400);
    });

    it('POST /api/v1/auth/send-update-otp should send OTP', async () => {
      const res = await request(app).post('/api/v1/auth/send-update-otp').set('Cookie', `token=${token}`).send({ phone: '1122334455' });
      expect(res.status).toBe(200);
      expect(await redis.get('otp:1122334455')).toBeTruthy();
    });

    it('POST /api/v1/auth/verify-update-otp should update user details', async () => {
      await redis.set('otp:1122334455', JSON.stringify({ otp: '111111' }), 'EX', 300);
      const res = await request(app).post('/api/v1/auth/verify-update-otp').set('Cookie', `token=${token}`).send({ phone: '1122334455', otp: '111111' });
      expect(res.status).toBe(200);
      expect(res.body.user.phone).toBe('1122334455');
    });
  });
});
