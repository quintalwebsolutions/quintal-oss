import type { DefinePluginArgs, GlobalInputFromPlugins, Plugin, PluginObject, Row } from '../types';

type DefaultValue<TRow extends Row, TValue> = TValue | ((row: TRow) => TValue);

type IsEmptyFunc<TValue> = (value: TValue) => boolean;

export type DefaultValuePluginArgs<TRow extends Row> = DefinePluginArgs<
  TRow,
  {
    input: {
      global: {
        isEmpty?: IsEmptyFunc<unknown>;
      };
      column: {
        defaultValue?: DefaultValue<TRow, unknown>;
        isEmpty?: IsEmptyFunc<unknown>;
      };
      columnMap: {
        [ColumnName in keyof TRow]: {
          defaultValue?: DefaultValue<TRow, TRow[ColumnName]>;
          isEmpty?: IsEmptyFunc<TRow[ColumnName]>;
        };
      };
    };
  }
>;

export type DefaultValuePlugin<TRow extends Row> = Plugin<DefaultValuePluginArgs<TRow>>;

const defaultIsEmptyFunc: IsEmptyFunc<unknown> = (value) => value === undefined || value === null;

function getDefaultValue<TRow extends Row, TValue>(
  defaultValue: DefaultValue<TRow, TValue>,
  row: TRow,
): TValue {
  if (typeof defaultValue !== 'function') return defaultValue;
  return (defaultValue as (row: TRow) => TValue)(row);
}

// TODO this plugin definition is not very elegant
export function defaultValuePlugin<TRow extends Row>(
  options: GlobalInputFromPlugins<DefaultValuePluginArgs<TRow>>,
): PluginObject<TRow, DefaultValuePluginArgs<TRow>> {
  return {
    transformValue: (value, _state, _setState, { row, column }) => {
      const isEmptyFunc = column.isEmpty ?? options.isEmpty ?? defaultIsEmptyFunc;
      const isEmpty = isEmptyFunc(value);
      if ('defaultValue' in column && isEmpty)
        return getDefaultValue(column.defaultValue, row) as TRow[keyof TRow];
      return value;
    },
  };
}
