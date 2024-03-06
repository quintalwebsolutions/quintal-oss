export const textPlugin = {
    parse: (value) => value || null,
    serialize: (value) => value !== null && value !== void 0 ? value : '',
};
//# sourceMappingURL=textPlugin.js.map