/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL the app calls PostgREST through (defaults to `/api`). */
  readonly VITE_API_BASE?: string;
}
