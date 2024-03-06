export function serializeValue(value, row, serializeFunction) {
    if (serializeFunction)
        return serializeFunction(value, row);
    if (typeof value === 'object')
        return value === null ? '' : JSON.stringify(value);
    if (typeof value === 'undefined')
        return '';
    return String(value);
}
export function getEntries(obj) {
    // TODO look into this typing
    // @ts-expect-error This should pass by definition.
    return Object.entries(obj);
}
export function applyPlugins(plugins, pluginFnName, ...args) {
    const [obj, state, setState, meta] = args;
    let result;
    // TODO deep clone?
    if (typeof obj === 'object') {
        if (obj === null)
            result = null;
        else
            result = Object.assign({}, obj);
    }
    else
        result = obj;
    for (const plugin of plugins) {
        const pluginFn = plugin[pluginFnName];
        if (pluginFn) {
            result = pluginFn(result, state, setState, meta);
        }
    }
    return result;
}
//# sourceMappingURL=util.js.map