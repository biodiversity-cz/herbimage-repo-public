const DEFAULT_API_BASE = '/api';

/**
 * Resolves the API base URL. The app always calls PostgREST through a
 * same-origin `/api` prefix (Vite dev-server proxy in development, nginx in
 * Docker/Kubernetes) unless `VITE_API_BASE` says otherwise.
 */
function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE?.trim();
  if (raw === undefined || raw === '') {
    return DEFAULT_API_BASE;
  }
  return raw.replace(/\/+$/, '') || '/';
}

export const appConfig = {
  /** Display name used in the navbar and page titles. */
  appName: 'HerbImage',
  /** Base URL for PostgREST calls. */
  apiBaseUrl: resolveApiBaseUrl(),
} as const;
