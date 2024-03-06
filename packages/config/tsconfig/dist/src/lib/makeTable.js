import { makeBody } from './makeBody';
import { makeHead } from './makeHead';
import { applyPlugins } from './util';
export function makeTable(id, plugins, persistentState, setState, columns, data) {
    let initialState = Object.assign({}, persistentState);
    for (const plugin of plugins)
        if (plugin.initializeState)
            initialState = plugin.initializeState(initialState);
    const state = initialState;
    const { head, originalHead } = makeHead(id, plugins, state, setState, columns);
    const { body, originalBody } = makeBody(id, plugins, state, setState, columns, data);
    const table = applyPlugins(plugins, 'transformTable', { id, head, originalHead, body, originalBody }, state, setState, {});
    return table;
}
//# sourceMappingURL=makeTable.js.map