import { applyPlugins, getEntries, serializeValue } from './util';
export function makeBody(tableId, plugins, state, setState, columns, data) {
    const bodyId = `${tableId}-body`;
    const bodyRows = [];
    const originalBodyRows = [];
    for (const [rowIndex, dataRow] of data.entries()) {
        const bodyRowId = `${tableId}-bodyRow-${rowIndex}`;
        const bodyCells = [];
        const originalBodyCells = [];
        const bodyValues = {};
        const row = applyPlugins(plugins, 'transformRow', dataRow, state, setState, {});
        for (const [columnName, column] of getEntries(columns)) {
            const name = columnName.toString();
            const bodyCellId = `${bodyRowId}-bodyCell-${name}`;
            const columnValue = row[columnName];
            const rawValue = applyPlugins(plugins, 'transformValue', columnValue, state, setState, { column: column, row });
            const serializedValue = serializeValue(rawValue, row, 
            // TODO
            // @ts-expect-error idk why this errors
            column.serialize);
            const value = { rawValue, serializedValue };
            bodyValues[columnName] = value;
            originalBodyCells.push(Object.assign(Object.assign({ id: bodyCellId }, value), { row: Object.assign({}, row) }));
            const bodyCell = applyPlugins(plugins, 'transformBodyCell', Object.assign(Object.assign({ id: bodyCellId }, value), { row: Object.assign({}, row) }), state, setState, { column: column });
            bodyCells.push(bodyCell);
        }
        const originalBodyRow = {
            id: bodyRowId,
            cells: originalBodyCells,
            values: bodyValues,
        };
        originalBodyRows.push(originalBodyRow);
        const bodyRow = applyPlugins(plugins, 'transformBodyRow', {
            id: bodyRowId,
            cells: bodyCells,
            values: bodyValues,
        }, state, setState, {});
        bodyRows.push(bodyRow);
    }
    const originalBody = {
        id: bodyId,
        rows: originalBodyRows,
    };
    const body = applyPlugins(plugins, 'transformBody', { id: bodyId, rows: bodyRows }, state, setState, {});
    return { originalBody, body };
}
//# sourceMappingURL=makeBody.js.map