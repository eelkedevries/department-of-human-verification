import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/department-of-human-verification/',
  build: {
    sourcemap: false,
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
