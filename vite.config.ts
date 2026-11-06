/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // `.env` / `.env.local` are loaded for local development overrides.
  const env = loadEnv(mode, process.cwd(), '');
  const postgrestUrl = env.POSTGREST_URL || 'http://localhost:3000';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      // The browser always talks to the same-origin `/api` prefix; the dev
      // server transparently proxies it to PostgREST (no CORS in development).
      proxy: {
        '/api': {
          target: postgrestUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
    },
  };
});
