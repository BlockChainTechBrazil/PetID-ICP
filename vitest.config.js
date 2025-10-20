import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      reporter: ['text', 'html', 'json'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        '.dfx/',
        'src/declarations/',
        '**/*.config.js',
        '**/*.test.js',
        'coverage/',
      ]
    },
    testTimeout: 30000, // 30 seconds for blockchain operations
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@declarations': path.resolve(__dirname, './src/declarations'),
    }
  }
});