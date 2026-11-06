import type { Table } from '@tanstack/react-table';
import { Form, Pagination as BootstrapPagination } from 'react-bootstrap';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

interface DataTablePaginationProps<T> {
  table: Table<T>;
  total: number | null;
  isLoading: boolean;
}

/** Bootstrap pagination bar bound to a (manually paginated) TanStack table. */
export function DataTablePagination<T>({ table, total, isLoading }: DataTablePaginationProps<T>) {
  const { pagination } = table.getState();
  const pageIndex = pagination.pageIndex;
  const pageCount = table.getPageCount();

  const firstRow = total !== null && total > 0 ? pageIndex * pagination.pageSize + 1 : null;
  const lastRow = total !== null ? Math.min((pageIndex + 1) * pagination.pageSize, total) : null;

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
      <span className="text-body-secondary small" aria-live="polite">
        {isLoading || total === null
          ? 'Načítám…'
          : firstRow === null
            ? 'Žádné záznamy'
            : `Zobrazeno ${firstRow}–${lastRow} z ${total.toLocaleString('cs-CZ')}`}
      </span>
      <div className="d-flex align-items-center gap-3">
        <Form.Select
          size="sm"
          aria-label="Počet záznamů na stránku"
          className="w-auto"
          value={pagination.pageSize}
          onChange={(event) => table.setPageSize(Number(event.target.value))}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size} / stránku
            </option>
          ))}
        </Form.Select>
        <BootstrapPagination className="mb-0">
          <BootstrapPagination.First
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
          />
          <BootstrapPagination.Prev
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          />
          {pageNumbers(pageIndex, pageCount).map((page) =>
            typeof page === 'number' ? (
              <BootstrapPagination.Item
                key={page}
                active={page === pageIndex}
                onClick={() => table.setPageIndex(page)}
              >
                {page + 1}
              </BootstrapPagination.Item>
            ) : (
              <BootstrapPagination.Ellipsis key={page} />
            ),
          )}
          <BootstrapPagination.Next
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          />
          <BootstrapPagination.Last
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
          />
        </BootstrapPagination>
      </div>
    </div>
  );
}

/**
 * Page numbers to render around the current page, with ellipses for gaps.
 * Returns an empty list when the total page count is unknown.
 */
function pageNumbers(
  pageIndex: number,
  pageCount: number,
): Array<number | 'ellipsis-left' | 'ellipsis-right'> {
  if (pageCount < 0) {
    return [];
  }
  const pages: Array<number | 'ellipsis-left' | 'ellipsis-right'> = [];
  const start = Math.max(0, pageIndex - 2);
  const end = Math.min(pageCount - 1, pageIndex + 2);
  if (start > 0) {
    pages.push(0);
    if (start > 1) {
      pages.push('ellipsis-left');
    }
  }
  for (let page = start; page <= end; page++) {
    pages.push(page);
  }
  if (end < pageCount - 1) {
    if (end < pageCount - 2) {
      pages.push('ellipsis-right');
    }
    pages.push(pageCount - 1);
  }
  return pages;
}
