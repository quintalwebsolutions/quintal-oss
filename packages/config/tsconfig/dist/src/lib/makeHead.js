import { applyPlugins, getEntries } from './util';
export function makeHead(tableId, plugins, state, setState, columns) {
    var _a;
    const headId = `${tableId}-head`;
    const headRows = [];
    const originalHeadRows = [];
    // TODO Add support for multiple / irregular head rows?
    // https://www.w3.org/WAI/tutorials/tables/irregular/
    for (const [rowIndex, row] of [columns].entries()) {
        const headRowId = `${tableId}-headRow-${rowIndex}`;
        const headCells = [];
        const originalHeadCells = [];
        for (const [columnName, column] of getEntries(row)) {
            const name = columnName.toString();
            const headCellId = `${headRowId}-headCell-${name}`;
            const label = (_a = column.label) !== null && _a !== void 0 ? _a : name
                .replace(/([A-Z])/g, (match) => ` ${match}`)
                .replace(/^./, (match) => match.toUpperCase())
                .trim();
            originalHeadCells.push({ id: headCellId, name, label });
            const headCell = applyPlugins(plugins, 'transformHeadCell', { id: headCellId, name, label }, state, setState, { column: column });
            headCells.push(headCell);
        }
        const originalHeadRow = {
            id: headRowId,
            cells: originalHeadCells,
        };
        originalHeadRows.push(originalHeadRow);
        const headRow = applyPlugins(plugins, 'transformHeadRow', { id: headRowId, cells: headCells }, state, setState, {});
        headRows.push(headRow);
    }
    const originalHead = {
        id: headId,
        rows: originalHeadRows,
    };
    const head = applyPlugins(plugins, 'transformHead', { id: headId, rows: headRows }, state, setState, {});
    return { originalHead, head };
}
//# sourceMappingURL=makeHead.js.map