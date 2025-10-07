import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import type { BodyValue, Columns, PluginArray, Plugins } from '../src/index.ts';
import { makeBody } from '../src/index.ts';

describe('makeBody', () => {
  it('correctly makes a basic body', () => {
    const state = {};
    const setState = vi.fn();

    type Row = {
      language: string;
      isStronglyTyped: boolean | null;
      undefined: undefined;
      jobs: { amount: number; salary: number };
      unserialized: { value: string };
    };

    const plugins: PluginArray<Row, Plugins> = [];

    const tableId = 'tableId';

    const columns: Columns<Row, Plugins> = {
      language: {},
      isStronglyTyped: {},
      undefined: {},
      jobs: {
        label: 'Job Stats',
        serialize: ({ amount, salary }) => {
          const separate = (n: number): string => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          return `${separate(amount)} jobs with $${separate(salary)} salary`;
        },
      },
      unserialized: {},
    };

    if (false as boolean) {
      makeBody<Row, Plugins>(tableId, plugins, state, setState, columns, [
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

    const { body, originalBody } = makeBody<Row, Plugins>(
      tableId,
      plugins,
      state,
      setState,
      columns,
      [
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
      ],
    );

    expect(body.rows).toHaveLength(2);
    expect(body).toEqual(originalBody);

    const bodyRow = body.rows[0];
    expect(bodyRow).not.toBeUndefined();
    expectTypeOf(bodyRow).exclude<undefined>().toHaveProperty('values').toMatchTypeOf<{
      language: BodyValue<string>;
      isStronglyTyped: BodyValue<boolean | null>;
      undefined: BodyValue<undefined>;
      jobs: BodyValue<{ amount: number; salary: number }>;
      unserialized: BodyValue<{ value: string }>;
    }>();

    expect(bodyRow?.values).toMatchInlineSnapshot(`
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

    expect(bodyRow?.cells[4]).toMatchInlineSnapshot(`
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
