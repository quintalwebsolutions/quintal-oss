import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import type {
  DefaultValuePlugin,
  P,
  Plugins as BasePlugins,
  Row as BaseRow,
  Table,
} from '../../src';
import { defaultValuePlugin, makeTable } from '../../src';

const getTableValues = (table: Table<BaseRow, BasePlugins>): object[] =>
  table.body.rows.map((row) =>
    Object.entries(row.values).reduce(
      (prev, [colName, colValue]) => {
        prev[colName] = colValue.rawValue;
        return prev;
      },
      {} as Record<string, unknown>,
    ),
  );

describe('defaultValuePlugin', () => {
  it('replaces empty values with a given default value', () => {
    type Row = {
      col1: number | null | undefined;
      col2: string | null | undefined;
    };
    type Plugins = P<DefaultValuePlugin<Row>>;

    const table = makeTable<Row, Plugins>(
      'tableId',
      [defaultValuePlugin({})],
      {},
      vi.fn(),
      {
        col1: { defaultValue: 42 },
        col2: {
          defaultValue: (row) => {
            expectTypeOf(row).toHaveProperty('col1').toEqualTypeOf<number | null | undefined>();
            expectTypeOf(row).toHaveProperty('col2').toEqualTypeOf<string | null | undefined>();
            return row.col1?.toString() ?? 'Empty';
          },
        },
      },
      [
        { col1: 1, col2: 'String' },
        { col1: null, col2: '' },
        { col1: undefined, col2: '' },
        { col1: 3, col2: null },
        { col1: null, col2: undefined },
      ],
    );

    expect(getTableValues(table)).toMatchInlineSnapshot(`
      [
        {
          "col1": 1,
          "col2": "String",
        },
        {
          "col1": 42,
          "col2": "",
        },
        {
          "col1": 42,
          "col2": "",
        },
        {
          "col1": 3,
          "col2": "3",
        },
        {
          "col1": 42,
          "col2": "Empty",
        },
      ]
    `);
  });

  it('supports passing in a custom isEmpty check gobally and locally', () => {
    type Row = {
      globalIsEmpty: number | null;
      localIsEmpty: number | null;
    };
    type Plugins = P<DefaultValuePlugin<Row>>;

    const table = makeTable<Row, Plugins>(
      'tableId',
      [defaultValuePlugin({ isEmpty: (value) => value === 0 })],
      {},
      vi.fn(),
      {
        globalIsEmpty: { defaultValue: 42 },
        localIsEmpty: { defaultValue: 42, isEmpty: (value) => value === 1 },
      },
      [
        { globalIsEmpty: 1, localIsEmpty: 1 },
        { globalIsEmpty: 0, localIsEmpty: 0 },
        { globalIsEmpty: null, localIsEmpty: null },
      ],
    );

    expect(getTableValues(table)).toMatchInlineSnapshot(`
      [
        {
          "globalIsEmpty": 1,
          "localIsEmpty": 42,
        },
        {
          "globalIsEmpty": 42,
          "localIsEmpty": 0,
        },
        {
          "globalIsEmpty": null,
          "localIsEmpty": null,
        },
      ]
    `);
  });

  it('does not replace the input if no default value is provided', () => {
    type Row = {
      defaultUndefined: undefined | null;
      defaultUndefinedFunc: undefined | null;
      noDefault: undefined | null;
    };
    type Plugins = P<DefaultValuePlugin<Row>>;

    const table = makeTable<Row, Plugins>(
      'tableId',
      [defaultValuePlugin({})],
      {},
      vi.fn(),
      {
        defaultUndefined: { defaultValue: undefined },
        defaultUndefinedFunc: { defaultValue: () => undefined },
        noDefault: {},
      },
      [{ defaultUndefined: null, defaultUndefinedFunc: null, noDefault: null }],
    );

    expect(getTableValues(table)).toMatchInlineSnapshot(`
      [
        {
          "defaultUndefined": undefined,
          "defaultUndefinedFunc": undefined,
          "noDefault": null,
        },
      ]
    `);
  });
});
