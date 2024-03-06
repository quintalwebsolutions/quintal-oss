export const numberPlugin = {
    parse: (value) => {
        const parsedValue = parseFloat(value);
        return !isNaN(parsedValue) ? parsedValue : null;
    },
    serialize: (value) => { var _a; return (_a = value === null || value === void 0 ? void 0 : value.toString()) !== null && _a !== void 0 ? _a : ''; },
};
//# sourceMappingURL=numberPlugin.js.map