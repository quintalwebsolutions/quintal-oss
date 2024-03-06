const defaultInitialPageSize = 10;
export function paginationPlugin(options) {
    return {
        initializeState: (persistentState) => {
            var _a, _b, _c;
            return ({
                page: (_a = persistentState.page) !== null && _a !== void 0 ? _a : 0,
                pageSize: (_c = (_b = persistentState.pageSize) !== null && _b !== void 0 ? _b : options.initialPageSize) !== null && _c !== void 0 ? _c : defaultInitialPageSize,
            });
        },
        transformTable: (table, state, setState) => {
            const { page, pageSize } = state;
            const dataLength = table.originalBody.rows.length;
            const pageAmount = dataLength === 0 ? 1 : Math.ceil(dataLength / pageSize);
            const setPage = (newPage) => {
                if (newPage < 0 || newPage >= pageAmount)
                    throw new Error(`Cannot set page to ${newPage}, should be in between 0 and ${pageAmount - 1}`);
                else
                    setState({ page: newPage, pageSize });
            };
            const setPageSize = (newPageSize) => {
                setState({ page, pageSize: newPageSize });
            };
            return Object.assign(Object.assign({}, table), { pagination: {
                    page,
                    pageSize,
                    pageAmount,
                    setPage,
                    setPageSize,
                    canPrevPage: page > 0,
                    setPrevPage: () => {
                        setPage(page - 1);
                    },
                    canNextPage: page < pageAmount - 1,
                    setNextPage: () => {
                        setPage(page + 1);
                    },
                    setFirstPage: () => {
                        setPage(0);
                    },
                    setLastPage: () => {
                        setPage(pageAmount - 1);
                    },
                } });
        },
        transformBody: (body, state) => {
            const paginatedRows = body.rows.slice(state.page * state.pageSize, state.page * state.pageSize + state.pageSize);
            return Object.assign(Object.assign({}, body), { rows: paginatedRows });
        },
    };
}
//# sourceMappingURL=paginationPlugin.js.map