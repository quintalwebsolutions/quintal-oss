import type {
  Body,
  BodyCell,
  BodyRow,
  BodyValues,
  Column,
  Columns,
  Data,
  OriginalBody,
  OriginalBodyCell,
  OriginalBodyRow,
  PluginArray,
  Plugins,
  Row,
  SetStateFromPlugins,
  StateFromPlugins,
  TableBase,
} from '../types';
import { applyPlugins, getEntries, serializeValue } from './util';

export function makeBody<TRow extends Row, TPlugins extends Plugins>(
  tableId: string,
  plugins: PluginArray<TRow, TPlugins>,
  state: StateFromPlugins<TPlugins>,
  setState: SetStateFromPlugins<TPlugins>,
  columns: Columns<TRow, TPlugins>,
  data: Data<TRow>,
): Pick<TableBase<TRow, TPlugins>, 'body' | 'originalBody'> {
  const bodyId = `${tableId}-body`;
  const bodyRows: BodyRow<TRow, TPlugins>[] = [];
  const originalBodyRows: OriginalBodyRow<TRow>[] = [];

  for (const [rowIndex, dataRow] of data.entries()) {
    const bodyRowId = `${tableId}-bodyRow-${rowIndex}`;
    const bodyCells: BodyCell<TRow, TPlugins, unknown>[] = [];
    const originalBodyCells: OriginalBodyCell<TRow, unknown>[] = [];
    const bodyValues: Partial<BodyValues<TRow>> = {};
    const row = applyPlugins<TRow, TPlugins>(
      plugins,
      'transformRow',
      dataRow,
      state,
      setState,
      {},
    ) as TRow;

    for (const [columnName, column] of getEntries(columns)) {
      const name = columnName.toString();
      const bodyCellId = `${bodyRowId}-bodyCell-${name}`;

      const columnValue = row[columnName];
      const rawValue = applyPlugins<TRow, TPlugins>(
        plugins,
        'transformValue',
        columnValue,
        state,
        setState,
        { column: column as Column<TRow, TPlugins>, row },
      ) as TRow[keyof TRow];
      const serializedValue = serializeValue(
        rawValue,
        row,
        // TODO
        // @ts-expect-error idk why this errors
        column.serialize,
      );
      const value = { rawValue, serializedValue };
      bodyValues[columnName] = value;

      originalBodyCells.push({ id: bodyCellId, ...value, row: { ...row } });

      const bodyCell = applyPlugins<TRow, TPlugins>(
        plugins,
        'transformBodyCell',
        { id: bodyCellId, ...value, row: { ...row } },
        state,
        setState,
        { column: column as Column<TRow, TPlugins> },
      ) as BodyCell<TRow, TPlugins, unknown>;
      bodyCells.push(bodyCell);
    }

    const originalBodyRow: OriginalBodyRow<TRow> = {
      id: bodyRowId,
      cells: originalBodyCells,
      values: bodyValues as BodyValues<TRow>,
    };
    originalBodyRows.push(originalBodyRow);

    const bodyRow = applyPlugins<TRow, TPlugins>(
      plugins,
      'transformBodyRow',
      {
        id: bodyRowId,
        cells: bodyCells,
        values: bodyValues as BodyValues<TRow>,
      },
      state,
      setState,
      {},
    ) as BodyRow<TRow, TPlugins>;
    bodyRows.push(bodyRow);
  }

  const originalBody: OriginalBody<TRow> = {
    id: bodyId,
    rows: originalBodyRows,
  };
  const body = applyPlugins<TRow, TPlugins>(
    plugins,
    'transformBody',
    { id: bodyId, rows: bodyRows },
    state,
    setState,
    {},
  ) as Body<TRow, TPlugins>;

  return { originalBody, body };
}
