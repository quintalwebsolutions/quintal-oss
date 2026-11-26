---
"@quintal/monads": minor
---

`inspect` and `inspectErr` now never let a failing callback affect the result: errors thrown (or rejected) inside the callback are silently swallowed, so handle errors inside the callback yourself. This fixes unhandled promise rejections from async callbacks and makes sync and async results behave consistently.

`inspect` and `inspectErr` now also follow the same pattern as `map` and `mapErr` for async callbacks: if the callback returns a promise, the result becomes an `AsyncResult` that resolves once the callback has finished (for example `ok(1).inspect(async () => {})` is now an `AsyncOk<number>` instead of an `Ok<number>`), and `AsyncResult` waits for the callback before the chain continues. They now return a new result instead of `this`.
