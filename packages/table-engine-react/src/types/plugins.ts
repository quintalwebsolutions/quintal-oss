import type { Column } from './inputs';
import type {
  Body,
  BodyBase,
  BodyCell,
  BodyCellBase,
  BodyRow,
  BodyRowBase,
  Head,
  HeadBase,
  HeadCell,
  HeadCellBase,
  HeadRow,
  HeadRowBase,
  Table,
  TableBase,
} from './outputs';
import type { Row } from './util';

export type PluginArgs<TRow extends Row> = {
  input?: {
    global?: Record<string, unknown>;
    // FIXME we need both definitions because a plugin definition doesn't know the Row, really odd bug
    column?: Record<string, unknown>;
    columnMap?: Record<keyof TRow, Record<string, unknown>>;
  };
  output?: {
    table?: Record<string, unknown>;
    head?: Record<string, unknown>;
    headRow?: Record<string, unknown>;
    headCell?: Record<string, unknown>;
    body?: Record<string, unknown>;
    bodyRow?: Record<string, unknown>;
    bodyCell?: Record<string, unknown>;
  };
  state?: Record<string, unknown>;
};

export type Plugins = PluginArgs<Row>;

export type DefinePluginArgs<TRow extends Row, TPluginArgs extends PluginArgs<TRow>> = TPluginArgs;

export type P<TPlugin> = TPlugin extends Plugin<infer TPlugins> ? TPlugins : Plugins;

type MapUnion<U> = U extends U ? (k: U) => void : never;
type UnionToIntersection<U> = MapUnion<U> extends MapUnion<infer I> ? I : never;

type OneLevelPluginsAccessor<
  TPlugins extends Plugins,
  Key extends keyof Plugins,
> = UnionToIntersection<TPlugins extends Record<Key, infer TResult> ? TResult : object>;

type TwoLevelPluginsAccessor<
  TPlugins extends Plugins,
  Key1 extends keyof Plugins,
  Key2 extends keyof NonNullable<Plugins[Key1]>,
> = UnionToIntersection<
  TPlugins extends Record<Key1, Record<Key2, infer TResult>> ? TResult : object
>;

export type InputFromPlugins<TPlugins extends Plugins> = OneLevelPluginsAccessor<TPlugins, 'input'>;

export type GlobalInputFromPlugins<TPlugins extends Plugins> = TwoLevelPluginsAccessor<
  TPlugins,
  'input',
  'global'
>;

export type ColumnInputFromPlugins<TPlugins extends Plugins> = TwoLevelPluginsAccessor<
  TPlugins,
  'input',
  'column'
>;

export type ColumnMapInputFromPlugins<TPlugins extends Plugins> = TwoLevelPluginsAccessor<
  TPlugins,
  'input',
  'columnMap'
>;

export type OutputFromPlugins<TPlugins extends Plugins> = OneLevelPluginsAccessor<
  TPlugins,
  'output'
>;

export type TableOutputFromPlugins<TPlugins extends Plugins> = TwoLevelPluginsAccessor<
  TPlugins,
  'output',
  'table'
>;

export type HeadOutputFromPlugins<TPlugins extends Plugins> = TwoLevelPluginsAccessor<
  TPlugins,
  'output',
  'head'
>;

export type HeadRowOutputFromPlugins<TPlugins extends Plugins> = TwoLevelPluginsAccessor<
  TPlugins,
  'output',
  'headRow'
>;

export type HeadCellOutputFromPlugins<TPlugins extends Plugins> = TwoLevelPluginsAccessor<
  TPlugins,
  'output',
  'headCell'
>;

export type BodyOutputFromPlugins<TPlugins extends Plugins> = TwoLevelPluginsAccessor<
  TPlugins,
  'output',
  'body'
>;

export type BodyRowOutputFromPlugins<TPlugins extends Plugins> = TwoLevelPluginsAccessor<
  TPlugins,
  'output',
  'bodyRow'
>;

export type BodyCellOutputFromPlugins<TPlugins extends Plugins> = TwoLevelPluginsAccessor<
  TPlugins,
  'output',
  'bodyCell'
>;

export type StateFromPlugins<TPlugins extends Plugins> = OneLevelPluginsAccessor<TPlugins, 'state'>;

export type PersistentStateFromPlugins<TPlugins extends Plugins> = Partial<
  StateFromPlugins<TPlugins>
>;

type StateArg<TPlugins extends Plugins> =
  | StateFromPlugins<TPlugins>
  | ((persistentState: PersistentStateFromPlugins<TPlugins>) => StateFromPlugins<TPlugins>);

export type SetStateFromPlugins<TPlugins extends Plugins> = (state: StateArg<TPlugins>) => void;

export type TransformFn<
  TPlugins extends Plugins,
  BaseObj = unknown,
  ReturnObj = unknown,
  Meta extends Record<string, unknown> = Record<string, never>,
> = (
  obj: BaseObj,
  state: StateFromPlugins<TPlugins>,
  setState: SetStateFromPlugins<TPlugins>,
  meta: Meta,
) => ReturnObj;

export type PluginObject<TRow extends Row, TPlugins extends Plugins> = {
  // TODO transformColumns?
  initializeState?: (
    persistentState: PersistentStateFromPlugins<TPlugins>,
  ) => StateFromPlugins<TPlugins>;
  transformRow?: TransformFn<TPlugins, TRow, TRow>;
  transformValue?: TransformFn<
    TPlugins,
    TRow[keyof TRow],
    TRow[keyof TRow],
    { column: Column<TRow, TPlugins>; row: TRow }
  >;
  transformTable?: TransformFn<TPlugins, TableBase<TRow, TPlugins>, Table<TRow, TPlugins>>;
  transformHead?: TransformFn<TPlugins, HeadBase<TPlugins>, Head<TPlugins>>;
  transformHeadRow?: TransformFn<TPlugins, HeadRowBase<TPlugins>, HeadRow<TPlugins>>;
  transformHeadCell?: TransformFn<
    TPlugins,
    HeadCellBase,
    HeadCell<TPlugins>,
    { column: Column<TRow, TPlugins> }
  >;
  transformBody?: TransformFn<TPlugins, BodyBase<TRow, TPlugins>, Body<TRow, TPlugins>>;
  transformBodyRow?: TransformFn<TPlugins, BodyRowBase<TRow, TPlugins>, BodyRow<TRow, TPlugins>>;
  transformBodyCell?: TransformFn<
    TPlugins,
    BodyCellBase<TRow, unknown>,
    BodyCell<TRow, TPlugins, unknown>,
    { column: Column<TRow, TPlugins> }
  >;
};

export type Plugin<TPlugins extends Plugins> = (
  options: GlobalInputFromPlugins<TPlugins>,
) => PluginObject<Row, TPlugins>;

export type PluginArray<TRow extends Row, TPlugins extends Plugins> = PluginObject<
  TRow,
  TPlugins
>[];
