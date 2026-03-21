import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.model.js';
import { generateToken } from '../utils/generateToken.js';

vi.mock('../config/s3.js', () => ({
  generatePreSignedUrl: vi.fn().mockResolvedValue({
    url: 'https://mock-s3-url.com',
    key: 'mock-key',
  })
}));

describe('Upload Routes - Integration', () => {
  let token: string;

  beforeEach(async () => {
    const user = await User.create({ 
        email: 'upload@test.com', 
        authType: 'email', 
        name: 'Upload User', 
        role: 'worker' 
    });
    token = generateToken(user._id.toString());
  });

  it('GET /api/v1/upload/pre-signed-url should return 401 if unauthenticated', async () => {
    const res = await request(app).get('/api/v1/upload/pre-signed-url');
    expect(res.status).toBe(401);
  });

  it('should return 400 if name, type, or size is missing', async () => {
    const res = await request(app)
      .get('/api/v1/upload/pre-signed-url?name=test.png&type=image/png')
      .set('Cookie', `token=${token}`);
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('File name, type, and size are required');
  });

  it('should return 400 if size is invalid or over 0.5MB', async () => {
    const res = await request(app)
      .get('/api/v1/upload/pre-signed-url?name=test.png&type=image/png&size=1000000') // 1MB
      .set('Cookie', `token=${token}`);
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid file size or exceeds 0.5MB limit');
  });

  it('should return 400 if folder is invalid', async () => {
    const res = await request(app)
      .get('/api/v1/upload/pre-signed-url?name=test.png&type=image/png&size=100000&folder=hack')
      .set('Cookie', `token=${token}`);
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid folder. Allowed: avatars, uploads, resumes, profiles');
  });

  it('should return 400 if MIME type is invalid', async () => {
    const res = await request(app)
      .get('/api/v1/upload/pre-signed-url?name=test.exe&type=application/exe&size=100000&folder=avatars')
      .set('Cookie', `token=${token}`);
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid file type. Allowed: image/jpeg, image/png, image/webp');
  });

  it('should return 200 and presigned url for valid request', async () => {
    const res = await request(app)
      .get('/api/v1/upload/pre-signed-url?name=test image.png&type=image/png&size=100000&folder=avatars')
      .set('Cookie', `token=${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toBe('https://mock-s3-url.com');
  });
});
