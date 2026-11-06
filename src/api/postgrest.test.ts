import { describe, expect, it } from 'vitest';
import { buildListSearchParams, escapeSearchValue, parseContentRange } from './postgrest';

describe('escapeSearchValue', () => {
  it('escapes PostgREST reserved characters', () => {
    expect(escapeSearchValue('a,b(c)*d\\e')).toBe('a\\,b\\(c\\)\\*d\\\\e');
  });

  it('keeps ordinary text untouched', () => {
    expect(escapeSearchValue('Quercus robur')).toBe('Quercus robur');
  });
});

describe('buildListSearchParams', () => {
  it('builds pagination params', () => {
    const params = buildListSearchParams({ range: { offset: 50, limit: 25 } });
    expect(params.get('limit')).toBe('25');
    expect(params.get('offset')).toBe('50');
  });

  it('builds order expressions with nulls-last', () => {
    const params = buildListSearchParams({
      order: [{ column: 'code', direction: 'asc', nulls: 'last' }],
    });
    expect(params.get('order')).toBe('code.asc.nullslast');
  });

  it('joins multiple order columns', () => {
    const params = buildListSearchParams({
      order: [
        { column: 'code', direction: 'asc' },
        { column: 'created_at', direction: 'desc', nulls: 'first' },
      ],
    });
    expect(params.get('order')).toBe('code.asc,created_at.desc.nullsfirst');
  });

  it('builds an or-expression for global search', () => {
    const params = buildListSearchParams({
      search: { query: 'foo', columns: ['code', 'title'] },
    });
    expect(params.get('or')).toBe('(code.ilike.*foo*,title.ilike.*foo*)');
  });

  it('escapes user input inside search expressions', () => {
    const params = buildListSearchParams({
      search: { query: 'a,b', columns: ['code'] },
    });
    expect(params.get('or')).toBe('(code.ilike.*a\\,b*)');
  });

  it('omits the search expression for an empty query', () => {
    const params = buildListSearchParams({
      search: { query: '   ', columns: ['code'] },
    });
    expect(params.get('or')).toBeNull();
  });

  it('combines select, order and range params', () => {
    const params = buildListSearchParams({
      select: 'id,code',
      order: [{ column: 'title', direction: 'desc' }],
      range: { offset: 0, limit: 10 },
    });
    expect(params.toString()).toBe('select=id%2Ccode&order=title.desc&limit=10&offset=0');
  });
});

describe('parseContentRange', () => {
  it('parses the total count', () => {
    expect(parseContentRange('0-24/137')).toBe(137);
    expect(parseContentRange('100-124/137')).toBe(137);
  });

  it('handles an empty result set', () => {
    expect(parseContentRange('*/0')).toBe(0);
  });

  it('returns null for unknown or missing counts', () => {
    expect(parseContentRange('0-9/*')).toBeNull();
    expect(parseContentRange(null)).toBeNull();
    expect(parseContentRange('garbage')).toBeNull();
  });
});
