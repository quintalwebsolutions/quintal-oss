import { describe, expect, it, vi } from 'vitest';
import { makeTable } from '../src';
describe('makeTable', () => {
    it('works', () => {
        const table = makeTable('makeTableId', [], {}, vi.fn(), {
            column1: { label: 'Alternate label' },
            column2: { serialize: (value) => `$${value.toFixed(2)}` },
            column3: {},
        }, [{ column1: 10, column2: 25, column3: null }]);
        expect(table).toMatchInlineSnapshot(`
      {
        "body": {
          "id": "makeTableId-body",
          "rows": [
            {
              "cells": [
                {
                  "id": "makeTableId-bodyRow-0-bodyCell-column1",
                  "rawValue": 10,
                  "row": {
                    "column1": 10,
                    "column2": 25,
                    "column3": null,
                  },
                  "serializedValue": "10",
                },
                {
                  "id": "makeTableId-bodyRow-0-bodyCell-column2",
                  "rawValue": 25,
                  "row": {
                    "column1": 10,
                    "column2": 25,
                    "column3": null,
                  },
                  "serializedValue": "$25.00",
                },
                {
                  "id": "makeTableId-bodyRow-0-bodyCell-column3",
                  "rawValue": null,
                  "row": {
                    "column1": 10,
                    "column2": 25,
                    "column3": null,
                  },
                  "serializedValue": "",
                },
              ],
              "id": "makeTableId-bodyRow-0",
              "values": {
                "column1": {
                  "rawValue": 10,
                  "serializedValue": "10",
                },
                "column2": {
                  "rawValue": 25,
                  "serializedValue": "$25.00",
                },
                "column3": {
                  "rawValue": null,
                  "serializedValue": "",
                },
              },
            },
          ],
        },
        "head": {
          "id": "makeTableId-head",
          "rows": [
            {
              "cells": [
                {
                  "id": "makeTableId-headRow-0-headCell-column1",
                  "label": "Alternate label",
                  "name": "column1",
                },
                {
                  "id": "makeTableId-headRow-0-headCell-column2",
                  "label": "Column2",
                  "name": "column2",
                },
                {
                  "id": "makeTableId-headRow-0-headCell-column3",
                  "label": "Column3",
                  "name": "column3",
                },
              ],
              "id": "makeTableId-headRow-0",
            },
          ],
        },
        "id": "makeTableId",
        "originalBody": {
          "id": "makeTableId-body",
          "rows": [
            {
              "cells": [
                {
                  "id": "makeTableId-bodyRow-0-bodyCell-column1",
                  "rawValue": 10,
                  "row": {
                    "column1": 10,
                    "column2": 25,
                    "column3": null,
                  },
                  "serializedValue": "10",
                },
                {
                  "id": "makeTableId-bodyRow-0-bodyCell-column2",
                  "rawValue": 25,
                  "row": {
                    "column1": 10,
                    "column2": 25,
                    "column3": null,
                  },
                  "serializedValue": "$25.00",
                },
                {
                  "id": "makeTableId-bodyRow-0-bodyCell-column3",
                  "rawValue": null,
                  "row": {
                    "column1": 10,
                    "column2": 25,
                    "column3": null,
                  },
                  "serializedValue": "",
                },
              ],
              "id": "makeTableId-bodyRow-0",
              "values": {
                "column1": {
                  "rawValue": 10,
                  "serializedValue": "10",
                },
                "column2": {
                  "rawValue": 25,
                  "serializedValue": "$25.00",
                },
                "column3": {
                  "rawValue": null,
                  "serializedValue": "",
                },
              },
            },
          ],
        },
        "originalHead": {
          "id": "makeTableId-head",
          "rows": [
            {
              "cells": [
                {
                  "id": "makeTableId-headRow-0-headCell-column1",
                  "label": "Alternate label",
                  "name": "column1",
                },
                {
                  "id": "makeTableId-headRow-0-headCell-column2",
                  "label": "Column2",
                  "name": "column2",
                },
                {
                  "id": "makeTableId-headRow-0-headCell-column3",
                  "label": "Column3",
                  "name": "column3",
                },
              ],
              "id": "makeTableId-headRow-0",
            },
          ],
        },
      }
    `);
    });
});
//# sourceMappingURL=makeTable.spec.js.map