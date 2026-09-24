import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// `vitest/config` re-exports Vite's `defineConfig` with the `test` key typed.
// Importing from `vite` directly would leave `test` an unknown property.
import { defineConfig } from 'vitest/config'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Questionnaire + scoring definitions live in shared/ so the client and
      // the API can never drift apart on question text or severity bands.
      '@shared': path.resolve(import.meta.dirname, '../shared'),
    },
  },
  test: {
    // The e2e/ directory holds Playwright specs, which run in a real browser via
    // their own runner. Without this, `vitest run` tries to collect them and
    // fails on the missing Playwright test runner.
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
