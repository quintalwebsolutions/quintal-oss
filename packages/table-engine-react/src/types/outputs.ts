import type {
  BodyCellOutputFromPlugins,
  BodyOutputFromPlugins,
  BodyRowOutputFromPlugins,
  HeadCellOutputFromPlugins,
  HeadOutputFromPlugins,
  HeadRowOutputFromPlugins,
  Plugins,
  TableOutputFromPlugins,
} from './plugins';
import type { Id, Row } from './util';

// BodyCell
export type BodyValue<TValue> = {
  rawValue: TValue;
  serializedValue: string;
};

export type BodyCellBase<TRow extends Row, TValue> = Id & {
  row: TRow;
} & BodyValue<TValue>;

export type BodyCell<
  TRow extends Row,
  TPlugins extends Plugins,
  TValue,
> = BodyCellBase<TRow, TValue> & BodyCellOutputFromPlugins<TPlugins>;

export type OriginalBodyCell<TRow extends Row, TValue> = BodyCell<
  TRow,
  Plugins,
  TValue
>;

// BodyRow
export type BodyValues<TRow extends Row> = {
  [ColumnName in keyof TRow]: BodyValue<TRow[ColumnName]>;
};

export type BodyRowBase<TRow extends Row, TPlugins extends Plugins> = Id & {
  values: BodyValues<TRow>;
  cells: BodyCell<TRow, TPlugins, unknown>[];
};

export type BodyRow<TRow extends Row, TPlugins extends Plugins> = BodyRowBase<
  TRow,
  TPlugins
> &
  BodyRowOutputFromPlugins<TPlugins>;

export type OriginalBodyRow<TRow extends Row> = BodyRow<TRow, Plugins>;

// Body
export type BodyBase<TRow extends Row, TPlugins extends Plugins> = Id & {
  rows: BodyRow<TRow, TPlugins>[];
};

export type Body<TRow extends Row, TPlugins extends Plugins> = BodyBase<
  TRow,
  TPlugins
> &
  BodyOutputFromPlugins<TPlugins>;

export type OriginalBody<TRow extends Row> = Body<TRow, Plugins>;

// HeadCell
export type HeadCellBase = Id & {
  name: string;
  label: string;
};

export type HeadCell<TPlugins extends Plugins> = HeadCellBase &
  HeadCellOutputFromPlugins<TPlugins>;

export type OriginalHeadCell = HeadCell<Plugins>;

// HeadRow
export type HeadRowBase<TPlugins extends Plugins> = Id & {
  cells: HeadCell<TPlugins>[];
};

export type HeadRow<TPlugins extends Plugins> = HeadRowBase<TPlugins> &
  HeadRowOutputFromPlugins<TPlugins>;

export type OriginalHeadRow = HeadRow<Plugins>;

// Head
export type HeadBase<TPlugins extends Plugins> = Id & {
  rows: HeadRow<TPlugins>[];
};

export type Head<TPlugins extends Plugins> = HeadBase<TPlugins> &
  HeadOutputFromPlugins<TPlugins>;

export type OriginalHead = Head<Plugins>;

// Table
export type TableBase<TRow extends Row, TPlugins extends Plugins> = Id & {
  head: Head<TPlugins>;
  originalHead: OriginalHead;
  body: Body<TRow, TPlugins>;
  originalBody: OriginalBody<TRow>;
};

export type Table<TRow extends Row, TPlugins extends Plugins> = TableBase<
  TRow,
  TPlugins
> &
  TableOutputFromPlugins<TPlugins>;

// TODO Props helpers
// export type TableProps<TRow extends Row, TPlugins> = Table<
//   Context<TRow, PluginArgsFromPlugin<TPlugins>>
// >;
