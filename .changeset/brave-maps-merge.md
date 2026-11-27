---
"@quintal/monads": minor
---

Extend `resultFromResults` utility:

- It now accepts a record of results, `resultFromResults({ a: resultA, b: resultB })`, and returns a record with the same keys. Async results and promises of results are accepted for known keys, which makes the result async. A record with unknown keys (like `Record<string, Result>`) can only hold sync results.
- It now accepts an array of sync results of any length, `resultFromResults(results)`. Async results can't be part of an array, since an array can't tell whether it holds async results at runtime (for example when it is empty). Wait for them first, e.g. `resultFromResults(await Promise.all(items.map(fetchItem)))`.
- The variadic form, `resultFromResults(resultA, resultB, ...)`, now also accepts `Promise<Result>`, which are typed exactly like async results.
- Documented that the first error is chosen by position, not by time, and that all async results are awaited before the result is determined.
- Exported the `ResultInput`, `ResultFromResults` and `ResultFromRecord` types.
