import { useState } from 'react';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { Form } from 'react-bootstrap';
import { DataTable } from '@/components/DataTable/DataTable';
import { ErrorState } from '@/components/states';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useRecords } from './api';
import { recordColumns } from './columns';

const DEFAULT_SORTING: SortingState = [{ id: 'code', desc: false }];

/** Catalog listing with server-side pagination, sorting and global search. */
export default function RecordsPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [sorting, setSorting] = useState<SortingState>(DEFAULT_SORTING);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput, 300);

  const { data, isPending, isPlaceholderData, error, refetch } = useRecords({
    pagination,
    sorting,
    search,
  });

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
        <div>
          <h1 className="h3 mb-0">Záznamy</h1>
          <p className="text-body-secondary mb-0">Procházejte katalog záznamů herbáře.</p>
        </div>
        <Form.Control
          type="search"
          aria-label="Hledat záznamy"
          placeholder="Hledat kód nebo název…"
          style={{ maxWidth: 320 }}
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            // Start over when the query changes.
            setPagination((previous) => ({ ...previous, pageIndex: 0 }));
          }}
        />
      </div>

      {error !== null ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <DataTable
          columns={recordColumns}
          data={data?.rows ?? []}
          total={data?.total ?? null}
          pagination={pagination}
          onPaginationChange={(next) =>
            setPagination((previous) =>
              next.pageSize !== previous.pageSize ? { ...next, pageIndex: 0 } : next,
            )
          }
          sorting={sorting}
          onSortingChange={(next) => {
            setSorting(next);
            // A new order can shuffle rows across pages – go back to page 1.
            setPagination((previous) => ({ ...previous, pageIndex: 0 }));
          }}
          isLoading={isPending}
          isPlaceholder={isPlaceholderData}
          emptyMessage="Žádné záznamy nenalezeny"
        />
      )}
    </>
  );
}
