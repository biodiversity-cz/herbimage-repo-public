/**
 * Thin read-only PostgREST client.
 *
 * The catalog only ever reads data, so this intentionally covers just the
 * subset of PostgREST we use:
 *
 * - pagination via `limit`/`offset` query params,
 * - the total count via `Prefer: count=exact` + the `Content-Range` header,
 * - sorting via `order=<column>.<direction>[.nullslast]`,
 * - global search via `or=(col.ilike.*query*,…)` expressions,
 * - single rows via `Accept: application/vnd.pgrst.object+json`.
 *
 * If requirements grow beyond this (embedded resources, aggregations…),
 * consider swapping this module for `@supabase/postgrest-js` – this is the
 * only module that talks HTTP, so the change stays local.
 */
import { appConfig } from '@/config';

export interface PostgrestOrder {
  column: string;
  direction: 'asc' | 'desc';
  /** Whether NULLs sort first or last – `nullslast` is the sane default for catalogs. */
  nulls?: 'first' | 'last';
}

export interface PostgrestRange {
  offset: number;
  limit: number;
}

export interface PostgrestSearch {
  query: string;
  /** Columns matched by the (case-insensitive) global search. */
  columns: string[];
}

export interface PostgrestListOptions {
  /** PostgREST `select` list, e.g. `*` or `id,code,title`. */
  select?: string;
  order?: PostgrestOrder[];
  range?: PostgrestRange;
  search?: PostgrestSearch;
}

export interface PostgrestListResult<T> {
  rows: T[];
  /** Total number of matching rows, `null` when the server did not report it. */
  total: number | null;
}

interface PostgrestErrorBody {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
}

/** Error thrown for non-2xx PostgREST responses. */
export class PostgrestError extends Error {
  readonly status: number;
  readonly code: string | null;
  readonly details: string | null;
  readonly hint: string | null;

  constructor(
    status: number,
    message: string,
    code: string | null = null,
    details: string | null = null,
    hint: string | null = null,
  ) {
    super(message);
    this.name = 'PostgrestError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.hint = hint;
  }
}

/**
 * Characters reserved by PostgREST filter syntax. Escaping them keeps user
 * input from breaking (or widening) the generated `or=(…)` expression.
 */
export function escapeSearchValue(value: string): string {
  return value.replace(/([\\*,()])/g, '\\$1');
}

/** Builds the value of the `or` query param, e.g. `(code.ilike.*foo*,title.ilike.*foo*)`. */
export function buildSearchExpression(search: PostgrestSearch): string {
  const pattern = `*${escapeSearchValue(search.query)}*`;
  return `(${search.columns.map((column) => `${column}.ilike.${pattern}`).join(',')})`;
}

/** Builds the value of the `order` query param, e.g. `code.asc.nullslast`. */
export function buildOrderExpression(order: PostgrestOrder[]): string | undefined {
  if (order.length === 0) {
    return undefined;
  }
  return order
    .map(
      (item) =>
        `${item.column}.${item.direction}${item.nulls !== undefined ? `.nulls${item.nulls}` : ''}`,
    )
    .join(',');
}

/** Serializes list options into PostgREST query params. */
export function buildListSearchParams(options: PostgrestListOptions): URLSearchParams {
  const params = new URLSearchParams();
  if (options.select !== undefined) {
    params.set('select', options.select);
  }
  const orderExpression =
    options.order !== undefined ? buildOrderExpression(options.order) : undefined;
  if (orderExpression !== undefined) {
    params.set('order', orderExpression);
  }
  if (options.range !== undefined) {
    params.set('limit', String(options.range.limit));
    params.set('offset', String(options.range.offset));
  }
  if (options.search !== undefined && options.search.query.trim() !== '') {
    params.set('or', buildSearchExpression(options.search));
  }
  return params;
}

/** Parses the total row count from a `Content-Range: 0-24/137` header. */
export function parseContentRange(header: string | null): number | null {
  if (header === null) {
    return null;
  }
  const total = header.split('/')[1];
  if (total === undefined || total === '*') {
    return null;
  }
  const parsed = Number.parseInt(total, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function buildUrl(table: string, params?: URLSearchParams): string {
  const base = `${appConfig.apiBaseUrl}/${table}`;
  const query = params?.toString();
  return query === '' ? base : `${base}?${query}`;
}

async function toPostgrestError(response: Response): Promise<PostgrestError> {
  let message = `PostgREST request failed with status ${response.status}`;
  let code: string | null = null;
  let details: string | null = null;
  let hint: string | null = null;
  try {
    const body = (await response.json()) as PostgrestErrorBody;
    if (typeof body?.message === 'string') {
      message = body.message;
      code = body.code ?? null;
      details = body.details ?? null;
      hint = body.hint ?? null;
    }
  } catch {
    // Not a JSON error body – keep the generic message.
  }
  return new PostgrestError(response.status, message, code, details, hint);
}

/**
 * Fetches one page of rows. The total count is requested through the
 * `Prefer: count=exact` header and parsed from `Content-Range`.
 */
export async function list<T>(
  table: string,
  options: PostgrestListOptions = {},
): Promise<PostgrestListResult<T>> {
  const response = await fetch(buildUrl(table, buildListSearchParams(options)), {
    headers: { Prefer: 'count=exact' },
  });
  if (!response.ok) {
    throw await toPostgrestError(response);
  }
  const rows = (await response.json()) as T[];
  return { rows, total: parseContentRange(response.headers.get('content-range')) };
}

/**
 * Fetches a single row by primary key. Uses the `vnd.pgrst.object+json`
 * media type, for which PostgREST answers 404 when no row matches.
 */
export async function findOne<T>(
  table: string,
  id: string | number,
  idColumn = 'id',
): Promise<T | null> {
  const params = new URLSearchParams({ [idColumn]: `eq.${encodeURIComponent(String(id))}` });
  const response = await fetch(buildUrl(table, params), {
    headers: { Accept: 'application/vnd.pgrst.object+json' },
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw await toPostgrestError(response);
  }
  return (await response.json()) as T;
}
