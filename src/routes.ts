/**
 * Central route definitions – keep URLs in one place so they can be renamed safely.
 */
export const routes = {
  home: '/',
  records: '/records',
  recordDetail: (id: string | number) => `/records/${id}`,
} as const;
