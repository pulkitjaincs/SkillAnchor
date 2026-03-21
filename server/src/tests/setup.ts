import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { redis } from '../config/redis.js';
import { beforeAll, afterAll, afterEach } from 'vitest';

let replset: MongoMemoryReplSet;

beforeAll(async () => {
  replset = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
  });
  const uri = replset.getUri();
  await mongoose.connect(uri);

  if (redis.status === 'end') {
    await redis.connect();
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await replset.stop();
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
