import { describe, expectTypeOf, it, vi } from 'vitest';
import { makeTable, paginationPlugin, renderPlugin } from '../src';
describe('plugin', () => {
    it('combines the outputs of multiple plugins', () => {
        const table = makeTable('tableId', [
            paginationPlugin({}),
            renderPlugin({}),
        ], {}, vi.fn(), { col1: {}, col2: {} }, []);
        expectTypeOf(table)
            .toHaveProperty('render')
            .toMatchTypeOf();
        expectTypeOf(table)
            .toHaveProperty('pagination')
            .toHaveProperty('page')
            .toEqualTypeOf();
    });
});
//# sourceMappingURL=plugin.spec.js.map