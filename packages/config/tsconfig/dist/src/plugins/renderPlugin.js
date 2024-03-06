import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const defaultRenderTable = (props) => (_jsxs("table", { id: props.id, children: [_jsx(props.head.render, {}), _jsx(props.body.render, {})] }));
const defaultRenderHead = (props) => (_jsx("thead", { id: props.id, children: props.rows.map((headRow) => (_jsx(headRow.render, {}, headRow.id))) }));
const defaultRenderHeadRow = (props) => (_jsx("tr", { id: props.id, children: props.cells.map((headCell) => (_jsx(headCell.render, {}, headCell.id))) }));
const defaultRenderHeadCell = (props) => (_jsx("th", { id: props.id, children: props.label }));
const defaultRenderBody = (props) => (_jsx("tbody", { id: props.id, children: props.rows.map((bodyRow) => (_jsx(bodyRow.render, {}, bodyRow.id))) }));
const defaultRenderBodyRow = (props) => (_jsx("tr", { id: props.id, children: props.cells.map((bodyCell) => (_jsx(bodyCell.render, {}, bodyCell.id))) }));
const defaultRenderBodyCell = (props) => _jsx("td", { id: props.id, children: props.serializedValue });
// TODO this plugin definition is not very elegant
export function renderPlugin(options) {
    return {
        transformTable: (table) => {
            var _a;
            const renderTable = (_a = options.renderTable) !== null && _a !== void 0 ? _a : defaultRenderTable;
            // FIXME
            // @ts-expect-err This errors for some reason. Replacing RenderTableFunc with:
            // type RenderTableFunc<TRow extends Row, TPlugins extends Plugins> = RenderFunc<
            //   TableBase<TRow, RenderPluginArgs<TRow, TPlugins>> & Table<TRow, TPlugins>
            // >;
            // Fixes it, but it's not a good solution
            return Object.assign(Object.assign({}, table), { render: () => renderTable(table) });
        },
        transformHead: (head) => {
            var _a;
            const renderHead = (_a = options.renderHead) !== null && _a !== void 0 ? _a : defaultRenderHead;
            return Object.assign(Object.assign({}, head), { render: () => renderHead(head) });
        },
        transformHeadRow: (headRow) => {
            var _a;
            const renderHeadRow = (_a = options.renderHeadRow) !== null && _a !== void 0 ? _a : defaultRenderHeadRow;
            return Object.assign(Object.assign({}, headRow), { render: () => renderHeadRow(headRow) });
        },
        transformHeadCell: (headCell, _state, _setState, { column }) => {
            var _a, _b;
            const renderHeadCell = (_b = (_a = column.renderHeadCell) !== null && _a !== void 0 ? _a : options.renderHeadCell) !== null && _b !== void 0 ? _b : defaultRenderHeadCell;
            return Object.assign(Object.assign({}, headCell), { render: () => renderHeadCell(headCell) });
        },
        transformBody: (body) => {
            var _a;
            const renderBody = (_a = options.renderBody) !== null && _a !== void 0 ? _a : defaultRenderBody;
            // @ts-expect-error This errors for some reason.
            return Object.assign(Object.assign({}, body), { render: () => renderBody(body) });
        },
        transformBodyRow: (bodyRow) => {
            var _a;
            const renderBodyRow = (_a = options.renderBodyRow) !== null && _a !== void 0 ? _a : defaultRenderBodyRow;
            // @ts-expect-error This errors for some reason.
            return Object.assign(Object.assign({}, bodyRow), { render: () => renderBodyRow(bodyRow) });
        },
        transformBodyCell: (bodyCell, _state, _setState, { column }) => {
            var _a, _b;
            const renderBodyCell = (_b = (_a = column.renderBodyCell) !== null && _a !== void 0 ? _a : options.renderBodyCell) !== null && _b !== void 0 ? _b : defaultRenderBodyCell;
            // @ts-expect-error This errors for some reason.
            return Object.assign(Object.assign({}, bodyCell), { render: () => renderBodyCell(bodyCell) });
        },
    };
}
//# sourceMappingURL=renderPlugin.js.map