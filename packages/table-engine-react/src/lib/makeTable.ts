import type {
  Columns,
  Data,
  PersistentStateFromPlugins,
  PluginArray,
  Plugins,
  Row,
  SetStateFromPlugins,
  StateFromPlugins,
  Table,
} from '../types';
import { makeBody } from './makeBody';
import { makeHead } from './makeHead';
import { applyPlugins } from './util';

export function makeTable<TRow extends Row, TPlugins extends Plugins>(
  id: string,
  plugins: PluginArray<TRow, TPlugins>,
  persistentState: PersistentStateFromPlugins<TPlugins>,
  setState: SetStateFromPlugins<TPlugins>,
  columns: Columns<TRow, TPlugins>,
  data: Data<TRow>,
): Table<TRow, TPlugins> {
  let initialState = { ...persistentState };
  for (const plugin of plugins)
    if (plugin.initializeState)
      initialState = plugin.initializeState(initialState) as PersistentStateFromPlugins<TPlugins>;
  const state = initialState as StateFromPlugins<TPlugins>;

  const { head, originalHead } = makeHead(id, plugins, state, setState, columns);

  const { body, originalBody } = makeBody(id, plugins, state, setState, columns, data);

  const table = applyPlugins<TRow, TPlugins>(
    plugins,
    'transformTable',
    { id, head, originalHead, body, originalBody },
    state,
    setState,
    {},
  ) as Table<TRow, TPlugins>;

  return table;
}
