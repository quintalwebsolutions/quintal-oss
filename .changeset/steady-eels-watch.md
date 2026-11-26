---
"@quintal/monads": minor
---

`inspect` and `inspectErr` now never let a failing callback affect the result: errors thrown (or rejected) inside the callback are silently swallowed. `inspect` and `inspectErr` now also follow the same pattern as `map` and `mapErr` for async callbacks: if the callback returns a promise, the result becomes an `AsyncResult` that resolves once the callback has finished. For example `ok(1).inspect(async () => {})` is now an `AsyncOk<number>` instead of an `Ok<number>`.
