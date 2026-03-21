import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';
import path from 'path';

// Load .env specifically for vitest so we can manipulate env vars before tests
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Override production URIs with test ones
if (process.env.MONGO_URI_TEST) process.env.MONGO_URI = process.env.MONGO_URI_TEST;
if (process.env.REDIS_URL_TEST) process.env.REDIS_URL = process.env.REDIS_URL_TEST;

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'src/config/**',
        'src/middleware/**',
        'src/tests/**',
        '**/node_modules/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    },
  },
});
