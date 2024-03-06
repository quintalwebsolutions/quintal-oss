import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { makeTable, paginationPlugin, renderPlugin } from '../../src';
describe('renderPlugin', () => {
    it('provides sensible default values for all render functions', () => {
        var _a, _b, _c, _d, _e, _f;
        const allDefaultsTable = makeTable('allDefaultsTable', [renderPlugin({})], {}, vi.fn(), { column: {} }, [{ column: 'Value' }]);
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
        expect((_a = allDefaultsTable.head.rows[0]) === null || _a === void 0 ? void 0 : _a.render()).toMatchInlineSnapshot(`
      <tr
        id="allDefaultsTable-headRow-0"
      >
        <render />
      </tr>
    `);
        expect((_c = (_b = allDefaultsTable.head.rows[0]) === null || _b === void 0 ? void 0 : _b.cells[0]) === null || _c === void 0 ? void 0 : _c.render())
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
        expect((_d = allDefaultsTable.body.rows[0]) === null || _d === void 0 ? void 0 : _d.render()).toMatchInlineSnapshot(`
      <tr
        id="allDefaultsTable-bodyRow-0"
      >
        <render />
      </tr>
    `);
        expect((_f = (_e = allDefaultsTable.body.rows[0]) === null || _e === void 0 ? void 0 : _e.cells[0]) === null || _f === void 0 ? void 0 : _f.render())
            .toMatchInlineSnapshot(`
      <td
        id="allDefaultsTable-bodyRow-0-bodyCell-column"
      >
        Value
      </td>
    `);
    });
    it('overrides the default values when other values are given', () => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const table = makeTable('table', [
            renderPlugin({
                renderTable: () => _jsx(_Fragment, { children: "GlobalTable" }),
                renderHead: () => _jsx(_Fragment, { children: "GlobalHead" }),
                renderHeadRow: () => _jsx(_Fragment, { children: "GlobalHeadRow" }),
                renderHeadCell: () => _jsx(_Fragment, { children: "GlobalHeadCell" }),
                renderBody: () => _jsx(_Fragment, { children: "GlobalBody" }),
                renderBodyRow: () => _jsx(_Fragment, { children: "GlobalBodyRow" }),
                renderBodyCell: () => _jsx(_Fragment, { children: "GlobalBodyCell" }),
            }),
        ], {}, vi.fn(), {
            global: {},
            local: {
                renderHeadCell: () => _jsx(_Fragment, { children: "LocalHeadCell" }),
                renderBodyCell: () => _jsx(_Fragment, { children: "LocalBodyCell" }),
            },
        }, [{ global: 'Global', local: 'Local' }]);
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
        expect((_a = table.head.rows[0]) === null || _a === void 0 ? void 0 : _a.render()).toMatchInlineSnapshot(`
      <React.Fragment>
        GlobalHeadRow
      </React.Fragment>
    `);
        expect((_c = (_b = table.head.rows[0]) === null || _b === void 0 ? void 0 : _b.cells[0]) === null || _c === void 0 ? void 0 : _c.render()).toMatchInlineSnapshot(`
      <React.Fragment>
        GlobalHeadCell
      </React.Fragment>
    `);
        expect((_e = (_d = table.head.rows[0]) === null || _d === void 0 ? void 0 : _d.cells[1]) === null || _e === void 0 ? void 0 : _e.render()).toMatchInlineSnapshot(`
      <React.Fragment>
        LocalHeadCell
      </React.Fragment>
    `);
        expect(table.body.render()).toMatchInlineSnapshot(`
      <React.Fragment>
        GlobalBody
      </React.Fragment>
    `);
        expect((_f = table.body.rows[0]) === null || _f === void 0 ? void 0 : _f.render()).toMatchInlineSnapshot(`
      <React.Fragment>
        GlobalBodyRow
      </React.Fragment>
    `);
        expect((_h = (_g = table.body.rows[0]) === null || _g === void 0 ? void 0 : _g.cells[0]) === null || _h === void 0 ? void 0 : _h.render()).toMatchInlineSnapshot(`
      <React.Fragment>
        GlobalBodyCell
      </React.Fragment>
    `);
        expect((_k = (_j = table.body.rows[0]) === null || _j === void 0 ? void 0 : _j.cells[1]) === null || _k === void 0 ? void 0 : _k.render()).toMatchInlineSnapshot(`
      <React.Fragment>
        LocalBodyCell
      </React.Fragment>
    `);
    });
    it('adds its parameters to all the necessary objects', () => {
        const table = makeTable('table', [], {}, vi.fn(), {
            column: {
                renderHeadCell: () => null,
                renderBodyCell: (props) => {
                    expectTypeOf(props)
                        .toHaveProperty('rawValue')
                        .toEqualTypeOf();
                    return null;
                },
            },
        }, []);
        expectTypeOf(table)
            .toHaveProperty('render')
            .toMatchTypeOf();
        expectTypeOf(table)
            .toHaveProperty('head')
            .toHaveProperty('render')
            .toMatchTypeOf();
        expectTypeOf(table)
            .toHaveProperty('head')
            .toHaveProperty('rows')
            .items.toHaveProperty('render')
            .toMatchTypeOf();
        expectTypeOf(table)
            .toHaveProperty('head')
            .toHaveProperty('rows')
            .items.toHaveProperty('cells')
            .items.toHaveProperty('render')
            .toMatchTypeOf();
        expectTypeOf(table)
            .toHaveProperty('body')
            .toHaveProperty('render')
            .toMatchTypeOf();
        expectTypeOf(table)
            .toHaveProperty('body')
            .toHaveProperty('rows')
            .items.toHaveProperty('render')
            .toMatchTypeOf();
        expectTypeOf(table)
            .toHaveProperty('body')
            .toHaveProperty('rows')
            .items.toHaveProperty('cells')
            .items.toHaveProperty('render')
            .toMatchTypeOf();
    });
    it('takes into account the props that previously added plugins added to output objects', () => {
        makeTable('table', [
            paginationPlugin({}),
            renderPlugin({
                renderTable: (props) => {
                    expectTypeOf(props)
                        .toHaveProperty('head')
                        .toHaveProperty('render')
                        .toMatchTypeOf();
                    expectTypeOf(props)
                        .toHaveProperty('body')
                        .toHaveProperty('render')
                        .toMatchTypeOf();
                    expectTypeOf(props)
                        .toHaveProperty('pagination')
                        .toHaveProperty('pageSize')
                        .toMatchTypeOf();
                    return null;
                },
            }),
        ], {}, vi.fn(), { column: {} }, []);
    });
});
//# sourceMappingURL=renderPlugin.spec.js.map