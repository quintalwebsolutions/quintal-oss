import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import type { PluginArray, Plugins } from '../src/index.ts';
import { makeHead } from '../src/index.ts';

describe('makeHead', () => {
  it('correctly makes a basic head row', () => {
    const state = {};
    const setState = vi.fn();

    type Row = {
      requiredString: string;
      optionalString: string | null;
      requiredObject: { hello: 'world' };
      optionalObject: { hello: 'world' } | null;
    };

    const plugins: PluginArray<Row, Plugins> = [];

    const tableId = 'tableId';

    if (false as boolean) {
      makeHead<Row, Plugins>(
        tableId,
        plugins,
        state,
        setState,
        // @ts-expect-error It expects an object with keys for each key in `Row`
        {},
      );

      makeHead<Row, Plugins>(tableId, plugins, state, setState, {
        // @ts-expect-error Columns definition not allow unknown keys
        unknownKey: {},
      });

      makeHead<Row, Plugins>(tableId, plugins, state, setState, {
        requiredString: {
          // @ts-expect-error Column definition does not accept unknown keys
          unknownKey: 'hello',
        },
      });
    }

    const { head, originalHead } = makeHead<Row, Plugins>(tableId, plugins, state, setState, {
      requiredString: {
        label: 'String',
      },
      optionalString: {
        // TODO defaultValuePlugin
        // defaultValue: "string",
      },
      requiredObject: {},
      optionalObject: {
        // TODO defaultValuePlugin
        // defaultValue: (row) => {
        //   expectTypeOf(row).toEqualTypeOf<Row>();
        //   return row.requiredObject;
        // },
        serialize: (value, row) => {
          expectTypeOf(value).toEqualTypeOf<{ hello: 'world' } | null>();
          expectTypeOf(row).toEqualTypeOf<Row>();
          return 'object';
        },
      },
    });

    expect(head.rows[0]?.cells).toHaveLength(4);
    expect(head).toEqual(originalHead);

    const headCell = head.rows[0]?.cells[0];
    if (headCell) {
      expectTypeOf(headCell).toMatchTypeOf<{
        id: string;
        label: string;
        name: string;
      }>();
    }

    expect(head).toMatchInlineSnapshot(`
      {
        "id": "tableId-head",
        "rows": [
          {
            "cells": [
              {
                "id": "tableId-headRow-0-headCell-requiredString",
                "label": "String",
                "name": "requiredString",
              },
              {
                "id": "tableId-headRow-0-headCell-optionalString",
                "label": "Optional String",
                "name": "optionalString",
              },
              {
                "id": "tableId-headRow-0-headCell-requiredObject",
                "label": "Required Object",
                "name": "requiredObject",
              },
              {
                "id": "tableId-headRow-0-headCell-optionalObject",
                "label": "Optional Object",
                "name": "optionalObject",
              },
            ],
            "id": "tableId-headRow-0",
          },
        ],
      }
    `);
  });
});
