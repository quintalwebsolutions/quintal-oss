import type { ReactElement } from 'react';
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
  PluginObject,
  Plugin,
  Plugins,
  GlobalInputFromPlugins,
  DefinePluginArgs,
  Row,
} from '../types';

type RenderFunc<Props extends object> = (props: Props) => ReactElement | null;

type RenderTableFunc<TRow extends Row, TPlugins extends Plugins> = RenderFunc<
  TableBase<TRow, RenderPluginArgs<TRow, TPlugins>> & Table<TRow, TPlugins>
>;
type RenderHeadFunc<TRow extends Row, TPlugins extends Plugins> = RenderFunc<
  HeadBase<RenderPluginArgs<TRow, TPlugins>> & Head<TPlugins>
>;
type RenderHeadRowFunc<TRow extends Row, TPlugins extends Plugins> = RenderFunc<
  HeadRowBase<RenderPluginArgs<TRow, TPlugins>> & HeadRow<TPlugins>
>;
type RenderHeadCellFunc<TPlugins extends Plugins> = RenderFunc<
  HeadCellBase & HeadCell<TPlugins>
>;
type RenderBodyFunc<TRow extends Row, TPlugins extends Plugins> = RenderFunc<
  BodyBase<TRow, RenderPluginArgs<TRow, TPlugins>> & Body<TRow, TPlugins>
>;
type RenderBodyRowFunc<TRow extends Row, TPlugins extends Plugins> = RenderFunc<
  BodyRowBase<TRow, RenderPluginArgs<TRow, TPlugins>> & BodyRow<TRow, TPlugins>
>;
type RenderBodyCellFunc<
  TRow extends Row,
  TPlugins extends Plugins,
  TValue,
> = RenderFunc<BodyCellBase<TRow, TValue> & BodyCell<TRow, TPlugins, TValue>>;

type RenderPluginGlobalInput<TRow extends Row, TPlugins extends Plugins> = {
  renderTable?: RenderTableFunc<TRow, TPlugins>;
  renderHead?: RenderHeadFunc<TRow, TPlugins>;
  renderHeadRow?: RenderHeadRowFunc<TRow, TPlugins>;
  renderHeadCell?: RenderHeadCellFunc<TPlugins>;
  renderBody?: RenderBodyFunc<TRow, TPlugins>;
  renderBodyRow?: RenderBodyRowFunc<TRow, TPlugins>;
  renderBodyCell?: RenderBodyCellFunc<TRow, TPlugins, unknown>;
};

type RenderPluginColumnInput<
  TRow extends Row,
  TPlugins extends Plugins,
  TValue,
> = {
  renderHeadCell?: RenderHeadCellFunc<TPlugins>;
  renderBodyCell?: RenderBodyCellFunc<TRow, TPlugins, TValue>;
};

type RenderPluginOutput = {
  render: () => ReactElement | null;
};

type RenderPluginArgs<
  TRow extends Row,
  TPlugins extends Plugins,
> = DefinePluginArgs<
  TRow,
  {
    input: {
      global: RenderPluginGlobalInput<TRow, TPlugins>;
      column: RenderPluginColumnInput<TRow, TPlugins, unknown>;
      columnMap: {
        [ColumnName in keyof TRow]: RenderPluginColumnInput<
          TRow,
          TPlugins,
          TRow[ColumnName]
        >;
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
  }
>;

export type RenderPlugin<TRow extends Row, TPlugins extends Plugins> = Plugin<
  RenderPluginArgs<TRow, TPlugins>
>;

const defaultRenderTable: RenderTableFunc<Row, Plugins> = (props) => (
  <table id={props.id}>
    <props.head.render />
    <props.body.render />
  </table>
);

const defaultRenderHead: RenderHeadFunc<Row, Plugins> = (props) => (
  <thead id={props.id}>
    {props.rows.map((headRow) => (
      <headRow.render key={headRow.id} />
    ))}
  </thead>
);

const defaultRenderHeadRow: RenderHeadRowFunc<Row, Plugins> = (props) => (
  <tr id={props.id}>
    {props.cells.map((headCell) => (
      <headCell.render key={headCell.id} />
    ))}
  </tr>
);

const defaultRenderHeadCell: RenderHeadCellFunc<Plugins> = (props) => (
  <th id={props.id}>{props.label}</th>
);

const defaultRenderBody: RenderBodyFunc<Row, Plugins> = (props) => (
  <tbody id={props.id}>
    {props.rows.map((bodyRow) => (
      <bodyRow.render key={bodyRow.id} />
    ))}
  </tbody>
);

const defaultRenderBodyRow: RenderBodyRowFunc<Row, Plugins> = (props) => (
  <tr id={props.id}>
    {props.cells.map((bodyCell) => (
      <bodyCell.render key={bodyCell.id} />
    ))}
  </tr>
);

const defaultRenderBodyCell: RenderBodyCellFunc<Row, Plugins, unknown> = (
  props,
) => <td id={props.id}>{props.serializedValue}</td>;

// TODO this plugin definition is not very elegant
export function renderPlugin<TRow extends Row, TPlugins extends Plugins>(
  options: GlobalInputFromPlugins<RenderPluginArgs<TRow, TPlugins>>,
): PluginObject<TRow, RenderPluginArgs<TRow, TPlugins>> {
  return {
    transformTable: (table) => {
      const renderTable = options.renderTable ?? defaultRenderTable;
      // FIXME
      // @ts-expect-error This errors for some reason. Replacing RenderTableFunc with:
      // type RenderTableFunc<TRow extends Row, TPlugins extends Plugins> = RenderFunc<
      //   TableBase<TRow, RenderPluginArgs<TRow, TPlugins>> & Table<TRow, TPlugins>
      // >;
      // Fixes it, but it's not a good solution
      return { ...table, render: () => renderTable(table) };
    },
    transformHead: (head) => {
      const renderHead = options.renderHead ?? defaultRenderHead;
      return { ...head, render: () => renderHead(head) };
    },
    transformHeadRow: (headRow) => {
      const renderHeadRow = options.renderHeadRow ?? defaultRenderHeadRow;
      return { ...headRow, render: () => renderHeadRow(headRow) };
    },
    transformHeadCell: (headCell, _state, _setState, { column }) => {
      const renderHeadCell =
        column.renderHeadCell ??
        options.renderHeadCell ??
        defaultRenderHeadCell;
      return { ...headCell, render: () => renderHeadCell(headCell) };
    },
    transformBody: (body) => {
      const renderBody = options.renderBody ?? defaultRenderBody;
      // @ts-expect-error This errors for some reason.
      return { ...body, render: () => renderBody(body) };
    },
    transformBodyRow: (bodyRow) => {
      const renderBodyRow = options.renderBodyRow ?? defaultRenderBodyRow;
      // @ts-expect-error This errors for some reason.
      return { ...bodyRow, render: () => renderBodyRow(bodyRow) };
    },
    transformBodyCell: (bodyCell, _state, _setState, { column }) => {
      const renderBodyCell =
        column.renderBodyCell ??
        options.renderBodyCell ??
        defaultRenderBodyCell;
      // @ts-expect-error This errors for some reason.
      return { ...bodyCell, render: () => renderBodyCell(bodyCell) };
    },
  };
}
