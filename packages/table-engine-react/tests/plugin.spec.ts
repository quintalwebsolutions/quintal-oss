import type { ReactElement } from 'react';
import { describe, expectTypeOf, it, vi } from 'vitest';
import type { P, PaginationPlugin, RenderPlugin } from '../src';
import { makeTable, paginationPlugin, renderPlugin } from '../src';

describe('plugin', () => {
  it('combines the outputs of multiple plugins', () => {
    type Row = { col1: string; col2: number };
    type Plugins = P<PaginationPlugin<Row> | RenderPlugin<Row, P<PaginationPlugin<Row>>>>;

    const table = makeTable<Row, Plugins>(
      'tableId',
      [paginationPlugin<Row>({}), renderPlugin<Row, P<PaginationPlugin<Row>>>({})],
      {},
      vi.fn(),
      { col1: {}, col2: {} },
      [],
    );

    expectTypeOf(table).toHaveProperty('render').toMatchTypeOf<() => ReactElement | null>();
    expectTypeOf(table).toHaveProperty('pagination').toHaveProperty('page').toEqualTypeOf<number>();
  });
});
