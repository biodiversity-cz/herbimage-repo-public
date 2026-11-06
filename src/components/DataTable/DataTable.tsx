import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table';
import { Table } from 'react-bootstrap';
import { EmptyState } from '@/components/states';
import { DataTablePagination } from './DataTablePagination';

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  /** Total number of rows on the server (parsed from PostgREST `Content-Range`). */
  total: number | null;
  pagination: PaginationState;
  onPaginationChange: (pagination: PaginationState) => void;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  /** True while the first page is loading (renders placeholder rows). */
  isLoading: boolean;
  /** True when previous-page data is shown while the next page loads. */
  isPlaceholder: boolean;
  /** Shown when the page has no rows. */
  emptyMessage?: string;
}

/**
 * Generic table with server-side (PostgREST) pagination, sorting and search.
 *
 * The table only orchestrates state – all data slicing happens in the API
 * layer, which keeps this component reusable for any read-only listing.
 */
export function DataTable<T>(props: DataTableProps<T>) {
  const {
    columns,
    data,
    total,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    isLoading,
    isPlaceholder,
    emptyMessage = 'Žádné záznamy',
  } = props;

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: total !== null ? Math.max(1, Math.ceil(total / pagination.pageSize)) : -1,
    state: { pagination, sorting },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater;
      onPaginationChange(next);
    },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      onSortingChange(next);
    },
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;
  const columnCount = columns.length;

  return (
    <div className="data-table">
      <Table responsive hover className={isPlaceholder ? 'opacity-50' : undefined}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    role={header.column.getCanSort() ? 'button' : undefined}
                    aria-sort={
                      sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined
                    }
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {sorted === 'asc' ? ' ▲' : sorted === 'desc' ? ' ▼' : null}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {isLoading ? (
            <DataTableSkeletonRows
              columnCount={columnCount}
              rowCount={Math.min(pagination.pageSize, 10)}
            />
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columnCount}>
                <EmptyState title={emptyMessage} />
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </Table>
      <DataTablePagination table={table} total={total} isLoading={isLoading} />
    </div>
  );
}

/** Bootstrap-style placeholder rows shown while a page is loading. */
function DataTableSkeletonRows({
  columnCount,
  rowCount,
}: {
  columnCount: number;
  rowCount: number;
}) {
  return (
    <>
      {Array.from({ length: rowCount }, (_, index) => (
        <tr key={index} aria-hidden="true">
          <td colSpan={columnCount}>
            <span className="placeholder col-12" />
          </td>
        </tr>
      ))}
    </>
  );
}
