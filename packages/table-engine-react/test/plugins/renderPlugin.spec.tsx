import type { ReactElement } from 'react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { P, PaginationPlugin, Plugins, RenderPlugin } from '../../src';
import { makeTable, paginationPlugin, renderPlugin } from '../../src';

type RenderFunction = () => ReactElement | null;

describe('renderPlugin', () => {
  it('provides sensible default values for all render functions', () => {
    type Row = { column: string };
    type Plugin = P<RenderPlugin<Row, Plugins>>;

    const allDefaultsTable = makeTable<Row, Plugin>(
      'allDefaultsTable',
      [renderPlugin<Row, Plugins>({})],
      {},
      vi.fn(),
      { column: {} },
      [{ column: 'Value' }],
    );

    expect(allDefaultsTable.render()).toMatchInlineSnapshot(`
      <table
        id="allDefaultsTable"
      >
        <render />
        <render />
      </table>
    `);
    expect(allDefaultsTable.head.render()).toMatchInlineSnapshot(`
      <thead
        id="allDefaultsTable-head"
      >
        <render />
      </thead>
    `);
    expect(allDefaultsTable.head.rows[0]?.render()).toMatchInlineSnapshot(`
      <tr
        id="allDefaultsTable-headRow-0"
      >
        <render />
      </tr>
    `);
    expect(allDefaultsTable.head.rows[0]?.cells[0]?.render())
      .toMatchInlineSnapshot(`
      <th
        id="allDefaultsTable-headRow-0-headCell-column"
      >
        Column
      </th>
    `);
    expect(allDefaultsTable.body.render()).toMatchInlineSnapshot(`
      <tbody
        id="allDefaultsTable-body"
      >
        <render />
      </tbody>
    `);
    expect(allDefaultsTable.body.rows[0]?.render()).toMatchInlineSnapshot(`
      <tr
        id="allDefaultsTable-bodyRow-0"
      >
        <render />
      </tr>
    `);
    expect(allDefaultsTable.body.rows[0]?.cells[0]?.render())
      .toMatchInlineSnapshot(`
      <td
        id="allDefaultsTable-bodyRow-0-bodyCell-column"
      >
        Value
      </td>
    `);
  });

  it('overrides the default values when other values are given', () => {
    type Row = { global: string; local: string };
    type Plugin = P<RenderPlugin<Row, Plugins>>;

    const table = makeTable<Row, Plugin>(
      'table',
      [
        renderPlugin<Row, Plugins>({
          renderTable: () => <>GlobalTable</>,
          renderHead: () => <>GlobalHead</>,
          renderHeadRow: () => <>GlobalHeadRow</>,
          renderHeadCell: () => <>GlobalHeadCell</>,
          renderBody: () => <>GlobalBody</>,
          renderBodyRow: () => <>GlobalBodyRow</>,
          renderBodyCell: () => <>GlobalBodyCell</>,
        }),
      ],
      {},
      vi.fn(),
      {
        global: {},
        local: {
          renderHeadCell: () => <>LocalHeadCell</>,
          renderBodyCell: () => <>LocalBodyCell</>,
        },
      },
      [{ global: 'Global', local: 'Local' }],
    );

    expect(table).toMatchSnapshot();

    expect(table.render()).toMatchInlineSnapshot(`
      <React.Fragment>
        GlobalTable
      </React.Fragment>
    `);
    expect(table.head.render()).toMatchInlineSnapshot(`
      <React.Fragment>
        GlobalHead
      </React.Fragment>
    `);
    expect(table.head.rows[0]?.render()).toMatchInlineSnapshot(`
      <React.Fragment>
        GlobalHeadRow
      </React.Fragment>
    `);
    expect(table.head.rows[0]?.cells[0]?.render()).toMatchInlineSnapshot(`
      <React.Fragment>
        GlobalHeadCell
      </React.Fragment>
    `);
    expect(table.head.rows[0]?.cells[1]?.render()).toMatchInlineSnapshot(`
      <React.Fragment>
        LocalHeadCell
      </React.Fragment>
    `);
    expect(table.body.render()).toMatchInlineSnapshot(`
      <React.Fragment>
        GlobalBody
      </React.Fragment>
    `);
    expect(table.body.rows[0]?.render()).toMatchInlineSnapshot(`
      <React.Fragment>
        GlobalBodyRow
      </React.Fragment>
    `);
    expect(table.body.rows[0]?.cells[0]?.render()).toMatchInlineSnapshot(`
      <React.Fragment>
        GlobalBodyCell
      </React.Fragment>
    `);
    expect(table.body.rows[0]?.cells[1]?.render()).toMatchInlineSnapshot(`
      <React.Fragment>
        LocalBodyCell
      </React.Fragment>
    `);
  });

  it('adds its parameters to all the necessary objects', () => {
    type Row = { column: null };
    type Plugin = P<RenderPlugin<Row, Plugins>>;

    const table = makeTable<Row, Plugin>(
      'table',
      [],
      {},
      vi.fn(),
      {
        column: {
          renderHeadCell: () => null,
          renderBodyCell: (props) => {
            expectTypeOf(props)
              .toHaveProperty('rawValue')
              .toEqualTypeOf<null>();
            return null;
          },
        },
      },
      [],
    );

    expectTypeOf(table)
      .toHaveProperty('render')
      .toMatchTypeOf<RenderFunction>();

    expectTypeOf(table)
      .toHaveProperty('head')
      .toHaveProperty('render')
      .toMatchTypeOf<RenderFunction>();

    expectTypeOf(table)
      .toHaveProperty('head')
      .toHaveProperty('rows')
      .items.toHaveProperty('render')
      .toMatchTypeOf<RenderFunction>();

    expectTypeOf(table)
      .toHaveProperty('head')
      .toHaveProperty('rows')
      .items.toHaveProperty('cells')
      .items.toHaveProperty('render')
      .toMatchTypeOf<RenderFunction>();

    expectTypeOf(table)
      .toHaveProperty('body')
      .toHaveProperty('render')
      .toMatchTypeOf<RenderFunction>();

    expectTypeOf(table)
      .toHaveProperty('body')
      .toHaveProperty('rows')
      .items.toHaveProperty('render')
      .toMatchTypeOf<RenderFunction>();

    expectTypeOf(table)
      .toHaveProperty('body')
      .toHaveProperty('rows')
      .items.toHaveProperty('cells')
      .items.toHaveProperty('render')
      .toMatchTypeOf<RenderFunction>();
  });

  it('takes into account the props that previously added plugins added to output objects', () => {
    type Row = { column: null };
    type Plugin = P<
      PaginationPlugin<Row> | RenderPlugin<Row, P<PaginationPlugin<Row>>>
    >;

    makeTable<Row, Plugin>(
      'table',
      [
        paginationPlugin<Row>({}),
        renderPlugin<Row, P<PaginationPlugin<Row>>>({
          renderTable: (props) => {
            expectTypeOf(props)
              .toHaveProperty('head')
              .toHaveProperty('render')
              .toMatchTypeOf<RenderFunction>();
            expectTypeOf(props)
              .toHaveProperty('body')
              .toHaveProperty('render')
              .toMatchTypeOf<RenderFunction>();
            expectTypeOf(props)
              .toHaveProperty('pagination')
              .toHaveProperty('pageSize')
              .toMatchTypeOf<number>();
            return null;
          },
        }),
      ],
      {},
      vi.fn(),
      { column: {} },
      [],
    );
  });
});
