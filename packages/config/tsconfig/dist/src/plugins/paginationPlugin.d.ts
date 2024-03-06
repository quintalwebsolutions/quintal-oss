import type { DefinePluginArgs, GlobalInputFromPlugins, Plugin, PluginObject, Row } from '../types';
export type PaginationPluginTableOutput = {
    /** Current page number (between 0 and `pageAmount - 1`) */
    page: number;
    /** Maximum size of the pages */
    pageSize: number;
    /** Amount of pages */
    pageAmount: number;
    /** Utility function to set the current page if possible */
    setPage: (pageNumber: number) => void;
    /** Utility function to set the current page size */
    setPageSize: (pageSize: number) => void;
    /** Utility function to skip to the first available page */
    setFirstPage: () => void;
    /** Utility function to skip to the last available page */
    setLastPage: () => void;
    /** Utility function to move to the next page if possible */
    setNextPage: () => void;
    /** Whether or not there is a next page to go to */
    canNextPage: boolean;
    /** Utility function to move to the previous page if possible */
    setPrevPage: () => void;
    /** Whether or not there is a previous page to go to */
    canPrevPage: boolean;
};
export type PaginationPluginArgs<TRow extends Row> = DefinePluginArgs<TRow, {
    input: {
        global: {
            initialPageSize?: number;
        };
    };
    output: {
        table: {
            pagination: PaginationPluginTableOutput;
        };
    };
    state: {
        pageSize: number;
        page: number;
    };
}>;
export type PaginationPlugin<TRow extends Row> = Plugin<PaginationPluginArgs<TRow>>;
export declare function paginationPlugin<TRow extends Row>(options: GlobalInputFromPlugins<PaginationPluginArgs<TRow>>): PluginObject<TRow, PaginationPluginArgs<TRow>>;
//# sourceMappingURL=paginationPlugin.d.ts.map