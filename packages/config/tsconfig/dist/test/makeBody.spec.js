import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { makeBody } from '../src';
describe('makeBody', () => {
    it('correctly makes a basic body', () => {
        const state = {};
        const setState = vi.fn();
        const plugins = [];
        const tableId = 'tableId';
        const columns = {
            language: {},
            isStronglyTyped: {},
            undefined: {},
            jobs: {
                label: 'Job Stats',
                serialize: ({ amount, salary }) => {
                    const separate = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    return `${separate(amount)} jobs with $${separate(salary)} salary`;
                },
            },
            unserialized: {},
        };
        if (false) {
            makeBody(tableId, plugins, state, setState, columns, [
                // @ts-expect-error The object should not be missing any required keys
                {},
                {
                    // @ts-expect-error Value types should match
                    language: 42,
                },
                {
                    // @ts-expect-error Unknown keys are disallowed
                    unknownKey: 'hello',
                },
            ]);
        }
        const { body, originalBody } = makeBody(tableId, plugins, state, setState, columns, [
            {
                language: 'JavaScript',
                jobs: { amount: 24000, salary: 118000 },
                isStronglyTyped: null,
                undefined,
                unserialized: { value: 'hello' },
            },
            {
                language: 'Java',
                jobs: { amount: 29000, salary: 104000 },
                isStronglyTyped: true,
                undefined,
                unserialized: { value: 'world' },
            },
        ]);
        expect(body.rows).toHaveLength(2);
        expect(body).toEqual(originalBody);
        const bodyRow = body.rows[0];
        expect(bodyRow).not.toBeUndefined();
        expectTypeOf(bodyRow)
            .exclude()
            .toHaveProperty('values')
            .toMatchTypeOf();
        expect(bodyRow === null || bodyRow === void 0 ? void 0 : bodyRow.values).toMatchInlineSnapshot(`
      {
        "isStronglyTyped": {
          "rawValue": null,
          "serializedValue": "",
        },
        "jobs": {
          "rawValue": {
            "amount": 24000,
            "salary": 118000,
          },
          "serializedValue": "24,000 jobs with $118,000 salary",
        },
        "language": {
          "rawValue": "JavaScript",
          "serializedValue": "JavaScript",
        },
        "undefined": {
          "rawValue": undefined,
          "serializedValue": "",
        },
        "unserialized": {
          "rawValue": {
            "value": "hello",
          },
          "serializedValue": "{"value":"hello"}",
        },
      }
    `);
        expect(bodyRow === null || bodyRow === void 0 ? void 0 : bodyRow.cells[4]).toMatchInlineSnapshot(`
      {
        "id": "tableId-bodyRow-0-bodyCell-unserialized",
        "rawValue": {
          "value": "hello",
        },
        "row": {
          "isStronglyTyped": null,
          "jobs": {
            "amount": 24000,
            "salary": 118000,
          },
          "language": "JavaScript",
          "undefined": undefined,
          "unserialized": {
            "value": "hello",
          },
        },
        "serializedValue": "{"value":"hello"}",
      }
    `);
    });
});
//# sourceMappingURL=makeBody.spec.js.map