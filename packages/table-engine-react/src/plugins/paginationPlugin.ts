import type { DefinePluginArgs, GlobalInputFromPlugins, Plugin, PluginObject, Row } from '../types';

const defaultInitialPageSize = 10;

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

export type PaginationPluginArgs<TRow extends Row> = DefinePluginArgs<
  TRow,
  {
    input: {
      global: { initialPageSize?: number };
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
  }
>;

export type PaginationPlugin<TRow extends Row> = Plugin<PaginationPluginArgs<TRow>>;

export function paginationPlugin<TRow extends Row>(
  options: GlobalInputFromPlugins<PaginationPluginArgs<TRow>>,
): PluginObject<TRow, PaginationPluginArgs<TRow>> {
  return {
    initializeState: (persistentState) => ({
      page: persistentState.page ?? 0,
      pageSize: persistentState.pageSize ?? options.initialPageSize ?? defaultInitialPageSize,
    }),
    transformTable: (table, state, setState) => {
      const { page, pageSize } = state;
      const dataLength = table.originalBody.rows.length;
      const pageAmount = dataLength === 0 ? 1 : Math.ceil(dataLength / pageSize);

      const setPage = (newPage: number): void => {
        if (newPage < 0 || newPage >= pageAmount)
          throw new Error(
            `Cannot set page to ${newPage}, should be in between 0 and ${pageAmount - 1}`,
          );
        setState({ page: newPage, pageSize });
      };

      const setPageSize = (newPageSize: number): void => {
        setState({ page, pageSize: newPageSize });
      };

      return {
        ...table,
        pagination: {
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
        },
      };
    },
    transformBody: (body, state) => {
      const paginatedRows = body.rows.slice(
        state.page * state.pageSize,
        state.page * state.pageSize + state.pageSize,
      );
      return { ...body, rows: paginatedRows };
    },
  };
}
