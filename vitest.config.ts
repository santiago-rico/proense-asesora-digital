/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    css: true,
    // Coverage instrumentation slows the heavier form tests past the 5s default.
    testTimeout: 15000,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/e2e/**',
      '**/tests/e2e/**',
      '**/*.{playwright,e2e}.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      // Only TS source: the Sanity Studio folder (proense-asesora-digital/) sits
      // outside this, and non-code files under src/ crash the v8 remap.
      include: ['src/**/*.{ts,tsx}', 'api/**/*.ts'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        '**/__tests__/**',
        'src/test-utils/**',
        'src/sanity/**',
        // Unused shadcn/ui components whose packages were never installed
        // (vaul, recharts, several @radix-ui/*): they can't be transformed, and
        // vitest 4.1 logs a parse error for each one.
        'src/components/ui/{avatar,chart,context-menu,drawer,hover-card,input-otp,menubar,progress,resizable,slider,switch,tabs,toggle,toggle-group}.tsx',
      ],
      // A ratchet just below today's coverage (Sep 2026: statements 30.71%,
      // branches 30.4%, functions 24.18%, lines 30.08%). Raise these as tests
      // are added; a drop below them fails CI.
      thresholds: {
        branches: 30,
        functions: 24,
        lines: 30,
        statements: 30,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})