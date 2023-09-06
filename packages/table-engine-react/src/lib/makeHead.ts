import type {
  Column,
  Columns,
  Head,
  HeadCell,
  HeadRow,
  TableBase,
  StateFromPlugins,
  OriginalHeadRow,
  OriginalHeadCell,
  OriginalHead,
  PluginArray,
  Row,
  Plugins,
 SetStateFromPlugins } from '../types';
import { applyPlugins, getEntries } from './util';

export function makeHead<TRow extends Row, TPlugins extends Plugins>(
  tableId: string,
  plugins: PluginArray<TRow, TPlugins>,
  state: StateFromPlugins<TPlugins>,
  setState: SetStateFromPlugins<TPlugins>,
  columns: Columns<TRow, TPlugins>,
): Pick<TableBase<TRow, TPlugins>, 'head' | 'originalHead'> {
  const headId = `${tableId}-head`;
  const headRows: HeadRow<TPlugins>[] = [];
  const originalHeadRows: OriginalHeadRow[] = [];

  // TODO Add support for multiple / irregular head rows?
  // https://www.w3.org/WAI/tutorials/tables/irregular/
  for (const [rowIndex, row] of [columns].entries()) {
    const headRowId = `${tableId}-headRow-${rowIndex}`;
    const headCells: HeadCell<TPlugins>[] = [];
    const originalHeadCells: OriginalHeadCell[] = [];

    for (const [columnName, column] of getEntries(row)) {
      const name = columnName.toString();
      const headCellId = `${headRowId}-headCell-${name}`;
      const label =
        column.label ??
        name
          .replace(/([A-Z])/g, (match) => ` ${match}`)
          .replace(/^./, (match) => match.toUpperCase())
          .trim();

      originalHeadCells.push({ id: headCellId, name, label });

      const headCell = applyPlugins<TRow, TPlugins>(
        plugins,
        'transformHeadCell',
        { id: headCellId, name, label },
        state,
        setState,
        { column: column as Column<TRow, TPlugins> },
      ) as HeadCell<TPlugins>;
      headCells.push(headCell);
    }

    const originalHeadRow: OriginalHeadRow = {
      id: headRowId,
      cells: originalHeadCells,
    };
    originalHeadRows.push(originalHeadRow);

    const headRow = applyPlugins<TRow, TPlugins>(
      plugins,
      'transformHeadRow',
      { id: headRowId, cells: headCells },
      state,
      setState,
      {},
    ) as HeadRow<TPlugins>;
    headRows.push(headRow);
  }

  const originalHead: OriginalHead = {
    id: headId,
    rows: originalHeadRows,
  };
  const head = applyPlugins<TRow, TPlugins>(
    plugins,
    'transformHead',
    { id: headId, rows: headRows },
    state,
    setState,
    {},
  ) as Head<TPlugins>;

  return { originalHead, head };
}
