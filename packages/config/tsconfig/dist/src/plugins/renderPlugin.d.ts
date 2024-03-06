import type { ReactElement } from 'react';
import type { Body, BodyBase, BodyCell, BodyCellBase, BodyRow, BodyRowBase, Head, HeadBase, HeadCell, HeadCellBase, HeadRow, HeadRowBase, Table, TableBase, PluginObject, Plugin, Plugins, GlobalInputFromPlugins, DefinePluginArgs, Row } from '../types';
type RenderFunc<Props extends object> = (props: Props) => ReactElement | null;
type RenderTableFunc<TRow extends Row, TPlugins extends Plugins> = RenderFunc<TableBase<TRow, RenderPluginArgs<TRow, TPlugins>> & Table<TRow, TPlugins>>;
type RenderHeadFunc<TRow extends Row, TPlugins extends Plugins> = RenderFunc<HeadBase<RenderPluginArgs<TRow, TPlugins>> & Head<TPlugins>>;
type RenderHeadRowFunc<TRow extends Row, TPlugins extends Plugins> = RenderFunc<HeadRowBase<RenderPluginArgs<TRow, TPlugins>> & HeadRow<TPlugins>>;
type RenderHeadCellFunc<TPlugins extends Plugins> = RenderFunc<HeadCellBase & HeadCell<TPlugins>>;
type RenderBodyFunc<TRow extends Row, TPlugins extends Plugins> = RenderFunc<BodyBase<TRow, RenderPluginArgs<TRow, TPlugins>> & Body<TRow, TPlugins>>;
type RenderBodyRowFunc<TRow extends Row, TPlugins extends Plugins> = RenderFunc<BodyRowBase<TRow, RenderPluginArgs<TRow, TPlugins>> & BodyRow<TRow, TPlugins>>;
type RenderBodyCellFunc<TRow extends Row, TPlugins extends Plugins, TValue> = RenderFunc<BodyCellBase<TRow, TValue> & BodyCell<TRow, TPlugins, TValue>>;
type RenderPluginGlobalInput<TRow extends Row, TPlugins extends Plugins> = {
    renderTable?: RenderTableFunc<TRow, TPlugins>;
    renderHead?: RenderHeadFunc<TRow, TPlugins>;
    renderHeadRow?: RenderHeadRowFunc<TRow, TPlugins>;
    renderHeadCell?: RenderHeadCellFunc<TPlugins>;
    renderBody?: RenderBodyFunc<TRow, TPlugins>;
    renderBodyRow?: RenderBodyRowFunc<TRow, TPlugins>;
    renderBodyCell?: RenderBodyCellFunc<TRow, TPlugins, unknown>;
};
type RenderPluginColumnInput<TRow extends Row, TPlugins extends Plugins, TValue> = {
    renderHeadCell?: RenderHeadCellFunc<TPlugins>;
    renderBodyCell?: RenderBodyCellFunc<TRow, TPlugins, TValue>;
};
type RenderPluginOutput = {
    render: () => ReactElement | null;
};
type RenderPluginArgs<TRow extends Row, TPlugins extends Plugins> = DefinePluginArgs<TRow, {
    input: {
        global: RenderPluginGlobalInput<TRow, TPlugins>;
        column: RenderPluginColumnInput<TRow, TPlugins, unknown>;
        columnMap: {
            [ColumnName in keyof TRow]: RenderPluginColumnInput<TRow, TPlugins, TRow[ColumnName]>;
        };
    };
    output: {
        table: RenderPluginOutput;
        head: RenderPluginOutput;
        headRow: RenderPluginOutput;
        headCell: RenderPluginOutput;
        body: RenderPluginOutput;
        bodyRow: RenderPluginOutput;
        bodyCell: RenderPluginOutput;
    };
}>;
export type RenderPlugin<TRow extends Row, TPlugins extends Plugins> = Plugin<RenderPluginArgs<TRow, TPlugins>>;
export declare function renderPlugin<TRow extends Row, TPlugins extends Plugins>(options: GlobalInputFromPlugins<RenderPluginArgs<TRow, TPlugins>>): PluginObject<TRow, RenderPluginArgs<TRow, TPlugins>>;
export {};
//# sourceMappingURL=renderPlugin.d.ts.map