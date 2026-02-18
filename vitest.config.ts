import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/renderer/**/*.{ts,tsx}'],
      exclude: ['src/renderer/env.d.ts', 'src/renderer/main.tsx'],
    },
  },
  resolve: {
    alias: {
      '@renderer': resolve(__dirname, 'src/renderer'),
      '@chips/components': resolve(
        __dirname,
        '../Chips-ComponentLibrary/packages/component-library/src/index.ts',
      ),
    },
  },
});
