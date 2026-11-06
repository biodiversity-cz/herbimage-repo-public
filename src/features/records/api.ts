import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { findOne, list } from '@/api/postgrest';
import { RECORDS_SEARCH_COLUMNS, type RecordRow } from './types';

export interface RecordsListParams {
  pagination: PaginationState;
  sorting: SortingState;
  search: string;
}

/** Query keys for the records feature. */
export const recordsKeys = {
  all: ['records'] as const,
  lists: () => [...recordsKeys.all, 'list'] as const,
  list: (params: RecordsListParams) => [...recordsKeys.lists(), params] as const,
  details: () => [...recordsKeys.all, 'detail'] as const,
  detail: (id: string) => [...recordsKeys.details(), id] as const,
};

/** Paginated, sorted and searched catalog listing. */
export function useRecords({ pagination, sorting, search }: RecordsListParams) {
  const query = search.trim();

  return useQuery({
    queryKey: recordsKeys.list({ pagination, sorting, search: query }),
    queryFn: async () =>
      list<RecordRow>('records', {
        select: '*',
        range: {
          offset: pagination.pageIndex * pagination.pageSize,
          limit: pagination.pageSize,
        },
        order: sorting.map((sort) => ({
          column: sort.id,
          direction: sort.desc ? 'desc' : 'asc',
          nulls: 'last',
        })),
        search: query === '' ? undefined : { query, columns: [...RECORDS_SEARCH_COLUMNS] },
      }),
    // Smoothly keep the previous page visible while the next one loads.
    placeholderData: keepPreviousData,
  });
}

/** Loads a single record by id (null when it does not exist). */
export function useRecord(id: string) {
  return useQuery({
    queryKey: recordsKeys.detail(id),
    queryFn: () => findOne<RecordRow>('records', id),
    enabled: id !== '',
  });
}
