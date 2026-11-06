import { QueryClient } from '@tanstack/react-query';

/**
 * Creates the app-wide TanStack Query client.
 *
 * Catalog data is read-only and changes rarely – cache responses for a while
 * and avoid needless refetches while browsing.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}
