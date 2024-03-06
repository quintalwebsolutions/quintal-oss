import { describe, expect, it, vi } from 'vitest';
import type { P, PaginationPlugin } from '../../src';
import { makeTable, paginationPlugin } from '../../src';

type Row = { count: number };
type Plugin = P<PaginationPlugin<Row>>;

describe('paginationPlugin', () => {
  it('paginates the data correctly', () => {
    const table = makeTable<Row, Plugin>(
      'table',
      [paginationPlugin({ initialPageSize: 3 })],
      { page: 1 },
      vi.fn(),
      { count: {} },
      Array.from(Array(100).keys()).map((count) => ({ count })),
    );

    expect(table.body.rows).toHaveLength(3);
    const rowValues = table.body.rows.map((row) => row.values.count.rawValue);
    expect(rowValues).toStrictEqual([3, 4, 5]);

    expect(table.pagination).toMatchInlineSnapshot(`
      {
        "canNextPage": true,
        "canPrevPage": true,
        "page": 1,
        "pageAmount": 34,
        "pageSize": 3,
        "setFirstPage": [Function],
        "setLastPage": [Function],
        "setNextPage": [Function],
        "setPage": [Function],
        "setPageSize": [Function],
        "setPrevPage": [Function],
      }
    `);
  });

  it('interacts with the state management correctly', () => {
    const setState = vi.fn();

    const table = makeTable<Row, Plugin>(
      'table',
      [paginationPlugin<Row>({})],
      {},
      setState,
      { count: {} },
      Array.from(Array(100).keys()).map((count) => ({ count })),
    );

    expect(table.pagination).toMatchInlineSnapshot(`
      {
        "canNextPage": true,
        "canPrevPage": false,
        "page": 0,
        "pageAmount": 10,
        "pageSize": 10,
        "setFirstPage": [Function],
        "setLastPage": [Function],
        "setNextPage": [Function],
        "setPage": [Function],
        "setPageSize": [Function],
        "setPrevPage": [Function],
      }
    `);

    expect(setState).toHaveBeenCalledTimes(0);
    table.pagination.setPageSize(20);
    expect(setState).toHaveBeenCalledTimes(1);
    table.pagination.setFirstPage();
    expect(setState).toHaveBeenCalledTimes(2);
    table.pagination.setLastPage();
    expect(setState).toHaveBeenCalledTimes(3);
    table.pagination.setNextPage();
    expect(setState).toHaveBeenCalledTimes(4);
    expect((): void => {
      table.pagination.setPrevPage();
    }).toThrow();
    expect(setState).toHaveBeenCalledTimes(4);
    table.pagination.setPage(4);
    expect(setState).toHaveBeenCalledTimes(5);
    expect((): void => {
      table.pagination.setPage(-1);
    }).toThrow();
    expect((): void => {
      table.pagination.setPage(10);
    }).toThrow();
    expect(setState).toHaveBeenCalledTimes(5);
  });

  it('shows correct result on 0 data rows', () => {
    const table = makeTable<Row, Plugin>(
      'table',
      [paginationPlugin({})],
      { pageSize: 5 },
      vi.fn(),
      { count: {} },
      [],
    );

    expect(table.pagination).toMatchInlineSnapshot(`
      {
        "canNextPage": false,
        "canPrevPage": false,
        "page": 0,
        "pageAmount": 1,
        "pageSize": 5,
        "setFirstPage": [Function],
        "setLastPage": [Function],
        "setNextPage": [Function],
        "setPage": [Function],
        "setPageSize": [Function],
        "setPrevPage": [Function],
      }
    `);
  });
});
