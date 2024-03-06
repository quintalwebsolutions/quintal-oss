import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { makeHead } from '../src';
describe('makeHead', () => {
    it('correctly makes a basic head row', () => {
        var _a, _b;
        const state = {};
        const setState = vi.fn();
        const plugins = [];
        const tableId = 'tableId';
        if (false) {
            makeHead(tableId, plugins, state, setState, 
            // @ts-expect-error It expects an object with keys for each key in `Row`
            {});
            makeHead(tableId, plugins, state, setState, {
                // @ts-expect-error Columns definition not allow unknown keys
                unknownKey: {},
            });
            makeHead(tableId, plugins, state, setState, {
                requiredString: {
                    // @ts-expect-error Column definition does not accept unknown keys
                    unknownKey: 'hello',
                },
            });
        }
        const { head, originalHead } = makeHead(tableId, plugins, state, setState, {
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
                    expectTypeOf(value).toEqualTypeOf();
                    expectTypeOf(row).toEqualTypeOf();
                    return 'object';
                },
            },
        });
        expect((_a = head.rows[0]) === null || _a === void 0 ? void 0 : _a.cells).toHaveLength(4);
        expect(head).toEqual(originalHead);
        const headCell = (_b = head.rows[0]) === null || _b === void 0 ? void 0 : _b.cells[0];
        if (headCell) {
            expectTypeOf(headCell).toMatchTypeOf();
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
//# sourceMappingURL=makeHead.spec.js.map