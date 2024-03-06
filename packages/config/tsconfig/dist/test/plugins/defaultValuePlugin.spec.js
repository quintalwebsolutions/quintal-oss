import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { defaultValuePlugin, makeTable } from '../../src';
const getTableValues = (table) => table.body.rows.map((row) => Object.entries(row.values).reduce((prev, [colName, colValue]) => (Object.assign(Object.assign({}, prev), { [colName]: colValue.rawValue })), {}));
describe('defaultValuePlugin', () => {
    it('replaces empty values with a given default value', () => {
        const table = makeTable('tableId', [defaultValuePlugin({})], {}, vi.fn(), {
            col1: { defaultValue: 42 },
            col2: {
                defaultValue: (row) => {
                    var _a, _b;
                    expectTypeOf(row)
                        .toHaveProperty('col1')
                        .toEqualTypeOf();
                    expectTypeOf(row)
                        .toHaveProperty('col2')
                        .toEqualTypeOf();
                    return (_b = (_a = row.col1) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : 'Empty';
                },
            },
        }, [
            { col1: 1, col2: 'String' },
            { col1: null, col2: '' },
            { col1: undefined, col2: '' },
            { col1: 3, col2: null },
            { col1: null, col2: undefined },
        ]);
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
        const table = makeTable('tableId', [defaultValuePlugin({ isEmpty: (value) => value === 0 })], {}, vi.fn(), {
            globalIsEmpty: { defaultValue: 42 },
            localIsEmpty: { defaultValue: 42, isEmpty: (value) => value === 1 },
        }, [
            { globalIsEmpty: 1, localIsEmpty: 1 },
            { globalIsEmpty: 0, localIsEmpty: 0 },
            { globalIsEmpty: null, localIsEmpty: null },
        ]);
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
        const table = makeTable('tableId', [defaultValuePlugin({})], {}, vi.fn(), {
            defaultUndefined: { defaultValue: undefined },
            defaultUndefinedFunc: { defaultValue: () => undefined },
            noDefault: {},
        }, [{ defaultUndefined: null, defaultUndefinedFunc: null, noDefault: null }]);
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
//# sourceMappingURL=defaultValuePlugin.spec.js.map