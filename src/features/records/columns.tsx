import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from 'react-bootstrap';
import { Link } from 'react-router';
import { routes } from '@/routes';
import type { RecordRow } from './types';

const DATE_FORMAT = new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'medium' });

function formatCellDate(value: unknown): string {
  if (typeof value !== 'string') {
    return '—';
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '—' : DATE_FORMAT.format(parsed);
}

/** Column definitions for the records table. */
export const recordColumns: ColumnDef<RecordRow>[] = [
  {
    accessorKey: 'code',
    header: 'Kód',
    cell: (info) => <span className="font-monospace text-nowrap">{String(info.getValue())}</span>,
  },
  {
    accessorKey: 'title',
    header: 'Název',
  },
  {
    accessorKey: 'category',
    header: 'Kategorie',
    cell: (info) => (
      <Badge bg="secondary" className="text-nowrap">
        {String(info.getValue())}
      </Badge>
    ),
  },
  {
    accessorKey: 'collected_at',
    header: 'Datum sběru',
    cell: (info) => formatCellDate(info.getValue()),
  },
  {
    id: 'detail',
    header: '',
    enableSorting: false,
    cell: ({ row }) => (
      <Link to={routes.recordDetail(row.original.id)} className="btn btn-sm btn-outline-secondary">
        Detail
      </Link>
    ),
  },
];
