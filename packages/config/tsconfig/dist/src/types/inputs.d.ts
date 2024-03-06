import type { ColumnMapInputFromPlugins, ColumnInputFromPlugins, Plugins } from './plugins';
import type { Row } from './util';
/** User input object for a single column configuration */
export type ColumnBase<TRow extends Row, TValue> = {
    /** Optional: name shown at the top of the column */
    label?: string;
    /** Optional: convert cell content to string for displaying and string matching / searching purposes */
    serialize?: (value: TValue, row: TRow) => string;
};
/** User input object for a single column configuration with plugin extensions */
export type Column<TRow extends Row, TPlugins extends Plugins, TColumnName extends keyof TRow | undefined = undefined> = TColumnName extends keyof TRow ? ColumnBase<TRow, TRow[TColumnName]> & ColumnMapInputFromPlugins<TPlugins>[TColumnName] : ColumnBase<Row, Row[keyof Row]> & ColumnInputFromPlugins<TPlugins>;
/** User input object for the configuration of all columns */
export type Columns<TRow extends Row, TPlugins extends Plugins> = {
    [ColumnName in keyof TRow]: Column<TRow, TPlugins, ColumnName>;
};
/** User input array of the data that is to be processed */
export type Data<TRow extends Row> = TRow[];
//# sourceMappingURL=inputs.d.ts.map