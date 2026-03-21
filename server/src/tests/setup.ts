import mongoose from 'mongoose';
import { redis } from '../config/redis.js';
import { beforeAll, afterAll, afterEach } from 'vitest';

beforeAll(async () => {
  const url = process.env.MONGO_URI_TEST || process.env.MONGO_URI || 'mongodb://localhost:27017/skillanchor_test';
  
  if (url.includes('cluster') && !url.toLowerCase().includes('test')) {
    throw new Error('Refusing to run tests against a production-like Atlas cluster without "test" in the URI');
  }

  await mongoose.connect(url);
  if (redis.status === 'end') {
    await redis.connect();
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  // Do not quit redis here as it's a singleton used across test files
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    if (collection) await collection.deleteMany({});
  }
  
  await redis.flushdb();
});
