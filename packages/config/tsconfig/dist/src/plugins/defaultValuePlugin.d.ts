import type { DefinePluginArgs, Row, GlobalInputFromPlugins, Plugin, PluginObject } from '../types';
type DefaultValue<TRow extends Row, TValue> = TValue | ((row: TRow) => TValue);
type IsEmptyFunc<TValue> = (value: TValue) => boolean;
export type DefaultValuePluginArgs<TRow extends Row> = DefinePluginArgs<TRow, {
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
}>;
export type DefaultValuePlugin<TRow extends Row> = Plugin<DefaultValuePluginArgs<TRow>>;
export declare function defaultValuePlugin<TRow extends Row>(options: GlobalInputFromPlugins<DefaultValuePluginArgs<TRow>>): PluginObject<TRow, DefaultValuePluginArgs<TRow>>;
export {};
//# sourceMappingURL=defaultValuePlugin.d.ts.map