import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'src/tests/**',
        '.next/**',
        'out/**',
        'src/lib/api.ts',
        '**/*.css',
      ],
      thresholds: {
        lines: 70,
        functions: 69,
        branches: 60,
        statements: 70
      }
    }
  },
});
