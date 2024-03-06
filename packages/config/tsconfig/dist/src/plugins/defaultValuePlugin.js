const defaultIsEmptyFunc = (value) => value === undefined || value === null;
function getDefaultValue(defaultValue, row) {
    if (typeof defaultValue !== 'function')
        return defaultValue;
    return defaultValue(row);
}
// TODO this plugin definition is not very elegant
export function defaultValuePlugin(options) {
    return {
        transformValue: (value, _state, _setState, { row, column }) => {
            var _a, _b;
            const isEmptyFunc = (_b = (_a = column.isEmpty) !== null && _a !== void 0 ? _a : options.isEmpty) !== null && _b !== void 0 ? _b : defaultIsEmptyFunc;
            const isEmpty = isEmptyFunc(value);
            if ('defaultValue' in column && isEmpty)
                return getDefaultValue(column.defaultValue, row);
            return value;
        },
    };
}
//# sourceMappingURL=defaultValuePlugin.js.map