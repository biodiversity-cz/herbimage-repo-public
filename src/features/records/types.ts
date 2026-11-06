import type { components } from '@/types/api-schema';

/**
 * Row of the `records` table as exposed by PostgREST. The shape comes from
 * src/types/api-schema.ts (regenerate with `npm run types:api`).
 */
export type RecordRow = components['schemas']['records'];

/** Columns covered by the global search box (mapped to PostgREST `ilike`). */
export const RECORDS_SEARCH_COLUMNS = ['code', 'title'] as const;
